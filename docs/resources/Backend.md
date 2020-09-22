- MongoDB
  - [Make a simple DB on your machine](https://docs.mongodb.com/manual/tutorial/getting-started/)
  - [MongoDB Courses](https://university.mongodb.com/)
- MVP Python web server. More information [here](https://docs.python.org/3/library/http.server.html).

```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    # Create a HTTP header
    def http_head(self, code=200, headers={}):
        self.send_response(code)
        for k, v in headers.items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/':
            self.http_head(200, {'Content-Type': 'text/html'})
            self.wfile.write(open('index.html', 'rb').read())
        else:
            self.http_head(404)
            self.wfile.write(b'404 Not found')

    def do_POST(self):
        if self.path == '/custom_post_request':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            post_data = json.loads(post_data)

            # Process post_data here

            self.http_head(200, {'Content-Type': 'text/plain'})
        else:
            self.http_head(404)
            self.wfile.write(b'404 Not found')

# Server begins here
httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
httpd.serve_forever()
```

- Example Flask + Mongodb restful API: https://towardsdatascience.com/creating-a-beautiful-web-api-in-python-6415a40789af