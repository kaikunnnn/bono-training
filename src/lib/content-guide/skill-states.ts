/**
 * コンテンツガイド（診断）: スキル状態 S1〜S18 の静的データ。
 *
 * 出典（2026-09-29 時点のスナップショット。言葉は変えない）:
 * - 状態の言葉・領域・段階: rebono `02_Projects/15_コンテンツガイド/08_スキル状態のゴール一覧_叩き台.md`
 * - 前提関係・学ぶ順:        同 `09_前提関係と道筋.md` / `10_プロトタイプ仕様書.md` §4
 *
 * 純粋なデータのみ（Server/Client どちらからも import 可能）。
 */

export const SKILL_STATE_IDS = [
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "S11",
  "S12",
  "S13",
  "S14",
  "S15",
  "S16",
  "S17",
  "S18",
] as const;

export type SkillStateId = (typeof SKILL_STATE_IDS)[number];

export type SkillStage = "基礎" | "実践" | "応用" | "基礎〜実践";

export interface SkillState {
  id: SkillStateId;
  /** 領域（ユーザーには小さな補助表示のみ） */
  domain: string;
  /** 段階 */
  stage: SkillStage;
  /** スキル状態の言葉（〜できる）。08 の表のまま */
  label: string;
  /** 直接の前提 */
  prerequisites: readonly SkillStateId[];
}

export const SKILL_STATES: Record<SkillStateId, SkillState> = {
  S1: {
    id: "S1",
    domain: "ビジュアルデザイン",
    stage: "基礎",
    label: "UIの基本要素（レイアウト・余白・配色・タイポグラフィ）を使って、1画面を作成できる",
    prerequisites: ["S3"],
  },
  S2: {
    id: "S2",
    domain: "ビジュアルデザイン",
    stage: "応用",
    label: "デザインシステム（コンポーネント・スタイル）を使って、一貫したUIを作れる",
    prerequisites: ["S1"],
  },
  S3: {
    id: "S3",
    domain: "ツール・プロトタイピング",
    stage: "基礎",
    label: "Figmaなどのデザインツールで、ワイヤーフレームと画面を作成できる",
    prerequisites: [],
  },
  S4: {
    id: "S4",
    domain: "ツール・プロトタイピング",
    stage: "実践",
    label: "クリックできるプロトタイプを作り、操作の流れを確認できる",
    prerequisites: ["S1"],
  },
  S5: {
    id: "S5",
    domain: "ツール・プロトタイピング",
    stage: "応用",
    label: "AIやコードを使って、動くプロトタイプ（実装）まで作れる",
    prerequisites: ["S4"],
  },
  S6: {
    id: "S6",
    domain: "情報設計・インタラクション",
    stage: "基礎",
    label:
      "UIの基本パターン（ナビゲーション・フォーム・リストなど）を使い、基本的な使い勝手を満たすUIを設計できる",
    prerequisites: ["S1"],
  },
  S7: {
    id: "S7",
    domain: "情報設計・インタラクション",
    stage: "実践",
    label: "要件を整理し、情報設計（情報構造・画面遷移・ワイヤーフレーム）を作成できる",
    prerequisites: ["S6"],
  },
  S8: {
    id: "S8",
    domain: "ユーザー理解・課題解決",
    stage: "実践",
    label: "目的とユーザー課題をもとに、課題を解決するUIを提案できる",
    prerequisites: ["S7"],
  },
  S9: {
    id: "S9",
    domain: "ユーザー理解・課題解決",
    stage: "実践",
    label: "ユーザーリサーチ（インタビュー・観察）を行い、課題を定義できる",
    prerequisites: [],
  },
  S10: {
    id: "S10",
    domain: "ユーザー理解・課題解決",
    stage: "応用",
    label: "ユーザーリサーチをもとに、調査→課題定義→解決策→検証まで一連でやり切れる",
    prerequisites: ["S8", "S9", "S11"],
  },
  S11: {
    id: "S11",
    domain: "評価・改善",
    stage: "基礎〜実践",
    label: "自分のデザインを評価基準で批評し、改善できる",
    prerequisites: ["S1"],
  },
  S12: {
    id: "S12",
    domain: "評価・改善",
    stage: "応用",
    label: "ユーザビリティテストを実施し、結果を改善につなげられる",
    prerequisites: ["S4", "S11"],
  },
  S13: {
    id: "S13",
    domain: "伝える・つなぐ",
    stage: "実践",
    label: "デザインの意図・根拠を、自分の言葉で説明できる",
    prerequisites: ["S6"],
  },
  S14: {
    id: "S14",
    domain: "伝える・つなぐ",
    stage: "実践",
    label: "デザインプロセスを、ケーススタディとして整理して伝えられる",
    prerequisites: ["S8", "S13"],
  },
  S15: {
    id: "S15",
    domain: "伝える・つなぐ",
    stage: "応用",
    label: "関係者（PM・エンジニア）にデザインを提案し、合意を得られる",
    prerequisites: ["S7", "S13"],
  },
  S16: {
    id: "S16",
    domain: "AI活用",
    stage: "実践",
    label: "AIを使ったUIデザインのワークフロー（リサーチ・アイデア出し・画面作成・検証）を踏める",
    prerequisites: ["S1"],
  },
  S17: {
    id: "S17",
    domain: "デザインを理解して使う（デザイナー以外向け）",
    stage: "基礎",
    label: "良いUIと悪いUIを見分け、基本用語でデザイナーと共通の言葉で話せる",
    prerequisites: [],
  },
  S18: {
    id: "S18",
    domain: "事業・サービスの視点",
    stage: "応用",
    label: "事業・サービス全体と、ユーザー価値をつなげて設計できる",
    prerequisites: ["S8", "S9"],
  },
};

/** 学ぶ順（前提関係のトポロジカル順）。10_仕様書 §4 のまま */
export const LEARNING_ORDER: readonly SkillStateId[] = [
  "S17",
  "S3",
  "S1",
  "S6",
  "S11",
  "S7",
  "S4",
  "S13",
  "S9",
  "S8",
  "S16",
  "S2",
  "S12",
  "S5",
  "S15",
  "S14",
  "S10",
  "S18",
];

/** 1状態あたりの目安期間（週） */
export const WEEKS_PER_STATE = 2;

/**
 * 目標選択の並び。似た状態が近くに並ぶよう、領域の順（08 の表の順）でまとめる。
 * 領域名は選択肢のグループの小さな補助ラベルとしてのみ使う。
 */
export interface GoalGroup {
  domain: string;
  stateIds: readonly SkillStateId[];
}

export const GOAL_GROUPS: readonly GoalGroup[] = (() => {
  const groups: GoalGroup[] = [];
  for (const id of SKILL_STATE_IDS) {
    const { domain } = SKILL_STATES[id];
    const last = groups[groups.length - 1];
    if (last && last.domain === domain) {
      (last.stateIds as SkillStateId[]).push(id);
    } else {
      groups.push({ domain, stateIds: [id] });
    }
  }
  return groups;
})();

export function isSkillStateId(value: unknown): value is SkillStateId {
  return typeof value === "string" && (SKILL_STATE_IDS as readonly string[]).includes(value);
}
