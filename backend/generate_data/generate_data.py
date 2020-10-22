import pandas as pd
import numpy as np
import os.path
import sys
import re
import requests
import queue
import pickle
from bson.objectid import ObjectId

from webserver import db
from webserver import models
from webserver import schema
from generate_data.download_upload_thread import DownloadUploadThread
from generate_data.check_link_valid_thread import CheckLinkValidThread

# Data source:
# https://data.world/brandon-telle/podcasts-dataset

OKGREEN = '\033[92m'
OKYELLOW = '\033[33m'
OKRED = '\033[31m'
ENDCOL = '\033[0m'

### FILE PATHS ###
SCRIPT_DIR = os.path.dirname(__file__)
RAW_EPISODES_CSV = f'{SCRIPT_DIR}/episodes.csv'
RAW_PODCASTS_CSV = f'{SCRIPT_DIR}/shows.csv'
FILTERED_CSV_NAME = f"{SCRIPT_DIR}/filtered_episodes.csv"
AUDIO_MAPPING_FILENAME = f"{SCRIPT_DIR}/audio_file_mapping.csv"
VALID_AUDIO_URLS_FILE = f"{SCRIPT_DIR}/valid_audio_urls.pickle"
UPLOADED_AUDIO_FILE = f"{SCRIPT_DIR}/uploaded_audio.pickle"
UPLOADED_IMAGE_FILE = f"{SCRIPT_DIR}/uploaded_images.pickle"

### FILTER VARIABLES ###
MIN_EPISODES_PER_PODCAST = 2
MAX_EPISODES_PER_PODCAST = 40
MAX_TITLE_LEN = 200
MAX_DESCRIPTION_LEN = 300
MIN_FILE_SIZE_MB = 0.0001
MAX_FILE_SIZE_MB = 1500
VALID_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'mp3', 'MP3', 'Audio/MP3', 'audio/mpeg3', 'audio/x-mp3']
VALID_IMAGE_FORMATS = ['image/jpeg', 'image/png']
EPISODE_DROP_COLS = ['link', 'guid', 'description', 'summary', 'pub_date', 'author', 'explicit']
EPISODE_ALLOW_NA_COLS = ['category', 'subtitle']
# TODO - consider adding explicit and language info
PODCAST_DROP_COLS = ['explicit', 'language', 'feed_url', 'subtitle', 'description', 'created_at', 'last_build_date', 'link']

def main():
    # Process data
    df, podcasts_df = get_data()
    confirm_data_ok_prompt(df)
    # Upload static data
    episode_id_to_uploaded_audio_url = download_upload_files(df, UPLOADED_AUDIO_FILE, ['id', 'audio_url'], VALID_AUDIO_FORMATS)
    podcast_id_to_uploaded_cover_url = download_upload_files(podcasts_df, UPLOADED_IMAGE_FILE, ['id', 'image'], VALID_IMAGE_FORMATS)
    # Write documents to mongodb
    # TODO enable
    # write_to_db(df, podcasts_df, episode_id_to_uploaded_audio_url)
    print(f"{OKGREEN}Finished Successfully{ENDCOL}")

def get_data():
    podcasts_df = get_podcasts_df()

    use_raw_csv = True
    if os.path.isfile(FILTERED_CSV_NAME):
        ans = input(f"{OKYELLOW}Existing filtered csv found. Use it?(y/n){ENDCOL}")
        if ans == 'y':
            use_raw_csv = False

    if use_raw_csv:
        df = process_raw_csv(podcasts_df)
    else:
        print(f"{OKGREEN}Opening csv...{ENDCOL}")
        df = pd.read_csv(FILTERED_CSV_NAME, sep=',')

    podcasts_df = podcasts_df[podcasts_df['id'].isin(df['show_id'].tolist())]
    return (df, podcasts_df)

def get_podcasts_df():
    print(f"{OKGREEN}Opening raw podcasts csv...{ENDCOL}")
    podcasts_df = pd.read_csv(RAW_PODCASTS_CSV, sep=',')
    print(f"Loaded in podcasts df: {podcasts_df.shape[0]}")

    # Drop unwanted columns
    print(f"{OKGREEN}Dropping unwanted columns...{ENDCOL}")
    for unwanted_col in PODCAST_DROP_COLS:
        podcasts_df.drop(unwanted_col, axis=1, inplace=True)

    # Drop rows with null values
    podcasts_df.dropna(axis=0, inplace=True)
    return podcasts_df

def process_raw_csv(podcasts_df):
    print(f"{OKGREEN}Opening raw episodes csv...{ENDCOL}")
    df = pd.read_csv(RAW_EPISODES_CSV, sep=',')
    log_entries(df, "Loaded in episode df")

    # Drop unwanted columns
    print(f"{OKGREEN}Dropping unwanted columns...{ENDCOL}")
    for unwanted_col in EPISODE_DROP_COLS:
        df.drop(unwanted_col, axis=1, inplace=True)

    # Drop rows with null values, set NaN to empty string
    non_na_cols = list(set(list(df)) - set(EPISODE_ALLOW_NA_COLS))
    df.dropna(axis=0, subset=non_na_cols, inplace=True)
    df.fillna('', inplace=True)
    log_entries(df, "Remove unallowable NaNs")

    # Drop all without podcast_id
    podcast_ids = podcasts_df['id'].tolist()
    df = df[df['show_id'].isin(podcast_ids)]
    log_entries(df, "Remove entries with show_id not in podcasts df")

    original_podcast_espisode_count = df.groupby('show_id').count()

    # Clean text fields in df and podcasts_df
    df_text_columns = ['title', 'subtitle']
    for column in df_text_columns:
        df[column] = df[column].map(remove_excess_whitespace)
    podcasts_df_text_columns = ['title', 'summary', 'email', 'author']
    for column in podcasts_df_text_columns:
        podcasts_df[column] = podcasts_df[column].map(remove_excess_whitespace)

    ################################################################
    # Filter
    ################################################################

    print(f"{OKGREEN}Filtering...{ENDCOL}")

    # Audio formats
    df.drop(df.loc[~df['audio_mime_type'].isin(VALID_AUDIO_FORMATS)].index, inplace=True)
    log_entries(df, "Audio type")

    # Audio file size
    df['audio_file_size'] = df['audio_file_size'].astype(int)
    df.drop(df[df['audio_file_size'] < mb_to_b(MIN_FILE_SIZE_MB)].index, inplace=True)
    df.drop(df[df['audio_file_size'] > mb_to_b(MAX_FILE_SIZE_MB)].index, inplace=True)
    log_entries(df, "Audio size")

    # Episode field lengths
    df = df[df['title'].map(len) <= MAX_TITLE_LEN]
    df = df[df['subtitle'].map(len) <= MAX_DESCRIPTION_LEN]
    log_entries(df, "Text field len")
    
    # Filter by number of episodes
    df = df.groupby('show_id').filter(
        lambda x : len(x) >= MIN_EPISODES_PER_PODCAST and len(x) <= MAX_EPISODES_PER_PODCAST)
    log_entries(df, "Number of episodes")

    # Confirm episode audio files are downloadable
    df = valid_download_link(df, 'audio_url', VALID_AUDIO_URLS_FILE)
    log_entries(df, "Valid audio link")

    # Podcasts contains all episodes that existed prior to filtering
    # has_all_episodes = df.groupby('show_id').count().isin(original_podcast_espisode_count).all(axis=1)
    # podcasts_with_all_episodes = has_all_episodes.index[has_all_episodes]
    # df = df[df['show_id'].isin(podcasts_with_all_episodes)]
    # logEntries(df, "All episodes in podcast")

    df.to_csv(FILTERED_CSV_NAME, index=False)
    return df

def valid_download_link(df, url_column_name, cache_file):
    print(f"{OKGREEN}Checking download links ({cache_file})...{ENDCOL}")
    
    valid_urls = []
    invalid_urls = []
    if os.path.exists(cache_file):
        urls_dict = pickle.load(open(cache_file, "rb"))
        valid_urls = urls_dict.get('valid', [])
        invalid_urls = urls_dict.get('invalid', [])

    unchecked_urls = list(set(df[url_column_name].tolist()) - set(valid_urls) - set(invalid_urls))
    url_queue = queue.Queue()
    for url in unchecked_urls:
        url_queue.put(url)

    num_threads = 16
    for i in range(num_threads):
        t = CheckLinkValidThread(url_queue, valid_urls)
        t.start()
    url_queue.join()

    invalid_urls.extend(list(set(unchecked_urls) - set(valid_urls)))
    pickle.dump({'valid': valid_urls, 'invalid': invalid_urls}, open(cache_file, "wb"))
    return df[df[url_column_name].isin(valid_urls)]

###########################################################################################################
#                                      Download & Upload Static data                                      #
###########################################################################################################

# 
def download_upload_files(df, cache_file, id_url_cols, valid_mime_formats):

    entity_id_to_uploaded_url = {}
    if os.path.isfile(cache_file):
        entity_id_to_uploaded_url = pickle.load(open(cache_file, "rb"))

    file_queue = queue.Queue()
    for entry in [tuple(x) for x in df[id_url_cols].to_numpy()]:
        entity_id = entry[0]
        download_url = entry[1]

        if entity_id not in entity_id_to_uploaded_url.keys():
            file_queue.put((entity_id, download_url, valid_mime_formats))

    num_threads = 16
    for i in range(num_threads):
        t = DownloadUploadThread(file_queue, entity_id_to_uploaded_url)
        t.start()
    file_queue.join()

    pickle.dump(entity_id_to_uploaded_url, open(cache_file, "wb"))
    return entity_id_to_uploaded_url

###########################################################################################################
#                                      Write Data                                                         #
###########################################################################################################

def write_to_db(df, podcasts_df, episode_id_to_uploaded_url):
    print(f"{OKGREEN}Writing to db...{ENDCOL}")

    # podcast_id_to_user = write_users_to_db(podcasts_df)
    # podcast_id_to_episodes = write_podcast_episodes_to_db(df)
    # podcast_id_to_podcasts = write_podcasts_to_db(df, podcasts_df, podcast_id_to_episodes, podcast_id_to_user)

    # Link users to podcasts
    # print(f"{OKGREEN}Linking users to podcasts...{ENDCOL}")
    # for podcast_id, user in podcast_id_to_user.items():
    #     user.update(published_podcasts=podcast_id_to_podcasts.get(podcast_id, []))

def write_users_to_db(podcasts_df):
    print(f"{OKGREEN}Creating users...{ENDCOL}")
    podcast_id_to_user = {}
    # emails = list(set(podcasts_df['email'].tolist()))
    # for email in emails:
    #     row = podcasts_df[podcasts_df['email'] == email].iloc[0]
    #     author = row['author']
    #     user = models.User(
    #         name=author, 
    #         email=email, 
    #         password="test",
    #         published_podcasts=[])
    #     user.save()
    #     podcast_id_to_user[row['id']] = user
    return podcast_id_to_user

def write_podcast_episodes_to_db(df):
    print(f"{OKGREEN}Creating podcast episodes...{ENDCOL}")
    podcast_id_to_episodes = {}
    
    # # Try to use existing objects in mongo
    # if os.path.isfile(AUDIO_MAPPING_FILENAME):
    #     podcast_audio_df = pd.read_csv(AUDIO_MAPPING_FILENAME)
    # else:
    #     podcast_audio_df = pd.DataFrame(columns=["csv_id", "mongo_id"])

    for index, row in df.iterrows():
        audio_url = upload_audio_file(row['id'])
        keywords = row['keywords'].split(",")
        # podcast_episode_meta = models.PodcastEpisodeMetadata(
        #     name=row['title'], 
        #     description=row['subtitle'],
        #     episode=podcast_episode_id,
        #     keywords=keywords)
        # podcast_id_to_episodes.setdefault(row['show_id'], []).append(podcast_episode_meta)
    # podcast_audio_df.to_csv(AUDIO_MAPPING_FILENAME, index=False)

    return podcast_id_to_episodes

def write_podcasts_to_db(df, podcasts_df, podcast_id_to_episodes, podcast_id_to_user):
    print(f"{OKGREEN}Creating podcasts...{ENDCOL}")
    podcast_id_to_podcasts = {}
    # podcast_ids = df['show_id'].unique()
    # for podcast_id in podcast_ids:
    #     podcast_data = podcasts_df[podcasts_df['id'] == podcast_id].iloc[0]
    #     podcast_metadata = models.PodcastMetadata(
    #         name=podcast_data['title'], 
    #         author=podcast_id_to_user.get(podcast_id),
    #         description=podcast_data['summary'],
    #         episodes=podcast_id_to_episodes.get(podcast_id, []),
    #         category=podcast_data['category'],
    #         sub_category=podcast_data['subcategory'])

    #     podcast_id_to_podcasts.setdefault(podcast_id, []).append(podcast_metadata)
    #     podcast_metadata.save()
    
    return podcast_id_to_podcasts

###########################################################################################################
#                                      Utility Functions                                                  #
###########################################################################################################

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

def remove_excess_whitespace(text):
    return re.sub(r"\s+", " ", text).strip()

def mb_to_b(num):
    return num * 10**6

def log_entries(df, filter_des):
    print(f"Podcasts: {len(df['show_id'].unique())} | Episodes: {df.shape[0]} | Filter applied: {filter_des}")

if __name__ == '__main__':
    main()