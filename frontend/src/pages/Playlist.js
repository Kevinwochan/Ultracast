import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AudioPlayer from "material-ui-audio-player";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    width: 128,
    height: 128,
  },
}));

const PlayerStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  loopIcon: {
    color: "#3f51b5",
    "&.selected": {
      color: "#0921a9",
    },
    "&:hover": {
      color: "#7986cb",
    },
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  playIcon: {
    color: "#f50057",
    "&:hover": {
      color: "#ff4081",
    },
  },
  volumeIcon: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  volumeSlider: {
    color: "black",
  },
  progressTime: {
    color: "rgba(0, 0, 0, 0.54)",
  },
  mainSlider: {
    color: "#3f51b5",
    "& .MuiSlider-rail": {
      color: "#7986cb",
    },
    "& .MuiSlider-track": {
      color: "#3f51b5",
    },
    "& .MuiSlider-thumb": {
      color: "#303f9f",
    },
  },
}));

const cards = [1, 2, 3, 4, 5, 6];

export default function Playlist({ episodes }) {
  const classes = useStyles();
  return (
    <>
      <Grid container md={12}>
        <Grid item lg={3}></Grid>
        <Grid container lg={8}>
          <Grid item xs>
            <Typography variant="subtitle1">Podcast</Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle1">Author</Typography>
          </Grid>
        </Grid>
      </Grid>
      {episodes.map((episode, index) => {
        return (
          <>
            <Grid container md={12}>
              <Grid item lg={1}>
                <Typography gutterBottom variant="subtitle1">
                  {index + 1}
                </Typography>
              </Grid>
              <Grid item lg={2}>
                <img
                  src={
                    episode.image
                      ? episode.image
                      : "https://source.unsplash.com/random"
                  }
                  className={classes.podcastCover}
                ></img>
              </Grid>
              <Grid item lg={8}>
                <Grid item xs container direction="column" spacing={2}>
                  <Grid item xs>
                    <Typography gutterBottom variant="subtitle1">
                      <Grid container>
                        <Grid item xs>
                          {episode.podcast}: {episode.title}
                        </Grid>
                        <Grid item xs>
                          {episode.author}
                        </Grid>
                      </Grid>
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {episode.description}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <AudioPlayer
                      useStyles={PlayerStyles}
                      src={episode.url}
                      elevation={1}
                      rounded={false}
                      spacing={0}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </>
        );
      })}
    </>
  );
}
