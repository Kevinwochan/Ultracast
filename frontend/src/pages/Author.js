import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { useParams } from "react-router-dom";
import { getPodcasts, getMySubscriptions } from "../api/query";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import PodcastPlaylist from "../components/PodcastList";

const useStyles = makeStyles((theme) => ({
  podcastHero: {
    background: "white",
    padding: theme.spacing(5),
    marginBottom: theme.spacing(3),
    minHeight: 150,
  },
  podcastCover: {
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },
  overlay: {
    height: "100%",
    width: "100%",
    background: "black",
    opacity: 0.7,
  },
  coverGlass: {
    position: "relative",
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
}));

export default function Author({ state }) {
  const classes = useStyles();
  const { id } = useParams();
  const [author, setAuthor] = useState();
  const [podcasts, setPodcasts] = useState("loader"); // TODO: paginate the podcasts

  useEffect(() => {
    getPodcasts(id).then((authorInfo) => {
      // initalise podcast.subscribed
      getMySubscriptions(state[0].cookies.token).then((data) => {
        const subscriptions = data.map((podcast) => podcast.id);
        authorInfo.podcasts.forEach((podcast) => {
          podcast.subscribed = subscriptions.includes(podcast.id);
        });
        setPodcasts(authorInfo.podcasts);
      });
      setAuthor(authorInfo.author);
    });
  }, [id, state]);

  if (podcasts === "loader") {
    return <CircularProgress />;
  }
  return (
    <>
      <Grid container spacing={0}>
        {/* Info section */}
        <Grid item className={classes.podcastHero}>
          <Typography variant="h3" paragraph style={{ fontWeight: "bold" }}>
            Podcasts by {author.name}
          </Typography>
        </Grid>
      </Grid>
      {/* List of podcasts */}
      <PodcastPlaylist podcasts={podcasts} state={state} />
    </>
  );
}
