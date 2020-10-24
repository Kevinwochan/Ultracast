from . import models
from . import schema

import re
import magic
import mimetypes
import boto3
from botocore.client import Config
from mongoengine import connect
from pydub import AudioSegment
import io
import hashlib
from base64 import urlsafe_b64encode

# Mongodb connection
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
MONGO_DB = 'ultracast_sandbox_static_files'

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

class IllegalMimeException(Exception):
    pass

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

def check_mime(data, valid_mimes):
    try:
        mime_type = magic.from_buffer(data, mime=True)
    except:
        raise IllegalMimeException(f"Could not interpret MIME type of payload")

    if mime_type not in valid_mimes:
        raise IllegalMimeException(f"MIME type {mime_type} not allowed")
    return mime_type

def add_file(data, key=None, valid_mimes=[], override=False):
    mime_type = check_mime(data, valid_mimes)
    extension = mimetypes.guess_extension(mime_type)
    key = get_key(data, key, extension)
    
    if not override and file_exists(key):
        return get_file_url(key)

    resp = client.put_object(
        Body=data, 
        Bucket=BUCKET, 
        Key=key, 
        ACL=FILE_ACCESS, 
        ContentType=mime_type)
    check_status(resp, [200], 'Add File')
    return get_file_url(key)

def remove_file(url, key=None):
    if key is None:
        resp = client.delete_object(Bucket=BUCKET, Key=get_key_from_url(url))
    else:
        resp = client.delete_object(Bucket=BUCKET, Key=key)
    check_status(resp, [200, 204], 'Remove File')

def update_file(old_url, data, new_key=None, valid_mimes=[]):
    if url_exists(old_url):
        remove_file(old_url)
    return add_file(data, new_key, valid_mimes)

def audio_file_duration_secs(data):
    try:
        audio = AudioSegment.from_file(io.BytesIO(data), format="mp3")
        return int(round(audio.duration_seconds))
    except:
        return -1
