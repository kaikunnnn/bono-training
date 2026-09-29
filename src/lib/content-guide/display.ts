/**
 * コンテンツガイド（診断）: 見せ方だけの補助データ。
 *
 * 出典: rebono `02_Projects/15_コンテンツガイド/11_UI改善仕様書.md` §2A
 * - 短い見出し（カード・道筋の見出し）。状態の言葉（長い文）は skill-states.ts のまま残し、補足として併記する。
 * - 段階のグループ（ステップ1の h2）。
 * ロジック・前提関係・道筋には関与しない。
 */

import { LEARNING_ORDER, SKILL_STATES, type SkillStateId } from "./skill-states";

/** 短い見出し（11_仕様書 §2A の案。オーナー修正可） */
export const SHORT_TITLES: Record<SkillStateId, string> = {
  S1: "1画面をつくる",
  S2: "デザインシステムを使う",
  S3: "Figmaで画面をつくる",
  S4: "プロトタイプで動きを見る",
  S5: "動くものまで作る",
  S6: "使いやすいUIの基本",
  S7: "情報設計をする",
  S8: "課題を解くUIを提案する",
  S9: "ユーザーリサーチをする",
  S10: "調査から検証まで通す",
  S11: "デザインを批評・改善する",
  S12: "ユーザビリティテストをする",
  S13: "デザインの理由を説明する",
  S14: "ケーススタディにまとめる",
  S15: "提案して合意を得る",
  S16: "AIでUIワークフローを回す",
  S17: "良いUIを見分ける",
  S18: "事業とユーザー価値をつなぐ",
};

export type StageGroupId = "basic" | "practice" | "advanced";

export interface StageGroup {
  id: StageGroupId;
  /** グループの見出し（平易な言葉） */
  title: string;
  /** 段階の名前（補助表示） */
  stageLabel: string;
  stateIds: SkillStateId[];
}

/**
 * 段階でグループ化する（基礎／実践／応用）。グループ内は学ぶ順。
 * 段階が「基礎〜実践」の S11 は、学ぶ順が基礎の直後のため「基礎」に入れる。
 */
function stageGroupOf(id: SkillStateId): StageGroupId {
  const stage = SKILL_STATES[id].stage;
  if (stage === "基礎" || stage === "基礎〜実践") return "basic";
  if (stage === "実践") return "practice";
  return "advanced";
}

export const STAGE_GROUPS: readonly StageGroup[] = (
  [
    { id: "basic", title: "まず身につけたい基本", stageLabel: "基礎" },
    { id: "practice", title: "実際に使える力にする", stageLabel: "実践" },
    { id: "advanced", title: "さらに伸ばす", stageLabel: "応用" },
  ] as const
).map((g) => ({
  ...g,
  stateIds: LEARNING_ORDER.filter((id) => stageGroupOf(id) === g.id),
}));
