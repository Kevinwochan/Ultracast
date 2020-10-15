#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <DATABASE_NAME>"
  exit 1
fi

database_to_drop="$1"

rm ./remote_db/audio_file_mapping.csv 2> /dev/null
ssh root@139.59.227.230 << EOF
  mongo --port 27017  --authenticationDatabase "admin" -u "ultracast_admin" -p 'vtcXHq7fS\$si9\$Bi6c&2'
  use $database_to_drop
  db.dropDatabase()
  exit
  exit
EOF
source env/bin/activate
python -m remote_db.generate_mongo_data
 
