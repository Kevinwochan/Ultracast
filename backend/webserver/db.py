from . import models
from . import schema

import re
import boto3
from botocore.client import Config
from mongoengine import connect
import hashlib
from base64 import urlsafe_b64encode

# Mongodb connection
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
MONGO_DB = 'ultracast_sandbox'

MONGO_URI = f'mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_IP}/{MONGO_DB}?authSource={MONGO_AUTH_DB}'

connect(host=MONGO_URI)

# Digital Ocean Space (Static-Files)

REGION = 'sfo2'
STATIC_FILE_BASE_URL = f'https://{REGION}.digitaloceanspaces.com'
session = boto3.session.Session()
client = session.client('s3',
                        region_name=REGION,
                        endpoint_url=STATIC_FILE_BASE_URL,
                        aws_access_key_id='CUT4SK6OYILHJJV3B5LD',
                        aws_secret_access_key='yyIXed9h9kn6n9V4c/b64+ZRHtP8baR89lp3dqvOY34')

BUCKET = 'ultracast-files'
FILE_ACCESS = 'public-read'

AUDIO_FORMAT_TYPE = "audio/mpeg"
AUDIO_EXTENSION = ".mp3"

def get_bucket_url():
    return re.sub(r"^https://", f"https://{BUCKET}.", STATIC_FILE_BASE_URL)

def get_file_url(filename):
    return get_bucket_url() + f"/{filename}"

def get_key_from_url(url):
    return re.sub(get_bucket_url() + "/", "", url)

def get_key_from_binary_data(data, ext=""):
    return urlsafe_b64encode(hashlib.sha256(data).digest()).decode('UTF-8') + ext

def check_status(resp, ok_statuses, op):
    if resp['ResponseMetadata']['HTTPStatusCode'] not in ok_statuses:
        raise Exception(f"Error for operation [{op}] - Response: {resp}")

def file_exists(key):
    try:
        client.head_object(Bucket=BUCKET, Key=key)
        return True
    except:
        return False

def url_exists(url):
    return file_exists(get_key_from_url(url))

def get_key(data, key=None, ext=""):
    if key is None:
        return get_key_from_binary_data(data, ext)
    else:
        return key

def add_file(data, key=None, override=False, content_type=None, ext=""):
    key = get_key(data, key, ext)
    
    if not override and file_exists(key):
        return get_file_url(key)
    
    if content_type is None:
        content_type = 'plain/text'

    resp = client.put_object(
        Body=data, 
        Bucket=BUCKET, 
        Key=key, 
        ACL=FILE_ACCESS, 
        ContentType=content_type)
    check_status(resp, [200], 'Add File')
    return get_file_url(key)

def add_audio_file(data, key=None, override=False):
    return add_file(data, key, override, AUDIO_FORMAT_TYPE, AUDIO_EXTENSION)

def remove_file(url):
    resp = client.delete_object(Bucket=BUCKET, Key=get_key_from_url(url))
    check_status(resp, [200, 204], 'Remove File')

def update_file(old_url, data, new_key=None, content_type=None, ext=""):
    if url_exists(old_url):
        remove_file(old_url)
    return add_file(data, new_key, content_type=content_type, ext=ext)

def update_audio_file(old_url, data, new_key=None):
    return update_file(old_url, data, new_key, AUDIO_FORMAT_TYPE, AUDIO_EXTENSION)
