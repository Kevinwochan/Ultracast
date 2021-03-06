from . import models
from . import query
from . import db

from abc import ABC
import graphene
import graphene.relay
import werkzeug.security
import logging
import requests
import datetime
import json
import geocoder

'''
Business Logic Layer
Sits between graphql and mongodb
'''
class BusinessLayerObject(ABC):
    _query_type = None
    _model_type = None
    def __init__(self, model):
        self._model = model

    def update(self, **kwargs):
        self._model.update(**kwargs)

    def delete(self):
        self._model.delete()

    def to_json(self):
        return self._model.to_json()

    def model(self):
        return self._model

    @classmethod
    def from_relay_id(cls, info, relay_id):
        node = graphene.relay.get_node_from_global_id(info, relay_id, only_type=cls._query_type)
        if node is None:
            raise ValueError("Invalid id {} for type {}".format(relay_id, cls._query_type.__name__))

        return cls(node)

    @classmethod
    def from_mongo_id(cls, mongo_id):
        model = cls._model_type.objects(id=mongo_id).get()
        return cls(model)

'''
class PodcastMetadata(BusinessLayerObject):
    MODEL_TYPE = models.PodcastMetadata
    def __init__(self, model=MODEL_TYPE()):
        super().__init__(model)
        self._query_type = query.PodcastMetadata

    @staticmethod
    def create(author, **kwargs):
        model = PodcastMetadata.MODEL_TYPE(**kwargs)
        return PodcastMetadata(model)

    def delete(self, num_deleted):
        # Track through deleting all episodes
        num_deleted = 0
        for episode_metadata in self._model.episodes:
            if (episode_metadata.episode is not None): 
                episode_metadata.episode.delete()
            num_deleted += 1

        # Remove podcast from all users subscriptions
        models.User.objects(subscribed_podcasts=podcast_metadata).modify(
                pull__subscribed_podcasts=self._model)

        # Remove podcast_metadata from the authors published set
        podcast_metadata.author.modify(pull__published_podcasts=self._model)

        # Bye bby
        super().delete()
        
        success = True
        return success

class PodcastEpisode:
    def __init__(self):
        self._model = models.PodcastMetadata()
        
    def update(self):
        pass 

    def delete(self):
        pass
'''



class User(BusinessLayerObject):
    _query_type = query.User
    _model_type = models.User
    def __init__(self, model, **kwargs):
        super().__init__(model, **kwargs)

    @classmethod
    def create(cls, email, password, name=None):
        if models.User.objects(email=email).count() != 0: # email used
            raise ValueError("Email {} is already used".format(email))
        if not password: # empty password
            raise ValueError("Invalid password")
        
        model = models.User(email=email, name=name, 
                password=werkzeug.security.generate_password_hash(password))
        model.save()
        return cls(model)

    def update(self, password):
        self._model.modify(password=werkzeug.security.generate_password_hash(password))

    def delete(self):
        # Delete all the podcasts!
        for podcast in self.model().published_podcasts:
            #print("deleting podcast")
            self.model().modify(pull__published_podcasts=podcast)
            for episode in podcast.episodes:
                #print("deleting episode")
                if episode.audio_url is not None:
                    db.removeFile(episode.audio_url)
                podcast.modify(pull__episodes=episode)
                # Pull episode from all users listen history (ewww slow)
                models.User.objects.update(pull__listen_history__episode=episode.id)
                episode.delete()

            podcast.delete()
        super().delete()

    @staticmethod
    def hash_password(password):
        return werkzeug.security.generate_password_hash(password)

    def subscribe_podcast(self, podcast_metadata_model):
        self._model.modify(add_to_set__subscribed_podcasts=podcast_metadata_model)
        podcast_metadata_model.modify(push__subscribers=self._model.id)

    def remove_subscribed_podcast(self, podcast_metadata_model):
        self._model.modify(pull__subscribed_podcasts=podcast_metadata_model)
        podcast_metadata_model.modify(pull__subscribers=self._model)

    def check_password(self, password):
        return werkzeug.security.check_password_hash(
                self._model.password, password)

    def get_email(self):
        return self._model.email

    def add_stream(self, search: str) -> models.Stream:
        stream = models.Stream(search=search, owner=self._model)
        stream.save()
        self._model.modify(push__streams=stream)
        return stream

    def update_stream(self, stream_model: models.Stream, **kwargs) -> models.Stream:
        assert(self.can_edit_stream(stream_model))
        stream_model.modify(**kwargs)
        self._model.reload()

        return stream_model

    def remove_stream(self, stream_model: models.Stream):
        assert(self.can_edit_stream(stream_model))
        self._model.modify(pull__streams=stream_model)
        stream_model.delete()

    def can_edit_stream(self, stream_model):
        return stream_model.id in [o.id for o in self._model.streams]

    def can_edit_podcast_metadata(self, podcast_metadata):
        return podcast_metadata.author.id == self._model.id

    def get_mongo_id(self):
        return self._model.id

    def login(self):
        self._model.modify(last_login=self._model.login_time)
        self._model.modify(login_time=datetime.datetime.now())

    def add_view(self, request_env, podcast_episode_metadata_model):
        
        latlon = geocoder.ip(request_env['REMOTE_ADDR']).latlng
        if latlon is None or len(latlon) == 0:
            latlon = geocoder.ip('me').latlng

        lat, lon = latlon

        lat_lon = json.dumps({'lat': lat, 'lon': lon})
        browser = request_env.get("HTTP_USER_AGENT", None)
        is_subscribed = podcast_episode_metadata_model.podcast_metadata in self._model.subscribed_podcasts

        episode_view = models.EpisodeView(lat_lon=lat_lon, browser=browser, is_subscribed=is_subscribed)

        podcast_episode_metadata_model.views.append(episode_view)
        podcast_episode_metadata_model.save()

    def mark_podcast_listened(self, request_env, podcast_episode_metadata_model):
        # See if the user has already listened to this episode
        # @Connor not sure why this was being forced to 0
        # Was breaking unit tests so I removed
        num_entries = sum(entry.episode == podcast_episode_metadata_model for entry in self._model.listen_history)

        listen_entry = models.ListenHistoryEntry(episode=podcast_episode_metadata_model)    

        self.add_view(request_env, podcast_episode_metadata_model)

        if (num_entries <= 0):
            # Create new entry
            self._model.modify(push__listen_history=listen_entry)
        else:
            # Update existing entry
            # Note we pop the old one to ensure the correct ordering
            old_entry = \
                self._model.listen_history.filter(episode=podcast_episode_metadata_model) \
                .first()

            listen_entry.num_listens = old_entry.num_listens + 1

            # Remove the old entries
            self._model.modify(pull__listen_history__episode=podcast_episode_metadata_model)
            
            # Add in the new
            self._model.modify(push__listen_history=listen_entry)

        if num_entries > 1:
            logging.warning("User {} has duplicate listen history entries!".format(
                self.get_email()))
        return True

    def follow_user(self, user_model):
        self._model.modify(add_to_set__following=user_model)

    def unfollow_user(self, user_model):
        self._model.modify(pull__following=user_model)

    def bookmark(self, track_timestamp, episode, title=None, description=None):
        if (track_timestamp < 0):
            raise Exception("Track timestamp should be >= 0")

        bookmark = models.Bookmark(title=title, description=description, track_timestamp=track_timestamp, episode=episode)
        bookmark.save()
        self._model.modify(push__bookmarks=bookmark)
        return bookmark

    def unbookmark(self, bookmark_model):
        self._model.modify(pull__bookmarks=bookmark_model)

    def add_searched_podcast(self, podcast_metadata_model):
        self._model.modify(push__searched_podcasts=podcast_metadata_model)

    @classmethod
    def from_email(cls, email):
        user_query = models.User.objects(email=email)
        if user_query.count() < 1:
            return None
        return cls(user_query.first())
