import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Playlist from "../components/Playlist";
import Page from "../common/Page";
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
  podcastCover: {
    width: 150,
    height: 150,
  },
  card: {
    background: "white",
    padding: theme.spacing(2),
    margin: theme.spacing(3),
    textDecoration: "none",
    transition: "0.5s",
    "&:hover": {
      boxShadow: "5px 5px 10px rgba(0,0,0,0.2)",
    }
  },
  order: {
    margin: "auto",
    textAlign: "center",
  },
}));

export default function History({ cookies, handleCookie }) {
  const classes = useStyles();
  //const podcasts = getPodcastNames();
  const podcasts = [
    {
      id: 1,
      title: "Oliver's True Crime Series",
      description:
        "In this innovative podcast, retired cold case investigator Paul Holes and true crime journalist Billy Jensen team up to tackle unsolved crimes and missing person cases each week. They invite listeners to contribute their own research and theories, so you can put on your own Sherlock hat.",
      image: "https://source.unsplash.com/random",
      author: { name: "Joe Rogan", id: 1 },
      podcast: "Joe Rogan Show",
    },
    {
      id: 1,
      title: "73 Questions with Oliver",
      description:
        "73 Questions Answered By Your Favorite Celebs - Filmed in a single shot, some of our favorite personalities are challenged to answer 73 rapid-fire questions.",
      image: "https://source.unsplash.com/random",
      author: { name: "Joe Rogan", id: 2 },
      podcast: "Joe Rogan Show",
    },
  ];

  return (
    <Page cookies={cookies} handleCookie={handleCookie}>
      <Container maxWidth="lg">
        <IconButton aria-label="delete" disabled color="primary"></IconButton>
        {podcasts.map((podcast, index) => (
          <Link to={`/podcast/${podcast.id}`}>
            <Grid container className={classes.card} spacing={3}>
              <Grid item lg={2}>
                <img
                  src={
                    podcast.cover
                      ? podcast.cover
                      : "https://source.unsplash.com/random"
                  }
                  alt="podcast cover"
                  className={classes.podcastCover}
                ></img>
              </Grid>
              <Grid item lg={10} container direction="column">
                <Grid item spacing={1}>
                  <Typography gutterBottom variant="h4">
                    <Grid container>
                      <Grid item xs>
                        {podcast.title}
                      </Grid>
                    </Grid>
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {podcast.description}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Link>
        ))}
      </Container>
    </Page>
  );
}
