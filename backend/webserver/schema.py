'''
Schema for making GraphQL queries and mutations
'''
import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import models

'''
Don't put embedded documents as classes here. It seems to break graphene somehow
'''

class PodcastEpisode(MongoengineObjectType):
    class Meta:
        model = models.PodcastEpisode
        interfaces = (Node,)

class PodcastMetadata(MongoengineObjectType):
    class Meta:
        model = models.PodcastMetadata
        interfaces = (Node,)

class User(MongoengineObjectType):
    class Meta:
        model = models.User
        interfaces = (Node,)

class Query(graphene.ObjectType):
    node = Node.Field()
    all_podcast_episode = MongoengineConnectionField(PodcastEpisode)
    all_podcast_metadata = MongoengineConnectionField(PodcastMetadata)
    all_user = MongoengineConnectionField(User)

class DeletePodcastEpisode(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        # Can provide either id
        podcast_episode_id = graphene.ID(required=True)

    def mutate(self, info, podcast_episode_id):
        podcast_episode = models.PodcastEpisode.objects(id=podcast_episode_id).get()
        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=podcast_episode).get()
        podcast_metadata.episodes.filter(episode=podcast_episode).delete()
        podcast_metadata.save()

        podcast_episode.delete()

        return DeletePodcastEpisode(success=True)


class CreatePodcastEpisodeMutation(graphene.Mutation):
    podcast_episode = graphene.Field(PodcastEpisode)
    podcast_metadata = graphene.Field(PodcastMetadata)

    class Arguments:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        audio = graphene_file_upload.scalars.Upload(required=True)

    def mutate(self, info, podcast_metadata_id=None, name=None, description=None, audio=None):
        episode = models.PodcastEpisode(audio=audio)
        episode.save()
        episode_metadata = models.PodcastEpisodeMetadata(name=name, description=description, episode=episode)
        podcast_metadata = models.PodcastMetadata.objects(id=podcast_metadata_id).get()
        podcast_metadata.episodes.append(episode_metadata)
        podcast_metadata.save()

        return CreatePodcastEpisodeMutation(podcast_episode=episode,
                podcast_metadata=podcast_metadata)

class CreateUser(graphene.Mutation):
    '''
    Inserts a user into MongoDB
    '''
    success = graphene.Boolean()

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    def mutate(self, info, username=None, password=None, email=None):
        new_user = models.User(username=username, password=password, email=email)
        new_user.save()
        success = True
        return CreateUser(success=success)

class Mutations(graphene.ObjectType):
    '''
    User mutations
    '''
    create_user = CreateUser.Field()
    '''
    Podcast mutations
    '''
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    delete_podcast_episode = DeletePodcastEpisode.Field()

schema = graphene.Schema(query=Query, mutation=Mutations, types=[PodcastEpisode, PodcastMetadata, User])

def saveSchema(path: str):
    with open(path, "w") as fp:
        fp.write('"""\nGenerated file. Do not push into git or modify!\n"""\n')
        schema_str = graphql.utils.schema_printer.print_schema(schema)
        fp.write(schema_str)

