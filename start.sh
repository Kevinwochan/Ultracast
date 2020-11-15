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
    echo "This is unlikely to work on CSE machines as the port used for the GraphQL webserver is often already in use."
    echo "Are you sure you want to use a local run? type yes"
    read y
    if [ $y != "yes" ]; then
        exit 1
    fi
    start_backend &
fi
start_frontend  $1
