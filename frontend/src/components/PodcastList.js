import React from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import SubscribeButton from "../components/SubscribeButton";

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
  const classes = useStyles();
  const [cookies, setCookie, removeCookie] = useCookies(['token']);

  if (podcasts === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      {podcasts.map((podcast) => (
        <Grid
          key={uid(podcast)}
          container
          justify={creator ? "space-around" : "center"}
          alignItems="center"
          className={classes.podcast}
        >
          <Grid item>
            {creator ? (
              <img
                src={podcast.image}
                alt={`${podcast.title} cover`}
                className={classes.podcastCover}
                onError={(e) => {
                  e.target.src = `/branding/square.svg`;
                }}
              ></img>
            ) : (
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
            )}
          </Grid>
          <Grid item xs={6} className={classes.podcastInfo}>
            <Link
              to={
                creator
                  ? `/creators/podcast/${podcast.id}`
                  : `/podcast/${podcast.id}`
              }
            >
              <Typography paragraph variant="h6">
                <b>{podcast.title}</b>
              </Typography>
              {creator ? (
                ""
              ) : (
                <Typography variant="subtitle2">
                  {`By ${podcast.author.name}`}
                </Typography>
              )}
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
            {creator ? (
              ""
            ) : (
              <SubscribeButton podcast={podcast}/>
            )}
          </Grid>
        </Grid>
      ))}
    </>
  );
}
