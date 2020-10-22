from . import models

import flask_jwt_extended

import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars

class AuthenticatedMongoengineConnectionField(MongoengineConnectionField):
    '''
    How this works:
    Inject an extra layer before the MongoengineConnectionField default resolver
    In there we can return a value if we want to indicate an error e.g. you dont have permission to access this record

    Example usage:
    class User(MongoengineObjectType):
        class Meta
            # Normal meta stuff
        class AuthenticationResolver:
            # New for this
            @classmethod
            def resolve(cls, root, info, **args):
                if (Has permission):
                    return None
                else:
                    return some error thingo (idk what)

    AuthenticatedMongoengineConnectionField(User)
    '''
    def __init__(self, type, **kwargs):
        super().__init__(type, **kwargs)

    def default_resolver(self, _root, info, **args):
        auth_resolver = self._type.AuthenticationResolver.resolve
        resolved = auth_resolver(_root, info, **args)
        if resolved is not None:
            return resolved
        return super().default_resolver(_root, info, **args)

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
        exclude_fields = ["password"]
        #filter_fields = {"id": graphene.ID}

    class AuthenticationResolver:
        @staticmethod
        @flask_jwt_extended.jwt_required
        def resolve(root, info, **args):
            # Cant do this yet but basic logic is:
            # If we have permission return None
            # Else raise an Exception
            # raise ValueError("Youre not allowed to access this")
            '''
            current_user = flask_jwt_extended.current_user
            if current_user.id != args["id"]:
                raise ValueError("No permission to access this user")
            '''
            return None

class Query(graphene.ObjectType):
    node = Node.Field()
    all_podcast_episode_metadata = MongoengineConnectionField(PodcastEpisodeMetadata)
    all_podcast_metadata = MongoengineConnectionField(PodcastMetadata)
    #all_user = AuthenticatedMongoengineConnectionField(User)
    all_user = MongoengineConnectionField(User)

types = [PodcastEpisodeMetadata, PodcastMetadata, User]
middleware = []
