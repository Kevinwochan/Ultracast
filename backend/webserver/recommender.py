# Returns a list of recommended podcasts given the following details about a user:
#  - A list of existing podcast subscriptions
#  - A list of recently played episodes
#  - A list of past podcast searches
def calculateRecommendations(subscriptions, recentEpisodes, searches):
    return None


# Grab the ids of the things that you're recommending, then return the query set. Eg:
# iterables = models.PodcastEpisodeMetadata.objects(publish_date__gte=user.model().last_login)(podcast_metadata__in=user.model().subscribed_podcasts)
# There should be an easy query that will return what you need if you have all of the ids
# Could be something like this, given that you have a list containing the ids of all of the podcasts that you want to return:
# models.PodcastMetadata.objects(id__in=object_id_list)
# See docs for more info:
# https://docs.mongoengine.org/guide/querying.html



# Essential reading:
#  - https://docs.graphene-python.org/en/latest/quickstart/
#  - https://docs.graphene-python.org/en/latest/types/objecttypes/#resolvers

# Helpful docs:
#  - https://docs.graphene-python.org/en/latest/api/
#  - https://docs.graphene-python.org/en/latest/execution/execute/
#  - https://docs.graphene-python.org/en/latest/relay/nodes/

# "ultraCast must be able to recommend new podcast shows to a listener based on at least
# information about the podcast shows they are subscribed to, podcast episodes they have recently
# played, and their past podcast searches."
# I need access to:
#  - A list of existing podcast subscriptions
#  - A list of recently played episodes
#  - A list of past podcast searches

# Initially, make them all required - then think about how you might handle one or two being missing.
# If all 3 are missing, you can just return a random selection of popular podcasts.

