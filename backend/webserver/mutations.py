import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import models
import mutations
import query

class DeletePodcastEpisode(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        # Can provide either id
        podcast_episode_id = graphene.ID(required=True)

    def mutate(self, info, podcast_episode_id):
        # Lookup the mongodb object from the relay Node ID
        podcast_episode = Node.get_node_from_global_id(info=info, global_id=podcast_episode_id, only_type=query.PodcastEpisode)

        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=podcast_episode).get()
        podcast_metadata.episodes.filter(episode=podcast_episode).delete()
        podcast_metadata.save()

        podcast_episode.delete()

        return DeletePodcastEpisode(success=True)

class UpdatePodcastEpisode(graphene.Mutation):
    podcast_episode = graphene.Field(query.PodcastEpisode)
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    podcast_episode_metadata = graphene.Field(query.PodcastEpisodeMetadata)
    success = graphene.Boolean()

    class Arguments:
        podcast_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload()

    def mutate(self, info, podcast_id, name=None, description=None, audio=None):
        # Retrieve the episode
        episode = Node.get_node_from_global_id(info, podcast_id, only_type=query.PodcastEpisode)
        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=episode).get()
        podcast_episode_metadata = podcast_metadata.episodes.filter(episode=episode).get()
        
        # Update the modified fields (only)
        if name is not None:
            podcast_episode_metadata.name = name
        if description is not None:
            podcast_episode_metadata.description = description
        if audio is not None:
            episode.audio = audio

        # Save out our changes
        episode.save()
        podcast_metadata.save()

        success = True
        return UpdatePodcastEpisode(podcast_episode=episode, 
            podcast_metadata=podcast_metadata, 
            podcast_episode_metadata=podcast_episode_metadata)

class CreatePodcastEpisodeMutation(graphene.Mutation):
    podcast_episode = graphene.Field(query.PodcastEpisode)
    podcast_metadata = graphene.Field(query.PodcastMetadata)

    class Arguments:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload(required=True)

    def mutate(self, info, podcast_metadata_id=None, name=None, description=None, audio=None):
        episode = models.PodcastEpisode(audio=audio)
        episode.save()
        episode_metadata = models.PodcastEpisodeMetadata(name=name, description=description, episode=episode)
        podcast_metadata = Node.get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)
        podcast_metadata.episodes.append(episode_metadata)
        podcast_metadata.save()

        return CreatePodcastEpisodeMutation(podcast_episode=episode,
                podcast_metadata=podcast_metadata)


class Mutations(graphene.ObjectType):
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    delete_podcast_episode = DeletePodcastEpisode.Field()
    update_podcast_episode = UpdatePodcastEpisode.Field()
