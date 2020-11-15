import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import PlayCircleFilledWhiteIcon from "@material-ui/icons/PlayCircleFilledWhite";
import PauseCircleFilledIcon from "@material-ui/icons/PauseCircleFilled";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";
import VolumeUp from "@material-ui/icons/VolumeUp";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeOff from "@material-ui/icons/VolumeOff";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import List from "@material-ui/core/List";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItem from "@material-ui/core/ListItem";
import { toHHMMSS } from "../../common/utils";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import BookmarkExtension from "../AudioPlayer/BookmarkExtension";
import { markAsPlayed } from "../../api/mutation";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Badge from "@material-ui/core/Badge";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  player: {
    background: theme.palette.background.default,
    position: "fixed",
    top: "auto",
    bottom: 0,
    left: 0,
    zIndex: 1201 /* sidebar is 1200*/,
    color: theme.palette.primary.dark,
    height: 77,
  },
  time: {
    paddingTop: theme.spacing(1),
  },
  audioCover: {
    height: 70,
    width: 70,
    display: "flex",
  },
  audioTitle: {
    paddingTop: theme.spacing(1),
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingBottom: 0,
    fontWeight: "bold",
  },
  audioTrackSlider: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  playlistPanel: {
    width: 400,
    zIndex: 1202 /* sidebar is 1200*/,
    background: theme.palette.secondary.main,
  },
  playbackRateSelector: {
  },
}));

function VolumeValueLabel(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

const truncate = (text, maxLength) => {
  return text.length < maxLength ? text : `${text.substr(0, maxLength - 3)}...`;
};

const Player = ({ setAudioPlayerControls }) => {
  const [cookies] = useCookies(["token"]);
  const history = useHistory();
  const [state, setState] = useState({
    playbackRate: 1.0,
    playlist: [],
    nowPlaying: null,
    paused: true,
    currentTime: null,
    duration: null,
    volume: 1.0,
    networkState: 3,
  });
  const audioEl = useRef(null);
  const [playlistPanelAnchorEl, setPlaylistPanelAnchorEl] = useState(null);

  const playNow = useRef((audio, time = 0) => {
    setState((prevState) => ({
      ...prevState,
      playlist: prevState.playlist.includes(audio)
        ? prevState.playlist
        : [...prevState.playlist.filter((a) => a.id !== audio.id), audio],
      nowPlaying: audio,
      currentTime: time,
    }));
    audioEl.current.currentTime = time;
  });

  const addAudio = useRef((audio) => {
    setState((prevState) => ({
      ...prevState,
      playlist: [...prevState.playlist.filter((a) => a.id !== audio.id), audio],
      nowPlaying: prevState.nowPlaying ? prevState.nowPlaying : audio,
    }));
  });

  const addAllAudio = useRef((audioList) => {
    setState((prevState) => ({
      ...prevState,
      playlist: [
        ...prevState.playlist.filter((a) => audioList.includes(a)),
        ...audioList,
      ],
      nowPlaying: prevState.nowPlaying ? prevState.nowPlaying : audioList[0],
    }));
  });

  const togglePlaylistMenu = (event) => {
    setPlaylistPanelAnchorEl(
      playlistPanelAnchorEl === null ? event.currentTarget : null
    );
  };

  useEffect(() => {
    setAudioPlayerControls({
      addAudio: addAudio.current,
      playNow: playNow.current,
      addAllAudio: addAllAudio.current,
    });
  }, [setAudioPlayerControls, addAudio, playNow]);

  useEffect(() => {
    if (state.nowPlaying === null) {
      audioEl.current.src = null;
      return;
    }
    audioEl.current.src = state.nowPlaying.url;
    audioEl.current.currentTime = state.currentTime;
    audioEl.current.play();
    markAsPlayed(state.nowPlaying.id, cookies.token);
  }, [state.nowPlaying]);

  const updatePlayerUI = () => {
    setState((prevState) => ({
      ...prevState,
      playbackRate: audioEl.current.playbackRate,
      paused: audioEl.current.paused,
      duration: audioEl.current.duration,
      currentTime: audioEl.current.currentTime,
      volume: audioEl.current.volume,
      muted: audioEl.current.muted,
      networkState: audioEl.current.networkState,
    }));
  };

  const hasNext = () => {
    const nowPlayingIndex = state.playlist.indexOf(state.nowPlaying);
    if (
      nowPlayingIndex + 1 >= 0 &&
      nowPlayingIndex + 1 < state.playlist.length
    ) {
      return nowPlayingIndex + 1;
    }
    return -1;
  };

  const hasPrev = () => {
    const nowPlayingIndex = state.playlist.indexOf(state.nowPlaying);
    if (nowPlayingIndex - 1 >= 0) {
      return nowPlayingIndex - 1;
    }
    return -1;
  };

  /* Player control handlers */
  const onAudioEnd = (event) => {
    setState((prevState) => ({
      ...prevState,
      nowPlaying: hasNext() < 0 ? null : prevState.playlist[hasNext()],
      currentTime: 0,
    }));
  };

  const removeFromPlaylist = (audio) => {
    setState((prevState) => ({
      ...prevState,
      playlist: prevState.playlist.filter((a) => a !== audio),
      nowPlaying:
        prevState.nowPlaying === audio
          ? hasNext() < 0
            ? null
            : prevState.playlist[hasNext()]
          : prevState.nowPlaying,
      currentTime: 0,
    }));
  };

  const setPlaybackRate = (event) => {
    audioEl.current.playbackRate = event.target.value;
    updatePlayerUI();
  };

  const volumeSliderHandler = (event, newVolume) => {
    audioEl.current.volume = newVolume;
    updatePlayerUI();
  };

  const audioTrackSliderHandler = (event, newTime) => {
    audioEl.current.currentTime = newTime;
    updatePlayerUI();
  };

  const playButonHandler = () => {
    if (state.nowPlaying === null) {
      return;
    }
    audioEl.current.play();
    updatePlayerUI();
  };
  const pauseButtonHandler = () => {
    audioEl.current.pause();
    updatePlayerUI();
  };

  const toggleMuteHandler = () => {
    audioEl.current.muted = !audioEl.current.muted;
    updatePlayerUI();
  };

  const prevButtonHandler = () => {
    playNow.current(state.playlist[hasPrev()]);
  };

  const nextButtonHandler = () => {
    playNow.current(state.playlist[hasNext()]);
  };

  const classes = useStyles();

  return (
    <AppBar position="fixed" className={classes.player}>
      <Container>
        <Grid container justify="center" alignItems="center" spacing={2}>
          <Box style={{ position: "relative" }}>
            {state.networkState === 2 && state.nowPlaying && (
              <CircularProgress
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                }}
              />
            )}
            <img
              alt={state.nowPlaying ? state.nowPlaying.title : ""}
              src={
                state.nowPlaying
                  ? state.nowPlaying.podcast.image
                  : "/branding/square.svg"
              }
              className={classes.audioCover}
              onClick={() => {
                if (state.nowPlaying) {
                  history.push(`/podcast/${state.nowPlaying.podcast.id}`);
                }
              }}
            ></img>
          </Box>
          <Grid item xs={4}>
            <Grid container jusify="center">
              <Grid item className={classes.audioTitle} xs={12}>
                {/* TODO animate this to show full text */}
                {state.nowPlaying ? state.nowPlaying.title : "-"}
              </Grid>
              <Grid item className={classes.time}>
                {state.nowPlaying ? toHHMMSS(state.currentTime) : "00:00"}
              </Grid>
              <Grid item xs className={classes.audioTrackSlider}>
                <Slider
                  min={0}
                  max={state.duration ? state.duration : 0}
                  step={1}
                  value={state.currentTime}
                  onChange={audioTrackSliderHandler}
                />
              </Grid>
              <Grid item className={classes.time}>
                {state.nowPlaying ? toHHMMSS(state.duration) : "00:00"}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <IconButton
              onClick={prevButtonHandler}
              color="primary"
              disabled={hasPrev() < 0}
            >
              <SkipPreviousIcon />
            </IconButton>
            {state.paused ? (
              <IconButton
                onClick={playButonHandler}
                color="primary"
                disabled={state.nowPlaying === null}
              >
                <PlayCircleFilledWhiteIcon />
              </IconButton>
            ) : (
              <IconButton onClick={pauseButtonHandler} color="primary">
                <PauseCircleFilledIcon />
              </IconButton>
            )}
            <IconButton
              onClick={nextButtonHandler}
              color="primary"
              disabled={hasNext() < 0}
            >
              <SkipNextIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <BookmarkExtension
              audioEl={audioEl}
              nowPlaying={state.nowPlaying}
            />
            <Select
              value={state.playbackRate}
              onChange={setPlaybackRate}
              label="Playback Rate"
              className={classes.playbackRateSelector}
            >
              <ListItem>Playback Rate</ListItem>
              <MenuItem selected={state.playbackRate === 0.5} value={0.5}>
                0.5
              </MenuItem>
              <MenuItem selected={state.playbackRate === 0.75} value={0.75}>
                0.75
              </MenuItem>
              <MenuItem selected={state.playbackRate === 1} value={1}>
                1
              </MenuItem>
              <MenuItem selected={state.playbackRate === 1.25} value={1.25}>
                1.25
              </MenuItem>
              <MenuItem selected={state.playbackRate === 1.5} value={1.5}>
                1.5
              </MenuItem>
              <MenuItem selected={state.playbackRate === 1.75} value={1.75}>
                1.75
              </MenuItem>
              <MenuItem selected={state.playbackRate === 2} value={2}>
                2
              </MenuItem>
            </Select>
          </Grid>
          <Grid item xs={2}>
            <Grid container alignItems="center">
              <Grid item>
                <IconButton onClick={toggleMuteHandler} color="primary">
                  {state.muted || state.volume === 0 ? (
                    <VolumeOff />
                  ) : state.volume < 0.5 ? (
                    <VolumeDown />
                  ) : (
                    <VolumeUp />
                  )}
                </IconButton>
              </Grid>
              <Grid item xs>
                <Slider
                  ValueLabelComponent={VolumeValueLabel}
                  valueLabelFormat={(volume) => Math.round(volume * 100)}
                  min={0}
                  max={1}
                  step={0.01}
                  value={state.volume}
                  onChange={volumeSliderHandler}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Popper
              open={Boolean(playlistPanelAnchorEl)}
              anchorEl={playlistPanelAnchorEl}
              placement="top"
              transition
              style={{ zIndex: 9999 }}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper>
                    <List component="ul" className={classes.playlistPanel}>
                      <ListItem divider>
                        <b>Player</b>
                      </ListItem>
                      {state.playlist.length === 0 ? (
                        <ListItem>Your playlist is empty</ListItem>
                      ) : (
                        state.playlist.map((audio, index) => (
                          <ListItem
                            key={audio.id}
                            selected={
                              state.nowPlaying &&
                              audio.id === state.nowPlaying.id
                            }
                            onClick={(event) => {
                              playNow.current(audio);
                            }}
                            divider
                          >
                            {`${index + 1}. ${truncate(audio.title, 30)}`}
                            <ListItemSecondaryAction
                              onClick={() => removeFromPlaylist(audio)}
                            >
                              <IconButton
                                edge="end"
                                aria-label="remove from playlist"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Paper>
                </Fade>
              )}
            </Popper>
            <IconButton onClick={togglePlaylistMenu} color="primary">
              <Badge showZero badgeContent={state.playlist.length}>
                <QueueMusicIcon />
              </Badge>
            </IconButton>
          </Grid>
          <audio
            ref={audioEl}
            onTimeUpdate={updatePlayerUI}
            onLoadedMetadata={updatePlayerUI}
            onEnded={onAudioEnd}
          />
        </Grid>
      </Container>
    </AppBar>
  );
};

export default Player;
