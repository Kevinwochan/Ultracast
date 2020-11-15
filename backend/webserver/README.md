# ultraCast Webserver

Uses JWT authentication for most operations.
You can sign in using the login() mutation. This returns an authentication token, which must be sent in the header of future queries.
This must be in the format "Authorization: Bearer $token"

We are using this library for JWT (with a nice example of how you place the token into the HTTP header): https://flask-jwt-extended.readthedocs.io/en/stable/basic_usage/

An example of a query using curl is shown below (you can see the authorization part in it)
``
curl 'http://127.0.0.1:5000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'Origin: moz-extension://70e05e85-f0d0-40f5-9844-d87f46df12d2' -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI5MTMwMjEsIm5iZiI6MTYwMjkxMzAyMSwianRpIjoiMGY4OTc1MjAtMjNjNC00OGY5LTljMWEtM2Y4NGE1ODZmZWNhIiwiZXhwIjoxNjAyOTEzOTIxLCJpZGVudGl0eSI6IntcIl9pZFwiOiB7XCIkb2lkXCI6IFwiNWY4YTgyZWZjOGJjMTI0ZjY3NTVmZjRkXCJ9LCBcImVtYWlsXCI6IFwib2xpMkBvbGkuY29tXCIsIFwicGFzc3dvcmRcIjogXCJwYmtkZjI6c2hhMjU2OjE1MDAwMCRhS3FtMEtHMyQxMjEzMTBmN2I5NDQwNmQ0YjhmM2MyM2UxNGY0MDhlNjg1ZWJhMDEwZTcwZjI1YWFmOGQzYjhjZWFiN2E4ZWVhXCIsIFwic3Vic2NyaWJlZF9wb2RjYXN0c1wiOiBbXSwgXCJsaXN0ZW5faGlzdG9yeVwiOiBbXSwgXCJwdWJsaXNoZWRfcG9kY2FzdHNcIjogW119IiwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIn0.uWBgtbyd0PgXUe39tK4ySB-V6lA83FHZgypGgsRsndo' --data-binary '{"query":"mutation a {\n  deletePodcastEpisode(input: {\n    podcastEpisodeId: \"UG9kY2FzdEVwaXNvZGU6NWY4YTg0MWQ1ZDZiNjZlYjI2YWY1ZjFh\"\n    \n  }) {\n    success\n  }\n}","variables":{}}' --compressed
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
