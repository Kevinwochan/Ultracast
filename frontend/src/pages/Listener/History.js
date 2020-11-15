import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { getMyHistory } from "../../api/query";
import EpisodePlaylist from "../../components/EpisodeList";

export default function History({ audioPlayerControls }) {
  const [cookies] = useCookies(["token"]);

  const [history, setHistory] = useState("loader");
  useEffect(() => {
    getMyHistory(cookies.token).then((data) => {
      setHistory(data);
    });
  }, []);

  return (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Recently Listened</b>
        </Typography>
      </Box>
      <EpisodePlaylist
        episodes={history}
        audioPlayerControls={audioPlayerControls}
        bookmarks
      />
    </>
  );
}
