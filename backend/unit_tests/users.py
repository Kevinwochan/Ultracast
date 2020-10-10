import webserver
from webserver.schema import schema
import webserver.db

import graphene
import graphene.test
import unittest
import snapshottest

class APITestCast(snapshottest.TestCase):
    def test_api(self):
        client = graphene.test.Client(schema)

        self.assertMatchSnapshot(client.execute(''' 
            mutation create_user {
                createUser(input: {email: "test@test.com" password: "password"}) {
                    success
                }
            }
                '''))
