import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Playlist from "../components/Playlist";
import Page from "../common/Page";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

const episodes = [
  {
    title: "Episode 1: Giving Lawyer X a Voice",
    description:
      "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 2: Dead man's chest",
    description:
      "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
];

const useStyles = makeStyles((theme) => ({}));

export default function History() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <Playlist episodes={episodes} />
    </Container>
  );
}
