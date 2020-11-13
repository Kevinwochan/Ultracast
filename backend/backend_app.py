import multiprocessing
import gunicorn.app.base

from webserver import app
from search import search_engine
from config import default_settings
import flask


def number_of_workers():
    return (multiprocessing.cpu_count() * 2) + 1
    #return 1

class BackendApp(gunicorn.app.base.BaseApplication):

    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        #self.search_engine = search_engine.SearchEngine(app.config)
        self.search_engine = None
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items()
                  if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        app = self.application()
        self.search_engine = search_engine.SearchEngine(app.config)
        return app

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
        #'capture-output': True,
        #'errorlog': "logs.txt",
        'on_exit': server.on_exit
    }
    '''
    Quite a few things going on here
    For mongodb you need to connect to the database only *after* the process has forked the worker
    Now, each worker calls the main function
    So we let the BackendApp actually call the factory method
    And thus instantiate its own connection to mongodb per process
    The search engine also has its own process with its very own connection
    '''
    standalone_app = BackendApp(app.create_app, options)
    server.app = standalone_app
    print("Starting app")
    standalone_app.run()
    standalone_app.search_engine.shutdown()
