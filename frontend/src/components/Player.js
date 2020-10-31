import React from "react";
import ReactJkMusicPlayer from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles
import { markAsPlayed } from "../api/query";

// Add an audio to the sessionState audioList
// https://github.com/lijinke666/react-music-player#bulb-audiolistprops
export function addAudio(state, { name, musicSrc, cover, id }) {
  console.log(name)
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

export default function Player({ state }) {
  const [sessionState, updateState] = state;
  const mode = sessionState.audioList ? "full" : "";

  const onAudioPlay = (audioInfo) => {
    console.log(`Marking audio as played ${audioInfo.name}`);
    markAsPlayed(audioInfo.id, sessionState.cookies.token);
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
  };

  return <ReactJkMusicPlayer {...options} />;
}
