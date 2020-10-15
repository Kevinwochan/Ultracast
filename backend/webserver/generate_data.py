import db
import models
import schema

def init_db():
    # Create the fixtures
    default_user = models.User(name="oli")
    default_user.save()

    podcast_metadata = models.PodcastMetadata(name="oli's podcast", author=default_user, description="a cool podcast")
    podcast_metadata.save()
    default_user.published_podcasts.append(podcast_metadata)

    
    with open('resources/sample_audio.mp4', 'rb') as audio_file:
        podcast_episode = models.PodcastEpisode(audio=audio_file)

    podcast_episode_meta = models.PodcastEpisodeMetadata(name="first episode", description="my first podcast episode", episode=podcast_episode)
    podcast_metadata.episodes.append(podcast_episode_meta)

    podcast_episode.save()
    podcast_metadata.save()
    default_user.save()
    print("Done init_db")

if __name__ == "__main__":
    init_db()
