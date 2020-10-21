import React from "react";
import Box from "@material-ui/core/Box";
import { Slider } from "../components/Podcast";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";

const getRandomNumber = () => {
  return Math.floor(Math.random() * 1000);
};

// ! Faked data
const recommended = [
  {
    title: "73 Questions with Oliver",
    author: "Oli Oligopoly",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "120 Questions with Dan",
    author: "Dan",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "68.5 Questions with Connor",
    author: "Connor O'Shea",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "12 Questions with Peter",
    author: "Peter",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    title: "3 Questions with Kevin",
    author: "Kevin",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    title: "50 Questions with Tatjana",
    author: "Tatjana",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    author: "Kevin Chan",
    image: `https://source.unsplash.com/random?sig=${getRandomNumber()}`,
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
];

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
