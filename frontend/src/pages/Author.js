import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Playlist } from "../components/Podcast";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";

/*
const getPodcastNames = () => {
  const query = `query getPodcastNames {
    allPodcastMetadata {
      edges {
        node{
          id
          name
          description
          author {
            id
          }
        }
      }
    }
  }`;
  const names = [];
  fetch("http://localhost:5000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      for (const item of data.data.allPodcastMetadata.edges) {
        names.push({
          value: item.node.id,
          label: item.node.name,
          description: item.node.description,
          author: item.node.author.id,
        });
      }
      console.log(data);
      names.filter(
        (item) => item.value === "VXNlcjo1ZjdlZmU5ZDM4OTVlMmUzNjhlZjU5NjY="
    });
  return names;
};

*/

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function Author({ state, name = "Oliver Productions" }) {
  const classes = useStyles();
  //const podcasts = getPodcastNames();
  const podcasts = [
    {
      title: "Oli's True Crime Series",
      length: "100",
      description:
        'Do "disgraced" lawyer Nicola Gobbo and "disgraced" former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?',
      image: "https://source.unsplash.com/random",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      author: { name: "Oliver Productions", id: 1 },
      podcast: { id: 1, title: "Oli's True Crime Series" },
    },
    {
      title: "Oli's True Crime Series 2: Electric Boogaloo",
      length: "20",
      description:
        "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
      image: "https://source.unsplash.com/random",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      author: { name: "Oliver Productions", id: 1 },
      podcast: { id: 1, title: "Oli's True Crime Series" },
    },
  ];

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>{name}</b>
        </Typography>
      </Box>
      <Playlist episodes={podcasts} state={state} variant="podcast" />
    </Container>
  );
}
