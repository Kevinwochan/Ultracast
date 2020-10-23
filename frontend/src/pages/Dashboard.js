import React from "react";
import Box from "@material-ui/core/Box";
import { Slider } from "../components/Podcast";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import { getRecommended } from "../api/query";


let recommended = []
getRecommended().then((data) => {
  recommended = data;
});

const useStyles = makeStyles((theme) => ({
  titleBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function Dashboard({ state }) {
  const classes = useStyles();
  const [sessionState, updateState] = state;

  return (
    <Container
      className={classes.cardGrid}
      maxWidth={sessionState.open ? "md" : "lg"}
    >
      <PodcastSliderTitle title="Recommended Podcasts" url="/" />
      <Slider state={state} podcasts={recommended} />
      <PodcastSliderTitle title="Recently Listened" url="/history" />
      <Slider state={state} podcasts={recommended} />
    </Container>
  );
}

const PodcastSliderTitle = ({ title, url }) => {
  const classes = useStyles();
  return (
    <Box className={classes.titleBar} m={2}>
      <Typography gutterBottom variant="h5">
        <b>{title}</b>
      </Typography>
      <Typography gutterBottom variant="subtitle1">
        <Link to={url}>See all</Link>
      </Typography>
    </Box>
  );
};
