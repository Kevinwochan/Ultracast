from webserver import app
from search.search_engine import SearchEngine

if __name__ == "__main__":
    app = app.create_app()
    search_engine = SearchEngine(app.config)
    app.run(debug=True)
    search_engine.shutdown()

