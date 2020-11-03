import multiprocessing
import gunicorn.app.base

from webserver import app
from search import search_engine


def number_of_workers():
    return (multiprocessing.cpu_count() * 2) + 1

class BackendApp(gunicorn.app.base.BaseApplication):

    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        self.search_engine = search_engine.SearchEngine()
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items()
                  if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

    def on_exit(self, server):
        self.search_engine.shutdown()

class Server:
    def __init__(self):
        self.app = None

    def on_exit(self, server):
        self.app.on_exit(server)

if __name__ == '__main__':
    server = Server()
    options = {
        'bind': '%s:%s' % ('127.0.0.1', '5000'),
        'workers': number_of_workers(),
        'on_exit': server.on_exit
    }
    standalone_app = BackendApp(app.app, options)
    server.app = standalone_app
    standalone_app.run()
    standalone_app.search_engine.shutdown()
