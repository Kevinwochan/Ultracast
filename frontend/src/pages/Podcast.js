import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getEpisodes, getSubscriptions } from "../api/query";
import CircularProgress from "@material-ui/core/CircularProgress";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import Divider from "@material-ui/core/Divider";
import EpisodePlaylist from "../components/EpisodeList";
import SubscribeButton from "../components/SubscribeButton";

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
  podcastDescription: {
    lineHeight: "1.5rem",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

export default function Podcast({ state }) {
  const classes = useStyles();
  const { podcastId } = useParams();
  const [sessionState, updateState] = state;
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [podcast, setPodcast] = useState("loader"); // TODO: paginate the episodes
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    getEpisodes(podcastId).then((podcastInfo) => {
      podcastInfo.podcast.id = podcastId;
      // initalise podcast.subscribed
      getSubscriptions(sessionState.cookies.token).then((data) => {
        const subscriptions = data.map((podcast) => podcast.id);
        podcastInfo.podcast.subscribed = subscriptions.includes(podcastId);
        setPodcast(podcastInfo.podcast);
      });
      setEpisodes(podcastInfo.episodes);
    });
  }, [podcastId, sessionState]);

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
      <Box className={classes.podcastHero}>
        <Grid container spacing={2} justify="center" marginBottom={2}>
          <Grid item xs={12} md={6} lg={4}>
            <Typography variant="subtitle2">PODCAST TITLE</Typography>
            <Typography variant="h4" className={classes.podcastTitle}>
              {podcast.title}
            </Typography>
          </Grid>
          <Grid item xs>
            <Link to={`/author/${podcast.author.id}`}>
              <Typography variant="subtitle2">AUTHOR</Typography>
              <Typography variant="subtitle2">
                <Link to={`/author/${podcast.author.id}`}>
                  {podcast.author.name}
                </Link>
              </Typography>
            </Link>
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle2">NO. EPISODES</Typography>
            <Typography variant="subtitle2">{podcast.episodeCount}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body1" className={classes.podcastDescription}>
          {podcast.description}
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <SubscribeButton podcast={podcast} sessionState={sessionState} />
          </Grid>
          <Grid item xs>
            {!addedToQueue ? (
              <Button
                variant="contained"
                color="primary"
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
        </Grid>
      </Box>
      <Divider variant="fullWidth" />
      <EpisodePlaylist episodes={episodes} state={state} />
    </>
  );
}
