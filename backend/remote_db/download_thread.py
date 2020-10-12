import requests
import threading
import queue

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