import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { getMyHistory } from "../api/query";
import EpisodePlaylist from "../components/EpisodeList";

export default function History({ state }) {
  const [sessionState, ] = state;

  const [history, setHistory] = useState("loader");
  useEffect(() => {
    getMyHistory(sessionState.cookies.token).then((data) => {
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
