import requests
import threading
import queue

class CheckLinkValidThread(threading.Thread):
    def __init__(self, queue, valid_url_list):
        super(CheckLinkValidThread, self).__init__()
        self.queue = queue
        self.daemon = True
        self.valid_url_list = valid_url_list

    def run(self):
        while True:
            url = self.queue.get()
            if self.valid_url(url):
                self.valid_url_list.append(url)
            self.queue.task_done()

    def valid_url(self, url):
        # print(f"Checking link: {url}")
        try:
            res = requests.head(url, timeout=10)
            return res.status_code == 200
        except:
            return False