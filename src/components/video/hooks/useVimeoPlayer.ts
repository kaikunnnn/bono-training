import { useEffect, useRef, useState, useCallback } from 'react';
import Player from '@vimeo/player';

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
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  isReady: boolean;
  isPip: boolean;
  textTracks: TextTrack[];
  activeTextTrack: TextTrack | null;
  chapters: Chapter[];
  currentChapter: Chapter | null;
}

export interface UseVimeoPlayerReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  state: VimeoPlayerState;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  toggleFullscreen: () => void;
  togglePip: () => Promise<void>;
  enableTextTrack: (language: string) => Promise<void>;
  disableTextTrack: () => Promise<void>;
}

export function useVimeoPlayer(vimeoId: string): UseVimeoPlayerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  const [state, setState] = useState<VimeoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: true,
    isReady: false,
    isPip: false,
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

    // Vimeo IDを抽出（URLの場合）
    const extractedId = extractVimeoId(vimeoId);

    console.log('[VimeoPlayer] Initializing with ID:', extractedId);

    const player = new Player(containerRef.current, {
      id: parseInt(extractedId, 10),
      controls: false,  // Vimeo標準UIを非表示（Plusプラン以上で有効）
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      pip: true,
    });

    playerRef.current = player;

    // エラーイベントをキャッチ
    player.on('error', (error: any) => {
      console.error('[VimeoPlayer] Error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // イベントリスナーの設定
    player.on('loaded', async () => {
      console.log('[VimeoPlayer] Video loaded');
      try {
        const duration = await player.getDuration();
        const volume = await player.getVolume();
        const textTracks = await player.getTextTracks();
        console.log('[VimeoPlayer] Duration:', duration, 'Volume:', volume);
        setState(prev => ({
          ...prev,
          duration,
          volume,
          textTracks: textTracks as TextTrack[],
          isLoading: false,
          isReady: true,
        }));
      } catch (err) {
        console.error('[VimeoPlayer] Error getting video info:', err);
        setState(prev => ({ ...prev, isLoading: false, isReady: true }));
      }
    });

    // readyイベントで初期化を完了
    player.ready().then(async () => {
      console.log('[VimeoPlayer] Player ready');
      try {
        const duration = await player.getDuration();
        const volume = await player.getVolume();
        const textTracks = await player.getTextTracks();

        // チャプター情報を取得
        let chapters: Chapter[] = [];
        try {
          chapters = await player.getChapters() as Chapter[];
          console.log('[VimeoPlayer] Chapters:', chapters);
        } catch (chapterErr) {
          console.log('[VimeoPlayer] No chapters available');
        }

        console.log('[VimeoPlayer] Ready - Duration:', duration, 'Volume:', volume);
        setState(prev => {
          if (prev.isReady) return prev;
          return {
            ...prev,
            duration,
            volume,
            textTracks: textTracks as TextTrack[],
            chapters,
            isLoading: false,
            isReady: true,
          };
        });
      } catch (err) {
        console.error('[VimeoPlayer] Ready error getting info:', err);
        setState(prev => ({ ...prev, isLoading: false, isReady: true }));
      }
    }).catch((err: any) => {
      console.error('[VimeoPlayer] Ready error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    });

    // イベント方式（バックアップ）
    player.on('play', () => {
      console.log('[VimeoPlayer] Play event fired');
      setState(prev => ({ ...prev, isPlaying: true }));
    });

    player.on('pause', () => {
      console.log('[VimeoPlayer] Pause event fired');
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    player.on('timeupdate', (data: { seconds: number }) => {
      setState(prev => ({ ...prev, currentTime: data.seconds }));
    });

    // ポーリング方式（イベントが発火しない場合の対策）
    const pollInterval = setInterval(async () => {
      try {
        const [currentTime, paused, volume, textTracks] = await Promise.all([
          player.getCurrentTime(),
          player.getPaused(),
          player.getVolume(),
          player.getTextTracks(),
        ]);

        // アクティブな字幕トラックを特定
        const activeTrack = (textTracks as TextTrack[]).find(t => t.mode === 'showing') || null;

        setState(prev => {
          // 現在のチャプターを計算
          let currentChapter: Chapter | null = null;
          if (prev.chapters.length > 0) {
            for (let i = prev.chapters.length - 1; i >= 0; i--) {
              if (currentTime >= prev.chapters[i].startTime) {
                currentChapter = prev.chapters[i];
                break;
              }
            }
          }

          return {
            ...prev,
            currentTime,
            volume,
            isPlaying: !paused,
            currentChapter,
            activeTextTrack: activeTrack,
          };
        });
      } catch (err) {
        // プレーヤーが破棄された場合は無視
      }
    }, 100);

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

    // PiP イベント
    player.on('enterpictureinpicture', () => {
      setState(prev => ({ ...prev, isPip: true }));
    });

    player.on('leavepictureinpicture', () => {
      setState(prev => ({ ...prev, isPip: false }));
    });

    // 字幕変更イベント
    player.on('texttrackchange', (data: any) => {
      console.log('[VimeoPlayer] Text track changed:', data);
      if (data.label && data.language) {
        setState(prev => ({
          ...prev,
          activeTextTrack: {
            label: data.label,
            language: data.language,
            kind: data.kind,
            mode: 'showing',
          },
        }));
      } else {
        setState(prev => ({ ...prev, activeTextTrack: null }));
      }
    });

    return () => {
      clearInterval(pollInterval);
      player.destroy();
      playerRef.current = null;
    };
  }, [vimeoId]);

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
      console.log('[VimeoPlayer] togglePlay called, paused:', paused);
      if (paused) {
        await playerRef.current.play();
      } else {
        await playerRef.current.pause();
      }
    }
  }, []);

  const seek = useCallback(async (time: number) => {
    if (playerRef.current) {
      await playerRef.current.setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (playerRef.current) {
      await playerRef.current.setVolume(volume);
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

  // Picture-in-Picture トグル
  const togglePip = useCallback(async () => {
    if (playerRef.current) {
      try {
        if (state.isPip) {
          // 即座にUIを更新（optimistic update）
          setState(prev => ({ ...prev, isPip: false }));
          await playerRef.current.exitPictureInPicture();
        } else {
          // 即座にUIを更新（optimistic update）
          setState(prev => ({ ...prev, isPip: true }));
          await playerRef.current.requestPictureInPicture();
        }
      } catch (err) {
        // エラー時は状態を元に戻す
        setState(prev => ({ ...prev, isPip: !prev.isPip }));
        console.error('[VimeoPlayer] PiP error:', err);
      }
    }
  }, [state.isPip]);

  // 字幕を有効化
  const enableTextTrack = useCallback(async (language: string) => {
    if (playerRef.current) {
      try {
        const track = await playerRef.current.enableTextTrack(language);
        console.log('[VimeoPlayer] Enabled text track:', track);
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
    togglePip,
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
