import graphene
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import numpy as np
import pandas as pd
from . import query
from . import models

# Returns a list of recommended podcasts given the following details about a user:
#  - A list of existing podcast subscriptions
#  - A list of recently played episodes
#  - A list of past podcast searches
# 
# Returns an empty list if all three inputs are empty.
def calculateRecommendations(subscriptions, recentEpisodes, searches):

    # Combine subbed podcasts, parents of listened eps and searches together into one list
    interestingPodcasts = set(subscriptions)
    for listenEntry in recentEpisodes:
        parentPodcast = listenEntry.episode.podcast_metadata
        interestingPodcasts.add(parentPodcast)
    interestingPodcasts.update(searches)

    # Collect all podcasts from the db into a list
    allPodcasts = []
    allPodcasts.extend(models.PodcastMetadata.objects())

    # Calculate the similarity matrix between all podcasts using their descriptions, processed using TF-IDF
    descriptions = [pod.description for pod in allPodcasts]
    vectorizer = TfidfVectorizer(strip_accents='ascii', stop_words='english')
    tfidfMatrix = vectorizer.fit_transform(descriptions)
    similarityMatrix = linear_kernel(tfidfMatrix, tfidfMatrix)

    # Find the index of each interestingPodcast in the list of all podcasts, and hence also in the similarity matrix
    # (Sorted to ensure that the order of recommended podcasts is consistent between queries)
    interestingIndexes = sorted([allPodcasts.index(pod) for pod in interestingPodcasts])

    # Grab the similarity scores (between all other podcasts) for each of the interesting podcasts, and store the index along with them
    allScores = []
    for index in interestingIndexes:
        similarityScores = list(enumerate(similarityMatrix[index]))
        allScores.extend([score for score in similarityScores if score[1] > 0])
    
    # Sort the similarity scores, highest to lowest
    allScores.sort(key=lambda x:x[1], reverse=True)

    # Add the podcasts to the recommendations list in order of similarity score
    recommendations = []
    for score in allScores:
        podcast = allPodcasts[score[0]]
        if podcast not in recommendations:
            recommendations.append(podcast)

    # Remove subscribed podcasts from recommendations
    recommendations = [pod for pod in recommendations if pod not in subscriptions]

    return recommendations
