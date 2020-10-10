import graphene
import graphql
from graphene.relay import Node, ClientIDMutation
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import models
import mutations
import query

'''
Trying things out relay style...
See https://docs.graphene-python.org/en/latest/relay/mutations/
and https://github.com/graphql-python/graphene/blob/master/graphene/relay/mutation.py
'''

def get_node_from_global_id(info, global_id, only_type):
    '''
    Does the same thing as Node.get_node_from_global_id, but throws an exception instead of returning None
    '''
    node = Node.get_node_from_global_id(info, global_id, only_type=only_type)
    if node is None:
        raise ValueError("Invalid id for type {}: {}".format(only_type.__name__, global_id))
    return node

###########################################################################################################
#                                           PodcastEpisode                                                #
###########################################################################################################
class DeletePodcastEpisode(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        # Can provide either id
        podcast_episode_id = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_episode_id):
        # Lookup the mongodb object from the relay Node ID
        podcast_episode = get_node_from_global_id(info=info, global_id=podcast_episode_id, only_type=query.PodcastEpisode)

        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=podcast_episode).get()
        podcast_metadata.episodes.filter(episode=podcast_episode).delete()
        podcast_metadata.save()

        podcast_episode.delete()

        return DeletePodcastEpisode(success=True)

class UpdatePodcastEpisode(ClientIDMutation):
    podcast_episode = graphene.Field(query.PodcastEpisode)
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    podcast_episode_metadata = graphene.Field(query.PodcastEpisodeMetadata)
    success = graphene.Boolean()

    class Input:
        podcast_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload()

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_id, name=None, description=None, audio=None):
        # Retrieve the episode
        episode = get_node_from_global_id(info, podcast_id, only_type=query.PodcastEpisode)
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
            podcast_episode_metadata=podcast_episode_metadata,
            success=success)

class CreatePodcastEpisodeMutation(ClientIDMutation):
    podcast_episode = graphene.Field(query.PodcastEpisode)
    podcast_metadata = graphene.Field(query.PodcastMetadata)

    class Input:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id=None, name=None, description=None, audio=None):
        episode = models.PodcastEpisode(audio=audio)
        episode.save()
        episode_metadata = models.PodcastEpisodeMetadata(name=name, description=description, episode=episode)
        podcast_metadata = get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)
        podcast_metadata.episodes.append(episode_metadata)
        podcast_metadata.save()

        return CreatePodcastEpisodeMutation(podcast_episode=episode,
                podcast_metadata=podcast_metadata)

###########################################################################################################
#                                           PodcastMetadata                                               #
###########################################################################################################

class CreatePodcastMetadata(ClientIDMutation):
    success = graphene.Boolean()
    podcast_metadata = graphene.Field(query.PodcastMetadata)
    class Input:
        name = graphene.String(required=True)
        author = graphene.ID(required=True)
        description = graphene.String()
        cover = graphene_file_upload.scalars.Upload()
    
    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        author = get_node_from_global_id(info, input["author"], only_type=query.User)
        podcast_metadata_args = input
        podcast_metadata_args["author"] = author.id
        
        # De dictionary the kwargs (by design match up with the model)
        podcast_metadata = models.PodcastMetadata(**podcast_metadata_args)
        podcast_metadata.save()

        author.published_podcasts.append(podcast_metadata)
        author.save()

        return CreatePodcastMetadata(success=True, podcast_metadata=podcast_metadata)



class Mutations(graphene.ObjectType):
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    delete_podcast_episode = DeletePodcastEpisode.Field()
    update_podcast_episode = UpdatePodcastEpisode.Field()
    create_podcast_metadata = CreatePodcastMetadata.Field()
