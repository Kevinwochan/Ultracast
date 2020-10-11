import pandas as pd
import os.path
import sys
import requests
import threading
import queue

from webserver import db
from webserver import models
from webserver import schema

# Data source:
# https://data.world/brandon-telle/podcasts-dataset

OKGREEN = '\033[92m'
OKYELLOW = '\033[33m'
ENDCOL = '\033[0m'

script_dir = os.path.dirname(__file__)

FILTERED_CSV_NAME = f"{script_dir}/filtered_episodes.csv"

def get_audio_filename(name):
    return f"{script_dir}/audio_files/{name}.mp3"


print(f"{OKGREEN}Opening csv...{ENDCOL}")
if not os.path.isfile(FILTERED_CSV_NAME):
    ################################################################
    # Open CSV and drop unwanted data
    ################################################################

    df = pd.read_csv(f'{script_dir}/episodes.csv', sep=',')
    print(f"{df.shape[0]} entries in csv")

    # Drop unwanted columns
    print(f"{OKGREEN}Dropping unwanted columns...{ENDCOL}")
    drop_cols = ['link', 'guid', 'description']
    for unwanted_col in drop_cols:
        df.drop(unwanted_col, axis=1, inplace=True)

    # Drop rows with null values
    df.dropna(axis=0, inplace=True) 

    original_podcast_espisode_count = df.groupby('show_id').count()

    ################################################################
    # Filter
    ################################################################

    print(f"{OKGREEN}Filtering...{ENDCOL}")

    # Audio formats
    valid_audio_formats = ['audio/mpeg', 'audio/mp3', 'mp3', 'MP3', 'Audio/MP3', 'audio/mpeg3', 'audio/x-mp3']
    df.drop(df.loc[~df['audio_mime_type'].isin(valid_audio_formats)].index, inplace=True)

    # Audio file size
    df['audio_file_size'] = df['audio_file_size'].astype(int)
    df.drop(df[df['audio_file_size'] < 50].index, inplace=True)
    df.drop(df[df['audio_file_size'] > 99999999].index, inplace=True)

    # Episode field lengths
    df = df[df['title'].map(len) < 100]
    df = df[df['subtitle'].map(len) < 200]
    df = df[df['summary'].map(len) < 200]
    df = df[df['author'].map(len) < 40]

    # Podcast - number of episodes
    df = df.groupby('show_id').filter(lambda nepisodes : len(nepisodes) >= 5 and len(nepisodes) <= 30)

    # Podcasts contains all episodes that existed prior to filtering
    has_all_episodes = df.groupby('show_id').count().isin(original_podcast_espisode_count).all(axis=1)
    podcasts_with_all_episodes = has_all_episodes.index[has_all_episodes]
    df = df[df['show_id'].isin(podcasts_with_all_episodes)]

    df.to_csv(FILTERED_CSV_NAME)
else:
    df = pd.read_csv(FILTERED_CSV_NAME, sep=',')
    print(f"{df.shape[0]} entries in csv")

################################################################
# Confirm download and db write ok
################################################################

total_audio_media_size = df['audio_file_size'].sum() / 10**9
podcasts_count = df.groupby(['show_id']).ngroups

print(f"============ STATS ============")
print(f"Total episodes: {df.shape[0]}")
print(f"Total podcasts: {podcasts_count}")
print(f"Total audio size (GB): {total_audio_media_size}")

ans = input(f"{OKYELLOW}Download audio files and write to db?(y/n){ENDCOL}")
if ans != 'y':
    exit()

################################################################
# Download Audio Files
################################################################

class DownloadThread(threading.Thread):
    def __init__(self, queue):
        super(DownloadThread, self).__init__()
        self.queue = queue
        self.daemon = True

    def run(self):
        while True:
            entry = self.queue.get()
            try:
                self.download_url(entry)
            except Exception as e:
                print(f"   Error: {e}")
            self.queue.task_done()

    def download_url(self, entry):
        url, file_path = entry
        print(f"Downloading {url} -> {file_path}")
        
        # Make the actual request, set the timeout for no data to 10 seconds and 
        # enable streaming responses so we don't have to keep the large files in memory
        request = requests.get(url, timeout=10, stream=True)

        # Open the output file and make sure we write in binary mode
        with open(file_path, 'wb') as fh:
            # Walk through the request response in chunks of 1024 * 1024 bytes, so 1MiB
            for chunk in request.iter_content(1024 * 1024):
                # Write the chunk to the file
                fh.write(chunk)

queue = queue.Queue()
for entry in [tuple(x) for x in df[['id', 'audio_url']].to_numpy()]:
    file_path = get_audio_filename(entry[0])
    if os.path.isfile(file_path):
        continue

    url = entry[1]
    queue.put((url, file_path))

print(f"{OKGREEN}Downloading audio files...{ENDCOL}")

num_threads = 16
for i in range(num_threads):
    t = DownloadThread(queue)
    t.start()
queue.join()

################################################################
# Write to DB
################################################################

print(f"{OKGREEN}Writing to db...{ENDCOL}")

authors = list(set(df['author'].tolist()))
for author in authors:
    author_df = df[df['author'] == author]
    user = models.User(name=author, email="test@gmail.com", password="test")
    user.save()

    podcasts = author_df['show_id'].unique()
    for podcast in podcasts:
        podcast_df = author_df[author_df['show_id'] == podcast]
        podcast_data = podcast_df.iloc[0]
        podcast_metadata = models.PodcastMetadata(name=author, author=user, description="")
        podcast_metadata.save()
        user.published_podcasts.append(podcast_metadata)

        for index, row in podcast_df.iterrows():
            audio_file = get_audio_filename(row['id'])
            if not os.path.isfile(audio_file):
                continue

            with open(audio_file, 'rb') as audio_file:
                podcast_episode = models.PodcastEpisode(audio=audio_file)

            podcast_episode_meta = models.PodcastEpisodeMetadata(name=row['title'], description=row['summary'], episode=podcast_episode)
            podcast_metadata.episodes.append(podcast_episode_meta)

            # Remove file to save space as this is being run on the remote server
            os.remove(audio_file)

            podcast_episode.save()

        podcast_metadata.save()
    user.save()


print(f"{OKGREEN}Finished Successfully{ENDCOL}")