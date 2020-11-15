#!/bin/bash

# Install virtualenv
if [ -z "$(pip3 list 2> /dev/null | grep virtualenv)" ]; then
    pip3 install virtualenv
fi

# Create env
if [ ! -d "./env" ]; then
    python3 -m virtualenv env
    pip install -e . # Install backend as editable package - lets us to imports!
fi

source ./env/bin/activate

# If requirements.txt different then run update
if [ -n "$(diff <( pip freeze) <( cat requirements.txt))" ]; then
    pip install -r requirements.txt
fi

