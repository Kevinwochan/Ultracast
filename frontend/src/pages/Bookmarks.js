import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import EpisodePlaylist from "../components/EpisodeList";
import { getBookmarkedEpisodes } from "../api/query";

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

const Bookmarks = ({ state }) => {
  const [episodes, setEpisodes] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    getBookmarkedEpisodes(state[0].cookies.token).then((episodes) => {
      const uniqueEpisodeIds = [
        ...new Set(episodes.map((episode) => episode.id)),
      ];
      let uniqueEpisodes = [];
      for (let i = 0; i < uniqueEpisodeIds.length; ++i) {
        for (let j = 0; j < episodes.length; ++j) {
          if (uniqueEpisodeIds[i] === episodes[j].id) {
            uniqueEpisodes.push(episodes[j]);
            break;
          }
        }
      }
      setEpisodes(uniqueEpisodes);
    });
  }, []);

  if (episodes === null) {
    return <CircularProgress />;
  }

  return (
    <>
      <Box className={classes.podcastHero}>
        <Typography variant="h4" className={classes.podcastTitle}>
          Bookmarks
        </Typography>
      </Box>
      <Divider variant="fullWidth" />
      <EpisodePlaylist episodes={episodes} state={state} />
    </>
  );
};

export default Bookmarks;
