#!/bin/sh

npm install --production
npm run build
node serve.js
