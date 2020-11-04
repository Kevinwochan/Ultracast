import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import { EpisodeSlider, PodcastSlider } from "../components/Podcast";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import { getMyHistory, getMyRecommended } from "../api/query";

const useStyles = makeStyles((theme) => ({
  titleBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: theme.spacing(2),
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function Dashboard({ state }) {
  const classes = useStyles();
  const [sessionState, updateState] = state;
  const [recommended, setRecommended] = useState("loader");
  const [history, setHistory] = useState("loader");

  // Need to update recommended and history like this, otherwise it won't work for larger/longer queries
  useEffect(() => {
    /*getMyRecommended(sessionState.cookies.token).then((data) => {
      setRecommended(data);
    });*/
    getMyHistory(sessionState.cookies.token,).then((data) => {
      setHistory(data);
    });
  }, [sessionState]);

  return (
    <Container
      className={classes.cardGrid}
      maxWidth={sessionState.open ? "md" : "lg"}
    >
      <PodcastSliderTitle title="Recommended Podcasts" url="/" />
      <PodcastSlider state={state} podcasts={recommended} />
      <PodcastSliderTitle title="Recently Listened" url="/history" />
      <EpisodeSlider state={state} episodes={history} />
    </Container>
  );
}

const PodcastSliderTitle = ({ title, url }) => {
  const classes = useStyles();
  return (
    <Box className={classes.titleBar}>
      <Typography gutterBottom variant="h5">
        <b>{title}</b>
      </Typography>
      <Typography gutterBottom variant="subtitle1">
        <Link to={url}>See all</Link>
      </Typography>
    </Box>
  );
};
