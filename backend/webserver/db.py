from mongoengine import connect

import models
import schema

# Amazon EC2 instance
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
'''
# Local mongo instance
MONGO_USERNAME = 'ultracast'
MONGO_PASSWORD = 'abcdefg'
MONGO_IP = 'localhost'
MONGO_AUTH_DB = 'admin'
'''

'''
To setup a local user, open up mongo terminal and then execute this query:
use admin
db.createUser({
    user: "ultracast", 
    pwd: "abcdefg",
    roles: [{role: "readWrite", db: "ultracast_sandbox"}]
    })
'''


MONGO_URL = f'mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_IP}/{MONGO_AUTH_DB}'


connect(db='ultracast_sandbox', host=MONGO_URL)


def init_db():
    # Save out the graphql schema
    schema.saveSchema("schema.graphql")
    # Create the fixtures
    default_user = models.User(name="oli")

    podcast_metadata = models.PodcastMetadata(name="oli's podcast", author=default_user, description="a cool podcast")
    default_user.published_podcasts.append(podcast_metadata)
    
    with open('resources/sample_audio.mp4', 'rb') as audio_file:
        podcast_episode = models.PodcastEpisode(audio=audio_file)

    podcast_episode_meta = models.PodcastEpisodeMetadata(name="first episode", description="my first podcast episode", episode=podcast_episode)
    podcast_metadata.episodes.append(podcast_episode_meta)

    podcast_episode.save()
    default_user.save()
    podcast_metadata.save()
    print("Done init_db")
