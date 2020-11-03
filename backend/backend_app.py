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


if __name__ == '__main__':
    options = {
        'bind': '%s:%s' % ('127.0.0.1', '8080'),
        'workers': number_of_workers(),
    }
    standalone_app = BackendApp(app.app, options)
    standalone_app.run()
    standalone_app.search_engine.shutdown()
