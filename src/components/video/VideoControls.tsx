import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, Loader2, Subtitles, PictureInPicture2 } from 'lucide-react';
import type { VimeoPlayerState, TextTrack } from './hooks/useVimeoPlayer';

interface VideoControlsProps {
  state: VimeoPlayerState;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onTogglePip: () => void;
  onEnableTextTrack: (language: string) => void;
  onDisableTextTrack: () => void;
  isFullscreen?: boolean;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoControls({
  state,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleFullscreen,
  onTogglePip,
  onEnableTextTrack,
  onDisableTextTrack,
  isFullscreen = false,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const subtitleMenuRef = useRef<HTMLDivElement>(null);

  const { isPlaying, currentTime, duration, volume, playbackRate, isLoading, isPip, textTracks, activeTextTrack } = state;

  // 時間フォーマット (長い動画はH:MM:SS、短い動画はM:SS)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // プログレスバーのクリック/ドラッグ処理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    onSeek(Math.max(0, Math.min(newTime, duration)));
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleProgressClick(e);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSeeking || !progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      onSeek(Math.max(0, Math.min(newTime, duration)));
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
    };

    if (isSeeking) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSeeking, duration, onSeek]);

  // メニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(e.target as Node)) {
        setShowSubtitleMenu(false);
      }
    };

    if (showSpeedMenu || showSubtitleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpeedMenu, showSubtitleMenu]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 音量アイコンの選択
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // 字幕が利用可能かどうか
  const hasSubtitles = textTracks.length > 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent pt-16 pb-3 px-4">
      {/* プログレスバー */}
      <div
        ref={progressRef}
        className="relative h-1 cursor-pointer mb-4 group"
        onMouseDown={handleProgressMouseDown}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => {
          setIsHoveringProgress(false);
          setHoverTime(null);
        }}
        onMouseMove={handleProgressHover}
      >
        {/* ベース（未再生部分）*/}
        <div className="absolute inset-0 bg-white/30 rounded-full" />

        {/* ホバー時のプレビュー位置 */}
        {isHoveringProgress && hoverTime !== null && (
          <div
            className="absolute top-0 h-full bg-white/20 rounded-full transition-all"
            style={{ width: `${hoverPosition}%` }}
          />
        )}

        {/* 再生済み領域（白） */}
        <div
          className="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* ドラッグハンドル（白い丸） */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-150 ${
            isHoveringProgress || isSeeking ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ left: `calc(${progress}% - 6px)` }}
        />

        {/* ホバー時の時間表示 */}
        {isHoveringProgress && hoverTime !== null && (
          <div
            className="absolute -top-8 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* ホバー/シーク時にバーを太くする */}
        <div
          className={`absolute inset-0 transition-all duration-150 ${
            isHoveringProgress || isSeeking ? 'scale-y-150' : 'scale-y-100'
          }`}
          style={{ transformOrigin: 'center' }}
        />
      </div>

      {/* コントロールボタン */}
      <div className="flex items-center justify-between">
        {/* 左側: 再生/一時停止、音量、時間表示 */}
        <div className="flex items-center gap-3">
          {/* 再生/一時停止ボタン */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </button>

          {/* 音量コントロール */}
          <div
            className="relative flex items-center group/volume"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label={volume > 0 ? 'ミュート' : 'ミュート解除'}
            >
              <VolumeIcon className="w-5 h-5 text-white" />
            </button>

            {/* 音量スライダー */}
            <div
              className={`flex items-center overflow-hidden transition-all duration-200 ${
                showVolumeSlider ? 'w-20 ml-2 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="relative w-full h-1 bg-white/30 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-white rounded-full"
                  style={{ width: `${volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* 音量ハンドル */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
                  style={{ left: `calc(${volume * 100}% - 6px)` }}
                />
              </div>
            </div>
          </div>

          {/* 時間表示 */}
          <div className="text-white text-sm font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/60 mx-1">/</span>
            <span className="text-white/80">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 右側: 字幕、再生速度、PiP、フルスクリーン */}
        <div className="flex items-center gap-2">
          {/* 字幕ボタン（字幕がある場合のみ表示） */}
          {hasSubtitles && (
            <div ref={subtitleMenuRef} className="relative">
              <button
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  activeTextTrack ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                aria-label="字幕"
              >
                <Subtitles className="w-5 h-5" />
              </button>

              {/* 字幕選択メニュー */}
              {showSubtitleMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl py-2 min-w-[120px] border border-white/10">
                  {/* オフ */}
                  <button
                    onClick={() => {
                      onDisableTextTrack();
                      setShowSubtitleMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center justify-between ${
                      !activeTextTrack
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>オフ</span>
                    {!activeTextTrack && <span className="text-white">✓</span>}
                  </button>
                  {/* 字幕トラック */}
                  {textTracks.map((track) => (
                    <button
                      key={track.language}
                      onClick={() => {
                        onEnableTextTrack(track.language);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center justify-between ${
                        activeTextTrack?.language === track.language
                          ? 'text-white bg-white/10'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{track.label}</span>
                      {activeTextTrack?.language === track.language && (
                        <span className="text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 再生速度 */}
          <div ref={speedMenuRef} className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="h-10 px-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white text-sm font-medium"
            >
              {playbackRate === 1 ? '標準' : `${playbackRate}x`}
            </button>

            {/* 速度選択メニュー */}
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl py-2 min-w-[100px] border border-white/10">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors flex items-center justify-between ${
                      rate === playbackRate
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{rate === 1 ? '標準' : `${rate}x`}</span>
                    {rate === playbackRate && (
                      <span className="text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picture-in-Picture */}
          <button
            onClick={onTogglePip}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isPip ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            aria-label={isPip ? 'ピクチャーインピクチャーを終了' : 'ピクチャーインピクチャー'}
          >
            <PictureInPicture2 className="w-5 h-5" />
          </button>

          {/* フルスクリーン */}
          <button
            onClick={onToggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label={isFullscreen ? 'フルスクリーン解除' : 'フルスクリーン'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
