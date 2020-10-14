'''
Schema for making GraphQL queries and mutations
'''
from . import models
from . import mutations
from . import query

import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars

schema = graphene.Schema(query=query.Query, mutation=mutations.Mutations, 
        types=query.types)

def get_relay_id(query_class, mongodb_id):
    '''
    Technically the query class should be the class that implements graphene.relay.Node
    Since the to_global_id just uses the class name and 
    we've matched up the names of our classes in models.py and query.py this doesnt really matter
    But you've been warned future me
    Example usage: get_relay_id(query.User, "123")
    '''
    assert(graphene.relay.is_node(query_class))
    return graphene.relay.Node.to_global_id(query_class.__name__, mongodb_id)

def saveSchema(path: str):
    with open(path, "w") as fp:
        schema_str = graphql.utils.schema_printer.print_schema(schema)
        fp.write(schema_str)

