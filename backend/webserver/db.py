from mongoengine import connect

import models
import schema

# Amazon EC2 instance
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
'''
# Local mongo instance
MONGO_USERNAME = 'ultracast'
MONGO_PASSWORD = 'abcdefg'
MONGO_IP = 'localhost'
MONGO_AUTH_DB = 'admin'
'''

'''
To setup a local user, open up mongo terminal and then execute this query:
use admin
db.createUser({
    user: "ultracast", 
    pwd: "abcdefg",
    roles: [{role: "readWrite", db: "ultracast_sandbox"}]
    })
'''


MONGO_URL = f'mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_IP}/{MONGO_AUTH_DB}'


connect(db='ultracast_sandbox', host=MONGO_URL)


