import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getSubscriptions } from "../api/query";
import PodcastPlaylist from "../components/PodcastList";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function Subscriptions({ state }) {
  const [sessionState, updateState] = state;
  const classes = useStyles();
  const [podcasts, setPodcasts] = useState("loader");

  useEffect(() => {
    getSubscriptions(sessionState.cookies.token).then((podcasts) => {
      podcasts.forEach(podcast => {
        podcast.subscribed = true
      });
      setPodcasts(podcasts);
    });
  }, [sessionState]);

  if (podcasts === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Subscriptions</b>
        </Typography>
      </Box>
      <PodcastPlaylist podcasts={podcasts} state={state} />
    </>
  );
}
