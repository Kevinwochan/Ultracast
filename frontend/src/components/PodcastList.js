import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { getSubscriptions, subscribe, unsubscribe } from "../api/query";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
  },
  podcast: {
    marginBottom: theme.spacing(5),
  },
}));

export default function Playlist({ podcasts, state }) {
  const classes = useStyles();
  const [subscriptions, setSubscriptions] = useState([]); // i apologise for this disgrace. Use this array of subscriptions to initalise the subscribe button
  const [sessionState, setSessionState] = state;

  useEffect(() => {
    getSubscriptions(sessionState.cookies.token).then((data) => {
      setSubscriptions(data.map((podcast) => podcast.id));
    });
  }, [sessionState]);

  podcasts.forEach((podcast) => {
    podcast.subscribed = subscriptions.includes(podcast.id);
  });

  return (
    <>
      {podcasts.map((podcast) => (
        <>
          <Grid
            key={uid(podcast)}
            container
            justify="center"
            alignItems="center"
            spacing={2}
            className={classes.podcast}
          >
            <Grid item>
              <Link to={`/podcast/${podcast.id}`}>
                <img
                  src={podcast.image}
                  alt={`${podcast.title} cover`}
                  className={classes.podcastCover}
                  onError={(e) => {
                    e.target.src = `/branding/square.svg`;
                  }}
                ></img>
              </Link>
            </Grid>
            <Grid item xs={6}>
              <Link to={`/podcast/${podcast.id}`}>
                <Typography paragraph variant="h6">
                  <b>{podcast.title}</b>
                </Typography>
                <Typography variant="subtitle2">
                  {`By ${podcast.author.name}`}
                </Typography>
                <Typography variant="subtitle2">
                  {`${podcast.episodeCount} episodes`}
                </Typography>
                <Typography variant="body2">
                  {podcast.description.length < 150
                    ? podcast.description
                    : `${podcast.description.substr(0, 150)} ...`}
                </Typography>
              </Link>
            </Grid>
            <Grid item>
              <SubscribeButton
                podcastId={podcast.id}
                sessionState={sessionState}
                alreadySubscribed={podcast.subscribed}
              />
            </Grid>
          </Grid>
        </>
      ))}
    </>
  );
}

const SubscribeButton = ({ alreadySubscribed, podcastId, sessionState }) => {
  const [subscribed, setSubscription] = useState(alreadySubscribed);

  const toggleSubscription = () => {
    if (subscribed) {
      console.log(`unsubscribing to ${podcastId}`);
      unsubscribe(podcastId, sessionState.cookies.token);
    } else {
      subscribe(podcastId, sessionState.cookies.token);
      console.log(`subscribing to ${podcastId}`);
    }
    setSubscription(!subscribed);
  };

  return !subscribed ? (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={toggleSubscription}
    >
      Subscribe
    </Button>
  ) : (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<RemoveIcon />}
      onClick={toggleSubscription}
    >
      Unsubscribe
    </Button>
  );
};
