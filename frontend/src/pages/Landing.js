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

const mainFeaturedPodcast = {
  title: "Oliver's True Crime Series",
  date: "Nov 12",
  description:
    "In this innovative podcast, retired cold case investigator Paul Holes and true crime journalist Billy Jensen team up to tackle unsolved crimes and missing person cases each week...",
  image: "https://source.unsplash.com/random",
  imageText: "Image Text",
  page: "/podcast/1",
  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  linkText: "Listen Now",
};

const featuredPodcasts = [
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
];

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

  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
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

const cards = [1, 2, 3, 4, 5, 6];

export default function Dashboard() {
  const classes = useStyles();

  return (
    <>
      {/* Hero unit */}
      <Hero post={mainFeaturedPodcast} />
      <Container className={classes.cardGrid} maxWidth="lg">
        {/* End hero unit */}
        <Grid container spacing={4}>
          {featuredPodcasts.map((post) => (
            <FeaturedPost key={post.title} post={post} />
          ))}
        </Grid>
        <Grid container spacing={4}>
          {cards.map((card, index) => (
            <Grid item key={card} xs={12} sm={6} md={4}>
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image="https://source.unsplash.com/random"
                  title="Image title"
                />
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h5" component="h2">
                    Podcast {index}
                  </Typography>
                  <Typography>Exciting podcast content coming soon</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View podcast
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
