/**
 * BONO Effects Kit のプリセット定義。
 * ツールごとに配列で管理し、増やしたいときはここに追記するだけでよい。
 */

/** Dot Effects Playground: [色1, 色2, 色3, 点/他] */
export const DOT_EFFECT_PRESETS: Record<string, [string, string, string, string]> = {
  若草: ["#eef0dd", "#d4e0b0", "#7a9b52", "#5f7d3a"],
  曙: ["#2a2448", "#c98a5e", "#ffe6a8", "#e0673a"],
  ミント: ["#dff0ea", "#a9d8c8", "#4d9e86", "#2f6f5c"],
  モノ: ["#eef0f3", "#c3cad6", "#8f99aa", "#3a4150"],
};

/** Frosted Bloom Motif Studio: [色1, 色2, 色3, 色4, 花色, 文字色] */
export const FROSTED_BLOOM_PRESETS: Record<
  string,
  [string, string, string, string, string, string]
> = {
  深緑: ["#1c6b52", "#2f9fb8", "#0d3b30", "#8fd4c4", "#eaf3e0", "#eef0dd"],
  曙: ["#3a2a5c", "#c98a5e", "#241a3d", "#ffcf9e", "#ffe9cf", "#fff2e0"],
  若草: ["#6f9b52", "#c7d99a", "#3f5e2a", "#d9e8b0", "#f4f7e6", "#2f3a1e"],
  ミント: ["#3aa088", "#7fd0c8", "#1f5f52", "#bfeadf", "#f0faf5", "#123a30"],
};
