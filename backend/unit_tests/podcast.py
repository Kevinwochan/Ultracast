import webserver
from webserver.schema import schema
import webserver.db

import graphene
import graphene.test
import unittest
import snapshottest

class CreatePodcastTest(snapshottest.TestCase):
    user_id = None

    def setUp(self):
        self.client = graphene.test.Client(schema)
        # Create a user
        result = self.client.execute(''' 
            mutation create_user {
                createUser(input: {email: "test@test.com" password: "password"}) {
                    success
                    user {
                        id
                    }
                }
            }
                ''')
        self.user_id = result["data"]["createUser"]["user"]["id"]

    def test_create_podcast(self):
        # Create a podcast
        create_podcast_query =  \
            '''
              mutation  c($id: ID!) {
                createPodcastMetadata (input: {
                  author: $id
                  name: "testy_podcast"
                  description: "a description"

                }) {
                  success
                  podcastMetadata {
                    description
                    name
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
        result = self.client.execute(create_podcast_query, variables={'id': self.user_id})
        self.assertMatchSnapshot(result)

    def createPodcast(self):
        '''
        Create a podcast and return the ID
        '''
        create_podcast_query =  \
            '''
              mutation  c($id: ID!) {
                createPodcastMetadata (input: {
                  author: $id
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
                  }
                }
              }
              '''
        result = self.client.execute(create_podcast_query, variables={'id': self.user_id})
        podcast_metadata_id = result["data"]["createPodcastMetadata"]["podcastMetadata"]["id"]
        return podcast_metadata_id

    def createPodcastEpisode(self, podcast_id):
        query = '''
            mutation createPodcast($podcast: ID!, $title: String, $description: String) {
                createPodcastEpisode(input: {podcastMetadataId: $podcast, name: $title, description: $description}) {
                    podcastMetadata {
                        name
                    }
                } 
            }
            '''
        variables = {"podcast": podcast_id, 
                "title": 
                "podcast episode title", 
                "description": "a smart descr",
                }
        
        result = self.client.execute(query, variables=variables)
        print(result)
        

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
        self.assertMatchSnapshot(self.client.execute(delete_query, variables={'id': podcast_metadata_id}))

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
        self.assertMatchSnapshot(self.client.execute(delete_query, variables={'id': podcast_metadata_id}))

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

        self.assertMatchSnapshot(self.client.execute(check_user_query, variables={"user_id": self.user_id}))
