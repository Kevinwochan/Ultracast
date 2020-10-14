import React from "react";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { addAudio } from "../helpers/audioControls";
import { Link } from "react-router-dom";

// ! Faked data
const recommended = [
  {
    title: "73 Questions with Oliver",
    author: "Oli Oligopoly",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "120 Questions with Dan",
    author: "Dan",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "68.5 Questions with Connor",
    author: "Connor O'Shea",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "12 Questions with Peter",
    author: "Peter",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    title: "3 Questions with Kevin",
    author: "Kevin",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    title: "50 Questions with Tatjana",
    author: "Tatjana",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    author: "Kevin Chan",
    image: "https://source.unsplash.com/random",
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
  podcastContainer: {
    flexWrap: "nowrap",
    overflow: "scroll",
  },
  podcast: {
    cursor: "pointer",
  },
  podcastCover: {
    paddingTop: "100%",
  },
  podcastDetailsContainer: {
    padding: "10px 0px",
  },
  podcastDetails: {
    display: "block",
    whiteSpace: "nowrap",
    width: "12em",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

export default function Dashboard({ state }) {
  const classes = useStyles();

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <PodcastSliderTitle
        classes={classes}
        title="Recommended Podcasts"
        url="/"
      />
      <PodcastSlider state={state} podcasts={recommended} classes={classes} />
      <PodcastSliderTitle
        classes={classes}
        title="Recently Listened"
        url="/history"
      />
      <PodcastSlider state={state} podcasts={recommended} classes={classes} />
    </Container>
  );
}

const PodcastSliderTitle = ({ classes, title, url }) => (
  <Box className={classes.titleBar} m={2}>
    <Typography gutterBottom variant="h5">
      <b>{title}</b>
    </Typography>
    <Typography gutterBottom variant="subtitle1">
      <Link to={url}>See all</Link>
    </Typography>
  </Box>
);

const PodcastSlider = ({ state, podcasts, classes }) => (
  <Grid container spacing={4} className={classes.podcastContainer}>
    {podcasts.map((podcast) => (
      <Grid item key={podcast.title} lg={2} className={classes.podcast}>
        <LargePodcast state={state} podcast={podcast} classes={classes} />
      </Grid>
    ))}
  </Grid>
);

const LargePodcast = ({ state, podcast, classes }) => {
  //! ensures we get (more or less) different images
  const getRandomNumber = () => {
    return Math.floor(Math.random() * 1000);
  };

  return (
    <>
      <CardMedia
        className={classes.podcastCover}
        image={podcast.image + `?sig=${getRandomNumber()}`}
        title={podcast.imageText}
        onClick={() => {
          addAudio(state, {
            name: podcast.title,
            musicSrc: podcast.url,
            cover: podcast.image,
          });
        }}
      />
      <CardContent className={classes.podcastDetailsContainer}>
        <Typography variant="subtitle2" className={classes.podcastDetails}>
          <b>{podcast.title}</b>
        </Typography>
        <Typography variant="caption" className={classes.podcastDetails}>
          {podcast.author}
        </Typography>
      </CardContent>
    </>
  );
};
