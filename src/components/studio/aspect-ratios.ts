export const ASPECT_RATIOS = [
  { key: "1:1", label: "1:1 正方形", w: 1, h: 1 },
  { key: "16:9", label: "16:9 横長", w: 16, h: 9 },
  { key: "4:3", label: "4:3", w: 4, h: 3 },
  { key: "3:2", label: "3:2", w: 3, h: 2 },
] as const;

export type AspectRatioKey = (typeof ASPECT_RATIOS)[number]["key"];

export function findAspectRatio(key: AspectRatioKey) {
  return ASPECT_RATIOS.find((r) => r.key === key) ?? ASPECT_RATIOS[0];
}

/** 長辺を longEdge に固定した書き出しピクセルサイズを、選んだ比率から計算する */
export function computeExportSize(ratio: { w: number; h: number }, longEdge: number) {
  const isWide = ratio.w >= ratio.h;
  const width = isWide ? longEdge : Math.round((longEdge * ratio.w) / ratio.h);
  const height = isWide ? Math.round((longEdge * ratio.h) / ratio.w) : longEdge;
  return { width, height };
}
