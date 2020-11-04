import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { getHistory } from "../api/query";
import EpisodePlaylist from "../components/EpisodeList";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function History({ state }) {
  const [sessionState, updateState] = state;
  const classes = useStyles();

  const [history, setHistory] = useState("loader");
  useEffect(() => {
    getHistory(sessionState.cookies.token).then((data) => {
      setHistory(data);
    });
  }, [sessionState]);

  return (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Recently Listened</b>
        </Typography>
      </Box>
      <EpisodePlaylist episodes={history} state={state} />
    </>
  );
}
