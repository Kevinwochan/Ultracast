import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { getMyFollowing, getHistory } from "../api/query";
import EpisodePlaylist from "../components/EpisodeList";
import FollowButton from "../components/FollowButton";

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(5)
  }
}));

export default function User({ state }) {
  const { id } = useParams();
  const [sessionState, updateState] = state;
  const [user, setUser] = useState("loader");
  const [history, setHistory] = useState("loader");
  
  useEffect(() => {
    getHistory(id, sessionState.cookies.token).then((data) => {
      console.log(data);
      let {user, history} = data
      getMyFollowing(sessionState.cookies.token).then((users)=> {
        user.following = users.map((user) => user.id).includes(id);
      });
      setUser(user);
      setHistory(history);
    });
  }, [id, sessionState]);

  const classes = useStyles();

  return (
    <>
      <Grid container className={classes.hero}>
        <Grid item xs >
        <Typography gutterBottom variant="h5">
        <b>{user.name} listened to</b>
        </Typography>
        </Grid>
        <Grid item xs><FollowButton user={user}/></Grid>
      </Grid>
      <EpisodePlaylist episodes={history} state={state} />
    </>
  );
}
