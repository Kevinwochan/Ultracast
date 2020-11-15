import { useCookies } from "react-cookie";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
import { getUserPodcastsInfo } from "../api/query";
import PodcastPlaylist from "../components/PodcastList";
import { PodcastLoader } from "../components/Podcast";

const useStyles = makeStyles((theme) => ({
  podcastHero: {
    background: "white",
    padding: theme.spacing(5),
  },
  podcastCover: {
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
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
    opacity: 0.7,
  },
  coverGlass: {
    position: "relative",
    minHeight: 150,
    minWidth: 150,
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
}));

export default function Edit() {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const classes = useStyles();
  const [podcasts, setPodcasts] = useState("loader");

  useEffect(() => {
    getUserPodcastsInfo(cookies.token).then((data) => {
      setPodcasts(data);
    });
  }, []);

  if (podcasts === "loader") {
    return (
      <Grid container className={classes.podcastHero}>
        <PodcastLoader />
      </Grid>
    );
  }
  return (
    <>
      <Grid container spacing={0}>
        {/* Info section */}
        <Grid item className={classes.podcastHero}>
          <Typography gutterBottom variant="h5">
            <b>Your Podcasts</b>
          </Typography>
        </Grid>
      </Grid>
      {/* List of podcasts */}
      <PodcastPlaylist podcasts={podcasts} creator />
    </>
  );
}
