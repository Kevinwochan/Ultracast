import React from "react";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import SubscribeButton from "../components/SubscribeButton";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
  },
  podcast: {
    marginBottom: theme.spacing(5),
  },
}));

/*
this components expects podcast.subscribed, the parent component should evaluate this
*/
export default function Playlist({ podcasts, state }) {
  const classes = useStyles();
  const [sessionState, setSessionState] = state;

  return (
    <>
      {podcasts.map((podcast) => (
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
            <SubscribeButton podcast={podcast} sessionState={sessionState} />
          </Grid>
        </Grid>
      ))}
    </>
  );
}
