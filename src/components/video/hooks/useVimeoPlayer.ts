import { useEffect, useRef, useState, useCallback } from 'react';
import Player from '@vimeo/player';

export interface TextTrack {
  label: string;
  language: string;
  kind: 'captions' | 'subtitles';
  mode: 'showing' | 'disabled';
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
      controls: true,  // Vimeo標準UIを表示（controls: falseは制限あり）
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      pip: true,  // Picture-in-Picture を有効化
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
        console.log('[VimeoPlayer] Duration:', duration, 'Volume:', volume, 'TextTracks:', textTracks);
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

    // readyイベントで初期化を完了（広告ブロッカー対応）
    player.ready().then(async () => {
      console.log('[VimeoPlayer] Player ready');
      try {
        const duration = await player.getDuration();
        const volume = await player.getVolume();
        const textTracks = await player.getTextTracks();
        console.log('[VimeoPlayer] Ready - Duration:', duration, 'Volume:', volume);
        setState(prev => {
          if (prev.isReady) return prev;
          return {
            ...prev,
            duration,
            volume,
            textTracks: textTracks as TextTrack[],
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

    player.on('play', () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    });

    player.on('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    player.on('timeupdate', (data: { seconds: number }) => {
      setState(prev => ({ ...prev, currentTime: data.seconds }));
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
          await playerRef.current.exitPictureInPicture();
        } else {
          await playerRef.current.requestPictureInPicture();
        }
      } catch (err) {
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
