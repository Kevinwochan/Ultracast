import React from "react";

const Upload = () => {
  getData();
  /* TODO */
  return <div></div>;
};

const getData = () => {
  // TODO: proxy the Flask server as :3000 to avoid CORS stuff
  fetch("http://localhost:5000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: "{ all_podcast_episode }" }),
  })
    .then((r) => r.json())
    .then((data) => console.log("data returned:", data));
};

export default Upload;
