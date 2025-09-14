import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomAudioUi.module.css"; // CSS Moduleをインポート
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

//  再生中の音声を管理するグローバルな状態
let currentPlayingAudio = null;

const CustomAudioUi = ({ src }) => {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    // 他の音声が再生されたときに、現在の音声の isPlaying 状態を更新
    audio.addEventListener("pause", () => {
      if (currentPlayingAudio !== audio) {
        setIsPlaying(false);
      }
    });

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("pause", () => setIsPlaying(false));
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      currentPlayingAudio = null;
    } else {
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
      }
      audio.play();
      currentPlayingAudio = audio;
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    audio.currentTime = (audio.duration / 100) * e.target.value;
  };

  return (
    <div className={styles.audioPlayer}>
      <button className={styles.playPauseButton} onClick={togglePlayPause}>
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>
      <div className={styles.timeInfo}>
        <span>{formatTime(currentTime)}</span> /{" "}
        <span>{formatTime(duration)}</span>
      </div>
      <input
        className={styles.progressBar}
        type="range"
        value={duration ? (currentTime / duration) * 100 : 0}
        onChange={handleProgressChange}
        style={{ backgroundSize: `${(currentTime / duration) * 100}% 100%` }}
      />
    </div>
  );
};

export default CustomAudioUi;
