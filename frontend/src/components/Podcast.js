import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { uid } from "react-uid";

const playlistStyles = makeStyles((theme) => ({
  card: {
    background: "white",
    padding: theme.spacing(2),
    margin: theme.spacing(3),
  },
}));

export function Playlist({ episodes, state, variant = "episode" }) {
  const classes = playlistStyles();

  // Waiting for DB query - just show loader for now
  if (episodes == "loader") {
    return <CircularProgress />;
  }

  // No episodes are available - show error message
  if (!episodes || episodes.length == 0) {
    return (
      <Typography variant="body1">Nothing is currently available.</Typography>
    );
  }

  const EpisodeTitle = ({ episode }) => (
    <Grid item lg={6}>
      {variant === "podcast" ? (
        <Link to={`/podcast/${episode.podcast.id}`}>
          <Typography gutterBottom variant="subtitle1">
            <b>{episode.title}</b>
          </Typography>
        </Link>
      ) : (
        <Typography gutterBottom variant="h6">
          <b>{episode.title}</b>
        </Typography>
      )}
    </Grid>
  );

  // Show the podcast title if the variant is "podcast"
  const PodcastTitle = ({ episode }) => (
    <Grid item lg={4}>
      <Link to={`/podcast/${episode.podcast.id}`}>
        <Typography gutterBottom variant="subtitle1">
          {episode.podcast.title}
        </Typography>
      </Link>
    </Grid>
  );

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
                  <Grid item>
                    <Grid container>
                      <EpisodeTitle episode={episode} />
                    </Grid>
                    <Grid container>
                      {variant === "podcast" ? null : (
                        <PodcastTitle episode={episode} />
                      )}
                      <Grid item lg={4}>
                        <Link to={`/author/${episode.author.id}`}>
                          <Typography gutterBottom variant="subtitle1">
                            {episode.author.name}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item lg={4}>
                        <Typography gutterBottom variant="subtitle1">
                          {variant === "podcast"
                            ? `${episode.length} episodes`
                            : `${episode.length} minutes`}
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

  // Waiting for DB query - just show loader for now
  if (podcasts == "loader") {
    return <CircularProgress />;
  }

  // No podcasts are available - show error message
  if (!podcasts || podcasts.length == 0) {
    return (
      <Grid container spacing={4} className={classes.podcastContainer}>
        <Typography variant="body1">Nothing is currently available.</Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4} className={classes.podcastContainer}>
      {podcasts.map((podcast) => (
        <Grid item key={uid(podcast)} lg={2} className={classes.podcast}>
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
        <Link to={`/podcast/${podcast.id}`}>
          <Typography variant="subtitle2" className={classes.podcastDetails}>
            <b>{podcast.title}</b>
          </Typography>
        </Link>
        <Link to={`/author/${podcast.author.id}`}>
          <Typography variant="caption" className={classes.podcastDetails}>
            {podcast.author.name}
          </Typography>
        </Link>
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
          musicSrc: podcast.episode.url,
          cover: podcast.image,
          id: podcast.episode.id,
        });
      }}
    >
      <img
        src={podcast.image}
        alt="podcast cover"
        className={classes.podcastCover}
        onError={(e) => {
          const getRandomNumber = () => {
            return Math.floor(Math.random() * 1000);
          };

          e.target.src = `https://source.unsplash.com/random?sig=${getRandomNumber()}`;
        }}
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
export function addAudio(state, { name, musicSrc, cover, id }) {
  const [sessionState, updateState] = state;
  const newList = [
    ...sessionState.audioList,
    {
      name: name,
      musicSrc: musicSrc,
      cover: cover,
      id: id,
    },
  ];

  updateState("audioList", newList);
}
