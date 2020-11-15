#!/bin/sh

npm install --production

if [ "$1" == "--local" ];
then
	npm run local

else
	npm run build
fi

node serve.js
