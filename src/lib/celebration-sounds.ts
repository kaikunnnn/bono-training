/**
 * celebration-sounds.ts - セレブレーション効果音
 *
 * Web Audio APIを使用して、記事・クエスト・レッスン完了時に
 * それぞれ異なる効果音を再生する
 */

// AudioContextのシングルトン
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * 単音を再生するヘルパー
 */
function playTone(
  frequency: number,
  duration: number,
  startTime: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  // フェードイン・フェードアウト
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
}

/**
 * レベル1: 記事完了音
 * シンプルな「ポン」という軽い音
 */
export function playArticleCompleteSound(): void {
  try {
    // 軽やかな2音（ド→ミ）
    playTone(523.25, 0.15, 0, 'sine', 0.25);      // C5
    playTone(659.25, 0.2, 0.1, 'sine', 0.2);     // E5
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

/**
 * レベル2: クエスト完了音
 * 達成感のある「ピロリン♪」という音
 */
export function playQuestCompleteSound(): void {
  try {
    // 上昇する3音（ド→ミ→ソ）
    playTone(523.25, 0.15, 0, 'sine', 0.25);      // C5
    playTone(659.25, 0.15, 0.12, 'sine', 0.25);  // E5
    playTone(783.99, 0.25, 0.24, 'sine', 0.3);   // G5
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

/**
 * レベル3: レッスン完了音
 * 壮大なファンファーレ風の音
 */
export function playLessonCompleteSound(): void {
  try {
    // ファンファーレ（ド→ミ→ソ→高いド）
    playTone(523.25, 0.2, 0, 'triangle', 0.3);      // C5
    playTone(659.25, 0.2, 0.15, 'triangle', 0.3);   // E5
    playTone(783.99, 0.2, 0.30, 'triangle', 0.3);   // G5
    playTone(1046.50, 0.4, 0.45, 'triangle', 0.35); // C6 (オクターブ上)

    // ハーモニー（少し遅れて和音）
    playTone(523.25, 0.3, 0.5, 'sine', 0.15);       // C5
    playTone(659.25, 0.3, 0.5, 'sine', 0.15);       // E5
    playTone(783.99, 0.3, 0.5, 'sine', 0.15);       // G5
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}
