import requests
import threading
import queue
import traceback

from webserver import db

OKRED = '\033[31m'
ENDCOL = '\033[0m'

class DownloadUploadThread(threading.Thread):
    def __init__(self, queue, episode_id_to_data):
        super(DownloadUploadThread, self).__init__()
        self.queue = queue
        self.episode_id_to_data = episode_id_to_data
        self.daemon = True

    def run(self):
        while True:
            entry = self.queue.get()
            try:
                self.download_upload(entry)
            except Exception as e:
                print(f"{OKRED}   For {entry} - Error: {e}{ENDCOL}\n{traceback.format_exc()}")
                episode_id, url, allowed_mime_types = entry
                self.episode_id_to_data['invalid'][episode_id] = True

            self.queue.task_done()

    def download_upload(self, entry):
        episode_id, url, allowed_mime_types = entry
        
        print(f"Downloading [{url}]")
        response = requests.get(url, timeout=10)
        
        print(f"Uploading [{url}] content")
        data = response.content
        upload_url = db.add_file(data=data, valid_mimes=allowed_mime_types)
        # Will return -1 for invalid types
        duration = db.audio_file_duration_secs(data)
        self.episode_id_to_data['valid'][episode_id] = {'url': upload_url, 'duration': duration}
        
        print(f"Upload done for [{url}] content")
