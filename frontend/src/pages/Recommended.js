import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Playlist } from "../components/Podcast";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

const podcasts = [
  {
    title: "Oli's True Crime Series",
    length: "100",
    description:
      'Do "disgraced" lawyer Nicola Gobbo and "disgraced" former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?',
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
  {
    title: "Oli's True Crime Series 2: Electric Boogaloo",
    length: "20",
    description:
      "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    author: { name: "Oliver Productions", id: 1 },
    podcast: { id: 1, title: "Oli's True Crime Series" },
  },
];

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function History({ state }) {
  const classes = useStyles();

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Recommended Podcasts</b>
        </Typography>
      </Box>

      <Playlist episodes={podcasts} state={state} variant="podcast" />
    </Container>
  );
}
