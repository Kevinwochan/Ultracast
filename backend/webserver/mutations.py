from . import models
from . import mutations
from . import query
from . import podcast_engine

import flask_jwt_extended

import graphene
import graphql
from graphene.relay import Node, ClientIDMutation
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import flask_jwt_extended
import werkzeug

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

@flask_jwt_extended.jwt_required
def assert_podcast_edit_permission(podcast_metadata):
    '''
    Checks the current user has edit permission for the podcast_metadata
    Raises a Forbidden error if not
    '''
    # Check we have permissions
    if not flask_jwt_extended.current_user.can_edit_podcast_metadata(podcast_metadata):
        raise werkzeug.exceptions.Forbidden("User {} cannot delete this podcast".format(
            flask_jwt_extended.current_user.get_email()))

###########################################################################################################
#                                           PodcastEpisode                                                #
###########################################################################################################
class DeletePodcastEpisode(ClientIDMutation):
    success = graphene.Boolean()

    class Input:
        # Can provide either id
        podcast_episode_id = graphene.ID(required=True)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_episode_id):
        
        # Lookup the mongodb object from the relay Node ID
        podcast_episode = get_node_from_global_id(info=info, global_id=podcast_episode_id, only_type=query.PodcastEpisode)
        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=podcast_episode).get()
        
        assert_podcast_edit_permission(podcast_metadata)

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
        keywords = graphene.List(graphene.String)

    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_id, name=None, description=None, audio=None, keywords=None):
        # Retrieve the episode
        episode = get_node_from_global_id(info, podcast_id, only_type=query.PodcastEpisode)
        podcast_metadata = models.PodcastMetadata.objects(episodes__episode=episode).get()
        podcast_episode_metadata = podcast_metadata.episodes.filter(episode=episode).get()

        assert_podcast_edit_permission(podcast_metadata)
        
        # Update the modified fields (only)
        if name is not None:
            podcast_episode_metadata.name = name
        if description is not None:
            podcast_episode_metadata.description = description
        if audio is not None:
            episode.audio = audio
        if keywords is not None:
            podcast_episode_metadata.keywords = keywords

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
        audio = graphene_file_upload.scalars.Upload(required=False)
        keywords = graphene.List(graphene.String)


    @classmethod
    @flask_jwt_extended.jwt_required
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id=None, audio=None, **kwargs):
        episode = models.PodcastEpisode(audio=audio)
        episode.save()
        episode_metadata = models.PodcastEpisodeMetadata(episode=episode, **kwargs)
        podcast_metadata = get_node_from_global_id(info, podcast_metadata_id, only_type=query.PodcastMetadata)

        assert_podcast_edit_permission(podcast_metadata)

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
        category = graphene.String()
        sub_category = graphene.String()
        keywords = graphene.List(graphene.String)
    
    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        # TODO: User authentication - remove author as an input and user flask_jwt_extended.current_user
        author = get_node_from_global_id(info, input["author"], only_type=query.User)
        
        podcast_metadata_args = input
        podcast_metadata_args["author"] = author.id
        
        # De dictionary the kwargs (by design match up with the model)
        podcast_metadata = models.PodcastMetadata(**podcast_metadata_args)
        podcast_metadata.save()

        author.published_podcasts.append(podcast_metadata)
        author.save()

        return CreatePodcastMetadata(success=True, podcast_metadata=podcast_metadata)

class DeletePodcastMetadata(ClientIDMutation):
    num_deleted_episodes = graphene.Int()
    success = graphene.Boolean()

    class Input:
        podcast_metadata_id = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id):
        podcast_metadata = get_node_from_global_id(info, podcast_metadata_id, 
                only_type=query.PodcastMetadata)

        assert_podcast_edit_permission(podcast_metadata)
        
        # Track through deleting all episodes
        num_deleted = 0
        for episode_metadata in podcast_metadata.episodes:
            if (episode_metadata.episode is not None): 
                episode_metadata.episode.delete()
            num_deleted += 1

        # Remove podcast from all users subscriptions
        models.User.objects(subscribed_podcasts=podcast_metadata).modify(pull__subscribed_podcasts=podcast_metadata)

        # Remove podcast_metadata from the authors published set
        podcast_metadata.author.modify(pull__published_podcasts=podcast_metadata)

        # Bye bby
        podcast_metadata.delete()
        
        success = True
        return DeletePodcastMetadata(num_deleted_episodes=num_deleted, success=success)

class UpdatePodcastMetadata(ClientIDMutation):
    success = graphene.Boolean()
    podcast_metadata = graphene.Field(query.PodcastMetadata)

    class Input:
        podcast_metadata_id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        cover = graphene_file_upload.scalars.Upload()
        category = graphene.String()
        sub_category = graphene.String()
        keywords = graphene.List(graphene.String)

    @classmethod
    def mutate_and_get_payload(cls, root, info, podcast_metadata_id, **kwargs):
        podcast_metadata = get_node_from_global_id(info, podcast_metadata_id, query.PodcastMetadata)

        assert_podcast_edit_permission(podcast_metadata)

        # Remove None's from kwargs
        filtered_args = {k: v for k, v in kwargs.items() if v is not None}
        podcast_metadata.modify(**filtered_args)

        return UpdatePodcastMetadata(success=True, podcast_metadata=podcast_metadata)

class CreateUser(ClientIDMutation):
    '''
    Inserts a user into MongoDB
    Sample payload
    mutation {
        createUser(input: {email: "test@test.com", password: "pass"} ) {
        success
        }
    }
    '''
    success = graphene.Boolean()
    user = graphene.Field(query.User)
    fail_why = graphene.String()
    token = graphene.String()

    class Input:
        password = graphene.String(required=True)
        email = graphene.String(required=True)
        name = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password, **input):
        # Check the email is unique
        new_user = None
        try:
            new_user = podcast_engine.User.create(email, password, **input)
        except ValueError as e:
            return CreateUser(success=False, fail_why=str(e))

        success = True
        token = flask_jwt_extended.create_access_token(identity=new_user)
        return CreateUser(success=success, user=new_user.model(), token=token)

class MarkedPodcastListened(ClientIDMutation):
    '''
    Mark a podcast as listened to by the user
    Not sure if we want to grab the user from the JWT
    Or pass it in as an input @Dan @Kevin
    '''
    success = graphene.Boolean()
    user = graphene.Field(query.User)

    class Input:
        podcast_episode_id = graphene.ID(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, user_id, podcast_episode_id):
        user = flask_jwt_extended.current_user
        episode = get_node_from_global_id(info, podcast_episode_id, only_type=query.PodcastEpisode)
        listen_entry = models.ListenHistoryEntry(episode=episode)
        user.listen_history.append(listen_entry)
        user.save()
        return MarkedPodcastListened(success=True, user=user)

class Login(ClientIDMutation):
    success = graphene.Boolean()
    token = graphene.String()
    message = graphene.String()
    user = graphene.Field(query.User)

    class Input:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, email, password):
        user = podcast_engine.User.from_email(email)
        if user is None:
            return Login(success=False, message="Invalid username")

        if not user.check_password(password):
            return Login(success=False, message="Invalid password")

        token = flask_jwt_extended.create_access_token(identity=user)
        return Login(success=True, token=token, user=user.model())
        

class Mutations(graphene.ObjectType):
    '''
    Podcast mutations
    '''
    create_podcast_episode = CreatePodcastEpisodeMutation.Field()
    delete_podcast_episode = DeletePodcastEpisode.Field()
    update_podcast_episode = UpdatePodcastEpisode.Field()
    create_podcast_metadata = CreatePodcastMetadata.Field()
    delete_podcast_metadata = DeletePodcastMetadata.Field()
    update_podcast_metadata = UpdatePodcastMetadata.Field()
    '''
    User mutations
    '''
    create_user = CreateUser.Field()
    login = Login.Field()
    '''
    Business Logic mutations
    '''
    mark_podcast_listened = MarkedPodcastListened.Field()

middleware = []
