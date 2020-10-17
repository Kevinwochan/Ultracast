from . import db
from .schema import (schema, middleware)
from . import models
from . import podcast_engine

from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS
import flask_jwt_extended

import json
from graphene_file_upload.flask import FileUploadGraphQLView

# App config

app = Flask(__name__)
app.debug = True

app.config["JWT_SECRET_KEY"] = "something"
app.config["REFRESH_EXP_LENGTH"] = 30
app.config["ACCESS_EXP_LENGTH"] = 10

jwt = flask_jwt_extended.JWTManager(app)

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
    return user.to_json()

@jwt.user_loader_callback_loader
def load_user_from_db(identity):
    user_id = json.loads(identity)["_id"]["$oid"]
    return podcast_engine.User.from_mongo_id(user_id)

CORS(app, resources={r"/*": {"origins": "*"}})


# Graphql rules
app.add_url_rule(
    '/graphql',
    view_func=FileUploadGraphQLView.as_view('graphql', schema=schema, graphiql=True, middleware=middleware)
    #view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

if __name__ == '__main__':
    #init_db()
    app.run(debug=True)
