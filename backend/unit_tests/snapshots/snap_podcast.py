# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['CreatePodcastTest::test_create_podcast 1'] = {
    'data': {
        'createPodcastMetadata': {
            'podcastMetadata': {
                'description': 'a description',
                'episodes': {
                    'edges': [
                    ]
                },
                'name': 'testy_podcast'
            },
            'success': True
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
