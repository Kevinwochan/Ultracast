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

const podcast = {
  id: 1,
  title: "Oliver's True Crime Series",
  description:
    "In this innovative podcast, retired cold case investigator Paul Holes and true crime journalist Billy Jensen team up to tackle unsolved crimes and missing person cases each week. They invite listeners to contribute their own research and theories, so you can put on your own Sherlock hat.",
  author: { name: "Oliver Productions", id: 1 },
};

const episodes = [
  {
    title: "Episode 1: Giving Lawyer X a Voice",
    length: "20",
    description:
      "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 2: Dead Man's Chest",
    length: "20",
    description:
      "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 3: A Locked Door",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 4",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 5",
    length: "20",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oli", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
];

const useStyles = makeStyles((theme) => ({
  podcastHero: {
    background: "white",
    paddingLeft: theme.spacing(8),
    paddingTop: theme.spacing(8),
    marginBottom: theme.spacing(3),
    minHeight: 300,
  },
  podcastCover: {
    width: 150,
    height: 150,
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
        <Grid item xs className={classes.podcastHero}>
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
        <Grid item>
          <img
            src={
              podcast.cover
                ? podcast.cover
                : "https://source.unsplash.com/random"
            }
            alt="podcast cover"
            className={classes.podcastCover}
          ></img>
        </Grid>
      </Grid>
      <Playlist episodes={episodes} state={state} />
    </>
  );
}
