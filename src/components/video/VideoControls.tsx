"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, Loader2, Subtitles, List } from 'lucide-react';
import type { VimeoPlayerState, Chapter } from './hooks/useVimeoPlayer';

interface VideoControlsProps {
  state: VimeoPlayerState;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSeekStart?: () => void;
  onSeekCancel?: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onEnableTextTrack: (language: string) => void;
  onDisableTextTrack: () => void;
  isFullscreen?: boolean;
  maxChapterMenuHeight?: number;
  onMenuOpenChange?: (open: boolean) => void;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoControls({
  state,
  onTogglePlay,
  onSeek,
  onSeekStart,
  onSeekCancel,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleFullscreen,
  onEnableTextTrack,
  onDisableTextTrack,
  isFullscreen = false,
  maxChapterMenuHeight = 300,
  onMenuOpenChange,
}: VideoControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hoverChapter, setHoverChapter] = useState<Chapter | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const subtitleMenuRef = useRef<HTMLDivElement>(null);
  const chapterButtonRef = useRef<HTMLButtonElement>(null);
  const chapterMenuRef = useRef<HTMLDivElement>(null);

  const { isPlaying, currentTime, pendingSeekTime, duration, volume, muted, playbackRate, isLoading, textTracks, activeTextTrack, chapters, currentChapter } = state;

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

  // ポインターを捕捉し、指がバーから外れても位置を追う。
  const timeAtPosition = (clientX: number) => {
    if (!progressRef.current || duration <= 0) return null;
    const rect = progressRef.current.getBoundingClientRect();
    if (rect.width <= 0) return null;
    return Math.max(0, Math.min(((clientX - rect.left) / rect.width) * duration, duration));
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerRef.current !== null || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const time = timeAtPosition(e.clientX);
    if (time === null) return;
    activePointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSeeking(true);
    setSeekTime(time);
    onSeekStart?.();
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const time = timeAtPosition(e.clientX);
    if (time === null) return;
    if (activePointerRef.current === e.pointerId) {
      setSeekTime(time);
    }
    if (e.pointerType !== 'mouse') return;
    setHoverPosition((time / duration) * 100);
    setHoverTime(time);

    // ホバー位置のチャプターを特定
    if (chapters.length > 0) {
      let foundChapter: Chapter | null = null;
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (time >= chapters[i].startTime) {
          foundChapter = chapters[i];
          break;
        }
      }
      setHoverChapter(foundChapter);
    }
  };

  const finishSeeking = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (activePointerRef.current !== e.pointerId) return;
    activePointerRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsSeeking(false);
    setSeekTime(null);
    const time = timeAtPosition(e.clientX);
    if (!cancelled && time !== null) {
      onSeek(time);
    } else {
      onSeekCancel?.();
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let time: number;
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        time = currentTime - 5;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        time = currentTime + 5;
        break;
      case 'Home':
        time = 0;
        break;
      case 'End':
        time = duration;
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (duration > 0) onSeek(Math.max(0, Math.min(time, duration)));
  };

  // メニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (subtitleMenuRef.current && !subtitleMenuRef.current.contains(e.target as Node)) {
        setShowSubtitleMenu(false);
      }
      if (
        chapterMenuRef.current &&
        !chapterMenuRef.current.contains(e.target as Node) &&
        !chapterButtonRef.current?.contains(e.target as Node)
      ) {
        setShowChapterMenu(false);
      }
    };

    if (showSpeedMenu || showSubtitleMenu || showChapterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpeedMenu, showSubtitleMenu, showChapterMenu]);

  useEffect(() => {
    onMenuOpenChange?.(showSpeedMenu || showSubtitleMenu || showChapterMenu);
  }, [showSpeedMenu, showSubtitleMenu, showChapterMenu, onMenuOpenChange]);

  const displayedTime = seekTime ?? pendingSeekTime ?? currentTime;
  const progress = duration > 0 ? (displayedTime / duration) * 100 : 0;

  // 音量アイコンの選択（muted状態も考慮）
  const VolumeIcon = (muted || volume === 0) ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // 字幕が利用可能かどうか
  const hasSubtitles = textTracks.length > 0;

  // チャプターが利用可能かどうか
  const hasChapters = chapters.length > 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent pt-16 pb-3 px-4">
      {/* プログレスバー */}
      <div
        ref={progressRef}
        role="slider"
        tabIndex={duration > 0 ? 0 : -1}
        aria-label="再生位置"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(displayedTime)}
        aria-valuetext={`${formatTime(displayedTime)} / ${formatTime(duration)}`}
        className="relative h-8 mb-2 cursor-pointer touch-none select-none group focus-visible:outline-2 focus-visible:outline-white"
        onPointerDown={handleProgressPointerDown}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setIsHoveringProgress(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return;
          setIsHoveringProgress(false);
          setHoverTime(null);
          setHoverChapter(null);
        }}
        onPointerMove={handleProgressPointerMove}
        onPointerUp={(e) => finishSeeking(e, false)}
        onPointerCancel={(e) => finishSeeking(e, true)}
        onKeyDown={handleProgressKeyDown}
      >
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${isHoveringProgress || isSeeking ? 'h-1.5' : 'h-1'}`}>
        {/* チャプターがある場合はセグメント分割、ない場合は従来の1本バー */}
        {hasChapters ? (
          // セグメント分割プログレスバー
          <div className="flex h-full gap-0.5">
            {chapters.map((chapter, index) => {
              const nextChapter = chapters[index + 1];
              const segmentStart = chapter.startTime;
              const segmentEnd = nextChapter ? nextChapter.startTime : duration;
              const segmentDuration = segmentEnd - segmentStart;
              const segmentWidth = (segmentDuration / duration) * 100;

              // このセグメント内での再生進捗を計算
              let segmentProgress = 0;
              if (displayedTime >= segmentEnd) {
                segmentProgress = 100;
              } else if (displayedTime > segmentStart) {
                segmentProgress = ((displayedTime - segmentStart) / segmentDuration) * 100;
              }

              // このセグメント内でのホバー進捗を計算
              let hoverSegmentProgress = 0;
              if (hoverTime !== null) {
                if (hoverTime >= segmentEnd) {
                  hoverSegmentProgress = 100;
                } else if (hoverTime > segmentStart) {
                  hoverSegmentProgress = ((hoverTime - segmentStart) / segmentDuration) * 100;
                }
              }

              return (
                <div
                  key={chapter.index}
                  className="relative h-full rounded-sm overflow-hidden"
                  style={{ width: `${segmentWidth}%` }}
                >
                  {/* ベース（未再生部分）*/}
                  <div className="absolute inset-0 bg-white/30" />

                  {/* ホバー時のプレビュー位置 */}
                  {isHoveringProgress && hoverTime !== null && hoverSegmentProgress > 0 && (
                    <div
                      className="absolute top-0 left-0 h-full bg-white/20"
                      style={{ width: `${hoverSegmentProgress}%` }}
                    />
                  )}

                  {/* 再生済み領域（白） */}
                  <div
                    className="absolute top-0 left-0 h-full bg-white transition-[width] duration-100"
                    style={{ width: `${segmentProgress}%` }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          // 従来の1本プログレスバー（チャプターなし）
          <>
            {/* ベース（未再生部分）*/}
            <div className="absolute inset-0 bg-white/30 rounded-full" />

            {/* ホバー時のプレビュー位置 */}
            {isHoveringProgress && hoverTime !== null && (
              <div
                className="absolute top-0 h-full bg-white/20 rounded-full"
                style={{ width: `${hoverPosition}%` }}
              />
            )}

            {/* 再生済み領域（白） */}
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </>
        )}

        {/* ドラッグハンドル（白い丸） */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-150 z-10 ${
            isHoveringProgress || isSeeking ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ left: `calc(${progress}% - 6px)` }}
        />
        </div>

        {/* ホバー時の時間・チャプター表示 */}
        {isHoveringProgress && hoverTime !== null && (
          <div
            className="absolute transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1.5 rounded pointer-events-none whitespace-nowrap z-20"
            style={{ left: `${hoverPosition}%`, bottom: 'calc(100% + 8px)' }}
          >
            {hoverChapter && (
              <div className="font-medium mb-0.5">{hoverChapter.title}</div>
            )}
            <div className={hoverChapter ? 'text-white/70' : ''}>{formatTime(hoverTime)}</div>
          </div>
        )}
      </div>

      {/* コントロールボタン */}
      <div className="flex items-center justify-between">
        {/* 左側: 再生/一時停止、音量、時間表示 */}
        <div className="flex items-center gap-3">
          {/* 再生/一時停止ボタン */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
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
              onClick={() => onVolumeChange((muted || volume === 0) ? 1 : 0)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                (muted || volume === 0)
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              aria-label={(muted || volume === 0) ? 'ミュート解除' : 'ミュート'}
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
            <span>{formatTime(displayedTime)}</span>
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
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
                    className={`w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer flex items-center justify-between ${
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
                      className={`w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer flex items-center justify-between ${
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

          {/* チャプター選択（チャプターがある場合のみ表示） */}
          {hasChapters && (
            <div className="relative">
              <button
                ref={chapterButtonRef}
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  showChapterMenu ? 'bg-white text-black' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                aria-label="チャプター"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 再生速度 */}
          <div ref={speedMenuRef} className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="h-10 px-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer text-white text-sm font-medium"
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
                    className={`w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer flex items-center justify-between ${
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

          {/* フルスクリーン */}
          <button
            onClick={onToggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
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

      {/* プレイヤーの右端に固定し、狭い画面でも一覧が枠内に収まるようにする。 */}
      {showChapterMenu && (
        <div
          ref={chapterMenuRef}
          className="absolute bottom-[60px] right-4 z-30 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl py-2 min-w-[200px] overflow-y-auto border border-white/10"
          style={{ maxHeight: maxChapterMenuHeight, maxWidth: 'calc(100% - 2rem)' }}
        >
          {chapters.map((chapter) => (
            <button
              key={chapter.index}
              onClick={() => {
                onSeek(chapter.startTime);
                setShowChapterMenu(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                currentChapter?.index === chapter.index
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="truncate">{chapter.title}</span>
              <span className="text-white/50 text-xs tabular-nums flex-shrink-0">
                {formatTime(chapter.startTime)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
