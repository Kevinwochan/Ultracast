# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['APITestCast::test_api 1'] = {
    'data': {
        'createUser': {
            'success': True
        }
    }
}

snapshots['APITestCast::test_user_with_name 1'] = {
    'data': {
        'createUser': {
            'success': True,
            'user': {
                'email': 'test@test.com',
                'name': 'my name',
                'password': 'password'
            }
        }
    }
}
