import requests
import threading
import queue
import traceback

from webserver import db

OKRED = '\033[31m'
ENDCOL = '\033[0m'

class DownloadUploadThread(threading.Thread):
    def __init__(self, queue, episode_id_to_uploaded_url):
        super(DownloadUploadThread, self).__init__()
        self.queue = queue
        self.episode_id_to_uploaded_url = episode_id_to_uploaded_url
        self.daemon = True

    def run(self):
        while True:
            entry = self.queue.get()
            try:
                self.download_upload(entry)
            except Exception as e:
                print(f"{OKRED}   For {entry} - Error: {e}{ENDCOL}\n{traceback.format_exc()}")
            self.queue.task_done()

    def download_upload(self, entry):
        episode_id, url, content_type, ext = entry
        print(f"Downloading {url}")
        response = requests.get(url, timeout=10)
        data = response.content
        print(f"Uploading {url} content")
        upload_url = db.add_file(data=data, override=False, content_type=content_type, ext=ext)
        self.episode_id_to_uploaded_url[episode_id] = upload_url
        print(f"Upload done for content from {url}")
