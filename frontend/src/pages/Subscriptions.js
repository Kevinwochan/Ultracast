import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { getMySubscriptions } from "../api/query";
import SubscriptionsList from "../components/SubscriptionsList";

export default function Subscriptions() {
  const [cookies] = useCookies(['token']);
  const [podcasts, setPodcasts] = useState("loader");

  useEffect(() => {
    getMySubscriptions(cookies.token).then((podcasts) => {
      podcasts.forEach((podcast) => {
        podcast.subscribed = true;
      });
      setPodcasts(podcasts);
    });
  }, [cookies.token]);

  return podcasts.length > 0 ? (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>PODCAST SUBSCRIPTION PREVIEW</b>
        </Typography>
      </Box>
      <SubscriptionsList podcasts={podcasts}/>
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
