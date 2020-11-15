import React from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import SubscribeButton from "./SubscribeButton";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
    border: "1px solid rgba(0,0,0,0.1)",
    margin: theme.spacing(2),
  },
  podcastInfo: {
    padding: theme.spacing(2),
  },
}));

/*
this components expects podcast.subscribed, the parent component should evaluate this
*/
export default function PodcastList({ podcasts, creator }) {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const classes = useStyles();

  if (podcasts === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      {podcasts.map((podcast) => (
        <Grid
          key={uid(podcast)}
          container
          justify="center"
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
          <Grid item xs={6} className={classes.podcastInfo}>
            <Link to={`/podcast/${podcast.id}`}>
              <Typography variant="subtitle2">PODCAST TITLE</Typography>
              <Typography variant="subtitle1" paragraph gutterBottom>
                <b>{podcast.title}</b>
              </Typography>
              <Typography variant="body2">{`Latest episode:`}</Typography>
              <Typography variant="body1">
                <b>{`${podcast.episodes[0].title}`}</b>
              </Typography>
            </Link>
          </Grid>
          <Grid item>
            <SubscribeButton podcast={podcast} />
          </Grid>
        </Grid>
      ))}
    </>
  );
}
