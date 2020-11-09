#!/bin/sh

npm install --production
npm run build
node server.js
