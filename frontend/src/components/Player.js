import React from "react";
import ReactJkMusicPlayer from "react-jinke-music-player";
import "react-jinke-music-player/assets/index.css";
import "./player.css"; // "Override" the default jinke-music-player styles

export default function Player() {
  const options = {
    theme: "light",
    defaultPosition: { bottom: 0, left: 0 },
    mode: "full",
    glassBg: false,
    drag: false,
    seeked: true,
    toggleMode: false,
    autoPlay: false,
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
    responsive: true,
    autoHiddenCover: false,
    quietUpdate: false,
  };

  return <ReactJkMusicPlayer {...options} />;
}
