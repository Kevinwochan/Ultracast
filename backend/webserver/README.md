# ultraCast Webserver

Note - current working example based off https://graphene-mongo.readthedocs.io/en/latest/tutorial.html#setup-the-project

After starting up the webserver (see below) go to http://127.0.0.1:5000/graphql and enter:

```
{
  allEmployees {
    edges {
      node {
        id,
        name,
        department {
          id,
          name
        },
        role {
          id,
          name
        }
      }
    }
  }
}
```

and the response should be

```
{
  "data": {
    "allEmployees": {
      "edges": []
    }
  }
}
```


### Run
```
chmod +x ./start.sh
./start.sh
```

Run manually:
1. Setup and activate your virtual env
2. Run `pip install -r requirements.txt`
3. Run `flask run`