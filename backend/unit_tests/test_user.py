import webserver
from webserver.schema import schema
import webserver.db
from webserver.app import create_app

import graphene
import graphene.test
import unittest
import snapshottest
import json
import time
import datetime
import dateutil

class APITestCast(snapshottest.TestCase):
    jwt_token = None
    app = create_app()

    def tearDown(self):
        # cleanup - delete user
        if self.jwt_token is not None:
            query = '''
            mutation delete_user {
                deleteUser (input: {}){
                    success
                }
            }'''
            self.execute_with_jwt(query)

    def execute_with_jwt(self, query, context={}, variables={}, **kwargs):
        json_request = {
                "query": query,
                "variables": variables
                }

        with self.app.test_client() as c:
            context["Authorization"] = "Bearer " + str(self.jwt_token)
            rv = c.post("/graphql", json=json_request, headers=context)
            result = rv.get_json()
            if (result.get("errors")):
                raise ValueError(result.get("errors"))
            return result

    def test_create_user(self):
        # Create a user
        result = self.execute_with_jwt(''' 
            mutation create_user {
                createUser(input: {email: "testytest123@test.com" password: "password" name: "oli the tester"}) {
                    success
                    failWhy
                    user {
                        email
                        name
                    }
                    token
                }
            }
                ''')
        self.jwt_token = result["data"]["createUser"].pop("token")
        self.assertMatchSnapshot(result, "Create a user")

    def test_login(self):
        # Create a user
        email = "testytest1234@test.com"
        result = self.execute_with_jwt(''' 
            mutation create_user($email: String!) {
                createUser(input: {email: $email password: "password" name: "oli the tester"}) {
                    success
                    failWhy
                    user {
                        email
                        name
                    }
                    token
                }
            }
                ''', variables={"email": email})
        self.jwt_token = result["data"]["createUser"].pop("token")
        self.assertMatchSnapshot(result, "Create a user")

        # Try login with wrong email
        login_query = \
            '''
            mutation l ($email: String! $password: String!){
                login(input: {email: $email password: $password}) {
                    success
                    message
                }
            }
            '''
        result = self.execute_with_jwt(login_query, variables={"email": email, "password": "wrong password"})
        self.assertMatchSnapshot(result, "login with invalid password")

        # Wait a second so we can check last login time
        time.sleep(2)

        result = self.execute_with_jwt(login_query, variables={"email": email, "password": "password"})
        self.assertMatchSnapshot(result, "login with correct password")

        # Check login time
        result = self.execute_with_jwt(
            '''
            query a($email: String!) {
                allUser(email: $email) {
                    edges {
                        node {
                            lastLogin
                        }
                    }
                }
            }
            ''', 
            variables={"email": email})

        #print(result)
        last_login_time = dateutil.parser.parse(result["data"]["allUser"]["edges"][0]["node"]["lastLogin"])
        self.assertLess(last_login_time - datetime.datetime.now(), datetime.timedelta(seconds=1), 
                "last login time too old")

    def test_current_user(self):
        # Create a user
        result = self.execute_with_jwt(''' 
            mutation create_user {
                createUser(input: {email: "testytest123@test.com" password: "password" name: "oli tests current user"}) {
                    success
                    failWhy
                    user {
                        email
                        name
                    }
                    token
                }
            }
                ''')
        self.assertTrue(result["data"]["createUser"]["success"])
        self.jwt_token = result["data"]["createUser"].pop("token")

        # Query that the name and email are correct
        result = self.execute_with_jwt(
            '''
            query currUser {
                currentUser {
                    name
                    email
                    publishedPodcasts {
                        edges {
                            node {
                                name
                            }
                        }
                    }
                }
            }
            ''')
        self.assertMatchSnapshot(result, "Current user is the last logged in user")

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
        result = self.execute_with_jwt(create_podcast_query, variables={})
        podcast_metadata_id = result["data"]["createPodcastMetadata"]["podcastMetadata"]["id"]
        return podcast_metadata_id

    def test_new_subscribed_episodes(self):
        # Create a user
        email = "testytest1234@test.com"
        result = self.execute_with_jwt(''' 
            mutation create_user($email: String!) {
                createUser(input: {email: $email password: "password" name: "oli the tester"}) {
                    success
                    failWhy
                    user {
                        email
                        name
                    }
                    token
                }
            }
                ''', variables={"email": email})
        self.jwt_token = result["data"]["createUser"].pop("token")
        self.assertTrue(result["data"]["createUser"]["success"])
        
        # Create a podcast
        podcast_id = self.createPodcast()

        # Create a podcast episode
        self.execute_with_jwt(
            '''
            mutation createPodcast($podcast: ID!, $title: String, $description: String, $keywords: [String]!) {
                createPodcastEpisode(input: {podcastMetadataId: $podcast, name: $title, description: $description, keywords: $keywords}) {
                    podcastMetadata {
                        name
                        description
                        keywords
                    }
                } 
            }
            ''',
            variables = {"podcast": podcast_id, 
                "title": "podcast episode title", 
                "description": "a smart descr",
                "keywords": ["key1", "k2", "k3"]
                })

        # Subscribe
        self.execute_with_jwt(
            '''
            mutation a($podcast: ID!) {
                subscribePodcast(input: {
                    podcastMetadataId: $podcast
                }) {
                    success
                }
            }
            ''', variables={"podcast": podcast_id})
        

        # Wait a moment
        time.sleep(1)

        # Sign in
        login_query = \
            '''
            mutation l ($email: String! $password: String!){
                login(input: {email: $email password: $password}) {
                    success
                    message
                    token
                }
            }
            '''
        result = self.execute_with_jwt(login_query, variables={"email": email, "password": "password"})
        self.jwt_token = result["data"]["login"]["token"]

        # Check that we have a new podcast to view

        result = self.execute_with_jwt(
            '''
            query a {
                newSubscribedPodcasts {
                    edges {
                        node {
                            name
                        }
                    }
                }
            }
            ''')
        self.assertMatchSnapshot(result)

    def createUser(self, email):
        # Create a user
        result = self.execute_with_jwt(''' 
            mutation create_user($email: String!) {
                createUser(input: {email: $email password: "password" name: "oli the tester"}) {
                    success
                    failWhy
                    user {
                        email
                        name
                    }
                    token
                }
            }
                ''', variables={"email": email})
        self.jwt_token = result["data"]["createUser"].pop("token")
        self.assertTrue(result["data"]["createUser"]["success"])

        
    def test_save_stream(self):
        self.createUser(email="danTheMan@test.com")
        
        save_stream_query = \
            '''
            mutation new_stream {
                createStream(input: {search: "dan the man 2 - electric boogadan"}) {
                    success
                    stream {
                        search
                    }
                    user {
                        streams {
                            edges {
                                node {
                                    search
                                }
                            }
                        }
                    }
                }
            }
            '''
        result = self.execute_with_jwt(save_stream_query)
        self.assertMatchSnapshot(result, "Stream is saved")

    def test_update_stream(self):
        self.createUser(email="danTheMan@test.com")

        save_stream_query = \
            '''
            mutation new_stream {
                createStream(input: {search: "dan the man 2 - electric boogadan"}) {
                    success
                    stream {
                        search
                        id
                    }
                    user {
                        streams {
                            edges {
                                node {
                                    search
                                }
                            }
                        }
                    }
                }
            }
            '''
        result = self.execute_with_jwt(save_stream_query)
        assert(result["data"]["createStream"]["success"])
        stream_id = result["data"]["createStream"]["stream"]["id"]

        update_stream_query = \
            '''
            mutation update_stream($stream_id: ID!) {
                updateStream(input: {
                    streamId: $stream_id 
                    search: "dan the man 3 - 2 fast 2 dan-gerous"
                }) {
                    success
                    stream {
                        search
                    }
                    user {
                        streams {
                            edges {
                                node {
                                    search
                                }
                            }
                        }
                    }
                }
            }
            '''
        result = self.execute_with_jwt(update_stream_query, variables={"stream_id": stream_id})
        self.assertMatchSnapshot(result, "Stream is updated")


    def test_delete_stream(self):
        self.createUser(email="danTheMan@test.com")

        save_stream_query = \
            '''
            mutation new_stream {
                createStream(input: {search: "dan the man 2 - electric boogadan"}) {
                    success
                    stream {
                        search
                        id
                    }
                    user {
                        streams {
                            edges {
                                node {
                                    search
                                }
                            }
                        }
                    }
                }
            }
            '''
        result = self.execute_with_jwt(save_stream_query)
        assert(result["data"]["createStream"]["success"])
        stream_id = result["data"]["createStream"]["stream"]["id"]

        delete_stream_query = \
            '''
            mutation delete_stream($stream_id: ID!) {
                deleteStream(input: {streamId: $stream_id}) {
                    success
                    user {
                        streams {
                            edges {
                                node {
                                    search
                                }
                            }
                        }
                    }
                }
            }
            '''
        result = self.execute_with_jwt(delete_stream_query, variables={"stream_id": stream_id})
        self.assertMatchSnapshot(result, "Stream is deleted")

    def test_add_searched_podcast(self):
        self.createUser(email="danIKnowYoureReadingThis@test.com")

        podcast_id = self.createPodcast()

        mark_searched_query = \
            '''
            mutation a($podcast_id: ID!) {
              markPodcastSearched (input: {
                podcastMetadataId: $podcast_id
              }) {
                success
                user {
                  searchedPodcasts {
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
        result = self.execute_with_jwt(mark_searched_query, variables={"podcast_id": podcast_id})
        self.assertMatchSnapshot(result, "Podcast is marked as searched")
