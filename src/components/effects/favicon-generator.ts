import {
  B_MARK_PATH,
  B_MARK_SCALE,
  B_MARK_TRANSFORM,
  FAVICON_VIEWBOX,
} from "./bono-b-mark";

export type FaviconPattern = "blueprint" | "solidBeta" | "gradient";

export interface FaviconLineStyle {
  /** "none" = 背景を描かない(グラデーション背景と合成する用の透明版) */
  background: "flat" | "none";
  bgColor: string;
  /** 方眼グリッドを重ねるかどうか */
  showGrid: boolean;
  guideColor: string;
  lineColor: string;
  /** 最終的な見た目のストローク幅(viewBox 100 基準) */
  strokeWidth: number;
  betaDot: boolean;
  betaDotColor: string;
}

export const FAVICON_LINE_PRESETS: Record<"blueprint" | "solidBeta", FaviconLineStyle> = {
  blueprint: {
    background: "none",
    bgColor: "#e9edf3",
    showGrid: true,
    guideColor: "#FAFBFB",
    lineColor: "#FAFBFB",
    strokeWidth: 2.6,
    betaDot: false,
    betaDotColor: "#FF9900",
  },
  solidBeta: {
    background: "flat",
    bgColor: "#FFFFFF",
    showGrid: false,
    guideColor: "#102720",
    lineColor: "#102720",
    strokeWidth: 2.8,
    betaDot: true,
    betaDotColor: "#FF9900",
  },
};

/** 方眼(グラフ用紙)のみの、ごく薄いグリッド線 */
function buildGridGuides(size: number, color: string): string {
  const step = size / 8;
  let grid = "";
  for (let i = 1; i < 8; i++) {
    const pos = (i * step).toFixed(2);
    grid += `<line x1="${pos}" y1="0" x2="${pos}" y2="${size}" stroke="${color}" stroke-width="0.4" opacity="0.4"/>`;
    grid += `<line x1="0" y1="${pos}" x2="${size}" y2="${pos}" stroke="${color}" stroke-width="0.4" opacity="0.4"/>`;
  }
  return `<g>${grid}</g>`;
}

/**
 * "B"のラインアートSVGを組み立てる。background="none"なら背景を描かず、
 * グラデーション背景(BrandGradient)の上に重ねる透明版として使う。
 */
export function buildFaviconSVG(style: FaviconLineStyle): string {
  const S = FAVICON_VIEWBOX;
  let bg = "";
  if (style.background === "flat") {
    bg += `<rect width="${S}" height="${S}" fill="${style.bgColor}"/>`;
  }
  if (style.showGrid) {
    bg += buildGridGuides(S, style.guideColor);
  }

  const strokeWidthInGroup = (style.strokeWidth / B_MARK_SCALE).toFixed(4);
  const betaDot = style.betaDot
    ? `<circle cx="${S * 0.815}" cy="${S * 0.815}" r="${S * 0.06}" fill="${style.betaDotColor}"/>`
    : "";

  // 背景がグラデーション合成(background="none")のときは、背景の明暗が読めないので
  // 線の下にダークハローを敷いて、どんな背景色に乗ってもコントラストが保たれるようにする
  const halo =
    style.background === "none"
      ? `<path d="${B_MARK_PATH}" fill="none" stroke="rgba(2,23,16,0.4)" stroke-width="${((style.strokeWidth * 1.9) / B_MARK_SCALE).toFixed(4)}" stroke-linejoin="round" stroke-linecap="round"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">${bg}<g transform="${B_MARK_TRANSFORM}">${halo}<path d="${B_MARK_PATH}" fill="none" stroke="${style.lineColor}" stroke-width="${strokeWidthInGroup}" stroke-linejoin="round" stroke-linecap="round"/></g>${betaDot}</svg>`;
}
