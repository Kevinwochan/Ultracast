# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['CreatePodcastTest::test_create_podcast 1'] = {
    'data': {
        'createPodcastMetadata': {
            'podcastMetadata': {
                'category': 'a test category',
                'description': 'a description',
                'episodes': {
                    'edges': [
                    ]
                },
                'keywords': [
                    'keyword1',
                    'key2'
                ],
                'name': 'testy_podcast',
                'subCategory': 'a subcategory'
            },
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_create_podcast_episode 1'] = {
    'data': {
        'createPodcastEpisode': {
            'podcastMetadata': {
                'description': 'a description',
                'keywords': [
                ],
                'name': 'testy_podcast'
            }
        }
    }
}

snapshots['CreatePodcastTest::test_delete_podcast_1_episode 1'] = {
    'data': {
        'deletePodcastMetadata': {
            'numDeletedEpisodes': 1,
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_delete_podcast_1_episode 2'] = {
    'data': {
        'allUser': {
            'edges': [
                {
                    'node': {
                        'publishedPodcasts': {
                            'edges': [
                            ]
                        }
                    }
                }
            ]
        }
    }
}

snapshots['CreatePodcastTest::test_delete_podcast_no_episode 1'] = {
    'data': {
        'deletePodcastMetadata': {
            'numDeletedEpisodes': 0,
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_subscribe 1'] = {
    'data': {
        'subscribePodcast': {
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_subscribe 2'] = {
    'data': {
        'allUser': {
            'edges': [
                {
                    'node': {
                        'subscribedPodcasts': {
                            'edges': [
                                {
                                    'node': {
                                        'name': 'testy_podcast'
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        }
    }
}

snapshots['CreatePodcastTest::test_subscribe 3'] = {
    'data': {
        'allPodcastMetadata': {
            'edges': [
                {
                    'node': {
                        'subscribers': {
                            'edges': [
                                {
                                    'node': {
                                        'name': 'oli the tester'
                                    }
                                }
                            ],
                            'totalCount': 1
                        }
                    }
                }
            ]
        }
    }
}

snapshots['CreatePodcastTest::test_unsubscribe 1'] = {
    'data': {
        'subscribePodcast': {
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_unsubscribe 2'] = {
    'data': {
        'allUser': {
            'edges': [
                {
                    'node': {
                        'subscribedPodcasts': {
                            'edges': [
                            ]
                        }
                    }
                }
            ]
        }
    }
}

snapshots['CreatePodcastTest::test_unsubscribe 3'] = {
    'data': {
        'allPodcastMetadata': {
            'edges': [
                {
                    'node': {
                        'subscribers': {
                            'edges': [
                            ]
                        }
                    }
                }
            ]
        }
    }
}

snapshots['CreatePodcastTest::test_unsubscribe failed to unsubscribe'] = {
    'data': {
        'unsubscribePodcast': {
            'success': True
        }
    }
}

snapshots['CreatePodcastTest::test_update_podcast 1'] = {
    'data': {
        'updatePodcastMetadata': {
            'podcastMetadata': {
                'description': 'an updated description',
                'keywords': [
                    'one new keyword',
                    'two',
                    'three'
                ],
                'name': 'an updated name'
            },
            'success': True
        }
    }
}
