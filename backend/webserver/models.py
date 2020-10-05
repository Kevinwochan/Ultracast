import mongoengine
import mongoengine.fields as mongofields

import datetime

class PodcastEpisode(mongoengine.Document):
    # Storing in a seperate collection to avoid having to collect the audio file to see metadata
    meta = {'collection': 'podcast_episode'}
    # Consider the PodcastEpisodeMetadata to own the PodcastEpisode (for deletion purposes)
    audio = mongofields.FileField(required=True) 

class PodcastEpisodeMetadata(mongoengine.EmbeddedDocument):
    name = mongofields.StringField(required=True)
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    description = mongofields.StringField()

    episode = mongofields.ReferenceField(PodcastEpisode, required=True)

class PodcastMetadata(mongoengine.Document):
    meta = {'collection': 'podcast_metadata'}
    name = mongofields.StringField(required=True)
    # Bi-directional relationship with User
    # Consider the User to own the PodcastMetadata
    author = mongofields.ReferenceField('User', required=True)
    publish_date = mongofields.DateTimeField(default=datetime.datetime.now)
    description = mongofields.StringField()

    # I'm having an issue with graphene + lists of embedded documents (not sure why...)
    # Comment out for now
    #episodes = mongofields.EmbeddedDocumentListField(PodcastEpisodeMetadata)

class ListenHistoryEntry(mongoengine.EmbeddedDocument):
    episode_metadata = mongofields.ReferenceField(
            'PodcastEpisodeMetadata', required=True)
    listen_time = mongofields.DateTimeField(default=datetime.datetime.now)

class User(mongoengine.Document):
    meta = {'collection': 'user'}
    name = mongofields.StringField(required=True)
    subscribed_podcasts = mongofields.ListField(mongofields.ReferenceField(PodcastMetadata), default=list)
    # I'm having an issue with graphene + lists of embedded documents (not sure why...)
    # Comment out for now
    #listen_history = mongofields.EmbeddedDocumentListField(ListenHistoryEntry)

    # Bi-directional relationship with PodcastMetadata
    # Consider the User to own the PodcastMetadata
    published_podcasts = mongofields.ListField(
            mongofields.ReferenceField(PodcastMetadata, reverse_delete_rule=mongoengine.DENY), default=list)
