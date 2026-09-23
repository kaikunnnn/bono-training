import { useEffect, useRef, useState, useCallback } from 'react';
import Player, { type TextTrackChangeEvent } from '@vimeo/player';

export interface TextTrack {
  label: string;
  language: string;
  kind: 'captions' | 'subtitles';
  mode: 'showing' | 'disabled';
}

export interface Chapter {
  startTime: number;
  title: string;
  index: number;
}

export interface VimeoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  /** Vimeoのシーク完了を待つ間、操作部に即時表示する位置 */
  pendingSeekTime: number | null;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  isLoading: boolean;
  isReady: boolean;
  textTracks: TextTrack[];
  activeTextTrack: TextTrack | null;
  chapters: Chapter[];
  currentChapter: Chapter | null;
}

export interface UseVimeoPlayerReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  state: VimeoPlayerState;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  toggleFullscreen: () => void;
  enableTextTrack: (language: string) => Promise<void>;
  disableTextTrack: () => Promise<void>;
}

export interface VimeoPlayerOptions {
  autoPlay?: boolean;
  muted?: boolean;
}

function findCurrentChapter(
  chapters: Chapter[],
  currentTime: number,
): Chapter | null {
  for (let index = chapters.length - 1; index >= 0; index -= 1) {
    if (currentTime >= chapters[index].startTime) {
      return chapters[index];
    }
  }

  return null;
}

export function useVimeoPlayer(vimeoId: string, options: VimeoPlayerOptions = {}): UseVimeoPlayerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const seekRequestRef = useRef(0);
  const autoPlay = options.autoPlay ?? false;
  const configuredMuted = options.muted ?? false;

  const [state, setState] = useState<VimeoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    pendingSeekTime: null,
    duration: 0,
    volume: 1,
    muted: configuredMuted,
    playbackRate: 1,
    isLoading: true,
    isReady: false,
    textTracks: [],
    activeTextTrack: null,
    chapters: [],
    currentChapter: null,
  });

  // プレーヤーの初期化
  useEffect(() => {
    if (!containerRef.current || !vimeoId) return;

    // 既存のプレーヤーをクリーンアップ
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Vimeo IDと private hash を抽出（URLの場合）
    const extractedId = extractVimeoId(vimeoId);
    const extractedHash = extractVimeoHash(vimeoId);

    const player = new Player(containerRef.current, {
      id: parseInt(extractedId, 10),
      ...(extractedHash ? { h: extractedHash } : {}),
      controls: false,  // Vimeo標準UIを非表示（Plusプラン以上で有効）
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      autoplay: autoPlay,
      muted: configuredMuted,
    });

    playerRef.current = player;

    // エラーイベントをキャッチ
    player.on('error', (error: unknown) => {
      console.error('[VimeoPlayer] Error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // readyイベントで初期化を完了
    player.ready().then(async () => {
      try {
        // 互いに依存しないVimeo APIを直列に待たない。
        // getChaptersは動画にチャプターがない場合だけ空配列へフォールバックする。
        const [duration, volume, textTracks, chapters, isMuted, currentTime] =
          await Promise.all([
            player.getDuration(),
            player.getVolume(),
            player.getTextTracks(),
            player.getChapters().catch(() => [] as Chapter[]),
            player.getMuted(),
            player.getCurrentTime(),
          ]);

        // muted=false が指定されているのに実際にミュートされていれば強制解除
        const normalization: Promise<unknown>[] = [];
        if (!configuredMuted && isMuted) normalization.push(player.setMuted(false));
        if (!configuredMuted && volume === 0) normalization.push(player.setVolume(1));
        await Promise.all(normalization);

        setState(prev => ({
          ...prev,
          duration,
          currentTime,
          volume: !configuredMuted && volume === 0 ? 1 : volume,
          muted: configuredMuted ? isMuted : false,
          textTracks: textTracks as TextTrack[],
          chapters: chapters as Chapter[],
          currentChapter: findCurrentChapter(chapters as Chapter[], currentTime),
          isLoading: false,
          isReady: true,
        }));
      } catch (err) {
        console.error('[VimeoPlayer] Ready error getting info:', err);
        setState(prev => ({ ...prev, isLoading: false, isReady: true }));
      }
    }).catch((err: unknown) => {
      console.error('[VimeoPlayer] Ready error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // Vimeoイベントを状態更新の唯一の継続ソースにする。
    player.on('play', () => {
      setState(prev => prev.isPlaying ? prev : ({ ...prev, isPlaying: true }));
    });

    player.on('pause', () => {
      setState(prev => prev.isPlaying ? ({ ...prev, isPlaying: false }) : prev);
    });

    player.on('timeupdate', (data: { seconds: number }) => {
      setState(prev => ({
        ...prev,
        currentTime: data.seconds,
        currentChapter: findCurrentChapter(prev.chapters, data.seconds),
      }));
    });

    player.on('volumechange', (data: { volume: number }) => {
      setState(prev => ({ ...prev, volume: data.volume }));
    });

    player.on('playbackratechange', (data: { playbackRate: number }) => {
      setState(prev => ({ ...prev, playbackRate: data.playbackRate }));
    });

    player.on('bufferstart', () => {
      setState(prev => ({ ...prev, isLoading: true }));
    });

    player.on('bufferend', () => {
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // 字幕変更イベント
    player.on('texttrackchange', (data: TextTrackChangeEvent) => {
      const label = data.label;
      const language = data.language;
      if (label && language) {
        setState(prev => ({
          ...prev,
          activeTextTrack: {
            label,
            language,
            kind: data.kind === 'captions' ? 'captions' : 'subtitles',
            mode: 'showing',
          },
        }));
      } else {
        setState(prev => ({ ...prev, activeTextTrack: null }));
      }
    });

    return () => {
      seekRequestRef.current += 1;
      player.destroy();
      playerRef.current = null;
    };
  }, [vimeoId, autoPlay, configuredMuted]);

  const play = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.play();
    }
  }, []);

  const pause = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (playerRef.current) {
      const paused = await playerRef.current.getPaused();
      if (paused) {
        await playerRef.current.play();
      } else {
        await playerRef.current.pause();
      }
    }
  }, []);

  const seek = useCallback(async (time: number) => {
    const player = playerRef.current;
    if (!player) return;

    const requestId = ++seekRequestRef.current;
    // ネットワーク越しのVimeo応答を待たず、バーと時刻は指を離した位置に保つ。
    // 実際の視聴進捗はtimeupdate由来のcurrentTimeだけで判定する。
    setState(prev => ({ ...prev, pendingSeekTime: time }));
    try {
      const actualTime = await player.setCurrentTime(time);
      if (playerRef.current !== player || seekRequestRef.current !== requestId) return;
      setState(prev => ({
        ...prev,
        currentTime: actualTime,
        currentChapter: findCurrentChapter(prev.chapters, actualTime),
        pendingSeekTime: null,
      }));
    } catch (error) {
      if (playerRef.current === player && seekRequestRef.current === requestId) {
        setState(prev => ({ ...prev, pendingSeekTime: null }));
      }
      console.error('[VimeoPlayer] Seek error:', error);
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (playerRef.current) {
      await playerRef.current.setVolume(volume);
      // 音量変更時にmuted状態も更新
      // Vimeo PlayerのsetVolumeは自動的にミュートを解除する
      setState(prev => ({ ...prev, muted: volume === 0 }));
    }
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    if (playerRef.current) {
      // 即座にUIを更新（optimistic update）
      setState(prev => ({ ...prev, playbackRate: rate }));
      await playerRef.current.setPlaybackRate(rate);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  // 字幕を有効化
  const enableTextTrack = useCallback(async (language: string) => {
    if (playerRef.current) {
      try {
        await playerRef.current.enableTextTrack(language);
      } catch (err) {
        console.error('[VimeoPlayer] Enable text track error:', err);
      }
    }
  }, []);

  // 字幕を無効化
  const disableTextTrack = useCallback(async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.disableTextTrack();
        setState(prev => ({ ...prev, activeTextTrack: null }));
      } catch (err) {
        console.error('[VimeoPlayer] Disable text track error:', err);
      }
    }
  }, []);

  return {
    containerRef,
    state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    enableTextTrack,
    disableTextTrack,
  };
}

// Vimeo URLからIDを抽出するヘルパー
function extractVimeoId(url: string): string {
  if (/^\d+$/.test(url)) {
    return url;
  }
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : url;
}

/**
 * Vimeo URLから private hash を抽出する。
 * 例: https://vimeo.com/1027603200/2dc830c8cb?share=copy → "2dc830c8cb"
 * 例: https://player.vimeo.com/video/1027603200?h=2dc830c8cb → "2dc830c8cb"
 * 公開動画の場合は null。
 */
function extractVimeoHash(url: string): string | null {
  if (/^\d+$/.test(url)) return null;
  // パスに含まれる /vimeo.com/{id}/{hash}
  const pathMatch = url.match(/vimeo\.com\/\d+\/([a-f0-9]+)/);
  if (pathMatch) return pathMatch[1];
  // クエリで ?h={hash}
  const queryMatch = url.match(/[?&]h=([a-f0-9]+)/);
  if (queryMatch) return queryMatch[1];
  return null;
}
