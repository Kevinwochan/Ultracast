import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import ReactJkMusicPlayer from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles
import { markAsPlayed } from "../api/query";

// Add an audio to the sessionState audioList
// https://github.com/lijinke666/react-music-player#bulb-audiolistprops
export function addAudio(state, { title, url, podcast, id }) {
  const [sessionState, updateState] = state;
  const newList = [
    ...sessionState.audioList,
    {
      id: id,
      name: title,
      musicSrc: url,
      cover: podcast.image,
    },
  ];

  updateState("audioList", newList);
}

export default function Player({ state }) {
  const [sessionState, updateState] = state;
  const mode = sessionState.audioList ? "full" : "";

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
    extendsContent: [
      <Select
        key={1}
        value={sessionState.playbackRate}
        onChange={setPlaybackRate}
        label="Playback Rate"
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
      </Select>,
    ],
  };

  return <ReactJkMusicPlayer {...options} />;
}
