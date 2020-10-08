from db import init_db
from flask import Flask
from flask_graphql import GraphQLView
from schema import schema
from flask_cors import CORS
from graphene_file_upload.flask import FileUploadGraphQLView

# App config

app = Flask(__name__)
app.debug = True

CORS(app, resources={r"/*": {"origins": "*"}})


# Graphql rules
app.add_url_rule(
    '/graphql',
    view_func=FileUploadGraphQLView.as_view('graphql', schema=schema, graphiql=True)
    #view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

if __name__ == '__main__':
    #init_db()
    app.run(debug=True)
