#!/bin/bash

npm install --production

if [ "$1" == "--local" ]; then
    echo "Local run. Binding to local graphql endpoint"
	npm run local

else
	npm run build
fi

node serve.js
