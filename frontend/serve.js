const express = require('express');
const path = require('path');
const app = express();

port = process.argv[2] || 4000;

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port);

console.log(`Serving frontend at http://localhost:${port}/`);
