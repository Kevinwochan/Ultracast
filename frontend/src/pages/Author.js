import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import Grid from "@material-ui/core/Grid";
import { useParams } from "react-router-dom";
import { getPodcasts } from "../api/query";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import PodcastPlaylist from "../components/PodcastList";

const useStyles = makeStyles((theme) => ({
  podcastHero: {
    background: "white",
    padding: theme.spacing(5),
    marginBottom: theme.spacing(3),
    minHeight: 150,
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

export default function Author({ state }) {
  const classes = useStyles();
  const { id } = useParams();
  const [author, setAuthor] = useState("loader");
  const [podcasts, setPodcasts] = useState([]); // TODO: paginate the podcasts

  useEffect(() => {
    getPodcasts(id).then((data) => {
      setPodcasts(data.podcasts);
      setAuthor(data.author);
    });
  }, [id]);

  if (podcasts === "loader") {
    return <CircularProgress />;
  }
  return (
    <>
      <Grid container>
        {/* Info section */}
        <Grid item className={classes.podcastHero}>
          <Typography variant="h3" paragraph style={{fontWeight: "bold"}}>
            Podcasts by {author.name}
          </Typography>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" />
      {/* List of podcasts */}
      <PodcastPlaylist podcasts={podcasts} state={state}/>
    </>
  );
}
