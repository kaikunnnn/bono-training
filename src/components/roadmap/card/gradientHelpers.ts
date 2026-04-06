import type { GradientDef } from '@/styles/gradients';

/**
 * グラデーションCSSを生成（方向指定付き）
 * @param gradient グラデーション定義
 * @param direction 方向 - 'vertical'(0deg: 下→上) または 'horizontal'(270deg: 右→左)
 */
export function buildGradientCSS(
  gradient: GradientDef,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const { from, to, mid, overlay, customGradient } = gradient;
  const deg = direction === 'horizontal' ? '270deg' : '0deg';

  // カスタムグラデーションがある場合は方向を差し替えて使用
  let gradientPart: string;
  if (customGradient) {
    // customGradientの0degを指定方向に置換
    gradientPart = customGradient.replace(/0deg/g, deg);
  } else if (mid) {
    // 3点グラデーション (career-change用)
    gradientPart = `linear-gradient(${deg}, ${from} 0%, ${mid} 19%, ${to} 100%)`;
  } else {
    gradientPart = `linear-gradient(${deg}, ${from} 0%, ${to} 100%)`;
  }

  if (overlay) {
    return `linear-gradient(${deg}, ${overlay} 0%, ${overlay} 100%), ${gradientPart}`;
  }
  return gradientPart;
}
