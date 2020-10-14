from . import models

import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars

class PodcastEpisode(MongoengineObjectType):
    class Meta:
        model = models.PodcastEpisode
        interfaces = (Node,)

class PodcastEpisodeMetadata(MongoengineObjectType):
    class Meta:
        model = models.PodcastEpisodeMetadata
        interfaces = (Node, )

class PodcastMetadata(MongoengineObjectType):
    class Meta:
        model = models.PodcastMetadata
        interfaces = (Node,)
        #filter_fields = ["name"]
        '''
        Don't even bother asking me why this works... There are no docs
        See source code https://github.com/graphql-python/graphene-mongo/blob/7ca0925bd2865cee85a38a4db1e75349f85595f3/graphene_mongo/fields.py#L133
        It seems like if you add *any* filter args to the query all the query's fields can be filtered on
        I'm not happy with this...
        '''
        filter_args = {"hackedy hack hack": graphene.String}

class ListenHistoryEntry(MongoengineObjectType):
    class Meta:
        model = models.ListenHistoryEntry
        interfaces = (Node,)

class User(MongoengineObjectType):
    class Meta:
        model = models.User
        interfaces = (Node,)

class Query(graphene.ObjectType):
    node = Node.Field()
    all_podcast_episode = MongoengineConnectionField(PodcastEpisode)
    all_podcast_metadata = MongoengineConnectionField(PodcastMetadata)
    all_user = MongoengineConnectionField(User)

types = [PodcastEpisode, PodcastMetadata, User]
