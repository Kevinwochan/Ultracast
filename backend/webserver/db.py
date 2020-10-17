from . import models
from . import schema

import re
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

REGION = 'sf02'
STATIC_FILE_BASE_URL = f'https://{REGION}.digitaloceanspaces.com'
session = boto3.session.Session()
client = session.client('s3',
                        region_name=REGION,
                        endpoint_url=STATIC_FILE_BASE_URL,
                        aws_access_key_id='CUT4SK6OYILHJJV3B5LD',
                        aws_secret_access_key='yyIXed9h9kn6n9V4c/b64+ZRHtP8baR89lp3dqvOY34')

BUCKET = 'ultracast-files'
FILE_ACCESS = 'public-read'

def getFileUrl(filename):
    return re.sub(r"^https://", f"https://{BUCKET}.", STATIC_FILE_BASE_URL) + f"/{filename}"

def checkStatus(resp, ok_statuses):
    return {'ok': resp['ResponseMetadata']['HTTPStatusCode'] not in ok_statuses, 'server_response': resp}

def addFile(filename, file):
    resp = client.put_object(Body=file, Bucket=BUCKET, Key=filename, ACL=FILE_ACCESS)
    return {'status': checkStatus(resp, [200]), 'url': getFileUrl(filename)} 

def removeFile(filename):
    resp = client.delete_object(Bucket=BUCKET, Key=filename)
    return {'status': checkStatus(resp, [200, 204])}