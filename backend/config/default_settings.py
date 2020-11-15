import datetime

DEBUG = False
SECRET_KEY = None
JWT_SECRET_KEY = "something"
JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(minutes=60*60)
JWT_REFRESH_TOKEN_EXPIRES = datetime.timedelta(minutes=75)

# Mongodb connection
MONGO_USERNAME = 'ultracast_admin'
MONGO_PASSWORD = 'vtcXHq7fS$si9$Bi6c&2'
MONGO_IP = '139.59.227.230'
MONGO_AUTH_DB = 'admin'
MONGO_DB = 'ultracast_sandbox_static_files'

# Algolia
ALGOLIA_API_KEY = "548eb1d95df6a4ac461e7a656230a1f9"
ALGOLIA_ID = "DLUH4B7HCZ"

S3 = {
        "REGION": "sfo2",
        "AWS_ACCESS_KEY": 'CUT4SK6OYILHJJV3B5LD',
        "AWS_SECRET_ACCESS_KEY": 'yyIXed9h9kn6n9V4c/b64+ZRHtP8baR89lp3dqvOY34',
        "BUCKET": 'ultracast-files',
        "FILE_ACCESS": 'public-read'
        }
