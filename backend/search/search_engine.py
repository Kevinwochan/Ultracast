from webserver import query
from webserver import models
from webserver import schema

from algoliasearch.search_client import SearchClient

import mongoengine

from pprint import pprint
import json
import queue
from queue import Empty
import threading
import logging

API_KEY = "548eb1d95df6a4ac461e7a656230a1f9"
ALGOLIA_ID = "DLUH4B7HCZ"

'''
Fields that will be forwarded to algolia
Note you can use __ to go into embedded doc's
'''
PODCAST_METADATA_FILEDS = ["description", "keywords", "name", "publish_date", "episodes__description", "cover_url",
        "episodes__keywords", "episodes__name", "episodes__publish_date"]

USER_FIELDS = ["name", "published_podcasts"]

# Batch uploading to algolia
BATCH_SIZE = 2

class SearchEngine:
    '''
    Threaded syncroniser with algolia
    Subscribes to mongo engine events for PodcastMetadata and PodcastEpisodeMetadata
    Saves modified documents into bounded queue
    Then in another thread, when the queue is larger than BATCH_SIZE, triggers an upload
    '''
    def __init__(self):
        self.algolia_client = SearchClient.create(ALGOLIA_ID, API_KEY)
        self.podcast_metadata_to_upload = queue.Queue() # thread safe queue
        self.is_shutdown = threading.Event()
        self.should_upload = threading.Event()
        self.upload_thread = threading.Thread(target=self.upload_thread_cb)
        self.upload_thread.start()

        # Register myself with mongo events
        mongoengine.signals.post_save.connect(self.podcast_episode_metadata_save_cb, 
                sender=models.PodcastEpisodeMetadata)
        mongoengine.signals.post_save.connect(self.podcast_metadata_save_cb, 
                sender=models.PodcastMetadata)

    def podcast_metadata_save_cb(self, sender, document, created=None):
        podcast_metadata = document
        assert(sender == models.PodcastMetadata)
        self.podcast_metadata_to_upload.put(podcast_metadata.id)
        if self.podcast_metadata_to_upload.qsize() >= BATCH_SIZE:
            self.should_upload.set()

    def podcast_episode_metadata_save_cb(self, sender, document, created=None):
        assert(sender == models.PodcastEpisodeMetadata)
        podcast_episode_metadata = document
        self.podcast_metadata_to_upload.put(podcast_episode_metadata.podcast_metadata.id)
        if self.podcast_metadata_to_upload.qsize() >= BATCH_SIZE:
            self.should_upload.set()
    
    def shutdown(self):
        self.is_shutdown.set()

    def upload_thread_cb(self):
        while not self.is_shutdown.is_set():
            self.should_upload.wait(timeout=3) # run every 3s or when indicated
            self.should_upload.clear()
            if self.podcast_metadata_to_upload.qsize() >= BATCH_SIZE:
                # Trigger an upload
                # Copy ids to local list
                to_upload = set()
                try:
                    while self.podcast_metadata_to_upload.qsize() > 0 and len(to_upload) < BATCH_SIZE:
                        to_upload.add(self.podcast_metadata_to_upload.get(block=False))
                except Empty:
                    pass

                print("Uploading {} documents to algolia".format(len(to_upload)))
                logging.info("Uploading {} documents to algolia".format(len(to_upload)))
                self.upload_to_algolia("podcasts", 
                        models.PodcastMetadata.objects(id__in=to_upload).only(*PODCAST_METADATA_FILEDS), 
                        query.PodcastMetadata)

    def upload_podcasts(self):
        return self.upload_to_algolia("podcasts", 
            models.PodcastMetadata.objects.only(*PODCAST_METADATA_FILEDS), query.PodcastMetadata)

    def upload_to_algolia(self, index_name, mongo_objects, query_class):
        index = self.algolia_client.init_index(index_name)
        records = []
        
        for o in mongo_objects:
            o_dict = o.to_mongo().to_dict()
            # Replace mongo ID with agolia ID
            o_dict["objectID"] = schema.get_relay_id(query_class, o_dict["_id"])
            o_dict.pop("_id")
            records.append(o_dict)

            if (len(records) % BATCH_SIZE == 0):
                # Trigger an upload
                logging.info("index: {} uploading {} documents".format(index_name, len(records)))
                index.save_objects(records)
                records = []

        logging.info("index: {} uploading {} documents".format(index_name, len(records)))
        index.save_objects(records)

