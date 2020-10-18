'''
Schema for MongoDB
'''

import mongoengine
import mongoengine.fields as mongofields
import datetime


class PodcastEpisodeMetadata(mongoengine.EmbeddedDocument):
    name = mongofields.StringField()
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    audio_url = mongofields.StringField()
    description = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())

class PodcastMetadata(mongoengine.Document):
    meta = {'collection': 'podcast_metadata'}
    name = mongofields.StringField(required=True)
    # Bi-directional relationship with User
    # Consider the User to own the PodcastMetadata
    author = mongofields.ReferenceField('User', required=True)
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    description = mongofields.StringField()
    episodes = mongofields.EmbeddedDocumentListField(PodcastEpisodeMetadata)
    cover = mongofields.FileField()
    category = mongofields.StringField()
    sub_category = mongofields.StringField()
    keywords = mongofields.ListField(mongofields.StringField())

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
    # I'm having an issue with graphene + lists of embedded documents (not sure why...)
    # Comment out for now
    listen_history = mongofields.EmbeddedDocumentListField(ListenHistoryEntry)

    # Bi-directional relationship with PodcastMetadata
    # Consider the User to own the PodcastMetadata
    published_podcasts = mongofields.ListField(
            mongofields.ReferenceField(PodcastMetadata, reverse_delete_rule=mongoengine.DENY), default=list)

