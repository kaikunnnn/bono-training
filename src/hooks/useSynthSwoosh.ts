import { useCallback, useRef, useState } from 'react';

export interface UseSynthSwooshOptions {
  /** 音量（0.0-1.0、デフォルト: 0.3） */
  volume?: number;
  /** 音の長さ（秒、デフォルト: 0.4） */
  duration?: number;
  /** prefers-reduced-motionを尊重するか（デフォルト: true） */
  respectReducedMotion?: boolean;
  /** デバッグモード（コンソールにログ出力） */
  debug?: boolean;
}

export interface UseSynthSwooshReturn {
  /** 音を再生する関数 */
  play: () => void;
  /** AudioContextが準備できているか */
  isReady: boolean;
  /** 再生中か */
  isPlaying: boolean;
}

/**
 * Web Audio APIでシンセサイズした「シュッ」音を再生するカスタムフック
 *
 * 音声ファイル不要で、ブラウザ上で音を生成します。
 *
 * 使用例:
 * ```tsx
 * const { play, isReady } = useSynthSwoosh({ volume: 0.3 });
 *
 * useEffect(() => {
 *   if (isReady) {
 *     play();
 *   }
 * }, [isReady]);
 * ```
 *
 * 生成される音:
 * - ホワイトノイズをベースにした「シュッ」という風切り音
 * - 高周波成分を強調（3000-8000Hz）
 * - 短いエンベロープ（0.4秒程度）
 */
export function useSynthSwoosh({
  volume = 0.3,
  duration = 0.4,
  respectReducedMotion = true,
  debug = false,
}: UseSynthSwooshOptions = {}): UseSynthSwooshReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // AudioContextの初期化（遅延初期化）
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      setIsReady(true);
      if (debug) console.log('[useSynthSwoosh] AudioContext initialized');
    } catch (err) {
      if (debug) console.error('[useSynthSwoosh] Failed to create AudioContext:', err);
    }
  }, [debug]);

  // 再生関数
  const play = useCallback(() => {
    // prefers-reduced-motionチェック
    if (respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        if (debug) console.log('[useSynthSwoosh] Skipped: prefers-reduced-motion');
        return;
      }
    }

    // AudioContext初期化（初回のみ）
    if (!audioContextRef.current) {
      initAudioContext();
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) {
      if (debug) console.warn('[useSynthSwoosh] AudioContext not available');
      return;
    }

    try {
      const now = audioContext.currentTime;

      // ノイズ生成（ホワイトノイズ）
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // -1 ~ 1 のランダム値
      }

      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;

      // ハイパスフィルター（低音カット）
      const highpass = audioContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 3000; // 3000Hz以下をカット

      // バンドパスフィルター（特定の周波数帯を強調）
      const bandpass = audioContext.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 5000; // 5000Hz周辺を強調
      bandpass.Q.value = 1.5; // やや広めのQ値

      // ゲインノード（音量調整とエンベロープ）
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // 瞬時に立ち上がり
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // 徐々に減衰

      // 接続: noise → highpass → bandpass → gain → destination
      noise.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 再生
      setIsPlaying(true);
      noise.start(now);
      noise.stop(now + duration);

      if (debug) console.log('[useSynthSwoosh] Playing synthesized swoosh');

      // 再生終了時にステート更新
      noise.onended = () => {
        setIsPlaying(false);
        if (debug) console.log('[useSynthSwoosh] Ended');
      };
    } catch (err) {
      setIsPlaying(false);
      if (debug) console.error('[useSynthSwoosh] Play failed:', err);
    }
  }, [volume, duration, respectReducedMotion, debug, initAudioContext]);

  return {
    play,
    isReady: true, // Web Audio APIは常に利用可能
    isPlaying,
  };
}
