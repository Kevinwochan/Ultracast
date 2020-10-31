import React, {useEffect, useState} from "react";
import { makeStyles } from "@material-ui/core/styles";
import PodcastList from "../components/PodcastList";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import {getRecommended} from "../api/query";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function History({ state }) {
  const classes = useStyles();
  const [recommended, setRecommended] = useState('loader');

  useEffect(() => {
    getRecommended(state[0].cookies.token,).then((data) => {
      setRecommended(data);
    });
  }, [state]);



  if (recommended === "loader") {
    return <CircularProgress />;
  }

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Recommended Podcasts</b>
        </Typography>
      </Box>

      <PodcastList podcasts={recommended} state={state}/>
    </Container>
  );
}
