import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { getMyFollowing, getHistory, getMyHistory } from "../api/query";
import EpisodePlaylist from "../components/EpisodeList";
import FollowButton from "../components/FollowButton";

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(5),
  },
}));

export default function User({ state }) {
  const [cookies, setCookie, removeCookie] = useCookies(['token']);
  const { id } = useParams();
  const [sessionState, ] = state;
  const [user, setUser] = useState("loader");
  const [history, setHistory] = useState("loader");

  useEffect(() => {
    getMyFollowing(cookies.token).then((users) => {
      const following = users.map((user) => user.id).includes(id);
      getHistory(id, cookies.token).then((data) => {
        let { user, history } = data;
        user.id = id;
        user.following = following;
        setUser(user);
        // check if episode has been watched
        getMyHistory(cookies.token).then((watchedEpisodes) => {
          const watchedEpisodeIds = watchedEpisodes.map((episode) => episode.id);
          history.forEach((episode) => {
            episode.watched = watchedEpisodeIds.includes(episode.id);
          });
          setHistory(history);
        });
      });
    });
  }, [id, sessionState]);

  const classes = useStyles();

  return (
    <>
      <Grid container className={classes.hero}>
        <Grid item xs>
          <Typography gutterBottom variant="h5">
            <b>{user.name} listened to</b>
          </Typography>
        </Grid>
        <Grid item xs>
          {user.following !== undefined && (
            <FollowButton state={state} user={user} />
          )}
        </Grid>
      </Grid>
      <EpisodePlaylist episodes={history} state={state} />
    </>
  );
}
