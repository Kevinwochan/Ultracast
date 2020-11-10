import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import ReactJkMusicPlayer from "react-jinke-music-player";
import BookmarkExtension from "./BookmarkExtension";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles
import { markAsPlayed } from "../../api/mutation";

export function playNow(state, episode, time = 0) {
  const [sessionState, updateState] = state;
  if (
    sessionState.audioList.length > 0 &&
    sessionState.audioList[0].id === episode.id
  ) {
    sessionState.audioInstance.current.currentTime = time;
    return;
  }
  const newList = [
    {
      episodeId: episode.id,
      name: episode.title,
      musicSrc: episode.url,
      cover: episode.podcast.image,
    },
    ...sessionState.audioList.filter(
      (listEpisode) => listEpisode.id === episode.id
    ),
  ];
  updateState("audioList", newList);
  sessionState.audioInstance.current.currentTime = time;
}

// Add an audio to the sessionState audioList
// https://github.com/lijinke666/react-music-player#bulb-audiolistprops
export function addAudio(state, { title, url, podcast, id }) {
  const [sessionState, updateState] = state;
  // Do not add duplicate episodes
  if (sessionState.audioList.map((episode) => episode.id).includes(id)) {
    return;
  }

  const newList = [
    ...sessionState.audioList,
    {
      episodeId: id,
      name: title,
      musicSrc: url,
      cover: podcast.image,
      podcastId: podcast.id,
    },
  ];

  updateState("audioList", newList);
}

const useStyles = makeStyles((theme) => ({
  extendedItem: {
    margin: theme.spacing(1),
    cursor: "pointer",
  },
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
    paddingBottom: theme.spacing(1),
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
  const history = useHistory();
  const classes = useStyles();
  const audioInstance = useRef(null);

  const onAudioPlay = (audioInfo) => {
    console.log(
      `Marking audio as played ${audioInfo.name}, ${audioInfo.episodeId}`
    );
    markAsPlayed(audioInfo.episodeId, sessionState.cookies.token);
  };

  const setPlaybackRate = (e) => {
    const rate = e.target.value;
    audioInstance.current.playbackRate = rate;
    updateState("playbackRate", rate);
  };

  const onAudioListsChange = (currentPlayId, audioLists, audioInfo) => {
    updateState("audioList", audioLists);
  };

  const onCoverClick = (mode, audioLists, audioInfo) => {
    history.push(`/podcast/${audioInfo.podcastId}`);
  };

  const onAudioSeeked = (audioInfo) => {
    audioInstance.current.fastSeek(audioInfo.currentTime);
  };

  useEffect(() => {
    updateState(
      "audioInstance",
      audioInstance
    ); /* this will break if player ever gets destroyed */
  }, []);

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
    clearPriorAudioLists: true,
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
    preload: true,
    remove: true,
    remember: false,
    spaceBar: true,
    responsive: false,
    autoHiddenCover: false,
    quietUpdate: false,
    audioLists: sessionState.audioList,
    onAudioPlay: onAudioPlay,
    onAudioListsChange: onAudioListsChange,
    onAudioSeeked: onAudioSeeked,
    onCoverClick: onCoverClick,
    extendsContent: (
      <>
        <BookmarkExtension
          sessionState={sessionState}
          audioInstance={audioInstance}
        />
        <Select
          key={1}
          value={sessionState.playbackRate}
          onChange={setPlaybackRate}
          label="Playback Rate"
          className={classes.extendedMenu}
        >
          <ListItem>Playback Rate</ListItem>
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
