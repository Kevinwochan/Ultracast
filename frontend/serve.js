const express = require("express");
const path = require("path");
const app = express();

const port = process.argv[2] || 0;

app.use(express.static(path.join(__dirname, "build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const listener = app.listen(port, function () {
  console.log(
    `Serving frontend at http://localhost:${listener.address().port}/`
  );
});
