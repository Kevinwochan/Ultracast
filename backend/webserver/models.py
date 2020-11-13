'''
Schema for MongoDB
'''

import mongoengine
import mongoengine.fields as mongofields
import bson
import bson.objectid
import datetime


class PodcastMetadata(mongoengine.Document):
    meta = {'collection': 'podcast_metadata'}
    name = mongofields.StringField(required=True)
    # Bi-directional relationship with User
    # Consider the User to own the PodcastMetadata (CASCADE reverse_delete_rule is set later)
    author = mongofields.ReferenceField('User', required=True)
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    description = mongofields.StringField()

    # PodcastMetadata owns the PodcastEpisodeMetadata (CASCADE reverse_delete_rule is set later)
    episodes = mongofields.ListField(mongofields.ReferenceField("PodcastEpisodeMetadata"))

    cover_url = mongofields.StringField()
    category = mongofields.StringField()
    sub_category = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())
    # Nullify on delete
    subscribers = mongofields.ListField(mongofields.ReferenceField("User"))

class EpisodeView(mongoengine.EmbeddedDocument):
    lat_lon = mongofields.StringField()
    browser = mongofields.StringField()
    timestamp = mongofields.DateTimeField(default=datetime.datetime.now)
    is_subscribed = mongofields.BooleanField()

class PodcastEpisodeMetadata(mongoengine.Document):
    meta = {'collection': 'podcast_episode_metadata'}

    name = mongofields.StringField()
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    audio_url = mongofields.StringField()
    # Duration in seconds
    duration = mongofields.IntField()
    description = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())
    # Bidirectional relationship with PodcastMetadata. PodcastEpisodeMetadata is owned by PodcastMetadata
    podcast_metadata = mongofields.ReferenceField("PodcastMetadata", 
            reverse_delete_rule=mongoengine.CASCADE, required=True)
    
    views = mongofields.EmbeddedDocumentListField(EpisodeView)
    

class Bookmark(mongoengine.Document):
    title = mongofields.StringField()
    description = mongofields.StringField()
    last_updated = mongofields.DateTimeField(default=datetime.datetime.now)
    track_timestamp = mongofields.LongField(required=True)
    episode = mongofields.ReferenceField("PodcastEpisodeMetadata", required=True) # reverse_delete_rule=mongoengine.CASCADE

class FollowingLastListenedEntry(mongoengine.Document):
    following_email = mongofields.StringField()
    following_name = mongofields.StringField()
    last_listened = mongofields.ReferenceField("PodcastEpisodeMetadata")

class ListenHistoryEntry(mongoengine.EmbeddedDocument):
    episode = mongofields.ReferenceField(
            'PodcastEpisodeMetadata', required=True)
    listen_time = mongofields.DateTimeField(default=datetime.datetime.now)
    num_listens = mongofields.IntField(min_value=1, default=1)

class Stream(mongoengine.Document):
    meta = {'collection': 'stream'}
    # User owns the stream
    # Cascade reverse delete rule (at bottom)
    owner = mongoengine.ReferenceField("User", required=True)
    search = mongoengine.StringField(unique_with="owner")

class User(mongoengine.Document):
    meta = {
            'collection': 'user',
            }
    '''
    General
    '''
    name = mongoengine.StringField()
    '''
    User Authentication
    '''
    email = mongofields.StringField(required=True, unique=True)
    password = mongofields.StringField(required=True)
    '''
    User usage data
    '''
    subscribed_podcasts = mongofields.ListField(mongofields.ReferenceField(PodcastMetadata),
            default=list, reverse_delete_rule=mongoengine.PULL)

    searched_podcasts = mongofields.ListField(mongofields.ReferenceField(PodcastMetadata), 
            default=list, reverse_delete_rule=mongoengine.PULL)

    # Sorted with most recent entry first
    listen_history = mongofields.EmbeddedDocumentListField(ListenHistoryEntry)

    bookmarks = mongofields.ListField(mongoengine.ReferenceField(Bookmark, unique=True, reverse_delete_rule=mongoengine.PULL))
    following = mongofields.ListField(mongofields.ReferenceField("User"))

    # For previous session
    last_login = mongofields.DateTimeField(default=datetime.datetime.now)
    # For current session
    login_time = mongofields.DateTimeField(default=datetime.datetime.now)

    # Bi-directional relationship with PodcastMetadata
    # Consider the User to own the PodcastMetadata
    published_podcasts = mongofields.ListField(
            mongofields.ReferenceField(PodcastMetadata, reverse_delete_rule=mongoengine.DENY), default=list)

    # User owns the stream
    streams = mongofields.ListField(mongoengine.ReferenceField(Stream, unique=True, reverse_delete_rule=mongoengine.PULL))

# Register reverse delete rules
User.register_delete_rule(PodcastMetadata, "author", mongoengine.CASCADE)
PodcastEpisodeMetadata.register_delete_rule(PodcastMetadata, "episodes", mongoengine.PULL)
User.register_delete_rule(PodcastMetadata, "subscribers", mongoengine.PULL)
#PodcastEpisodeMetadata.register_delete_rule(EpisodeView, "views", mongoengine.CASCADE)

# A little mean but this is the only reverse delete rule we can use in embedded documents...
PodcastEpisodeMetadata.register_delete_rule(User, "listen_history__episode", mongoengine.DENY)

PodcastEpisodeMetadata.register_delete_rule(Bookmark, "episode", mongoengine.CASCADE)

User.register_delete_rule(Stream, "owner", mongoengine.CASCADE)
