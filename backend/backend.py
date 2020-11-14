import sys

from webserver import app
from search.search_engine import SearchEngine

if __name__ == "__main__":
    # Webserver runs on remote server by default
    host_ip = '0.0.0.0'
    if len(sys.argv) > 1 and sys.argv[1] == "--local":
        host_ip = '127.0.0.1'

    app = app.create_app()
    search_engine = SearchEngine(app.config)
    app.run(debug=True, host=host_ip)
    search_engine.shutdown()

