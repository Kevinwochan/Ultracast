from webserver import db
from webserver import models

from algoliasearch.search_client import SearchClient

from pprint import pprint
import json

API_KEY = "548eb1d95df6a4ac461e7a656230a1f9"
ALGOLIA_ID = "DLUH4B7HCZ"

'''
Fields that will be forwarded to algolia
Note you can use __ to go into embedded doc's
'''
PODCAST_METADATA_FILEDS = ["description", "keywords", "name", "publish_date", "episodes__description", 
        "episodes__keywords", "episodes__name", "episodes__publish_date"]

USER_FIELDS = ["name", "published_podcasts"]

# Batch uploading to algolia
BATCH_SIZE = 1000

def upload_podcasts(algolia_client):
    return upload_to_algolia(algolia_client, "podcasts", 
        models.PodcastMetadata.objects.only(*PODCAST_METADATA_FILEDS))


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

        user_dict["objectID"] = str(user_dict["_id"])
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

def upload_to_algolia(algolia_client, index_name, mongo_objects):
    index = algolia_client.init_index(index_name)
    records = []
    
    for o in mongo_objects:
        o_dict = o.to_mongo().to_dict()
        # Replace mongo ID with agolia ID
        o_dict["objectID"] = str(o_dict["_id"])
        o_dict.pop("_id")
        records.append(o_dict)
        #print(o_dict)
        
        if (len(records) % BATCH_SIZE == 0):
            # Trigger an upload
            print("index: {} uploading {} documents".format(index_name, len(records)))
            index.save_objects(records)
            records = []

    print("index: {} uploading {} documents".format(index_name, len(records)))
    index.save_objects(records)



if __name__ == "__main__":
    algolia_client = SearchClient.create(ALGOLIA_ID, API_KEY)

    # Creates two indexes - one for podcasts and another for publishers
    upload_podcasts(algolia_client)
    upload_publishers(algolia_client)
    
