'''
Schema for MongoDB
'''

import mongoengine
import mongoengine.fields as mongofields
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

    cover = mongofields.FileField()
    category = mongofields.StringField()
    sub_category = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())
    # Nullify on delete
    subscribers = mongofields.ListField(mongofields.ReferenceField("User"))

class PodcastEpisodeMetadata(mongoengine.Document):
    meta = {'collection': 'podcast_episode_metadata'}

    name = mongofields.StringField()
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    audio_url = mongofields.StringField()
    description = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())
    # Bidirectional relationship with PodcastMetadata. PodcastEpisodeMetadata is owned by PodcastMetadata
    podcast_metadata = mongofields.ReferenceField("PodcastMetadata", 
            reverse_delete_rule=mongoengine.CASCADE, required=True)

class ListenHistoryEntry(mongoengine.EmbeddedDocument):
    episode = mongofields.ReferenceField(
            'PodcastEpisodeMetadata', required=True)
    listen_time = mongofields.DateTimeField(default=datetime.datetime.now)

class User(mongoengine.Document):
    meta = {'collection': 'user'}
    '''
    General
    '''
    name = mongoengine.StringField()
    '''
    User Authentication
    '''
    email = mongofields.StringField(required=True)
    password = mongofields.StringField(required=True)
    '''
    User usage data
    '''
    subscribed_podcasts = mongofields.ListField(mongofields.ReferenceField(PodcastMetadata), default=list)
    listen_history = mongofields.EmbeddedDocumentListField(ListenHistoryEntry)
    last_login = mongofields.DateTimeField(default=datetime.datetime.now)

    # Bi-directional relationship with PodcastMetadata
    # Consider the User to own the PodcastMetadata
    published_podcasts = mongofields.ListField(
            mongofields.ReferenceField(PodcastMetadata, reverse_delete_rule=mongoengine.DENY), default=list)


# Register reverse delete rules
User.register_delete_rule(PodcastMetadata, "author", mongoengine.CASCADE)
PodcastEpisodeMetadata.register_delete_rule(PodcastMetadata, "episodes__S", mongoengine.CASCADE)
User.register_delete_rule(PodcastMetadata, "subscribers__S", mongoengine.NULLIFY)
