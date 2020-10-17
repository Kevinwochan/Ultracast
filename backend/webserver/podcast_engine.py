from . import models
from . import query

from abc import ABC
import graphene
import graphene.relay
import werkzeug.security

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

    def check_password(self, password):
        return werkzeug.security.check_password_hash(
                self._model.password, password)

    def get_email(self):
        return self._model.email

    def can_edit_podcast_metadata(self, podcast_metadata):
        return podcast_metadata.author.id == self._model.id

    @classmethod
    def from_email(cls, email):
        user_query = models.User.objects(email=email)
        if user_query.count() < 1:
            return None
        return cls(user_query.first())
