from webserver import db
from webserver import models
from webserver import query
from webserver import app

from algoliasearch.search_client import SearchClient
import graphene
import graphene.relay

from pprint import pprint
import json

'''
Fields that will be forwarded to algolia
Note you can use __ to go into embedded doc's
'''
PODCAST_METADATA_FILEDS = ["description", "keywords", "name", "publish_date", "episodes__description", "cover_url", "subscribers", "author",
        "episodes__keywords", "episodes__name", "episodes__publish_date"]

USER_FIELDS = ["name", "published_podcasts"]

# Batch uploading to algolia
BATCH_SIZE = 1000

def get_relay_id(query_class, mongodb_id):
    '''
    Technically the query class should be the class that implements graphene.relay.Node (I think)
    Since the to_global_id just uses the class name and 
    we've matched up the names of our classes in models.py and query.py this doesnt really matter
    But you've been warned future me
    Example usage: get_relay_id(query.User, "123")
    '''
    assert(graphene.relay.is_node(query_class))
    return graphene.relay.Node.to_global_id(query_class.__name__, mongodb_id)

def upload_podcasts(algolia_client):
    index_name = "podcasts"
    podcast_objects = models.PodcastMetadata.objects.only(*PODCAST_METADATA_FILEDS)
    query_class = query.PodcastMetadata
    index = algolia_client.init_index(index_name)
    records = []
    
    for o in podcast_objects:
        o_dict = o.to_mongo().to_dict()
        # Replace mongo ID with agolia ID
        o_dict["objectID"] = get_relay_id(query_class, o_dict["_id"])
        o_dict.pop("_id")
        records.append(o_dict)

        # Add number of subscribers
        o_dict["numSubscribers"] = len(o.subscribers)
        o_dict.pop("subscribers")

        # Add author
        author_id = o_dict.pop("author")
        o_dict["authorName"] = models.User.objects(id=author_id).only("name").get().name

        if (len(records) % BATCH_SIZE == 0):
            # Trigger an upload
            print("index: {} uploading {} documents".format(index_name, len(records)))
            index.save_objects(records)
            records = []

    print("index: {} uploading {} documents".format(index_name, len(records)))
    index.save_objects(records)


def upload_publishers(algolia_client):
    index_name = "publishers"
    index = algolia_client.init_index(index_name)

    publishers = models.User.objects(published_podcasts__0__exists=True).only(*USER_FIELDS)
    records = []
    for user in publishers:
        user_dict = user.to_mongo().to_dict()
        for i, podcast in enumerate(user_dict["published_podcasts"]):
            user_dict["published_podcasts"][i] = json.loads(models.PodcastMetadata.objects(id=podcast) \
                    .only(*PODCAST_METADATA_FILEDS).to_json())

        user_dict["objectID"] = get_relay_id(query.User, user_dict["_id"])
        user_dict.pop("_id")
        records.append(user_dict)

        if (len(records) % BATCH_SIZE == 0):
            # Trigger an upload
            #print("index: {} uploading {} documents".format(index_name, len(records)))
            index.save_objects(records)
            records = []

    print("index: {} uploading {} documents".format(index_name, len(records)))
    index.save_objects(records)

    '''
    return upload_to_algolia(algolia_client, "publishers",
            # Take only the users that have uploaded a podcast
            models.User.objects(published_podcasts__0__exists=True).only(*USER_FIELDS))
    '''

def upload_to_algolia(algolia_client, index_name, mongo_objects, query_class):
    index = algolia_client.init_index(index_name)
    records = []
    
    for o in mongo_objects:
        o_dict = o.to_mongo().to_dict()
        # Replace mongo ID with agolia ID
        o_dict["objectID"] = get_relay_id(query_class, o_dict["_id"])
        o_dict.pop("_id")
        records.append(o_dict)

        if (len(records) % BATCH_SIZE == 0):
            # Trigger an upload
            print("index: {} uploading {} documents".format(index_name, len(records)))
            index.save_objects(records)
            records = []

    print("index: {} uploading {} documents".format(index_name, len(records)))
    index.save_objects(records)



if __name__ == "__main__":
    cfg = app.get_config()
    db.connect_mongo(cfg)
    algolia_client = SearchClient.create(cfg["ALGOLIA_ID"], cfg["ALGOLIA_API_KEY"])

    # Creates two indexes - one for podcasts and another for publishers
    upload_podcasts(algolia_client)
    upload_publishers(algolia_client)
    
