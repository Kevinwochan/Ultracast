import pandas as pd
import os.path
import sys
import requests
import queue
from bson.objectid import ObjectId

from webserver import db
from webserver import models
from webserver import schema
from remote_db.download_thread import DownloadThread
from remote_db.check_link_valid_thread import CheckLinkValidThread

# Data source:
# https://data.world/brandon-telle/podcasts-dataset

OKGREEN = '\033[92m'
OKYELLOW = '\033[33m'
OKRED = '\033[31m'
ENDCOL = '\033[0m'

SCRIPT_DIR = os.path.dirname(__file__)
RAW_EPISODES_CSV = f'{SCRIPT_DIR}/episodes.csv'
RAW_PODCASTS_CSV = f'{SCRIPT_DIR}/shows.csv'
FILTERED_CSV_NAME = f"{SCRIPT_DIR}/filtered_episodes.csv"
AUDIO_MAPPING_FILENAME = f"{SCRIPT_DIR}/audio_file_mapping.csv"

###
MIN_EPISODES_PER_PODCAST = 5
MAX_EPISODES_PER_PODCAST = 10
MAX_TITLE_LEN = 200
MAX_DESCRIPTION_LEN = 300
MAX_AUTHOR_NAME_LEN = 100
MIN_FILE_SIZE_MB = 0.0001
MAX_FILE_SIZE_MB = 1000
VALID_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'mp3', 'MP3', 'Audio/MP3', 'audio/mpeg3', 'audio/x-mp3']
### 

def main():
    df, podcasts_df = get_data()
    confirm_data_ok_prompt(df)
    download_audio_files(df)
    write_to_db(df, podcasts_df)
    print(f"{OKGREEN}Finished Successfully{ENDCOL}")

def get_audio_filename(name):
    return f"{SCRIPT_DIR}/audio_files/{name}.mp3"

def get_data():
    podcast_df = get_podcasts_df()

    use_raw_csv = True
    if os.path.isfile(FILTERED_CSV_NAME):
        ans = input(f"{OKYELLOW}Existing filtered csv found. Use it?(y/n){ENDCOL}")
        if ans == 'y':
            use_raw_csv = False

    if use_raw_csv:
        df = process_raw_csv(podcast_df)
    else:
        print(f"{OKGREEN}Opening csv...{ENDCOL}")
        df = pd.read_csv(FILTERED_CSV_NAME, sep=',')

    return (df, podcast_df)

def get_podcasts_df():
    print(f"{OKGREEN}Opening raw podcasts csv...{ENDCOL}")
    podcasts_df = pd.read_csv(RAW_PODCASTS_CSV, sep=',')
    print(f"{podcasts_df.shape[0]} entries in podcast csv")

    # Drop unwanted columns
    print(f"{OKGREEN}Dropping unwanted columns...{ENDCOL}")
    drop_cols = ['feed_url', 'description', 'created_at', 'last_build_date', 'link', 'email']
    for unwanted_col in drop_cols:
        podcasts_df.drop(unwanted_col, axis=1, inplace=True)

    # Drop rows with null values
    podcasts_df.dropna(axis=0, inplace=True)
    return podcasts_df

def process_raw_csv(podcasts_df):
    print(f"{OKGREEN}Opening raw episodes csv...{ENDCOL}")
    df = pd.read_csv(RAW_EPISODES_CSV, sep=',')
    print(f"{df.shape[0]} entries in episode csv")

    # Drop unwanted columns
    print(f"{OKGREEN}Dropping unwanted columns...{ENDCOL}")
    drop_cols = ['link', 'guid', 'description']
    for unwanted_col in drop_cols:
        df.drop(unwanted_col, axis=1, inplace=True)

    # Drop rows with null values
    df.dropna(axis=0, inplace=True)

    # Drop all without podcast_id
    podcast_ids = podcasts_df['id'].tolist()
    df = df[df['show_id'].isin(podcast_ids)]

    original_podcast_espisode_count = df.groupby('show_id').count()

    ################################################################
    # Filter
    ################################################################

    print(f"{OKGREEN}Filtering...{ENDCOL}")

    # Audio formats
    df.drop(df.loc[~df['audio_mime_type'].isin(VALID_AUDIO_FORMATS)].index, inplace=True)

    # Audio file size
    df['audio_file_size'] = df['audio_file_size'].astype(int)
    df.drop(df[df['audio_file_size'] < MIN_FILE_SIZE_MB * 10**6].index, inplace=True)
    df.drop(df[df['audio_file_size'] > MAX_FILE_SIZE_MB * 10**6].index, inplace=True)

    # Episode field lengths
    df = df[df['title'].map(len) <= MAX_TITLE_LEN]
    df = df[df['subtitle'].map(len) <= MAX_TITLE_LEN]
    df = df[df['summary'].map(len) <= MAX_TITLE_LEN]
    df = df[df['author'].map(len) <= MAX_AUTHOR_NAME_LEN]

    # Podcast - number of episodes
    df = df.groupby('show_id').filter(
        lambda nepisodes : len(nepisodes) >= MIN_EPISODES_PER_PODCAST and len(nepisodes) <= MAX_EPISODES_PER_PODCAST)

    # Confirm episode audio files are downloadable
    df = valid_audio_download_link(df)

    # Podcasts contains all episodes that existed prior to filtering
    has_all_episodes = df.groupby('show_id').count().isin(original_podcast_espisode_count).all(axis=1)
    podcasts_with_all_episodes = has_all_episodes.index[has_all_episodes]
    df = df[df['show_id'].isin(podcasts_with_all_episodes)]

    df.to_csv(FILTERED_CSV_NAME, index=False)
    return df

def valid_audio_download_link(df):
    print(f"{OKGREEN}Checking audio download links...{ENDCOL}")
    
    valid_urls = []
    urls = df['audio_url'].tolist()
    url_queue = queue.Queue()
    for url in urls:
        url_queue.put(url)

    num_threads = 16
    for i in range(num_threads):
        t = CheckLinkValidThread(url_queue, valid_urls)
        t.start()
    url_queue.join()
    
    return df[df['audio_url'].isin(valid_urls)]

def confirm_data_ok_prompt(df):
    print_batch_stats(df)
    ans = input(f"{OKYELLOW}Download audio files and write to db?(y/n){ENDCOL}")
    if ans != 'y':
        print(f"{OKGREEN}Successfully terminated{ENDCOL}")
        exit()

def print_batch_stats(df):
    total_audio_media_size = df['audio_file_size'].sum() / 10**9
    podcasts_count = df.groupby(['show_id']).ngroups

    print(f"============ STATS ============")
    print(f"Total episodes: {df.shape[0]}")
    print(f"Total podcasts: {podcasts_count}")
    print(f"Total audio size (GB): {total_audio_media_size}")

def download_audio_files(df):
    file_queue = queue.Queue()
    for entry in [tuple(x) for x in df[['id', 'audio_url']].to_numpy()]:
        file_path = get_audio_filename(entry[0])
        if os.path.isfile(file_path):
            continue

        url = entry[1]
        file_queue.put((url, file_path))

    print(f"{OKGREEN}Downloading audio files...{ENDCOL}")

    num_threads = 16
    for i in range(num_threads):
        t = DownloadThread(file_queue)
        t.start()
    file_queue.join()

def write_to_db(df, podcasts_df):
    print(f"{OKGREEN}Writing to db...{ENDCOL}")

    print(f"{OKGREEN}Creating users...{ENDCOL}")
    podcast_to_author = {}
    authors = list(set(df['author'].tolist()))
    for author in authors:
        user = models.User(
            name=author, 
            email="test@gmail.com", 
            password="test",
            published_podcasts=[])
        user.save()
    
    print(f"{OKGREEN}Creating podcast episodes...{ENDCOL}")
    podcast_to_episodes = {}
    if os.path.isfile(AUDIO_MAPPING_FILENAME):
        podcast_audio_df = pd.read_csv(AUDIO_MAPPING_FILENAME)
    else:
        podcast_audio_df = pd.DataFrame(columns=["csv_id", "mongo_id"])
    for index, row in df.iterrows():
        podcast_episode_id = write_podcast_audio(podcast_audio_df, row)
        keywords = row['keywords'].split(",")
        podcast_episode_meta = models.PodcastEpisodeMetadata(
            name=row['title'], 
            description=row['summary'],
            episode=podcast_episode_id,
            keywords=keywords)
        podcast_to_episodes.setdefault(row['show_id'], []).append(podcast_episode_meta)
    podcast_audio_df.to_csv(AUDIO_MAPPING_FILENAME, index=False)

    print(f"{OKGREEN}Creating podcasts...{ENDCOL}")
    author_to_podcasts = {}
    podcast_ids = df['show_id'].unique()
    for podcast_id in podcast_ids:
        podcast_data = podcasts_df[podcasts_df['id'] == podcast_id].iloc[0]
        author = podcast_data['author']
        podcast_metadata = models.PodcastMetadata(
            name=podcast_data['title'], 
            author=author,
            description=podcast_data['summary'],
            episodes=podcast_to_episodes.get(podcast_id, []),
            category=podcast_data['category'],
            sub_category=podcast_data['subcategory'])

        author_to_podcasts.setdefault(author, []).append(podcast_metadata)
        podcast_metadata.save()

    print(f"{OKGREEN}Linking author users to podcasts...{ENDCOL}")
    for author in authors:
        user.update(published_podcasts=author_to_podcasts.get(author, []))


def write_podcast_audio(podcast_audio_df, podcast_row):
    # Attempt to use existing object in db
    id = podcast_row['id']
    if id in podcast_audio_df['csv_id'].values:
        return ObjectId(podcast_audio_df[podcast_audio_df['csv_id'] == id].iloc[0]['mongo_id'])
    
    # Upload audio file as new object
    audio_filename = get_audio_filename(id)
    if not os.path.isfile(audio_filename):
        print(f"{OKRED}Missing audio file: {audio_filename}...{ENDCOL}")
        return None

    with open(audio_filename, 'rb') as audio_file:
        podcast_episode = models.PodcastEpisode(audio=audio_file)
        podcast_episode.save()

    mongo_id = podcast_episode.id
    podcast_audio_df.loc[len(podcast_audio_df)] = [id, mongo_id]
    return mongo_id

if __name__ == '__main__':
    main()