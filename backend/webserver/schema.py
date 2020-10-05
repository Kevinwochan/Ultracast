import graphene
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import models

class PodcastEpisode(MongoengineObjectType):
    class Meta:
        model = models.PodcastEpisode
        interfaces = (Node,)

class PodcastMetadata(MongoengineObjectType):
    class Meta:
        model = models.PodcastMetadata
        interfaces = (Node,)

class User(MongoengineObjectType):
    class Meta:
        model = models.User
        interfaces = (Node,)

class PodcastEpisodeMetadata(MongoengineObjectType):
    class Meta:
        model = models.PodcastEpisodeMetadata
        interface = (Node,)

class ListenHistoryEntry(MongoengineObjectType):
    class Meta:
        model = models.ListenHistoryEntry
        interface = (Node,)


class Query(graphene.ObjectType):
    node = Node.Field()
    all_podcast_episode = MongoengineConnectionField(PodcastEpisode)
    all_podcast_metadata = MongoengineConnectionField(PodcastMetadata)
    all_user = MongoengineConnectionField(User)

schema = graphene.Schema(query=Query, types=[PodcastEpisode, PodcastMetadata, PodcastEpisodeMetadata, User])
