from webserver.app import app
from search.search_engine import SearchEngine

if __name__ == "__main__":
    search_engine = SearchEngine()
    app.run(debug=True)
    search_engine.shutdown()
