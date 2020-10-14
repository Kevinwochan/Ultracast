import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Playlist from "../components/Playlist";
import Page from "../common/Page";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

const episodes = [
  {
    title: "Episode 1",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Episode 2",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
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
