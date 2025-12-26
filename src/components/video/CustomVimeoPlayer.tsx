import { useState, useCallback, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { useVimeoPlayer } from './hooks/useVimeoPlayer';
import { VideoControls } from './VideoControls';

interface CustomVimeoPlayerProps {
  vimeoId: string;
  className?: string;
}

export function CustomVimeoPlayer({ vimeoId, className = '' }: CustomVimeoPlayerProps) {
  const {
    containerRef,
    state,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip,
    enableTextTrack,
    disableTextTrack,
  } = useVimeoPlayer(vimeoId);

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // マウス移動時にコントロールを表示
  const handleMouseMove = useCallback(() => {
    setShowControls(true);

    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    // 再生中は3秒後に非表示
    if (state.isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  }, [state.isPlaying, controlsTimeout]);

  // マウスがプレーヤーから離れたらコントロールを非表示
  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      setShowControls(false);
    }
  }, [state.isPlaying]);

  // 一時停止中はコントロールを常に表示
  useEffect(() => {
    if (!state.isPlaying) {
      setShowControls(true);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    }
  }, [state.isPlaying]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // フォーカスがinput要素にある場合は無視
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, state.currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(state.duration, state.currentTime + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, state.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 0.1));
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, setVolume, toggleFullscreen, state.currentTime, state.duration, state.volume]);

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vimeoプレーヤーコンテナ */}
      <div
        ref={containerRef}
        className="w-full aspect-video"
        onClick={togglePlay}
      />

      {/* ローディング表示 */}
      {!state.isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* 中央の再生ボタン（一時停止中のみ表示） */}
      {state.isReady && !state.isPlaying && showControls && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="再生"
        >
          <Play className="w-10 h-10 text-white ml-1" />
        </button>
      )}

      {/* コントロールバー */}
      {state.isReady && (
        <div
          className={`transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <VideoControls
            state={state}
            onTogglePlay={togglePlay}
            onSeek={seek}
            onVolumeChange={setVolume}
            onPlaybackRateChange={setPlaybackRate}
            onToggleFullscreen={toggleFullscreen}
            onTogglePip={togglePip}
            onEnableTextTrack={enableTextTrack}
            onDisableTextTrack={disableTextTrack}
            isFullscreen={isFullscreen}
          />
        </div>
      )}
    </div>
  );
}
