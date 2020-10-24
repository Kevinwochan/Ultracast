import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Playlist } from "../components/Podcast";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { getHistory } from "../api/query";

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
    getHistory(false, sessionState.cookies.token).then((data) => {
      setHistory(data);
    });
  }, []);

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Recently Listened</b>
        </Typography>
      </Box>

      <Playlist episodes={history} state={state} />
    </Container>
  );
}
