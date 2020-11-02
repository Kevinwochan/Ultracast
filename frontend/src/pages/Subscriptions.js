import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { getSubscriptions } from "../api/query";
import PodcastPlaylist from "../components/PodcastList";

export default function Subscriptions({ state }) {
  const [sessionState, updateState] = state;
  const [podcasts, setPodcasts] = useState("loader");

  useEffect(() => {
    getSubscriptions(sessionState.cookies.token).then((podcasts) => {
      podcasts.forEach((podcast) => {
        podcast.subscribed = true;
      });
      setPodcasts(podcasts);
    });
  }, [sessionState]);

  return podcasts.length > 0 ? (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Subscriptions</b>
        </Typography>
      </Box>
      <PodcastPlaylist podcasts={podcasts} state={state} />
    </>
  ) : (
    <Box m={2}>
      <SentimentVeryDissatisfiedIcon fontSize="large" />
      <Typography paragraph variant="subtitle">
        You have no subscriptions
      </Typography>
    </Box>
  );
}
