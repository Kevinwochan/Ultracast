#!/bin/bash

start_backend() {
    cd backend
    ./setup.sh
    ./start_production.sh
}

start_frontend() {
    cd frontend
    sh deploy.sh
}

start_backend &
start_frontend 
