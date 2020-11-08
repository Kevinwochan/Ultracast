import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { getMySubscriptions } from "../api/query";
import SubscriptionsList from "../components/SubscriptionsList";

export default function Subscriptions({ state }) {
  const [sessionState, updateState] = state;
  const [podcasts, setPodcasts] = useState("loader");

  useEffect(() => {
    getMySubscriptions(sessionState.cookies.token).then((podcasts) => {
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
          <b>PODCAST SUBSCRIPTION PREVIEW</b>
        </Typography>
      </Box>
      <SubscriptionsList podcasts={podcasts} state={state} />
    </>
  ) : (
    <Box m={2}>
      <SentimentVeryDissatisfiedIcon fontSize="large" />
      <Typography paragraph variant="subtitle2">
        You have no subscriptions
      </Typography>
    </Box>
  );
}
