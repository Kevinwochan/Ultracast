import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
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

class CreatePodcastEpisodeMutation(graphene.Mutation):
    podcast_episode = graphene.Field(PodcastEpisode)
    podcast_metadata = graphene.Field(PodcastMetadata)

    class Arguments:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        #audio = graphene_file_upload.scalars.Upload(required=True)

    def mutate(self, info, podcast_metadata_id=None, name=None, description=None, audio=None):
        episode = models.PodcastEpisode(audio=audio)
        episode.save()
        episode_metadata = models.PodcastEpisodeMetadata(name=name, description=description, episode=episode)
        podcast_metadata = models.PodcastMetadata.objects(id=podcast_metadata_id).get()
        podcast_metadata.episodes.append(episode_metadata)
        print(podcast_metadata, flush=True)
        podcast_metadata.save()

        return CreatePodcastEpisodeMutation(podcast_episode=PodcastEpisode(episode), podcast_metadata=PodcastMetadata(podcast_metadata))


class DummyMutation(graphene.Mutation):
    data = graphene.Field(graphene.String)
    class Arguments:
        data = graphene.String()
    def mutate(self, info, data=None):
        return DummyMutation(data=data)

class Mutations(graphene.ObjectType):
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    create_dummy = DummyMutation.Field()

#schema = graphene.Schema(query=Query, types=[PodcastEpisode, PodcastMetadata, PodcastEpisodeMetadata, User])
schema = graphene.Schema(query=Query, mutation=Mutations, types=[PodcastEpisode, PodcastMetadata, User])

def saveSchema(path: str):
    with open(path, "w") as fp:
        schema_str = graphql.utils.schema_printer.print_schema(schema)
        fp.write(schema_str)

