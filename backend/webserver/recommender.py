# Returns a list of recommended podcasts given the following details about a user:
#  - A list of existing podcast subscriptions
#  - A list of recently played episodes
#  - A list of past podcast searches








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

