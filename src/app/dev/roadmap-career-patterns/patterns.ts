/**
 * /dev/roadmap-career-patterns のパターン定義（#282）
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

export const PATTERN_KEYS = ["now", "A", "B", "C", "D", "E", "F", "G", "H", "I", "all", "J", "K", "L", "guide"] as const;
export type PatternKey = (typeof PATTERN_KEYS)[number];
export type SinglePatternKey = Exclude<PatternKey, "now" | "all" | "guide">;

/** guide の見え方（K はログイン中、J・L は未ログイン） */
export type GuideView = "guest" | "member";

export interface PatternDef {
  key: PatternKey;
  /** 切り替えボタンの表示 */
  label: string;
  /** 何を変えたか（1行） */
  change: string;
  /** 効く仮説 */
  hypotheses: HypothesisId[];
  /** #295 の案の番号（J 以降） */
  proposal?: string;
  /** #295 の案の狙い（J 以降） */
  aim?: string;
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
  {
    key: "J",
    label: "J",
    change: "ロードマップの流れの各ステップに「最初の1本」を足す。一覧・順番・リンクはそのまま",
    hypotheses: [],
    proposal: "#295 案2",
    aim: "個別ロードマップへ行かなくても、次のレッスンが分かる",
  },
  {
    key: "K",
    label: "K",
    change: "ログイン中の「現在地と次の1本」をヒーロー直下に出す（表示は例の固定データ）",
    hypotheses: [],
    proposal: "#295 案4",
    aim: "1本終えて戻ったときに、次を確かめられる",
  },
  {
    key: "L",
    label: "L",
    change: "ヒーローの2番目のボタンを「無料で始める」にして次の1本を出す。「カリキュラムへ」は文字リンクへ",
    hypotheses: [],
    proposal: "#295 案5",
    aim: "料金を見て閉じる前に、無料で始められると分かる",
  },
  {
    key: "guide",
    label: "guide",
    change: "J＋K＋L をまとめた版。未ログインは J＋L、ログイン中は J＋K。AIのステップ入り",
    hypotheses: [],
    proposal: "#295 案1・2・4・5",
    aim: "迷わず動けて、戻って次を確かめられるか",
  },
];

const ALL_TARGETS: readonly SinglePatternKey[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

export function normalizePattern(raw: string | string[] | undefined): PatternKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "now";
  const found = PATTERN_KEYS.find((k) => k.toLowerCase() === value.toLowerCase());
  return found ?? "now";
}

export function normalizeView(raw: string | string[] | undefined): GuideView {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "member" ? "member" : "guest";
}

/** AIのステップを足すか。guide は既定であり（ai=0 で外す）、それ以外は既定でなし（ai=1 で足す） */
export function resolveAiStep(current: PatternKey, raw: string | string[] | undefined): boolean {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return current === "guide" ? value !== "0" : value === "1";
}

/**
 * 選択中のパターンに、ある単体パターンが含まれるか
 * - all は A〜I だけを含む（J 以降は入れない）
 * - guide は view=guest なら J＋L、view=member なら J＋K
 */
export function includesPattern(current: PatternKey, target: SinglePatternKey, view: GuideView = "guest"): boolean {
  if (current === "all") return ALL_TARGETS.includes(target);
  if (current === "guide") return target === "J" || target === (view === "member" ? "K" : "L");
  return current === target;
}
