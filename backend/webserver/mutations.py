from . import models
from . import mutations
from . import query
from . import podcast_engine
from . import db
from . import schema

import flask_jwt_extended

import graphene
import graphql
from graphene.relay import Node, ClientIDMutation
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import flask_jwt_extended
import werkzeug

VALID_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'Audio/MP3', 'audio/mpeg3', 'audio/x-mp3']
VALID_IMAGE_FORMATS = ['image/jpeg', 'image/png']

'''
Trying things out relay style...
See https://docs.graphene-python.org/en/latest/relay/mutations/
and https://github.com/graphql-python/graphene/blob/master/graphene/relay/mutation.py
'''


@flask_jwt_extended.jwt_required
def assert_podcast_edit_permission(podcast_metadata):
    '''
    Checks the current user has edit permission for the podcast_metadata
    Raises a Forbidden error if not
    '''
    # Check we have permissions
    if not flask_jwt_extended.current_user.can_edit_podcast_metadata(podcast_metadata):
        raise werkzeug.exceptions.Forbidden("User {} cannot delete this podcast".format(
            flask_jwt_extended.current_user.get_email()))

###########################################################################################################
#                                           PodcastEpisode                                                #
###########################################################################################################

class CreatePodcastEpisodeMutation(ClientIDMutation):
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    podcast_episode_metadata = graphene.Field(query.PodcastEpisodeMetadata)

    class Input:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload(required=False)
        keywords = graphene.List(graphene.String)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id=None, audio=None, **kwargs):
        audio_url = None
        duration = None

        if audio is not None:
            audio = audio.read()
            audio_url = db.add_file(data=audio, valid_mimes=VALID_AUDIO_FORMATS)
            duration = db.audio_file_duration_secs(audio)
        
        podcast_metadata = schema.get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)
        assert_podcast_edit_permission(podcast_metadata)

        episode_metadata = models.PodcastEpisodeMetadata(audio_url=audio_url, 
                duration=duration, podcast_metadata=podcast_metadata,
                **kwargs)
        episode_metadata.save()

        podcast_metadata.episodes.append(episode_metadata)
        podcast_metadata.save()

        return CreatePodcastEpisodeMutation(podcast_metadata=podcast_metadata,
                podcast_episode_metadata=episode_metadata)

class DeletePodcastEpisode(ClientIDMutation):
    success = graphene.Boolean()
    podcast_metadata = graphene.Field(query.PodcastMetadata)

    class Input:
        # Can provide either id
        podcast_episode_metadata_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_episode_metadata_id):
        
        # Lookup the mongodb object from the relay Node ID
        podcast_episode = schema.get_node_from_global_id(info=info, global_id=podcast_episode_metadata_id, only_type=query.PodcastEpisodeMetadata)
        podcast_metadata = podcast_episode.podcast_metadata
        
        assert_podcast_edit_permission(podcast_metadata)

        podcast_metadata.modify(pull__episodes=podcast_episode)
        podcast_metadata.save()

        # Remove episode from any subscribers listen history 
        # This may be a little slow...
        models.User.objects.update(pull__listen_history__episode=podcast_episode)

        # Finally delete the episode
        podcast_episode.delete()
        
        if podcast_episode.audio_url is not None:
            db.remove_file(podcast_episode.audio_url)

        return DeletePodcastEpisode(success=True, podcast_metadata=podcast_metadata)

class UpdatePodcastEpisode(ClientIDMutation):
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    podcast_episode_metadata = graphene.Field(query.PodcastEpisodeMetadata)
    success = graphene.Boolean()

    class Input:
        podcast_episode_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload()
        keywords = graphene.List(graphene.String)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_episode_metadata_id, 
            name=None, description=None, audio=None, keywords=None):
        # Retrieve the episode
        podcast_episode_metadata = schema.get_node_from_global_id(info, 
                podcast_episode_metadata_id, only_type=query.PodcastEpisodeMetadata)
        podcast_metadata = podcast_episode_metadata.podcast_metadata

        assert_podcast_edit_permission(podcast_metadata)
        
        # Update the modified fields (only)
        if name is not None:
            podcast_episode_metadata.name = name
        if description is not None:
            podcast_episode_metadata.description = description
        if audio is not None:
            audio = audio.read()
            podcast_episode_metadata.audio_url = db.update_file(
                    podcast_episode_metadata.audio_url, audio,
                    valid_mimes=VALID_AUDIO_FORMATS)
            podcast_episode_metadata.duration = db.audio_file_duration_secs(audio)
        if keywords is not None:
            podcast_episode_metadata.keywords = keywords

        # Save out our changes
        podcast_episode_metadata.save()
        podcast_metadata.save()

        success = True
        return UpdatePodcastEpisode(
            podcast_metadata=podcast_metadata, 
            podcast_episode_metadata=podcast_episode_metadata,
            success=success)

###########################################################################################################
#                                           PodcastMetadata                                               #
###########################################################################################################

class CreatePodcastMetadata(ClientIDMutation):
    success = graphene.Boolean()
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    class Input:
        name = graphene.String(required=True)
        description = graphene.String()
        cover = graphene_file_upload.scalars.Upload()
        category = graphene.String()
        sub_category = graphene.String()
        keywords = graphene.List(graphene.String)
    
    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, cover=None, **input):
        author = flask_jwt_extended.current_user
        
        cover_url = None
        if cover is not None:
            cover = cover.read()
            cover_url = db.add_file(data=cover, valid_mimes=VALID_IMAGE_FORMATS)

        podcast_metadata_args = input
        podcast_metadata_args["author"] = author.get_mongo_id()
        
        # De dictionary the kwargs (by design match up with the model)
        podcast_metadata = models.PodcastMetadata(cover_url=cover_url, **podcast_metadata_args)
        podcast_metadata.save()

        author.model().published_podcasts.append(podcast_metadata)
        author.model().save()

        return CreatePodcastMetadata(success=True, podcast_metadata=podcast_metadata)

class DeletePodcastMetadata(ClientIDMutation):
    num_deleted_episodes = graphene.Int()
    success = graphene.Boolean()

    class Input:
        podcast_metadata_id = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id):
        podcast_metadata = schema.get_node_from_global_id(info, podcast_metadata_id, 
                only_type=query.PodcastMetadata)

        assert_podcast_edit_permission(podcast_metadata)
        
        # Track through deleting all episodes
        num_deleted = 0
        for episode_metadata in podcast_metadata.episodes:
            audio_url = episode_metadata.audio_url
            if audio_url is not None:
                db.remove_file(audio_url)
            
            # eww... trawl all users and remove from listen history
            models.User.objects.update(pull__listen_history__episode=episode_metadata)
            episode_metadata.delete()
            num_deleted += 1
        
        if podcast_metadata.cover_url is not None:
            db.remove_file(podcast_metadata.cover_url)

        # Remove podcast from all users subscriptions
        models.User.objects(subscribed_podcasts=podcast_metadata).modify(pull__subscribed_podcasts=podcast_metadata)
        # Remove podcast_metadata from the authors published set
        podcast_metadata.author.modify(pull__published_podcasts=podcast_metadata)

        # Bye bby
        podcast_metadata.delete()
        
        success = True
        return DeletePodcastMetadata(num_deleted_episodes=num_deleted, success=success)

class UpdatePodcastMetadata(ClientIDMutation):
    success = graphene.Boolean()
    podcast_metadata = graphene.Field(query.PodcastMetadata)

    class Input:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        cover = graphene_file_upload.scalars.Upload()
        category = graphene.String()
        sub_category = graphene.String()
        keywords = graphene.List(graphene.String)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id, cover=None, **kwargs):
        podcast_metadata = schema.get_node_from_global_id(info, podcast_metadata_id, 
                query.PodcastMetadata)

        assert_podcast_edit_permission(podcast_metadata)

        if cover is not None:
            cover = cover.read()
            if podcast_metadata.cover_url is not None:
                cover_url = db.update_file(
                        podcast_metadata.cover_url, cover, valid_mimes=VALID_IMAGE_FORMATS)
            else:
                cover_url = db.add_file(data=cover, valid_mimes=VALID_IMAGE_FORMATS)

            podcast_metadata.modify(cover_url=cover_url)

        if len(kwargs) > 0:
            podcast_metadata.modify(**kwargs)

        return UpdatePodcastMetadata(success=True, podcast_metadata=podcast_metadata)


###########################################################################################################
#                                          Bookmark                                                       #
###########################################################################################################

class CreateBookmark(ClientIDMutation):
    success = graphene.Boolean()
    bookmark = graphene.Field(query.Bookmark)

    class Input:
        title = graphene.String()
        description = graphene.String()
        track_timestamp = graphene.Int(required=True)
        episode = graphene.ID(required=True)
    
    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, track_timestamp, episode, title=None, description=None):
        user = flask_jwt_extended.current_user
        episode_metadata = schema.get_node_from_global_id(info, episode, only_type=query.PodcastEpisodeMetadata)
        bookmark = user.bookmark(track_timestamp, episode_metadata, title, description)
        return CreateBookmark(success=True, bookmark=bookmark)

class DeleteBookmark(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        bookmark_id = graphene.ID(required=True)
    
    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, bookmark_id):
        user = flask_jwt_extended.current_user
        bookmark = schema.get_node_from_global_id(info, bookmark_id, only_type=query.Bookmark)
        user.unbookmark(bookmark)
        bookmark.delete()
        return DeleteBookmark(success=True)


###########################################################################################################
#                                           User                                                          #
###########################################################################################################


class CreateUser(ClientIDMutation):
    '''
    Inserts a user into MongoDB
    Sample payload
    mutation {
        createUser(input: {email: "test@test.com", password: "pass"} ) {
        success
        }
    }
    '''
    success = graphene.Boolean()
    user = graphene.Field(query.User)
    fail_why = graphene.String()
    token = graphene.String()

    class Input:
        password = graphene.String(required=True)
        email = graphene.String(required=True)
        name = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password, **input):
        # Check the email is unique
        new_user = None
        try:
            new_user = podcast_engine.User.create(email, password, **input)
        except ValueError as e:
            return CreateUser(success=False, fail_why=str(e))

        success = True
        token = flask_jwt_extended.create_access_token(identity=new_user)
        return CreateUser(success=success, user=new_user.model(), token=token)

class DeleteUser(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        pass

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info):
        user = flask_jwt_extended.current_user
        user.delete()

        return DeleteUser(success=True)

class MarkPodcastListened(ClientIDMutation):
    '''
    Mark a podcast as listened to by the current user
    '''
    success = graphene.Boolean()
    user = graphene.Field(query.User)

    class Input:
        podcast_episode_metadata_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_episode_metadata_id):
        user = flask_jwt_extended.current_user
        episode = schema.get_node_from_global_id(info, podcast_episode_metadata_id, only_type=query.PodcastEpisodeMetadata)
        user.mark_podcast_listened(info.context.environ, episode)
        return MarkPodcastListened(success=True, user=user.model())

class Login(ClientIDMutation):
    success = graphene.Boolean()
    token = graphene.String()
    message = graphene.String()
    user = graphene.Field(query.User)

    class Input:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password):
        user = podcast_engine.User.from_email(email)
        if user is None:
            return Login(success=False, message="Invalid email")

        if not user.check_password(password):
            return Login(success=False, message="Invalid password")
        
        user.login()
        token = flask_jwt_extended.create_access_token(identity=user)
        return Login(success=True, token=token, user=user.model())

class SubscribePodcast(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        podcast_metadata_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id):
        user = flask_jwt_extended.current_user
        print(user.to_json())
        podcast_metadata = schema.get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)
        print(podcast_metadata.to_json())
        user.subscribe_podcast(podcast_metadata)

        return SubscribePodcast(success=True)

class UnsubscribePodcast(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        podcast_metadata_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id):
        user = flask_jwt_extended.current_user
        podcast_metadata = schema.get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)
        user.remove_subscribed_podcast(podcast_metadata)

        return UnsubscribePodcast(success=True)

class FollowUser(ClientIDMutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Input:
        follow_user_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, follow_user_id):
        user = flask_jwt_extended.current_user
        follow_user = schema.get_node_from_global_id(info, follow_user_id, only_type=query.User)
        if follow_user == user.model():
            return FollowUser(success=False, message="User cannot follow themselves")
        user.follow_user(follow_user)
        return FollowUser(success=True)

class UnfollowUser(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        unfollow_user_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, unfollow_user_id):
        user = flask_jwt_extended.current_user
        unfollow_user = schema.get_node_from_global_id(info, unfollow_user_id, only_type=query.User)
        user.unfollow_user(unfollow_user)
        return UnfollowUser(success=True)

class CreateStream(ClientIDMutation):
    success = graphene.Boolean()
    user = graphene.Field(query.User)
    stream = graphene.Field(query.Stream)

    class Input:
        search = graphene.String(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, search):
        user = flask_jwt_extended.current_user
        stream_model = user.add_stream(search)

        return CreateStream(success=True, user=user.model(), stream=stream_model)

class UpdateStream(ClientIDMutation):
    success = graphene.Boolean()
    user = graphene.Field(query.User)
    stream = graphene.Field(query.Stream)

    class Input:
        stream_id = graphene.ID(required=True)
        search = graphene.String()

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, stream_id, **kwargs):
        user = flask_jwt_extended.current_user
        stream_model = schema.get_node_from_global_id(info, stream_id, query.Stream)
        if not user.can_edit_stream(stream_model):
            raise werkzeug.exceptions.Forbidden("User {} cannot edit this stream"
                    .format(user.get_email()))

        stream_model = user.update_stream(stream_model, **kwargs)

        return UpdateStream(success=True, user=user.model(), stream=stream_model)

class DeleteStream(ClientIDMutation):
    success = graphene.Boolean()
    user = graphene.Field(query.User)

    class Input:
        stream_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, stream_id):
        user = flask_jwt_extended.current_user
        stream_model = schema.get_node_from_global_id(info, stream_id, query.Stream)
        #print("Deleting stream {} have streams {}".format(stream_model.id, [ o.id for o in user.model().streams]))
        if not user.can_edit_stream(stream_model):
            raise werkzeug.exceptions.Forbidden("User {} cannot edit this stream"
                    .format(user.get_email()))

        user.remove_stream(stream_model)

        return DeleteStream(success=True, user=user.model())

class MarkPodcastSearched(ClientIDMutation):
    success = graphene.Boolean()
    user = graphene.Field(query.User)

    class Input:
        podcast_metadata_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id):
        user = flask_jwt_extended.current_user
        podcast_metadata = schema.get_node_from_global_id(info, 
                podcast_metadata_id, query.PodcastMetadata)

        user.add_searched_podcast(podcast_metadata)

        return MarkPodcastSearched(success=True, user=user.model())

class Mutations(graphene.ObjectType):
    '''
    Podcast mutations
    '''
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    delete_podcast_episode = DeletePodcastEpisode.Field()
    update_podcast_episode = UpdatePodcastEpisode.Field()
    create_podcast_metadata = CreatePodcastMetadata.Field()
    delete_podcast_metadata = DeletePodcastMetadata.Field()
    update_podcast_metadata = UpdatePodcastMetadata.Field()
    '''
    Bookmark mutations
    '''
    create_bookmark = CreateBookmark.Field()
    delete_bookmark = DeleteBookmark.Field()
    '''
    Streams
    '''
    create_stream = CreateStream.Field()
    update_stream = UpdateStream.Field()
    delete_stream = DeleteStream.Field()
    '''
    User mutations
    '''
    create_user = CreateUser.Field()
    delete_user = DeleteUser.Field()
    login = Login.Field()
    '''
    Business Logic mutations
    '''
    mark_podcast_listened = MarkPodcastListened.Field()
    subscribe_podcast = SubscribePodcast.Field()
    unsubscribe_podcast = UnsubscribePodcast.Field()
    follow_user = FollowUser.Field()
    unfollow_user = UnfollowUser.Field()
    mark_podcast_searched = MarkPodcastSearched.Field()

middleware = []
