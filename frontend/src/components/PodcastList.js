import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
  },
  podcast: {
    padding: theme.spacing(5),
  },
}));

export default function Playlist({ podcasts, state }) {
  const classes = useStyles();
  return (
    <>
      {podcasts.map((podcast) => {
        return (
          <>
            <Grid
              key={uid(podcast)}
              container
              alignItems="center"
              className={classes.podcast}
            >
              <Link to={`/podcast/${podcast.id}`}>
              <Grid item xs container spacing={5}>
                <Grid item>
                  <img
                    src={podcast.image}
                    alt="podcast cover"
                    className={classes.podcastCover}
                    onError={(e) => {
                      e.target.src = `/branding/square.svg`;
                    }}
                  ></img>
                </Grid>
                <Grid item xs container direction="column">
                  <Grid item>
                    <Grid container>
                      <Typography gutterBottom variant="h6">
                        <b>{podcast.title}</b>
                      </Typography>
                    </Grid>
                    <Grid container>
                      <Grid item xs>
                        <Typography gutterBottom variant="subtitle1">
                          {`${podcast.episodeCount} episodes`}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" gutterBottom>
                      {podcast.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              </Link>
            </Grid>
            <Divider variant="fullWidth" />
          </>
        );
      })}
    </>
  );
}
