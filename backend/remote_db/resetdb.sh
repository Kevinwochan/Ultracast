#!/bin/bash
database_to_drop="ultracast_data_gen_test"

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
 
