import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getNotifications } from "../api/query";
import EpisodePlaylist from "../components/EpisodeList";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function Subscriptions({ state }) {
  const [sessionState, updateState] = state;
  const classes = useStyles();
  const [episodes, setEpisodes] = useState("loader");

  useEffect(() => {
    getNotifications(sessionState.cookies.token).then((data) => {
      setEpisodes(data);
    });
  }, []);

  if (episodes === "loader") {
    return <CircularProgress />;
  }

  return (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Subscriptions</b>
        </Typography>
      </Box>
      <EpisodePlaylist episodes={episodes} state={state} />
    </>
  );
}
