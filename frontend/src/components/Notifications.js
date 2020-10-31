import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import SettingsIcon from "@material-ui/icons/Settings";
import NotificationsIcon from "@material-ui/icons/Notifications";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { uid } from "react-uid";
import { addAudio } from "./Player";
import { getNotifications } from "../api/query";

const testData = [
  {
    title: "Episode 1: Giving Lawyer X a Voice",
    description:
      "Do “disgraced” lawyer Nicola Gobbo and “disgraced” former drug squad detective Paul Dale deserve to be given a platform to tell their sides of their stories?",
    image: "https://source.unsplash.com/random",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    date: new Date(),
    podcast: {
      id: 1,
      title: "Oli's True Crime Series",
      image: "https://source.unsplash.com/random",
      author: { name: "Oliver Productions", id: 1 },
    },
  },
  {
    title: "Episode 2: Dead man's chest",
    description:
      "Captain Jack Sparrow seeks the heart of Davy Jones, a mythical pirate, in order to avoid being enslaved to him. However, others, including his friends Will and Elizabeth, want it for their own gain.",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    date: new Date(),
    podcast: {
      id: 1,
      title: "Oli's True Crime Series",
      image: "https://source.unsplash.com/random",
      author: { name: "Oliver Productions", id: 1 },
    },
  },
];

const useStyles = makeStyles((theme) => ({
  podcastCover: {
    height: 50,
    width: 50,
  },
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
  const [episodes, setEpisodes] = useState(testData);
  const [count, setCount] = useState(2);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    /*getNotifications(token).then((data) => {
      setEpisodes(data.episodes);
      setCount(data.count);
    });*/
  }, [state]);

  const classes = useStyles();

  const playNow = (index) => {
    return () => {
      const episode = {
        name: episodes[index].title,
        musicSrc: episodes[index].url,
        cover: episodes[index].podcast.image,
        id: episodes[index].id,
      };
      addAudio(state, episode);
    };
  };

  return (
    <>
      <IconButton color="secondary" onClick={handleClick}>
        <Badge badgeContent={count}>
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
      >
        <MenuItem>
          Notifications
          <Link to="/subscriptions">
            <IconButton color="primary">
              <SettingsIcon />
            </IconButton>
          </Link>
        </MenuItem>
        {episodes.map((episode, index) => (
          <MenuItem onClick={playNow(index)} key={uid(episode)} id={index}>
            <Grid container spacing={2}>
              <Grid item>
                <img
                  className={classes.podcastCover}
                  src={episode.podcast.image}
                  alt={`${episode.podcast.title} cover`}
                ></img>
              </Grid>
              <Grid item>
                <Typography variant="body1">
                  {episode.podcast.author.name} uploaded: {episode.title}
                </Typography>
                <Typography variant="subtitle2">
                  {timeSince(episode.date.getTime())}
                </Typography>
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Notifications;
