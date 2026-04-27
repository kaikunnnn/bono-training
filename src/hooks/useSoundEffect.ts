import { useEffect, useRef, useState } from 'react';

export interface UseSoundEffectOptions {
  /** 音声ファイルのパス（例: '/sounds/swoosh.mp3'） */
  src: string;
  /** 音量（0.0-1.0、デフォルト: 0.5） */
  volume?: number;
  /** prefers-reduced-motionを尊重するか（デフォルト: true） */
  respectReducedMotion?: boolean;
  /** デバッグモード（コンソールにログ出力） */
  debug?: boolean;
}

export interface UseSoundEffectReturn {
  /** 音を再生する関数 */
  play: () => Promise<void>;
  /** 音声が読み込まれたか */
  isLoaded: boolean;
  /** 再生中か */
  isPlaying: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * サウンドエフェクトを再生するカスタムフック
 *
 * 使用例:
 * ```tsx
 * const { play, isLoaded } = useSoundEffect({ src: '/sounds/swoosh.mp3' });
 *
 * useEffect(() => {
 *   if (isLoaded) {
 *     play();
 *   }
 * }, [isLoaded]);
 * ```
 *
 * 注意:
 * - ブラウザの自動再生ポリシーにより、ユーザーインタラクション前は再生されない場合があります
 * - prefers-reduced-motionが有効な場合、音は再生されません（デフォルト）
 */
export function useSoundEffect({
  src,
  volume = 0.5,
  respectReducedMotion = true,
  debug = false,
}: UseSoundEffectOptions): UseSoundEffectReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化: Audio要素を作成してプリロード
  useEffect(() => {
    try {
      const audio = new Audio(src);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.preload = 'auto';

      // 読み込み完了イベント
      audio.addEventListener('canplaythrough', () => {
        setIsLoaded(true);
        if (debug) console.log('[useSoundEffect] Audio loaded:', src);
      });

      // エラーイベント
      audio.addEventListener('error', (e) => {
        const errorMsg = `Failed to load audio: ${src}`;
        setError(errorMsg);
        if (debug) console.error('[useSoundEffect]', errorMsg, e);
      });

      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    } catch (err) {
      const errorMsg = 'Failed to create audio element';
      setError(errorMsg);
      if (debug) console.error('[useSoundEffect]', errorMsg, err);
    }
  }, [src, volume, debug]);

  // 再生関数
  const play = async () => {
    // prefers-reduced-motionチェック
    if (respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        if (debug) console.log('[useSoundEffect] Skipped: prefers-reduced-motion');
        return;
      }
    }

    const audio = audioRef.current;
    if (!audio) {
      if (debug) console.warn('[useSoundEffect] Audio element not initialized');
      return;
    }

    if (!isLoaded) {
      if (debug) console.warn('[useSoundEffect] Audio not loaded yet');
      return;
    }

    try {
      // 再生中なら停止してリセット
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
      }

      setIsPlaying(true);
      await audio.play();
      if (debug) console.log('[useSoundEffect] Playing:', src);

      // 再生終了時にステート更新
      audio.onended = () => {
        setIsPlaying(false);
        if (debug) console.log('[useSoundEffect] Ended:', src);
      };
    } catch (err) {
      // 自動再生ポリシーでブロックされた場合など
      setIsPlaying(false);
      const errorMsg = err instanceof Error ? err.message : 'Play failed';
      if (debug) console.warn('[useSoundEffect] Play failed:', errorMsg);
      // エラーは記録するが、UIには影響させない（音が鳴らないだけ）
    }
  };

  return {
    play,
    isLoaded,
    isPlaying,
    error,
  };
}
