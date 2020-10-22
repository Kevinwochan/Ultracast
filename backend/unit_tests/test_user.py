import webserver
from webserver.schema import schema
import webserver.db
from webserver.app import app

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

    def tearDown(self):
        # cleanup - delete user
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

        with app.test_client() as c:
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
        
