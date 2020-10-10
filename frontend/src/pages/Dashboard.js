import React from "react";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Hero from "../components/Hero";
import FeaturedPost from "../components/FeaturedPodcasts";
import LoggedInDrawer from "../components/LoggedInDrawer";
import LoggedInNavBar from "../components/LoggedInNavBar";

const mainFeaturedPodcast = {
  title: "Title of a featured podcast/podcaster/most recommended item",
  description:
    "Multiple lines of text that form the lede, informing new readers quickly and efficiently about what's most interesting in this post's contents.",
  image: "https://source.unsplash.com/random",
  imgText: "main image description",
  linkText: "Continue reading…",
  page: "/podcast/1",
  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

const featuredPodcasts = [
  {
    title: "Featured podcast 1",
    date: "Nov 12",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random",
    imageText: "Image Text",
    page: "/podcast/1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Featured podcast 2",
    date: "Nov 11",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
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

export default function Dashboard({cookies}) {
  const classes = useStyles();

  /* Handles state of the drawer aka left panel */
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <LoggedInNavBar isOpen={open} handleDrawerOpen={handleDrawerOpen} />
      <div className={classes.root}>
        <CssBaseline />
        <LoggedInDrawer isOpen={open} handleDrawerClose={handleDrawerClose} />
        <main className={classes.content}>
          {/* Hero unit */}
          <Hero post={mainFeaturedPodcast} />
          <Container className={classes.cardGrid} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
              {featuredPodcasts.map((post) => (
                <FeaturedPost key={post.title} post={post} />
              ))}
            </Grid>
            <Grid container spacing={4}>
              {cards.map((card) => (
                <Grid item key={card} xs={12} sm={6} md={4}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image="https://source.unsplash.com/random"
                      title="Image title"
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        Heading
                      </Typography>
                      <Typography>
                        This is a media card. You can use this section to
                        describe the content.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </main>
      </div>
    </>
  );
}
