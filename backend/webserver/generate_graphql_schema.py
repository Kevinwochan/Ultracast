from webserver import schema

if __name__ == "__main__":
    # Save out the graphql schema
    schema.saveSchema("schema.graphql")
