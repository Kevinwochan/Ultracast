import graphene
from . import query
from . import models

# Returns a list of recommended podcasts given the following details about a user:
#  - A list of existing podcast subscriptions
#  - A list of recently played episodes
#  - A list of past podcast searches
def calculateRecommendations(subscriptions, recentEpisodes, searches):
    debug = True

    if len(subscriptions) == 0 or len(recentEpisodes) == 0:
        debug = False

    if debug:
        print(f"\n{len(subscriptions)} podcast(s) of type:\t\t{type(subscriptions[0])}")
        print(f"Example subscribed podcast:\t'{subscriptions[0].name}'")
        print(f"\n{len(recentEpisodes)} recent episode(s) of type:\t{type(recentEpisodes[0])}")
        print(f"Example episode:\t\t'{recentEpisodes[0].episode.name}'\n")
    
    
    # Elements to consider:
    # Subscriptions
    #  - Category + subcategory
    #  - Description / summary
    # Recent Episodes
    #  - Keywords
    #  - Description / summary
    #  - Category
    # Searches
    #  - Text

    # Current (simple) strategy:
    # Take the podcasts that are the parent of the recently played episodes
    # and combine them with the list of subscribed podcasts. Use this list
    # to perform the search, retrieving podcasts of the same category and
    # returning them.

    # interestingPodcasts = subscriptions[:]
    # for listenEntry in recentEpisodes:
    #     parentPodcast = listenEntry.episode.podcast_metadata
    #     if parentPodcast not in interestingPodcasts:
    #         interestingPodcasts.append(parentPodcast)

    interestingPodcasts = set(subscriptions)
    for listenEntry in recentEpisodes:
        parentPodcast = listenEntry.episode.podcast_metadata
        interestingPodcasts.add(parentPodcast)

    # schema = graphene.Schema(query=query.Query)

    # result = schema.execute(
    #     """
    #     query{
    #         allPodcastMetadata{
    #             edges{
    #                 node{
    #                     name
    #                     id
    #                 }
    #             }
    #         }
    #     }
    #     """
    # )

    # print(len(result.data['allPodcastMetadata']['edges']))


    # result = models.PodcastMetadata.objects().get()

    # print(result)

    # Extensions:
    #  - Run some NLP (eg: TF-IDF) across all descriptions and pick podcasts 
    #    with the highest similarity score
    #      - Include the information from actual episodes in the search
    #  - Cache the podcasts on startup or first run
    #  - Using Mongo, filter the documents by asking to only retreive podcasts with relevant  categories/subcats
    #      - https://docs.mongoengine.org/guide/querying.html

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

