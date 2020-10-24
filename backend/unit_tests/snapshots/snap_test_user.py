# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['APITestCast::test_create_user Create a user'] = {
    'data': {
        'createUser': {
            'failWhy': None,
            'success': True,
            'user': {
                'email': 'testytest123@test.com',
                'name': 'oli the tester'
            }
        }
    }
}

snapshots['APITestCast::test_create_user Delete a user'] = {
    'data': {
        'deleteUser': {
            'success': True
        }
    }
}

snapshots['APITestCast::test_current_user Current user is the last logged in user'] = {
    'data': {
        'currentUser': {
            'email': 'testytest123@test.com',
            'name': 'oli tests current user',
            'publishedPodcasts': {
                'edges': [
                ]
            }
        }
    }
}

snapshots['APITestCast::test_login Create a user'] = {
    'data': {
        'createUser': {
            'failWhy': None,
            'success': True,
            'user': {
                'email': 'testytest1234@test.com',
                'name': 'oli the tester'
            }
        }
    }
}

snapshots['APITestCast::test_login login with correct password'] = {
    'data': {
        'login': {
            'message': None,
            'success': True
        }
    }
}

snapshots['APITestCast::test_login login with invalid password'] = {
    'data': {
        'login': {
            'message': 'Invalid password',
            'success': False
        }
    }
}

snapshots['APITestCast::test_new_subscribed_episodes 1'] = {
    'data': {
        'newSubscribedPodcasts': {
            'edges': [
                {
                    'node': {
                        'name': 'podcast episode title'
                    }
                }
            ]
        }
    }
}
