from db import init_db
from flask import Flask
from flask_graphql import GraphQLView
from schema import schema

# App config

app = Flask(__name__)
app.debug = True

# Graphql rules

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True)
)

if __name__ == '__main__':
    init_db()
    app.run()