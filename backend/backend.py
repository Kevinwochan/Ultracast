import sys

from webserver import app
from search.search_engine import SearchEngine

if __name__ == "__main__":
    # Webserver runs on remote server by default
    app = app.create_app()
    search_engine = SearchEngine(app.config)
    host_ip = app.config.get("HOST", "127.0.0.1")
    app.run(debug=True, host=host_ip)
    search_engine.shutdown()

