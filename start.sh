#!/bin/bash

start_backend() {
    cd backend
    ./setup.sh
    ./start_production.sh
}

start_frontend() {
    cd frontend
    ./deploy.sh $1
}

if [ "$1" == "--local" ]; then
    echo "Local run. Starting backend webserver"
    start_backend &
fi
start_frontend  $1
