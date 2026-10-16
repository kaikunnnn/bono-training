/* ============================================================
   config.mjs — チェックの記事コンフィグ（単一ソース）
   全 check-*.mjs と run-all.mjs はこの配列を駆動する。
   記事を増やすときはここに1行足すだけで全チェックが対象化する。
   ============================================================ */

/* 検査対象の記事。
   - expectedItems: <section class="item"> の期待数
   - svgHexCheck:   SVG内の生hex（fill/stroke/stop-color/style属性）を禁止するか
                    （J2: ループ1では color.html のみ true。spacing.html のSVGは
                     生hexを含むためループ2でリトロフィット予定） */
export const ARTICLES = [
  { file: "spacing.html", expectedItems: 9, svgHexCheck: false },
  { file: "color.html", expectedItems: 9, svgHexCheck: true },
];

/* <style>内の生hex（トークン経由でない色使用）を検査するファイル */
export const STYLE_HEX_FILES = ["index.html", "spacing.html", "color.html"];

/* D-2 コントラスト検査ペア（chromeテキストのみ・specimenは含めない）。
   両記事は tokens.css を共有するため同一ペアで検査する。 */
export const CONTRAST_PAIRS = [
  { fg: "--color-ink", bg: "--color-bg", min: 4.5, note: "本文 on 紙" },
  { fg: "--color-ink", bg: "--color-surface", min: 4.5, note: "本文 on カード" },
  { fg: "--color-ink", bg: "--color-surface-2", min: 4.5, note: "本文 on パネル" },
  { fg: "--color-ink-2", bg: "--color-bg", min: 4.5, note: "補助 on 紙" },
  { fg: "--color-ink-2", bg: "--color-surface", min: 4.5, note: "補助 on カード" },
  { fg: "--color-ink-3", bg: "--color-bg", min: 4.5, note: "メタ on 紙" },
  { fg: "--color-ink-3", bg: "--color-surface", min: 4.5, note: "メタ on カード" },
  { fg: "--color-ink-3", bg: "--color-surface-2", min: 4.5, note: "メタ on パネル" },
  { fg: "--color-accent", bg: "--color-bg", min: 4.5, note: "リンク on 紙" },
  { fg: "--color-accent", bg: "--color-surface", min: 4.5, note: "リンク on カード" },
  { fg: "--color-accent", bg: "--color-surface-2", min: 4.5, note: "リンク on パネル" },
  { fg: "--color-fact", bg: "--color-fact-bg", min: 4.5, note: "事実ラベル文字 on 事実背景" },
  { fg: "--color-interp", bg: "--color-interp-bg", min: 4.5, note: "解釈ラベル文字 on 解釈背景" },
  { fg: "--color-ink", bg: "--color-fact-bg", min: 4.5, note: "事実ブロック本文 on 事実背景" },
  { fg: "--color-ink", bg: "--color-interp-bg", min: 4.5, note: "解釈ブロック本文 on 解釈背景" },
  /* ヒーロー: 白文字を全グラデ停止点で 4.5:1 */
  { fg: "--color-on-grad", bg: "--grad-1", min: 4.5, note: "ヒーロー白文字 on grad-1" },
  { fg: "--color-on-grad", bg: "--grad-2", min: 4.5, note: "ヒーロー白文字 on grad-2" },
  { fg: "--color-on-grad", bg: "--grad-3", min: 4.5, note: "ヒーロー白文字 on grad-3" },
  { fg: "--color-on-grad", bg: "--grad-4", min: 4.5, note: "ヒーロー白文字 on grad-4" },
];
