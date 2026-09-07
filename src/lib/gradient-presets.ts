/**
 * Brand Gradient Studio のプリセット定義。
 * プリセットを増やしたいときはここに追記するだけでよい（[色1, 色2, 色3] の hex 3点）。
 */
export const BRAND_PRESETS: Record<string, [string, string, string]> = {
  夕暮れ: ["#3a6fb0", "#e88a5a", "#c94f3d"],
  ミント: ["#9fd6c4", "#e7dcc0", "#d99a8f"],
  モノ: ["#e9edf3", "#c3cad6", "#8f99aa"],
  桃: ["#f3c9b8", "#e8a48f", "#b98a9c"],
  BONO仮: ["#1b2a4a", "#3d7bd9", "#7ad0c8"], // 例。実際の値に差し替え
};

export type BrandPresetName = keyof typeof BRAND_PRESETS;
