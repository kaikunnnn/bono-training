import type { CSSProperties } from "react";

/**
 * /studio 配下の社内クリエイティブツール一覧。
 * 新しいツールを増やしたらここに追記するだけで一覧に出る。
 */
export interface StudioTool {
  slug: string;
  title: string;
  description: string;
  meta: string;
  /** カード上部のサムネイル背景(そのツールの雰囲気を表すCSSグラデーション) */
  thumbnailStyle: CSSProperties;
}

export const STUDIO_TOOLS: StudioTool[] = [
  {
    slug: "gradient",
    title: "Brand Gradient Studio",
    description:
      "ブランドカラーのグラデーション＋グレイン＋らせん模様をWebGLで生成する。比率を選んでPNG書き出しまでできる。",
    meta: "WebGL · 画像素材",
    thumbnailStyle: {
      background: "linear-gradient(115deg, #3a6fb0 0%, #e88a5a 55%, #c94f3d 100%)",
    },
  },
  {
    slug: "shapes",
    title: "Shape Playground",
    description:
      "らせん・放射ドット・絡まる輪など6種類の幾何学図形をSVGで生成する。Figmaに直接ペーストできる。",
    meta: "SVG · 図解素材",
    thumbnailStyle: {
      background: "#ffffff",
      backgroundImage:
        "repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 8px, rgba(2,23,16,0.5) 8px, rgba(2,23,16,0.5) 9px)",
    },
  },
  {
    slug: "dots",
    title: "Dot Effects Playground",
    description:
      "ドット表現4種(まばら / ハーフトーン / 朝日 / グラデ線)をWebGLで生成する。",
    meta: "WebGL · 画像素材",
    thumbnailStyle: {
      background: "#eef0dd",
      backgroundImage:
        "radial-gradient(circle, #7a9b52 2px, transparent 2.5px)",
      backgroundSize: "14px 14px",
    },
  },
  {
    slug: "frosted-bloom",
    title: "Frosted Bloom — Motif Studio",
    description:
      "方向性ブラーの霧背景＋モチーフ(四つ葉/五弁/六弁/桜/星/丸)をCanvasで生成する。見出し付きキービジュアル向け。",
    meta: "Canvas · キービジュアル",
    thumbnailStyle: {
      background:
        "radial-gradient(circle at 30% 30%, #2f9fb8 0%, transparent 55%), radial-gradient(circle at 70% 65%, #8fd4c4 0%, transparent 50%), #0d3b30",
    },
  },
  {
    slug: "photo-frosted",
    title: "Photo Frosted Grain",
    description:
      "アップした写真にブラー＋ブランド色かぶせ＋グレインを重ねる。見出し付きでPNG書き出しできる。",
    meta: "写真加工 · キービジュアル",
    thumbnailStyle: {
      background:
        "linear-gradient(rgba(46,139,111,0.35), rgba(46,139,111,0.35)), linear-gradient(135deg, #2a2a2a 0%, #111 100%)",
    },
  },
  {
    slug: "favicon",
    title: "Favicon Studio",
    description:
      "BONOロゴの「B」をモチーフに、ベータ版だとわかる線画ベースのfaviconを生成する。3パターン(ブループリント/実線+βドット/グラデーション背景)を用意済み。",
    meta: "SVG・PNG · アイコン素材",
    thumbnailStyle: {
      background: "#102720",
      backgroundImage:
        "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(250,251,251,0.35) 6px, rgba(250,251,251,0.35) 7px)",
    },
  },
  {
    slug: "clouds",
    title: "Cloud Sky Studio",
    description: "雲＋空を背景素材として生成する。朝・昼・夜で色味が変わる。",
    meta: "Canvas · キービジュアル",
    thumbnailStyle: {
      background: "linear-gradient(180deg, #6ec3f4 0%, #eaf6ff 100%)",
    },
  },
  {
    slug: "stars",
    title: "Star Sky Studio",
    description: "星＋空を背景素材として生成する。夕・夜・深夜で色味が変わる。",
    meta: "Canvas · キービジュアル",
    thumbnailStyle: {
      backgroundImage:
        "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 60% 20%, #fff, transparent), radial-gradient(1.5px 1.5px at 80% 45%, #fff, transparent), radial-gradient(1px 1px at 35% 65%, #fff, transparent), linear-gradient(180deg, #0a1030 0%, #1a2550 100%)",
    },
  },
  {
    slug: "mountains",
    title: "Mountain Sky Studio",
    description: "山＋空を背景素材として生成する。朝・昼・夕で色味が変わる。",
    meta: "Canvas · キービジュアル",
    thumbnailStyle: {
      backgroundImage:
        "linear-gradient(to top, #3c4d43 0%, #3c4d43 20%, transparent 20%), linear-gradient(to top, #6d8577 0%, #6d8577 32%, transparent 32%), linear-gradient(180deg, #6ec3f4 0%, #dff1fb 100%)",
    },
  },
];
