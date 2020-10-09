import graphene
import graphql
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField, MongoengineObjectType
import graphene_file_upload
import graphene_file_upload.scalars
import models
import mutations
import query

schema = graphene.Schema(query=query.Query, mutation=mutations.Mutations, 
        types=query.types)

def saveSchema(path: str):
    with open(path, "w") as fp:
        schema_str = graphql.utils.schema_printer.print_schema(schema)
        fp.write(schema_str)

