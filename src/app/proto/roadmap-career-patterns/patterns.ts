/**
 * /proto/roadmap-career-patterns のパターン定義（#282）
 * 試作バーと本文の出し分けが同じ定義を参照する。
 */

export const HYPOTHESES = {
  H1: "売り込みに見える",
  H2: "転職できる証拠がない",
  H3: "中身が見えない",
  H4: "長くて迷う",
  H5: "YouTubeから来た理由とずれる",
} as const;

export type HypothesisId = keyof typeof HYPOTHESES;

export const PATTERN_KEYS = ["now", "A", "B", "C", "D", "E", "F", "G", "H", "I", "all"] as const;
export type PatternKey = (typeof PATTERN_KEYS)[number];
export type SinglePatternKey = Exclude<PatternKey, "now" | "all">;

export interface PatternDef {
  key: PatternKey;
  /** 切り替えボタンの表示 */
  label: string;
  /** 何を変えたか（1行） */
  change: string;
  /** 効く仮説 */
  hypotheses: HypothesisId[];
}

export const PATTERNS: PatternDef[] = [
  { key: "now", label: "現状", change: "本番ページと同じ並び（未会員の見え方に固定）", hypotheses: [] },
  { key: "A", label: "A", change: "ヒーロー直下に転職した人を1人（こじさん）", hypotheses: ["H1", "H2"] },
  { key: "B", label: "B", change: "流れの直後に「BONOで学んで転職した人」3人＋料金への小さな導線", hypotheses: ["H2"] },
  { key: "C", label: "C", change: "「独学で転職できるか不安」のカードに転職した人の話へのリンクを足す", hypotheses: ["H2"] },
  { key: "D", label: "D", change: "料金枠をヒーローから流れの後ろへ移し、主ボタンを「カリキュラムを見る」に", hypotheses: ["H1", "H3"] },
  { key: "E", label: "E", change: "ヒーロー直下に「何が身につくか」（4項目＋期間）", hypotheses: ["H3"] },
  { key: "F", label: "F", change: "スマホだけ画面下に「料金を見る／カリキュラムへ」の固定バー（上に戻すと出る）", hypotheses: ["H4"] },
  { key: "G", label: "G", change: "目次を「このページの内容」付きのチップ横並びに", hypotheses: ["H4"] },
  { key: "H", label: "H", change: "ヒーロー直下に運営者（カイクン）の顔・一言・YouTube", hypotheses: ["H5"] },
  { key: "I", label: "I", change: "よくある質問をカリキュラムの前に", hypotheses: ["H2", "H3"] },
  {
    key: "all",
    label: "全部入り",
    change: "A〜Iを全部入れた版（ヒーローはD、目次はG、変化はC）",
    hypotheses: ["H1", "H2", "H3", "H4", "H5"],
  },
];

export function normalizePattern(raw: string | string[] | undefined): PatternKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "now";
  const found = PATTERN_KEYS.find((k) => k.toLowerCase() === value.toLowerCase());
  return found ?? "now";
}

/** 選択中のパターンに、ある単体パターンが含まれるか（all は A〜I 全部を含む） */
export function includesPattern(current: PatternKey, target: SinglePatternKey): boolean {
  if (current === "all") return true;
  return current === target;
}
