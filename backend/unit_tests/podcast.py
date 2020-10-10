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


    def test_api(self):


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

