/**
 * グラデーション定義（統一管理）
 *
 * ロードマップカード、ヒーローセクション、その他コンポーネントで使用するグラデーション定義
 * Figmaデザインに基づいた5つのプリセット
 */

// ============================================
// グラデーションプリセット型
// ============================================

export type GradientPreset =
  | 'career-change'  // UIUXデザイナー転職
  | 'ui-beginner'    // UIデザイン入門（Figma基礎）
  | 'ui-visual'      // UIビジュアル入門
  | 'info-arch'      // 情報設計基礎
  | 'ux-design';     // UXデザイン基礎

// ============================================
// グラデーション定義インターフェース
// ============================================

export interface GradientDef {
  /** 開始色 */
  from: string;
  /** 終了色 */
  to: string;
  /** 中間色（3点以上のグラデーション用） */
  mid?: string;
  /** オーバーレイ（暗くする用） */
  overlay?: string;
  /** 4点以上のカスタムグラデーション（完全なlinear-gradient記法） */
  customGradient?: string;
}

// ============================================
// グラデーション定義（Figmaから）
// ============================================

/**
 * ロードマップカード用グラデーション定義
 *
 * 各プリセットはFigmaデザインに基づいた配色とオーバーレイを含む
 */
export const GRADIENTS: Record<GradientPreset, GradientDef> = {
  'career-change': {
    from: '#482B4B',
    mid: '#2A2C42',
    to: '#141520',
    // 3点グラデーション + 12%黒オーバーレイ
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), linear-gradient(0deg, #482B4B 0%, #2A2C42 27%, #141520 100%)',
  },
  'ui-beginner': {
    from: '#684B4B',
    to: '#231C26',
    // 2点グラデーション + 12%黒オーバーレイ
    customGradient:
      'linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), linear-gradient(0deg, rgba(104, 75, 75, 1) 0%, rgba(35, 28, 38, 1) 100%)',
  },
  'ui-visual': {
    from: '#304750',
    to: '#5D5B65',
    // 既存0.2 + 追加0.12 = 0.32
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.32), rgba(0,0,0,0.32)), linear-gradient(0deg, #304750 0%, #5D5B65 100%)',
  },
  'info-arch': {
    from: '#214234',
    to: '#8D7746',
    // 既存0.3 + 追加0.12 = 0.42
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.42), rgba(0,0,0,0.42)), linear-gradient(0deg, #214234 0%, #8D7746 100%)',
  },
  'ux-design': {
    from: '#F1BAC1',
    to: '#2F3F6D',
    // 既存0.4 + 追加0.12 = 0.52、4点グラデーション（反転）
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.52), rgba(0,0,0,0.52)), linear-gradient(0deg, #F1BAC1 0%, #E27979 12%, #764749 54%, #2F3F6D 100%)',
  },
};

/**
 * グラデーションCSSを取得
 *
 * @param preset - グラデーションプリセット
 * @returns グラデーションCSS文字列
 */
export function getGradientCSS(preset: GradientPreset): string {
  const gradient = GRADIENTS[preset];
  if (!gradient) {
    console.warn(`Unknown gradient preset: ${preset}`);
    return GRADIENTS['career-change'].customGradient || '';
  }

  // customGradientが定義されている場合はそれを優先
  if (gradient.customGradient) {
    return gradient.customGradient;
  }

  // 3点グラデーション
  if (gradient.mid) {
    return `linear-gradient(0deg, ${gradient.from} 0%, ${gradient.mid} 50%, ${gradient.to} 100%)`;
  }

  // 2点グラデーション
  return `linear-gradient(0deg, ${gradient.from} 0%, ${gradient.to} 100%)`;
}

/**
 * Tailwindクラス用のfrom/to色を取得
 *
 * @param preset - グラデーションプリセット
 * @returns { from: string, to: string }
 */
export function getGradientColors(preset: GradientPreset): { from: string; to: string } {
  const gradient = GRADIENTS[preset];
  return {
    from: gradient.from,
    to: gradient.to,
  };
}
