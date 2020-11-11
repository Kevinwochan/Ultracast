import flask_jwt_extended
import graphene
import graphene_file_upload
import graphene_file_upload.scalars
import graphql
import graphql_relay
from graphene.relay import Connection, ConnectionField, Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType

from . import models
from .recommender import calculateRecommendations


class EdgeCountedConnection(graphene.Connection):
    '''
    Connection which allows you to query the number of edges
    '''
    class Meta:
        abstract = True
    
    total_count = graphene.Int()

    def resolve_total_count(self, info):
        return len(self.edges)

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
        connection_class = EdgeCountedConnection

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
        connection_class = EdgeCountedConnection

class EpisodeView(MongoengineObjectType):
    class Meta:
        model = models.EpisodeView
        interfaces = (Node,)
        connection_class = EdgeCountedConnection

class ListenHistoryEntry(MongoengineObjectType):
    class Meta:
        model = models.ListenHistoryEntry
        interfaces = (Node,)
        connection_class = EdgeCountedConnection
        order_by = "listen_time"

class Bookmark(MongoengineObjectType):
    class Meta:
        model = models.Bookmark
        interfaces = (Node,)
        connection_class = EdgeCountedConnection


class FollowingLastListenedEntry(MongoengineObjectType):
    class Meta:
        model = models.FollowingLastListenedEntry
        interfaces = (Node,)
        connection_class = EdgeCountedConnection

class Stream(MongoengineObjectType):
    class Meta:
        model = models.Stream
        interfaces = (Node,)
        connection_class = EdgeCountedConnection

class User(MongoengineObjectType):
    class Meta:
        model = models.User
        interfaces = (Node,)
        exclude_fields = ["password"]
        #filter_fields = {"id": graphene.ID}
        connection_class = EdgeCountedConnection

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


'''
Custom query field resolvers
'''

@flask_jwt_extended.jwt_required
def resolve_new_subscribed_podcasts(root, info, **args):
    user = flask_jwt_extended.current_user
    # Quite the query....
    # Find all the podcast episodes who were created since the last login date and then filter by those subscribed by this user
    iterables = models.PodcastEpisodeMetadata.objects(publish_date__gte=user.model().last_login)(podcast_metadata__in=user.model().subscribed_podcasts)
    return iterables

@flask_jwt_extended.jwt_required
def resolve_current_user(root, info):
    return flask_jwt_extended.current_user.model()

@flask_jwt_extended.jwt_required
def resolve_recommendations(root, info):
    # See 'models.py -> User' for all of the fields you can query
    subscriptions = flask_jwt_extended.current_user.model().subscribed_podcasts
    recentEpisodes = flask_jwt_extended.current_user.model().listen_history
    searches = None  # search history isn't implemented yet
    return calculateRecommendations(subscriptions, recentEpisodes, searches)

@flask_jwt_extended.jwt_required
def resolve_following_last_listened(root, info):
    following_list = flask_jwt_extended.current_user.model().following
    
    res = []
    for following in following_list:
        last_listened = None
        if len(following.listen_history) > 0:
            last_listened = following.listen_history[0].episode

        last_listened_entry = models.FollowingLastListenedEntry(
            following_email=following.email, 
            following_name=following.name,
            last_listened=last_listened)
        res.append(last_listened_entry)
    
    return res

class Query(graphene.ObjectType):
    node = Node.Field()
    all_podcast_episode_metadata = MongoengineConnectionField(PodcastEpisodeMetadata)
    all_podcast_metadata = MongoengineConnectionField(PodcastMetadata)
    #all_user = AuthenticatedMongoengineConnectionField(User)
    all_user = MongoengineConnectionField(User)
    all_stream = MongoengineConnectionField(Stream)
    '''
    Custom query to get recommended podcasts for a particular user
    '''
    recommendations = MongoengineConnectionField(PodcastMetadata,
            # subcriptions=graphene.List(PodcastMetadata),
            # recent_episodes=graphene.List(PodcastEpisodeMetadata), # OR ListenHistoryEntry
            # searches=graphene.List(PodcastMetadata),
            resolver=resolve_recommendations,
            description="Get a list of recommended podcasts given a user's existing subscriptions, \
                         recently played episodes and search history.")

    '''
    Custom query to get all the new podcasts the user has subscribed to since the last login
    '''
    new_subscribed_podcasts = MongoengineConnectionField(PodcastEpisodeMetadata, 
            resolver=resolve_new_subscribed_podcasts,
            description="Get the podcast episodes that the currently logged in user has subscribed to \
                    which were released since their last login or sign up")

    '''
    Custom query to get current logged in user
    '''
    current_user = graphene.Field(User, resolver=resolve_current_user,
            description="Get the currently logged in user (as indicated by the JWT token)")
    
    
    '''
    Custom query to get the last episode listened to by each user that the logged in user follows
    '''
    following_last_listened = MongoengineConnectionField(FollowingLastListenedEntry, 
            resolver=resolve_following_last_listened,
            description="Get the last episode listened to by each user that the logged in user follows")


types = [PodcastEpisodeMetadata, PodcastMetadata, Stream, User]
middleware = []
