import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import EpisodePlaylist from "../components/EpisodePlaylist";
import { Playlist } from "../components/Podcast";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import { CenterFocusStrong, LinearScale } from "@material-ui/icons";
import { transform } from "@babel/core";

const podcast = {
  id: 1,
  title: "Oliver's True Crime Series",
  description:
    "In this innovative podcast, retired cold case investigator Paul Holes and true crime journalist Billy Jensen team up to tackle unsolved crimes and missing person cases each week. They invite listeners to contribute their own research and theories, so you can put on your own Sherlock hat.",
  image: "https://source.unsplash.com/random/150x150",
  author: { name: "Oliver Productions", id: 1 },
};

const episodes = [
  {
    id: 1,
    title: "Episode 1: Giving Lawyer X a Voice",
    length: "20",
    description:
      "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: podcast,
  },
  {
    id: 2,
    title: "Episode 2: Dead Man's Chest",
    length: "20",
    description:
      "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: podcast,
  },
  {
    id: 3,
    title: "Episode 3: A Locked Door",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: podcast,
  },
  {
    id: 4,
    title: "Episode 4",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: podcast,
  },
  {
    id: 5,
    title: "Episode 5",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: podcast,
  },
];

const useStyles = makeStyles((theme) => ({
  podcastHero: {
    background: "white",
    paddingLeft: theme.spacing(5),
    paddingTop: theme.spacing(5),
    marginBottom: theme.spacing(3),
    minHeight: 150,
  },
  podcastCover: {
    minHeight: 150,
    minWidth: 150,
    backgroundImage: `url(${podcast.image})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
  },
  overlay: {
    height: "100%",
    width: "100%",
    background: "black",
    opacity: 0.4
  },
  coverGlass: {
    position: "relative",
    minHeight: 150,
    minWidth: 150,
    backgroundImage: `url(${podcast.image})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundBlendMode: "screen",
  },
}));

export default function Podcast({ state }) {
  const classes = useStyles();
  const [subscribed, setSubscription] = useState(false);

  const toggleSubscription = () => {
    setSubscription(!subscribed);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={8} className={classes.podcastHero}>
          <Typography variant="h4" paragraph>
            {podcast.title}
          </Typography>
          <Typography variant="subtitle2" paragraph>
            <Link to={`/author/${podcast.author.id}`}>
              By: {podcast.author.name}
            </Link>
          </Typography>
          <Typography variant="body2" paragraph>
            {podcast.description}
          </Typography>
          {subscribed ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={toggleSubscription}
            >
              Subscribe
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RemoveIcon />}
              onClick={toggleSubscription}
            >
              Unsubscribe
            </Button>
          )}
        </Grid>
        <Grid item xs={4} className={classes.coverGlass}>
          <div className={classes.overlay}></div>
          <div className={classes.podcastCover}></div>
        </Grid>
      </Grid>
      <Playlist episodes={episodes} state={state} />
    </>
  );
}
