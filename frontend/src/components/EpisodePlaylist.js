import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AudioPlayer from "material-ui-audio-player";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 150,
    height: 150,
  },
  card: {
    background: "white",
    padding: theme.spacing(2),
    margin: theme.spacing(3),
  },
  order: {
    margin: "auto",
    textAlign: "center",
  },
}));

const PlayerStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    marginTop: theme.spacing(4),
  },
  loopIcon: {
    color: theme.palette.primary.light,
    "&:hover": {
      color: theme.palette.primary.dark,
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  volumeIcon: {
    color: theme.palette.primary.light,
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
  playIcon: {
    color: theme.palette.primary.light,
    "&:hover": {
      color: theme.palette.primary.dark,
    },
  },
  mainSlider:{
    color: theme.palette.primary.light,
  }
}));

export default function Playlist({ episodes }) {
  const classes = useStyles();
  return (
    <>
      {episodes.map((episode, index) => {
        return (
          <>
            <Grid container alignItems="center" className={classes.card}>
              <Grid item container direction="column">
                <Grid item spacing={3}>
                  <Typography gutterBottom variant="subtitle1">
                        {episode.title}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {episode.description}
                  </Typography>
                </Grid>
                <AudioPlayer
                  useStyles={PlayerStyles}
                  src={episode.url}
                  elevation={0}
                  rounded={false}
                  spacing={1}
                />
              </Grid>
            </Grid>
          </>
        );
      })}
    </>
  );
}
