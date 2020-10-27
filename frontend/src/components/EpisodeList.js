import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { PodcastCover } from "./Podcast";
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
  header: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
  },
}));

// https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
// probably a better way but ceebs
var toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};

export default function Playlist({ episodes, state }) {
  const classes = useStyles();
  return (
    <>
      <Grid container alignItems="center" className={classes.header}>
        <Grid item xs container spacing={2}>
          <Grid item xs={1}>
            #
          </Grid>
          <Grid item xs={3} lg={2}>
            Cover
          </Grid>
          <Grid item xs={6} container>
            <Grid item xs container direction="column">
              <Grid item>
                <Grid container>
                  <Typography gutterBottom variant="h6"></Typography>
                  <Typography variant="body2" gutterBottom>
                    Episode
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={1}>
              <Typography gutterBottom variant="subtitle1">
                Length
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography gutterBottom variant="subtitle1">
                Published On
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" />
      {episodes.map((episode, index) => {
        return (
          <>
            <Grid
              key={uid(episode)}
              container
              alignItems="center"
              className={classes.podcast}
            >
              <Grid item xs container spacing={2}>
                <Grid item xs={1}>{index + 1}</Grid>
                <Grid item xs={3} lg={2}>
                  <PodcastCover episode={episode} state={state} />
                </Grid>
                <Grid item xs={6} container>
                  <Grid item xs container direction="column">
                    <Grid item>
                      <Grid container>
                        <Typography gutterBottom variant="h6">
                          <b>{episode.title}</b>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {episode.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography gutterBottom variant="subtitle1">
                      {toHHMMSS(episode.length)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography gutterBottom variant="subtitle1">
                      {episode.date.toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider variant="fullWidth" />
          </>
        );
      })}
    </>
  );
}
