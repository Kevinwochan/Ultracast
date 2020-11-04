import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import SentimentVeryDissatisfiedIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import { makeStyles } from "@material-ui/core";
import { addAudio } from "../components/Player";
import Tooltip from "@material-ui/core/Tooltip";
import { getMyFollowing } from "../api/query";

let usersList = [
  {
    name: "Kevin",
    id: "VXNlcjo1Zjk1NGZjMGZiNzFmZmFjZGZmMDA4MmQ=",
    episode: {
      title: "Episode 1: Giving Lawyer X a Voice",
      description:
        "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
      image: "https://source.unsplash.com/random",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      author: { name: "Oliver Productions", id: 1 },
      podcast: { id: 1, title: "Oli's True Crime Series" },
    },
  },
  {
    name: "John",
    id: "VXNlcjo1Zjk1NGZjMGZiNzFmZmFjZGZmMDA4MmQ=",
    episode: {
      title: "Episode 1: Giving Lawyer X a Voice",
      description:
        "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
      image: "https://source.unsplash.com/random",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      author: { name: "Oliver Productions", id: 1 },
      podcast: { id: 1, title: "Oli's True Crime Series" },
    },
  },
  {
    name: "asdfasdf",
    id: "VXNlcjo1Zjk1NGZjMGZiNzFmZmFjZGZmMDA4MmQ=",
    episode: {
      title: "Episode 1: Giving Lawyer X a Voice",
      description:
        "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
      image: "https://source.unsplash.com/random",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      author: { name: "Oliver Productions", id: 1 },
      podcast: { id: 1, title: "Oli's True Crime Series" },
    },
  },
];

const useStyles = makeStyles((theme) => ({
  user: {
    "&:hover": {
      background: theme.palette.background.dark,
    },
  },
  avatar: {
    height: 50,
    width: 50,
  },
  listenTo: {
    cursor: "pointer",
    transition: "0.5s",
    textOverflow: "ellipsis",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

usersList = usersList.concat(usersList);

export default function Social({ state }) {
  const [users, setFollowing] = useState(usersList);
  const classes = useStyles();

  useEffect(() => {
    getMyFollowing(state[0].cookies.token).then((users) => {
      setFollowing(users);
    });
  }, [state]);

  const playNow = (episode) => {
    return () => {
      addAudio(state, episode);
    };
  };

  return users.length > 0 ? (
    <>
      <Box m={2}>
        <Typography gutterBottom variant="h5">
          <b>Following</b>
        </Typography>
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={6}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                className={classes.user}
              >
                <Grid item>
                  <Link to={`/user/${user.id}`}>
                    <Avatar className={classes.avatar}>
                      {user.name.substr(0, 1)}
                    </Avatar>
                  </Link>
                </Grid>
                <Grid item>
                  <Link to={`/user/${user.id}`}>
                    <Typography variant="subtitle1">{user.name}</Typography>
                  </Link>
                  <Tooltip title="add to playlist">
                    <Typography
                      variant="subtitle2"
                      onClick={playNow(user.episode)}
                      className={classes.listenTo}
                    >{`Listening to ${user.episode.title}`}</Typography>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  ) : (
    <Box m={2}>
      <SentimentVeryDissatisfiedIcon fontSize="large" />
      <Typography paragraph variant="subtitle1">
        Get connected and follow users
      </Typography>
    </Box>
  );
}
