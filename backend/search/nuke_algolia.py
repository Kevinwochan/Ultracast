import search_engine

if __name__ == "__main__":
    search_eng = search_engine.SearchEngine()

    i = input("Nuking all algolia index's. Type yes to confirm: ")
    if (i == "yes"):
        print("Nuking...")
        search_eng.clear_algolia()
        print("...Done")

    else:
        print("Nope!")
    search_eng.shutdown()
