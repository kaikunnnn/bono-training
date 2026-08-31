/**
 * 相談導線の配置パターン定義（クエリ値のホワイトリスト）。
 *
 * URL クエリ `c`（C1 既定 | C2 | C3 | C4）で一度に 1 つのパターンだけを有効化する。
 * どのパターンでも主CTA（課金＝PlanCtaButton）は不変で、相談導線（セカンダリー）を
 * 該当位置にのみ差し込む。
 */

export const CONSULT_PATTERNS = ["C1", "C2", "C3", "C4"] as const;
export type ConsultPattern = (typeof CONSULT_PATTERNS)[number];
export const DEFAULT_CONSULT_PATTERN: ConsultPattern = "C1";

/** クエリ値のホワイトリスト検証（不正値は既定 C1 へフォールバック）。 */
export function parseConsultPattern(v: string | null): ConsultPattern {
  return CONSULT_PATTERNS.includes(v as ConsultPattern)
    ? (v as ConsultPattern)
    : DEFAULT_CONSULT_PATTERN;
}

/** 確認用スイッチャのラベルと意図注記。 */
export const CONSULT_OPTIONS: {
  key: ConsultPattern;
  label: string;
  note: string;
}[] = [
  {
    key: "C1",
    label: "C1 末尾セーフティネット",
    note: "C1: 下部再掲カードの後に相談ブロックを置き、読了・未購入層を拾う。",
  },
  {
    key: "C2",
    label: "C2 カード直下サブリンク",
    note: "C2: 上の価格カード直下に小さなテキストリンク。迷いのピークに控えめ設置。",
  },
  {
    key: "C3",
    label: "C3 カード直下ブロック",
    note: "C3: 上の価格カード直下に相談ブロック（block型）。迷いのピークで無料相談へ拾う。",
  },
  {
    key: "C4",
    label: "C4 スティッキー最小",
    note: "C4: 右下に小さな固定ボタンを常設。レイアウトを侵さないセーフティネット。",
  },
];
