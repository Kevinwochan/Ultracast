import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import { uid } from "react-uid";
import { addAudio } from "./AudioPlayer/Player";
import ultraCastTheme from "../theme";
import { toHHMMSS } from "../common/utils";

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
  if (episodes === "loader") {
    return <PodcastLoader />;
  }

  // No episodes are available - show error message
  if (!episodes || episodes.length === 0) {
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
                  <PodcastCover episode={episode} state={state} />
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
                        <Link to={`/author/${episode.podcast.author.id}`}>
                          <Typography gutterBottom variant="subtitle1">
                            {episode.podcast.author.name}
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item lg={4}>
                        <Typography gutterBottom variant="subtitle1">
                          {toHHMMSS(episode.length)}
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

const PodcastSliderStyles = makeStyles((theme) => ({
  podcastContainer: {
    flexWrap: "nowrap",
    overflow: "scroll",
  },
  podcast: {
    cursor: "pointer",
  },
  podcastCover: {
    height: 150,
    width: 150,
  },
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

export function PodcastSlider({ state, podcasts }) {
  const classes = PodcastSliderStyles();

  // Waiting for DB query - just show loader for now
  if (podcasts === "loader") {
    return <PodcastLoader />;
  }

  // No podcasts are available - show error message
  if (!podcasts || podcasts.length === 0) {
    return (
      <Grid container spacing={4} className={classes.podcastContainer}>
        <Typography variant="body1">Nothing is currently available.</Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4} className={classes.podcastContainer}>
      {podcasts.map((podcast) => (
        <Grid item key={uid(podcast)} xs={2} className={classes.podcast}>
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
          <CardContent className={classes.podcastDetailsContainer}>
            <Link to={`/podcast/${podcast.id}`}>
              <Typography
                variant="subtitle2"
                className={classes.podcastDetails}
              >
                <b>{podcast.title}</b>
              </Typography>
            </Link>
            <Link to={`/author/${podcast.author.id}`}>
              <Typography variant="caption" className={classes.podcastDetails}>
                {podcast.author.name}
              </Typography>
            </Link>
          </CardContent>
        </Grid>
      ))}
    </Grid>
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

export function EpisodeSlider({ state, episodes }) {
  const classes = sliderStyles();

  // Waiting for DB query - just show loader for now
  if (episodes === "loader") {
    return <PodcastLoader />;
  }

  // No podcasts are available - show error message
  if (!episodes || episodes.length === 0) {
    return (
      <Grid container spacing={4} className={classes.podcastContainer}>
        <Typography variant="body1">Nothing is currently available.</Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4} className={classes.podcastContainer}>
      {episodes.map((episode) => (
        <Grid item key={uid(episode)} xs={2} className={classes.podcast}>
          <PodcastCard state={state} episode={episode} />
        </Grid>
      ))}
    </Grid>
  );
}

const podcastCardStyles = makeStyles((theme) => ({
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

export function PodcastCard({ state, episode }) {
  const classes = podcastCardStyles();

  const addEpisodeToPlaylist = () => {
    addAudio(state, episode);
  };
  return (
    <>
      <PodcastCover episode={episode} state={state} />
      <CardContent className={classes.podcastDetailsContainer}>
        <Typography
          variant="subtitle2"
          className={classes.podcastDetails}
          onClick={addEpisodeToPlaylist}
        >
          <b>{episode.title}</b>
        </Typography>
        <Link to={`/author/${episode.podcast.author.id}`}>
          <Typography variant="caption" className={classes.podcastDetails}>
            {episode.podcast.author.name}
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
  editItem: {
    display: "inline-block",
    position: "relative",
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
function PodcastCover({ episode, state, creator }) {
  const classes = coverStyles();
  const [play, updatePlay] = useState(false);

  function showPlay() {
    updatePlay(true);
  }

  function hidePlay() {
    updatePlay(false);
  }

  const updateAudioList = () => {
    addAudio(state, episode);
  };

  return (
    <div
      className={creator ? classes.editItem : classes.podcastItem}
      onMouseEnter={creator ? null : showPlay}
      onMouseLeave={creator ? null : hidePlay}
      onClick={creator ? null : updateAudioList}
    >
      <img
        src={episode.podcast.image}
        alt="podcast cover"
        className={classes.podcastCover}
        onError={(e) => {
          e.target.src = `/branding/square.svg`;
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

const PodcastLoaderStyles = makeStyles((theme) => ({
  container: {
    flexWrap: "nowrap",
    overflow: "scroll",
  },
  cover: {
    margin: 10,
    height: 150,
    width: 150,
    background: ultraCastTheme.palette.secondary.main,
    animation: "$flash 2s linear infinite",
  },
  "@keyframes flash": {
    "50%": {
      opacity: 0,
    },
  },
}));

const PodcastLoader = () => {
  const classes = PodcastLoaderStyles();
  return (
    <Grid container spacing={4} className={classes.container}>
      {[...Array(6).keys()].map((item) => (
        <div key={item} className={classes.cover}></div>
      ))}
    </Grid>
  );
};

const searchResultStyles = makeStyles((theme) => ({
  infoContainer: {
    padding: "16px 16px 0px",
  },
  podcastDetails: {
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  podcastItem: {
    display: "grid",
    justifyContent: "center",
  },
  podcastCover: {
    width: 150,
    height: 150,
  },
}));

const SearchResult = ({ podcast }) => {
  const classes = searchResultStyles();

  return (
    <>
      <div className={classes.podcastItem}>
        <Link to={`/podcast/${podcast.podcast.id}`}>
          <img
            src={podcast.podcast.image}
            alt="podcast cover"
            className={classes.podcastCover}
            onError={(e) => {
              e.target.src = `/branding/square.svg`;
            }}
          ></img>
        </Link>
      </div>
      <div className={classes.infoContainer}>
        <Link to={`/podcast/${podcast.podcast.id}`}>
          <Typography variant="subtitle2" className={classes.podcastDetails}>
            <b>{podcast.podcast.title}</b>
          </Typography>
          <Typography variant="body2" className={classes.podcastDetails}>
            <b>
              {podcast.podcast.subscribers} subscriber
              {podcast.podcast.subscribers === 1 ? "" : "s"}
            </b>
          </Typography>
        </Link>
        <Link to={`/author/${podcast.author.id}`}>
          <Typography variant="caption" className={classes.podcastDetails}>
            {podcast.author.name}
          </Typography>
        </Link>
      </div>
    </>
  );
};

export { PodcastCover, SearchResult, PodcastLoader };
