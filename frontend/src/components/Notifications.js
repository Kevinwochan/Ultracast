import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import SettingsIcon from "@material-ui/icons/Settings";
import NotificationsIcon from "@material-ui/icons/Notifications";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { uid } from "react-uid";
import { addAudio } from "./Player";
import { getMyNotifications, getNumNotifications } from "../api/query";
import useInterval from "../hooks/useInterval";

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    height: 100,
    width: 100,
  },
  notification: {
    overflowWrap: "break-word",
  },
  notificationTitle: {
    "&:hover": {
      background: "inherit",
      cursor: "inherit",
    },
  },
  dropdown: {},
}));

const timeSince = (timestamp) => {
  const now = new Date();
  const localTime = new Date(parseInt(timestamp, 10));
  const secondsPast = (now.getTime() - localTime.getTime()) / 1000;
  if (secondsPast < 60) {
    return `${parseInt(secondsPast, 10)}s ago`;
  }
  if (secondsPast < 3600) {
    return `${parseInt(secondsPast / 60, 10)}m ago`;
  }
  if (secondsPast <= 86400) {
    return `${parseInt(secondsPast / 3600, 10)}h ago`;
  }
  return `${localTime.toLocaleDateString("en-au")}`;
};

const Notifications = ({ state }) => {
  const [count, setCount] = useState(0);
  const [episodes, setEpisodes] = useState([]);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useInterval(() => {
    getNumNotifications(state[0].cookies.token).then((count) => {
      if (count > 0) {
        getMyNotifications(state[0].cookies.token).then((episodes) => {
          setEpisodes(episodes);
        });
      }
      setCount(count);
    });
  }, 100000);

  const classes = useStyles();

  const playNow = (index) => {
    return () => {
      addAudio(state, episodes[index]);
    };
  };

  return (
    <>
      <IconButton color="secondary" onClick={handleClick}>
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        className={classes.dropdown}
      >
        <ListItem className={classes.notificationTitle}>
          <Typography variant="h5">Notifications</Typography>
          <Link to="/subscriptions">
            <IconButton color="primary">
              <SettingsIcon />
            </IconButton>
          </Link>
        </ListItem>
        <Divider />
        {count > 0 ? (
          episodes.length > 0 ? (
            episodes.map((episode, index) => (
              <MenuItem
                onClick={playNow(index)}
                key={uid(episode)}
                id={index}
                className={classes.notification}
              >
                <Grid container spacing={2}>
                  <Grid item>
                    <img
                      className={classes.podcastCover}
                      src={episode.podcast.image}
                      alt={`${episode.podcast.title} cover`}
                    ></img>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body1">
                      {episode.podcast.author.name} uploaded: {episode.title}
                    </Typography>
                    <Typography variant="subtitle2">
                      {timeSince(episode.date.getTime())}
                    </Typography>
                  </Grid>
                </Grid>
              </MenuItem>
            ))
          ) : (
            <CircularProgress />
          )
        ) : (
          <ListItem>
            <Typography>No new notifications</Typography>
          </ListItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
