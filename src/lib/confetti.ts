/**
 * 紙吹雪（Confetti）演出ユーティリティ
 * 熱血コーチング・セレブレーション機能
 */
import confetti from 'canvas-confetti';

/**
 * クエスト完了時の紙吹雪（中規模）
 * 星形を含むパーティクルを少量発射
 */
export function fireQuestConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8C42', '#A855F7'],
  };

  // 中央から発射
  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 1.2,
    shapes: ['star', 'circle'],
    origin: { x: 0.5, y: 0.5 },
  });

  // 少し遅れて追加発射
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 0.8,
      shapes: ['circle'],
      origin: { x: 0.5, y: 0.6 },
    });
  }, 150);
}

/**
 * レッスン完了時の紙吹雪（大規模・連続）
 * 左右から断続的に発射し続ける「祝福の嵐」
 */
export function fireLessonConfetti() {
  const duration = 5000; // 5秒間
  const animationEnd = Date.now() + duration;
  const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8C42', '#A855F7', '#F59E0B'];

  const frame = () => {
    // 左から発射
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    // 右から発射
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      shapes: ['star', 'circle'],
      scalar: 1.2,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  // 最初に大きな爆発
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors,
    shapes: ['star'],
    scalar: 1.5,
  });
}

/**
 * 記事完了時のミニ演出（オプション）
 */
export function fireArticleConfetti() {
  confetti({
    particleCount: 20,
    spread: 50,
    origin: { x: 0.5, y: 0.3 },
    colors: ['#FF6B6B', '#FFE66D'],
    shapes: ['circle'],
    scalar: 0.8,
    ticks: 60,
  });
}
