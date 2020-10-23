from webserver import db
from webserver import models

import mongoengine
import mongoengine.connection

def drop_collections():
    models.PodcastEpisodeMetadata.drop_collection()
    models.PodcastMetadata.drop_collection()
    models.User.drop_collection()


if __name__ == "__main__":
    db = mongoengine.get_db()
    print("Dropping *ALL* collections. This will delete the entire DB {}!!!!".format(db.name))
    word = input("Type 'yes' to do this (You can only blame yourself now :)")
    if (word == "yes"):
        print("Dropping collections...")
        drop_collections()
        print("Done!")
    else:
        print("Not today bby")
