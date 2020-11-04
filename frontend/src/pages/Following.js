import React, { useState, useEffect } from "react";
import { uid } from "react-uid";
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
import UserSearch from "../components/UserSearch";

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

export default function Following({ state }) {
  const [users, setFollowing] = useState([]);
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
      <Box m={5}>
        <UserSearch />
        <Typography gutterBottom paragraph variant="h5">
          <b>Following</b>
        </Typography>
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={6} key={uid(user)}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                wrap="nowrap"
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
                  {user.episode ? (
                    <Tooltip title="add to playlist">
                      <Typography
                        variant="subtitle2"
                        onClick={playNow(user.episode)}
                        className={classes.listenTo}
                      >{`Listening to ${user.episode.title}`}</Typography>
                    </Tooltip>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      className={classes.listenTo}
                    >{`hasn't listened to a podcast yet`}</Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  ) : (
    <Box m={5}>
      <UserSearch />
      <SentimentVeryDissatisfiedIcon fontSize="large" />
      <Typography paragraph variant="subtitle1">
        Get connected and follow users
      </Typography>
    </Box>
  );
}
