#!/bin/bash

start_backend() {
    cd backend
    source env/bin/activate
    cd webserver
    flask run
}

start_frontend() {
    cd frontend
    sh deploy.sh
}

start_backend &
start_frontend 
