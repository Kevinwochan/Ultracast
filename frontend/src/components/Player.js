import React from "react";
import ReactJkMusicPlayer from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles

export default function Player({ state }) {
  const [sessionState, updateState] = state;
  const mode = sessionState.audioList ? "full" : "";

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
  };

  return <ReactJkMusicPlayer {...options} />;
}
