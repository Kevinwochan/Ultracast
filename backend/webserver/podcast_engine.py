from . import models
from . import query

from abc import ABC
import graphene

class PodcastEngine:
    '''
    Business Logic Layer
    Sits between graphql and mongodb
    '''
    class BusinessLayerObject(ABC):
        def __init__(self, model):
            self.__model = model
            self.__query_type = None

            self.__model.save()

        def update(self, **kwargs):
            self.__model.update(**kwargs)

        def delete(self):
            self.__model.delete()

        @classmethod
        def from_relay_id(cls, info, relay_id):
            node = graphene.relay.get_node_from_global_id(info, relay_id, only_type=self.__query_type)
            if node is None:
                raise ValueError("Invalid id {} for type {}".format(relay_id, self.__query_type.__name__))

            return cls(node)

    class PodcastMetadata(BusinessLayerObject):
        MODEL_TYPE = models.PodcastMetadata
        def __init__(self, model=MODEL_TYPE()):
            super().__init__(model)
            self.__query_type = query.PodcastMetadata

        @staticmethod
        def create(author, **kwargs):
            model = PodcastMetadata.MODEL_TYPE(**kwargs)
            return PodcastMetadata(model)

        def delete(self, num_deleted):
            # Track through deleting all episodes
            num_deleted = 0
            for episode_metadata in self.__model.episodes:
                if (episode_metadata.episode is not None): 
                    episode_metadata.episode.delete()
                num_deleted += 1

            # Remove podcast from all users subscriptions
            models.User.objects(subscribed_podcasts=podcast_metadata).modify(
                    pull__subscribed_podcasts=self.__model)

            # Remove podcast_metadata from the authors published set
            podcast_metadata.author.modify(pull__published_podcasts=self.__model)

            # Bye bby
            super().delete()
            
            success = True
            return success

    class PodcastEpisode:
        def __init__(self):
            self.__model = models.PodcastMetadata()
            
        def update(self):
            pass 

        def delete(self):
            pass

