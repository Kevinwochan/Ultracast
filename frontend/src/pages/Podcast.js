import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getEpisodes, getMyHistory, getMySubscriptions } from "../api/query";
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

export default function Podcast({ audioPlayerControls }) {
  const [cookies] = useCookies(["token"]);
  const classes = useStyles();
  const { podcastId } = useParams();
  const [addedToQueue, setAddedToQueue] = useState(false);
  const [podcast, setPodcast] = useState("loader"); // TODO: paginate the episodes
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    getEpisodes(podcastId).then((podcastInfo) => {
      podcastInfo.podcast.id = podcastId;
      // initalise podcast.subscribed
      getMySubscriptions(cookies.token).then((data) => {
        const subscriptions = data.map((podcast) => podcast.id);
        podcastInfo.podcast.subscribed = subscriptions.includes(podcastId);
        setPodcast(podcastInfo.podcast);
      });
      // check if episode has been watched
      getMyHistory(cookies.token).then((watchedEpisodes) => {
        const watchedEpisodeIds = watchedEpisodes.map((episode) => episode.id);
        podcastInfo.episodes.forEach((episode) => {
          episode.watched = watchedEpisodeIds.includes(episode.id);
        });
        setEpisodes(podcastInfo.episodes);
      });
    });
  }, [podcastId, cookies]);

  const addAll = () => {
    audioPlayerControls.addAllAudio(episodes);
    setAddedToQueue(true);
  };

  if (podcast === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      <Box className={classes.podcastHero}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} md={6} lg={6}>
            <Typography variant="subtitle2">PODCAST TITLE</Typography>
            <Typography variant="h4" className={classes.podcastTitle}>
              {podcast.title}
            </Typography>
          </Grid>
          <Grid item xs>
            <Link to={`/author/${podcast.author.id}`}>
              <Typography variant="subtitle2">AUTHOR</Typography>
              <Typography variant="subtitle2">
                <b>{podcast.author.name}</b>
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
            <SubscribeButton podcast={podcast} />
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
      <EpisodePlaylist episodes={episodes} audioPlayerControls={audioPlayerControls}/>
    </>
  );
}
