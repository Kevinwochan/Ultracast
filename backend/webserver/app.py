from . import db
from .schema import schema

from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS
from graphene_file_upload.flask import FileUploadGraphQLView

# App config

app = Flask(__name__)
app.debug = True

CORS(app, resources={r"/graphql/*": {"origins": "*"}})


# Graphql rules

app.add_url_rule(
    '/graphql',
    view_func=FileUploadGraphQLView.as_view('graphql', schema=schema, graphiql=True)
    #view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

if __name__ == '__main__':
    app.run()
