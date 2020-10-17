from . import models
from . import schema

import boto3
from botocore.client import Config
from mongoengine import connect

# Mongodb connection
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
MONGO_DB = 'ultracast_sandbox'

MONGO_URI = f'mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_IP}/{MONGO_DB}?authSource={MONGO_AUTH_DB}'

connect(host=MONGO_URI)

# Digital Ocean Space (Static-Files)
session = boto3.session.Session()
client = session.client('s3',
                        region_name='sfo2',
                        endpoint_url='https://sfo2.digitaloceanspaces.com',
                        aws_access_key_id='CUT4SK6OYILHJJV3B5LD',
                        aws_secret_access_key='yyIXed9h9kn6n9V4c/b64+ZRHtP8baR89lp3dqvOY34')

BUCKET = 'ultracast-files'
FILE_ACCESS = 'public-read'

def checkStatus(resp, ok_statuses):
    if resp['ResponseMetadata']['HTTPStatusCode'] not in ok_statuses:
        print(resp)
        return False
    return True

def addFile(filename, file):
    resp = client.put_object(Body=file, Bucket=BUCKET, Key=filename, ACL=FILE_ACCESS)
    return checkStatus(resp, [200])

def removeFile(filename):
    resp = client.delete_object(Bucket=BUCKET, Key=filename)
    return checkStatus(resp, [200, 204])