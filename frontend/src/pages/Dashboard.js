import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Hero from "../components/Hero";
import FeaturedPost from "../components/FeaturedPodcasts";

const recentlyPlayed = [
  {
    title: "73 Questions with Oliver",
    date: "Nov 12",
    description: "73 Questions Answered By Your Favorite Celebs...",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    date: "Nov 12",
    description: "In March, Congress pushed through a relief package ...",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    date: "Nov 12",
    description: "In March, Congress pushed through a relief package ...",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    date: "Nov 12",
    description: "In March, Congress pushed through a relief package ...",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "The Politics of Pandemic Relief",
    date: "Nov 12",
    description: "In March, Congress pushed through a relief package ...",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
];

const forYou = [];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    overflow: "auto",
  },
  container: {},
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
}));

export default function Dashboard() {
  const classes = useStyles();

  return (
    <Container className={classes.cardGrid} maxWidth="lg">
      <Typography gutterBottom variant="h5">
        Recently Played
      </Typography>
      <Grid container spacing={4}>
        {recentlyPlayed.map((card) => (
          <Grid item key={card} xs={12} sm={6} md={2}>
            <Card className={classes.card}>
              <CardMedia
                className={classes.cardMedia}
                image={card.image}
                title={card.imageText}
              />
              <CardContent className={classes.cardContent}>
                <Typography variant="body1">{card.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
