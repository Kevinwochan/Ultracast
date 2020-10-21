import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

const playlistStyles = makeStyles((theme) => ({
  card: {
    background: "white",
    padding: theme.spacing(2),
    margin: theme.spacing(3),
  },
}));

export function Playlist({ episodes, state }) {
  const classes = playlistStyles();

  return (
    <>
      {episodes.map((episode) => {
        return (
          <>
            <Grid container alignItems="center" className={classes.card}>
              <Grid item lg={11} container spacing={2}>
                <Grid item>
                  <PodcastCover podcast={episode} state={state} />
                </Grid>
                <Grid item lg={10} container direction="column">
                  <Grid item spacing={1}>
                    <Grid container>
                      <Grid item lg={6}>
                        <Typography gutterBottom variant="h6">
                          {episode.title}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item lg={4}>
                        <Link to={`/podcast/${episode.podcast.id}`}>
                          <Typography gutterBottom variant="subtitle1">
                            {episode.podcast.title}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item lg={4}>
                        <Link to={`/author/${episode.author.id}`}>
                          <Typography gutterBottom variant="subtitle1">
                            {episode.author.name}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item lg={4}>
                        <Typography gutterBottom variant="subtitle1">
                          {episode.length} minutes
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" gutterBottom>
                      {episode.description}
                    </Typography>
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

const sliderStyles = makeStyles((theme) => ({
  podcastContainer: {
    flexWrap: "nowrap",
    overflow: "scroll",
  },
  podcast: {
    cursor: "pointer",
  },
}));

export function Slider({ state, podcasts }) {
  const classes = sliderStyles();

  return (
    <Grid container spacing={4} className={classes.podcastContainer}>
      {podcasts.map((podcast) => (
        <Grid item key={podcast.title} lg={2} className={classes.podcast}>
          <LargePodcast state={state} podcast={podcast} />
        </Grid>
      ))}
    </Grid>
  );
}

const largePodcastStyles = makeStyles((theme) => ({
  podcastDetailsContainer: {
    padding: "10px 0px",
  },
  podcastDetails: {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export function LargePodcast({ state, podcast }) {
  const classes = largePodcastStyles();

  return (
    <>
      <PodcastCover podcast={podcast} state={state} />
      <CardContent className={classes.podcastDetailsContainer}>
        <Typography variant="subtitle2" className={classes.podcastDetails}>
          <b>{podcast.title}</b>
        </Typography>
        <Typography variant="caption" className={classes.podcastDetails}>
          {podcast.author}
        </Typography>
      </CardContent>
    </>
  );
}

const coverStyles = makeStyles((theme) => ({
  podcastItem: {
    display: "inline-block",
    position: "relative",
    cursor: "pointer",
  },
  podcastCover: {
    width: 150,
    height: 150,
  },
  podcastPlay: {
    position: "absolute",
    top: 60,
    left: 60,
  },
}));

// Image for the podcast
export function PodcastCover({ podcast, state }) {
  const classes = coverStyles();
  const [play, updatePlay] = useState(false);

  function showPlay() {
    updatePlay(true);
  }

  function hidePlay() {
    updatePlay(false);
  }

  return (
    <div
      className={classes.podcastItem}
      onMouseEnter={showPlay}
      onMouseLeave={hidePlay}
      onClick={() => {
        addAudio(state, {
          name: podcast.title,
          musicSrc: podcast.url,
          cover: podcast.image,
        });
      }}
    >
      <img
        src={podcast.image}
        alt="podcast cover"
        className={classes.podcastCover}
      ></img>
      <div
        className={classes.podcastPlay}
        style={{ display: play ? "block" : "none" }}
      >
        <PlayCircleFilledIcon fontSize="large" />
      </div>
    </div>
  );
}

// Add an audio to the sessionState audioList
// https://github.com/lijinke666/react-music-player#bulb-audiolistprops
export function addAudio(state, { name, musicSrc, cover }) {
  const [sessionState, updateState] = state;
  const newList = [
    ...sessionState.audioList,
    {
      name: name,
      musicSrc: musicSrc,
      cover: cover,
    },
  ];

  updateState("audioList", newList);
}
