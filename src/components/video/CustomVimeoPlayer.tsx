import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  // デバッグ: state変化を監視
  useEffect(() => {
    console.log('[CustomVimeoPlayer] State changed:', {
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      isReady: state.isReady,
      showControls,
    });
  }, [state.isPlaying, state.currentTime, state.duration, state.isReady, showControls]);

  // タイマーをクリアする共通関数
  const clearControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  // コントロール表示タイマーをリセットする共通関数
  const resetControlsTimer = useCallback(() => {
    clearControlsTimer();
    setShowControls(true);

    // 再生中のみ自動非表示タイマーを設定
    if (state.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [state.isPlaying, clearControlsTimer]);

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 再生状態が変わったらコントロール表示を更新
  useEffect(() => {
    if (state.isPlaying) {
      // 再生開始したら3秒後に非表示
      resetControlsTimer();
    } else {
      // 一時停止したら常に表示
      clearControlsTimer();
      setShowControls(true);
    }
  }, [state.isPlaying, resetControlsTimer, clearControlsTimer]);

  // コンポーネントアンマウント時にタイマークリア
  useEffect(() => {
    return () => clearControlsTimer();
  }, [clearControlsTimer]);

  // マウス移動時にコントロールを表示
  const handleMouseMove = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // マウスがプレーヤーから離れたらコントロールを非表示（再生中のみ）
  const handleMouseLeave = useCallback(() => {
    if (state.isPlaying) {
      clearControlsTimer();
      setShowControls(false);
    }
  }, [state.isPlaying, clearControlsTimer]);

  // 動画エリアクリックで再生/一時停止
  const handleVideoClick = useCallback(() => {
    togglePlay();
    // 操作後にタイマーリセット（次のレンダリングで state.isPlaying が更新される）
  }, [togglePlay]);

  // コントロール操作時のラッパー（タイマーリセット付き）
  const handleSeek = useCallback((time: number) => {
    seek(time);
    resetControlsTimer();
  }, [seek, resetControlsTimer]);

  const handleVolumeChange = useCallback((volume: number) => {
    setVolume(volume);
    resetControlsTimer();
  }, [setVolume, resetControlsTimer]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    resetControlsTimer();
  }, [setPlaybackRate, resetControlsTimer]);

  const handleToggleFullscreen = useCallback(() => {
    if (playerWrapperRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerWrapperRef.current.requestFullscreen();
      }
    }
    resetControlsTimer();
  }, [resetControlsTimer]);

  const handleTogglePip = useCallback(() => {
    togglePip();
    resetControlsTimer();
  }, [togglePip, resetControlsTimer]);

  const handleEnableTextTrack = useCallback((language: string) => {
    enableTextTrack(language);
    resetControlsTimer();
  }, [enableTextTrack, resetControlsTimer]);

  const handleDisableTextTrack = useCallback(() => {
    disableTextTrack();
    resetControlsTimer();
  }, [disableTextTrack, resetControlsTimer]);

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
          resetControlsTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, state.currentTime - 10));
          resetControlsTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(state.duration, state.currentTime + 10));
          resetControlsTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, state.volume + 0.1));
          resetControlsTimer();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 0.1));
          resetControlsTimer();
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, setVolume, handleToggleFullscreen, state.currentTime, state.duration, state.volume, resetControlsTimer]);

  return (
    <div
      ref={playerWrapperRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vimeoプレーヤーコンテナ */}
      <div
        ref={containerRef}
        className="w-full aspect-video"
      />

      {/* クリック領域（動画の上に透明なレイヤーを配置） */}
      {state.isReady && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleVideoClick}
          style={{
            // コントロールバーの領域を除外
            bottom: showControls ? '80px' : '0'
          }}
        />
      )}

      {/* ローディング表示 */}
      {!state.isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* 中央の再生ボタン（一時停止中のみ表示） */}
      {state.isReady && !state.isPlaying && showControls && (
        <button
          onClick={handleVideoClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-10"
          aria-label="再生"
        >
          <Play className="w-10 h-10 text-white ml-1" />
        </button>
      )}

      {/* コントロールバー */}
      {state.isReady && (
        <div
          className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <VideoControls
            state={state}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleFullscreen={handleToggleFullscreen}
            onTogglePip={handleTogglePip}
            onEnableTextTrack={handleEnableTextTrack}
            onDisableTextTrack={handleDisableTextTrack}
            isFullscreen={isFullscreen}
          />
        </div>
      )}
    </div>
  );
}
