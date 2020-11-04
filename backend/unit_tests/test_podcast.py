import webserver
from webserver.schema import schema
import webserver.db
from webserver.app import create_app

import graphene
import graphene.test
import unittest
import snapshottest
import json

app = create_app()

class CreatePodcastTest(snapshottest.TestCase):
    user_id = None
    jwt_token = None
    maxDiff = None

    def setUp(self):
        self.client = graphene.test.Client(schema)
        # Create a user
        result = self.execute_with_jwt(''' 
            mutation create_user {
                createUser(input: {email: "taa1h13hfj311112112131112esty_testy123@test.com" password: "password" name: "oli the tester"}) {
                    success
                    user {
                        id
                    }
                    token
                    failWhy
                }
            }
                ''')
        if not result["data"]["createUser"]["success"]:
            raise RuntimeError("Failed to create user: {}".format(result["data"]["createUser"]["failWhy"]))
        self.user_id = result["data"]["createUser"]["user"]["id"]
        self.jwt_token = result["data"]["createUser"]["token"]

    def tearDown(self):
        query = '''
        mutation delete_user {
            deleteUser (input: {}){
                success
            }
        }'''
        result = self.execute_with_jwt(query)

    def execute_with_jwt(self, query, context={}, variables={}, **kwargs):
        json_request = {
                "query": query,
                "variables": variables
                }

        with app.test_client() as c:
            context["Authorization"] = "Bearer " + str(self.jwt_token)
            rv = c.post("/graphql", json=json_request, headers=context)
            result = rv.get_json()
            if (result.get("errors")):
                raise ValueError(result.get("errors"))
            return result
            #return self.client.execute(query, context=context, **kwargs)

    def test_create_podcast(self):
        # Create a podcast
        create_podcast_query =  \
            '''
              mutation  c($keywords: [String]!) {
                createPodcastMetadata (input: {
                  name: "testy_podcast"
                  description: "a description"
                  category: "a test category"
                  subCategory: "a subcategory"
                  keywords: $keywords

                }) {
                  success
                  podcastMetadata {
                    description
                    name
                    category
                    subCategory
                    keywords
                    episodes {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                  }
                }
              }
              '''
        result = self.execute_with_jwt(create_podcast_query, 
                variables={'id': self.user_id, 'keywords': ['keyword1', 'key2']})
        self.assertMatchSnapshot(result)


    def createPodcast(self):
        '''
        Create a podcast and return the ID
        '''
        create_podcast_query =  \
            '''
              mutation  c {
                createPodcastMetadata (input: {
                  name: "testy_podcast"
                  description: "a description"

                }) {
                  success
                  podcastMetadata {
                    description
                    name
                    id
                    episodes {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                    author {
                        name
                    }
                  }
                }
              }
              '''
        result = self.execute_with_jwt(create_podcast_query, variables={'id': self.user_id})
        podcast_metadata_id = result["data"]["createPodcastMetadata"]["podcastMetadata"]["id"]
        return podcast_metadata_id

    def test_create_podcast_episode(self):
        podcast_id = self.createPodcast()
        query = '''
            mutation createPodcast($podcast: ID!, $title: String, $description: String, $keywords: [String]!) {
                createPodcastEpisode(input: {podcastMetadataId: $podcast, name: $title, description: $description, keywords: $keywords}) {
                    podcastMetadata {
                        name
                        description
                        keywords
                    }
                } 
            }
            '''
        variables = {"podcast": podcast_id, 
                "title": 
                "podcast episode title", 
                "description": "a smart descr",
                "keywords": ["key1", "k2", "k3"]
                }
        
        result = self.execute_with_jwt(query, variables=variables)
        self.assertMatchSnapshot(result)


    def createPodcastEpisode(self, podcast_id):
        query = '''
            mutation createPodcast($podcast: ID!, $title: String, $description: String) {
                createPodcastEpisode(input: {podcastMetadataId: $podcast, name: $title, description: $description}) {
                    podcastMetadata {
                        name
                    }
                    podcastEpisodeMetadata {
                        id
                    }
                } 
            }
            '''
        variables = {"podcast": podcast_id, 
                "title": 
                "podcast episode title", 
                "description": "a smart descr",
                }
        
        result = self.execute_with_jwt(query, variables=variables)

        return result["data"]["createPodcastEpisode"]["podcastEpisodeMetadata"]["id"]

        

    def test_delete_podcast_no_episode(self):
        podcast_metadata_id = self.createPodcast()

        delete_query = '''
        mutation delete ($id: ID!) {
          deletePodcastMetadata(input: {
            podcastMetadataId: $id
          }) {
            success
            numDeletedEpisodes
          }
        }
        '''
        self.assertMatchSnapshot(self.execute_with_jwt(delete_query, variables={'id': podcast_metadata_id}))

    def test_delete_podcast_1_episode(self):
        podcast_metadata_id = self.createPodcast()
        self.createPodcastEpisode(podcast_metadata_id)

        delete_query = '''
        mutation delete ($id: ID!) {
          deletePodcastMetadata(input: {
            podcastMetadataId: $id
          }) {
            success
            numDeletedEpisodes
          }
        }
        '''
        self.assertMatchSnapshot(self.execute_with_jwt(delete_query, variables={'id': podcast_metadata_id}))

        # Check that the creator has the podcast removed
        check_user_query = '''
            query check_user ($user_id: ID!) {
                allUser(id: $user_id) {
                    edges {
                        node {
                            publishedPodcasts {
                                edges {
                                    node {
                                        name
                                        description
                                    }
                                }
                            }
                        }
                    }
                }
            }
            '''

        self.assertMatchSnapshot(self.execute_with_jwt(check_user_query, variables={"user_id": self.user_id}))

    def test_delete_podcast_1_episode_1_listener(self):
        podcast_metadata_id = self.createPodcast()
        podcast_episode_id = self.createPodcastEpisode(podcast_metadata_id)

        # Mark the podcast as listened to
        result = self.execute_with_jwt(
            '''
            mutation mark_listened($podcast_id: ID!) {
                markPodcastListened(input: {
                    podcastEpisodeMetadataId: $podcast_id
                }) {
                    success
                    user {
                        listenHistory {
                            edges {
                                node {
                                    episode {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }''', variables={"podcast_id": podcast_episode_id})

        self.assertMatchSnapshot(result, "Podcast episode is added to listen history")

        delete_query = '''
        mutation delete ($id: ID!) {
          deletePodcastMetadata(input: {
            podcastMetadataId: $id
          }) {
            success
            numDeletedEpisodes
          }
        }
        '''
        self.assertMatchSnapshot(self.execute_with_jwt(delete_query, variables={'id': podcast_metadata_id}))

        # Check that the creator has the podcast removed
        check_user_query = '''
            query check_user ($user_id: ID!) {
                allUser(id: $user_id) {
                    edges {
                        node {
                            listenHistory {
                                edges {
                                    node {
                                        episode {
                                            name
                                        }
                                    }
                                }
                            }
                            publishedPodcasts {
                                edges {
                                    node {
                                        name
                                        description
                                    }
                                }
                            }
                        }
                    }
                }
            }
            '''

        self.assertMatchSnapshot(self.execute_with_jwt(check_user_query, variables={"user_id": self.user_id}))

    def test_mark_podcast_listened_duplicates(self):
        podcast_metadata_id = self.createPodcast()
        podcast_episode_id = self.createPodcastEpisode(podcast_metadata_id)

        # Listen to the podcast twice
        mark_listened_query = \
            '''
            mutation mark_listened($podcast_id: ID!) {
                markPodcastListened(input: {
                    podcastEpisodeMetadataId: $podcast_id
                }) {
                    success
                    user {
                        listenHistory {
                            edges {
                                node {
                                    episode {
                                        name
                                    }
                                    numListens
                                }
                            }
                        }
                    }
                }
            }'''
        result = self.execute_with_jwt(mark_listened_query, variables={"podcast_id": podcast_episode_id})
        self.assertMatchSnapshot(result, "Podcast episode is added to listen history")
        
        result = self.execute_with_jwt(mark_listened_query, variables={"podcast_id": podcast_episode_id})
        self.assertMatchSnapshot(result, "Podcast episode is not added a second time")



    def test_update_podcast(self):
        podcast_metadata_id = self.createPodcast()

        update_query = '''
            mutation update_podcast($podcast_id: ID!) {
                  updatePodcastMetadata(input: {
                    podcastMetadataId: $podcast_id
                    name: "an updated name"
                    description: "an updated description"
                    keywords: ["one new keyword", "two", "three"]
                    
                  }){
                    success
                    podcastMetadata {
                        description
                        name
                        keywords
                  }
                }
            }
            '''
        variables = {"podcast_id": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(update_query, variables=variables))

    def test_subscribe(self):
        podcast_metadata_id = self.createPodcast()

        query = \
            '''
            mutation a($podcast_id: ID!) {
                subscribePodcast(input: {
                    podcastMetadataId: $podcast_id
                }) {
                    success
                }
            }
            '''

        variables = {"podcast_id": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(query, variables=variables))

        # Check that the user has subscribed
        check_user_query = \
            '''
            query a($user: ID!){
                allUser(id: $user) {
                    edges {
                        node {
                            subscribedPodcasts { 
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
            '''
        check_user_variables = {"user": self.user_id}
        self.assertMatchSnapshot(self.execute_with_jwt(check_user_query, variables=check_user_variables))

        # Check that the podcast has the user listed as a subscriber
        check_podcast_query = \
            '''
            query a($podcast: ID!) {
                allPodcastMetadata(id: $podcast) {
                    edges {
                        node {
                            subscribers {
                                edges {
                                    node {
                                        name
                                    }
                                }
                                totalCount
                            }
                        }
                    }
                }
            }
            '''
        check_podcast_variables = {"podcast": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(check_podcast_query, variables=check_podcast_variables))

    def test_unsubscribe(self):
        ''' 
        Subscribe to a podcast then unsubscribe
        '''
    
        podcast_metadata_id = self.createPodcast()

        query = \
            '''
            mutation a($podcast_id: ID!) {
                subscribePodcast(input: {
                    podcastMetadataId: $podcast_id
                }) {
                    success
                }
            }
            '''

        variables = {"podcast_id": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(query, variables=variables))

        '''
        Unsubscribe
        '''

        unsub_query = \
            '''
            mutation a($podcast_id: ID!) {
                unsubscribePodcast(input: {
                    podcastMetadataId: $podcast_id
                }) {
                    success
                }
            }
            '''
        unsub_variables = {"podcast_id": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(unsub_query, variables=unsub_variables), "failed to unsubscribe")

        '''
        Check user and podcast that user is not sub'd
        '''

        check_user_query = \
            '''
            query a($user: ID!){
                allUser(id: $user) {
                    edges {
                        node {
                            subscribedPodcasts { 
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
            '''
        check_user_variables = {"user": self.user_id}
        self.assertMatchSnapshot(self.execute_with_jwt(check_user_query, variables=check_user_variables))

        # Check that the podcast does not have user listed as a subscriber
        check_podcast_query = \
            '''
            query a($podcast: ID!) {
                allPodcastMetadata(id: $podcast) {
                    edges {
                        node {
                            subscribers {
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
            '''
        check_podcast_variables = {"podcast": podcast_metadata_id}
        self.assertMatchSnapshot(self.execute_with_jwt(check_podcast_query, variables=check_podcast_variables))


