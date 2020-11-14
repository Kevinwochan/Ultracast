from . import db
from .schema import (schema, middleware)
from . import models
from . import podcast_engine
from config import default_settings

from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS
import flask_jwt_extended
import os
import sys

import json
import datetime
import importlib

from graphene_file_upload.flask import FileUploadGraphQLView

jwt = flask_jwt_extended.JWTManager()
# App config

def get_config():
    # Load defaults
    config = default_settings.__dict__
    try:
        # Read the file environ var points to and update config with it
        spec = importlib.util.spec_from_file_location("config", os.environ["ULTRACAST_BACKEND_SETTINGS"])
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        config.update(module.__dict__)
    except Exception as e:
        print("Failed to load environment variable ULTRACAST_BACKEND_SETTINGS. {}".format(e))
    return config

def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(default_settings)
    try:
        app.config.from_envvar('ULTRACAST_BACKEND_SETTINGS')
    except RuntimeError as err:
        print("Failed to load config from environment: {}".format(err))
    
    db.init_app(app)
    db.connect_mongo(app.config)

    jwt.init_app(app)

    '''
    A bit of JWT magic
    We want to use our users from the DB as our current users
    To do this we need two callbacks that JWT will use
    user_identity_loader takes a User object and converts it to json
    user_loader_callback_loader then takes that json document and grabs the user object 
    so that flask_jwt_extended.current_user gets set for us
    '''
    @jwt.user_identity_loader
    def user_to_json(user):
        user_dict = {
                "id": str(user.model().id),
                "email": user.model().email
                }
        return json.dumps(user_dict)

    @jwt.user_loader_callback_loader
    def load_user_from_db(identity):
        user_id = json.loads(identity)["id"]
        return podcast_engine.User.from_mongo_id(user_id)

    CORS(app, resources={r"/*": {"origins": "*"}})

    # Graphql rules
    app.add_url_rule(
        '/graphql',
        view_func=FileUploadGraphQLView.as_view('graphql', schema=schema, graphiql=True, middleware=middleware)
        #view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
    )

    return app

if __name__ == '__main__':
    #init_db()
    app = create_app()
    app.run(debug=True)
