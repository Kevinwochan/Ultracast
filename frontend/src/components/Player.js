import React, { useRef, useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import Modal from "@material-ui/core/Modal";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import IconButton from "@material-ui/core/IconButton";
import ReactJkMusicPlayer from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles
import { markAsPlayed } from "../api/query";
import { toHHMMSS } from "../common/utils";

// Add an audio to the sessionState audioList
// https://github.com/lijinke666/react-music-player#bulb-audiolistprops
export function addAudio(state, { name, musicSrc, cover, id }) {
  console.log(name);
  const [sessionState, updateState] = state;
  const newList = [
    ...sessionState.audioList,
    {
      name: name,
      musicSrc: musicSrc,
      cover: cover,
      id: id,
    },
  ];

  updateState("audioList", newList);
}

const useStyles = makeStyles((theme) => ({
  extendedMenu: {},
  bookmarkMenu: {
    minHeight: 200,
    minWidth: 400,
    top: "50vh",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
    backgroundColor: theme.palette.background.default,
  },
  bookmarkMessage: {},
  bookmarkInputField: {
    height: "100%",
    width: "100%",
  },
  bookmarkCancel: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  bookmarkSave: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
}));

export default function Player({ state }) {
  const [sessionState, updateState] = state;
  const mode = sessionState.audioList ? "full" : "";

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const audioInstance = useRef(null);
  const bookmarkField = useRef(null);

  const openBookmarkMenu = (event) => {
    console.log(audioInstance.current);
    setOpen(true);
  };

  const closeBookmarkMenu = () => {
    setOpen(false);
  };

  const saveBookmark = () => {
    /* TODO send query */
    closeBookmarkMenu();
  };

  const onAudioPlay = (audioInfo) => {
    console.log(`Marking audio as played ${audioInfo.name}`);
    markAsPlayed(audioInfo.id, sessionState.cookies.token);
  };

  const setPlaybackRate = (e) => {
    // Brute force HTML way but it is what it is
    const rate = e.target.value;
    const audio = document.querySelector("audio.music-player-audio");
    audio.playbackRate = rate;
    updateState("playbackRate", rate);
  };

  const options = {
    getAudioInstance: (instance) => {
      audioInstance.current = instance;
    },
    theme: "light",
    defaultPosition: { bottom: 0, left: 0 },
    mode: mode,
    glassBg: false,
    drag: false,
    seeked: true,
    toggleMode: false,
    autoPlay: true,
    clearPriorAudioLists: false,
    autoplayInitLoadPlayList: false,
    showMiniProcessBar: false,
    showMiniModeCover: false,
    showProgressLoadBar: true,
    showPlay: true,
    showReload: false,
    showDownload: false,
    showPlayMode: true,
    showThemeSwitch: false,
    showLyric: false,
    showDestroy: false,
    preload: false,
    remove: true,
    remember: false,
    spaceBar: true,
    responsive: false,
    autoHiddenCover: false,
    quietUpdate: false,
    audioLists: sessionState.audioList,
    onAudioPlay: onAudioPlay,
    extendsContent: (
      <>
        <BookmarkIcon
          className={classes.extendedMenu}
          onClick={openBookmarkMenu}
        />
        <Modal open={open} onClose={closeBookmarkMenu}>
          <Box className={classes.bookmarkMenu} p={5}>
            {audioInstance.current !== null &&
            audioInstance.current.currentSrc ? (
              <>
                <IconButton
                  color="primary"
                  aria-label="cancel bookmark"
                  onClick={closeBookmarkMenu}
                  className={classes.bookmarkCancel}
                >
                  <CloseIcon />
                </IconButton>
                <Typography
                  variant="body1"
                  gutterBottom
                  className={classes.bookmarkMessage}
                >
                  {`Bookmarked at ${toHHMMSS(audioInstance.current.currentTime)}`}
                </Typography>
                <form noValidate autoComplete="off">
                  <TextField
                    multiline
                    label="Notes"
                    variant="outlined"
                    className={classes.bookmarkInputField}
                    ref={bookmarkField}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={saveBookmark}
                    className={classes.bookmarkSave}
                    aria-label="save"
                    endIcon={<SaveIcon />}
                    type="submit"
                  >
                    Save
                  </Button>
                </form>
              </>
            ) : (
              <Typography variant="body1" className={classes.bookmarkMessage}>
                Play a podcast episode to begin bookmarking
              </Typography>
            )}
          </Box>
        </Modal>
        <Select
          key={1}
          value={sessionState.playbackRate}
          onChange={setPlaybackRate}
          label="Playback Rate"
          className={classes.extendedMenu}
        >
          <MenuItem value={1}>
            <em>Playback Rate</em>
          </MenuItem>
          <MenuItem value={0.5}>0.5</MenuItem>
          <MenuItem value={0.75}>0.75</MenuItem>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={1.25}>1.25</MenuItem>
          <MenuItem value={1.5}>1.5</MenuItem>
          <MenuItem value={1.75}>1.75</MenuItem>
          <MenuItem value={2}>2</MenuItem>
        </Select>
      </>
    ),
  };

  return <ReactJkMusicPlayer {...options} />;
}
