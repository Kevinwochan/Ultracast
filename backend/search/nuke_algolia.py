import search_engine

from webserver import app

if __name__ == "__main__":
    cfg = app.get_config()
    search_eng = search_engine.SearchEngine(cfg)

    i = input("Nuking all algolia index's. Type yes to confirm: ")
    if (i == "yes"):
        print("Nuking...")
        search_eng.clear_algolia()
        print("...Done")

    else:
        print("Nope!")
    search_eng.shutdown()
