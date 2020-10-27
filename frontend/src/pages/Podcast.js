import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getEpisodes } from "../api/query";
import CircularProgress from "@material-ui/core/CircularProgress";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import Divider from "@material-ui/core/Divider";
import EpisodePlaylist from "../components/EpisodeList";

const useStyles = makeStyles((theme) => ({
  podcastTitle: {
    fontWeight: "bold",
  },
  podcastHero: {
    background: "white",
    padding: theme.spacing(5),
    marginBottom: theme.spacing(3),
    minHeight: 150,
  },
  podcastCover: {
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },
  overlay: {
    height: "100%",
    width: "100%",
    background: "black",
    opacity: 0.7,
  },
  coverGlass: {
    position: "relative",
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
}));

export default function Podcast({ state }) {
  const classes = useStyles();
  const { id } = useParams();
  const [sessionState, updateState] = state;
  const [subscribed, setSubscription] = useState(false);
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [podcast, setPodcast] = useState("loader"); // TODO: paginate the episodes
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    getEpisodes(id).then((data) => {
      setPodcast(data.podcast);
      setEpisodes(data.episodes);
    });
  }, [id]);

  const toggleSubscription = () => {
    setSubscription(!subscribed);
  };

  const addAll = () => {
    const episodePlaylist = episodes.map((episode) => ({
      id: episode.id,
      name: episode.title,
      musicSrc: episode.audioUrl,
      cover: podcast.image,
    }));
    updateState("audioList", sessionState.audioList.concat(episodePlaylist));
    setAddedToQueue(true);
  };

  if (podcast === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      <Grid container>
        {/* Info section */}
        <Grid item xs={8} className={classes.podcastHero}>
          <Typography variant="h4" paragraph className={classes.podcastTitle}>
            {podcast.title}
          </Typography>
          <Typography variant="subtitle2" paragraph>
            <Link to={`/author/${podcast.author.id}`}>
              Author: {podcast.author.name}
            </Link>
          </Typography>
          <Typography variant="subtitle2" paragraph>
            Total Episodes: {podcast.episodeCount}
          </Typography>
          <Typography variant="body2" paragraph>
            {podcast.description}
          </Typography>
          {subscribed ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={toggleSubscription}
            >
              Subscribe
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RemoveIcon />}
              onClick={toggleSubscription}
            >
              Unsubscribe
            </Button>
          )}
          {!addedToQueue ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlaylistAddIcon />}
              onClick={addAll}
            >
              Add all to Queue
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlaylistAddCheckIcon />}
            >
              Added
            </Button>
          )}
        </Grid>
        {/* Podcast Cover */}
        <Grid
          item
          xs={4}
          className={classes.coverGlass}
          style={{ backgroundImage: `url(${podcast.image})` }}
        >
          <div className={classes.overlay}></div>
          <div
            className={classes.podcastCover}
            style={{ backgroundImage: `url(${podcast.image})` }}
          ></div>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" />
      <EpisodePlaylist episodes={episodes} state={state} />
    </>
  );
}
