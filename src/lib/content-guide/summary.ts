/**
 * コンテンツガイド（診断）: 診断結果の要約（A案・B案の共通。12_診断UI_A案B案_仕様書 §6）。
 *
 * - あなたの現在地: 一言のラベル（ゴールまでの進み具合で判定。13_夜明けデザイン仕様書 §5）と、
 *   補助として段階ごとの「できている数／全体の数」（基礎5・実践7・応用6。チェック + 前提の閉包で数える）。
 * - 目指す状態 / 次に身につける状態 / ゴールまでの残りステップ・週数。
 *
 * 純粋関数のみ。道筋のロジック（path.ts）は変えず、その結果から数えるだけ。
 */

import { STAGE_GROUPS, type StageGroupId } from "./display";
import { closure, computePath, doneStates } from "./path";
import { LEARNING_ORDER, type SkillStateId } from "./skill-states";

export interface StageCount {
  id: StageGroupId;
  /** 段階の名前（基礎／実践／応用） */
  stageLabel: string;
  done: number;
  total: number;
}

/**
 * 現在地のラベル（夜明けの言葉。13_夜明けデザイン仕様書 §5）。
 * 段階別の数では6つ中3つが決して出なかった（12_ の既定値）ため、ゴールまでの進み具合で決める。
 */
export const POSITION_LABELS = {
  none: "夜明け前。ここから、日が昇ります",
  early: "朝日が、差し始めています",
  middle: "東の空が、明るくなってきました",
  high: "日が、高く昇ってきました",
  last: "もう、朝の光のなかにいます。あと一歩です",
} as const;

export type PositionLabel = (typeof POSITION_LABELS)[keyof typeof POSITION_LABELS];

export interface DiagnosisSummary {
  goal: SkillStateId;
  /** 次に身につける状態（= 道筋の先頭） */
  next: SkillStateId;
  /** 段階ごとの できている数／全体（基礎・実践・応用の順） */
  stages: StageCount[];
  /** できている状態の合計（18個のうち） */
  doneTotal: number;
  /** 現在地のラベル（ゴールまでの進み具合 progress で決める） */
  label: PositionLabel;
  /** ゴールまでの進み具合 = できている状態 ÷ 道筋の全状態（目標の前提の閉包。目標を含む）。0〜1 */
  progress: number;
  /** 目標に必要な状態の数（目標を含む） */
  requiredTotal: number;
  /** 目標に必要な状態のうち、できている数 */
  requiredDone: number;
  /** ゴールまでの残りステップ（目標を含む） */
  remainingSteps: number;
  /** ゴールまでの目安（週） */
  weeks: number;
}

/**
 * 進み具合からラベルを決める（13_ §5 の表）。
 * - できている状態が0（前提がない目標を含む） → 夜明け前
 * - 目標の前提がすべてできている（残りが目標だけ） → もう、朝の光のなか
 * - それ以外は p = できている ÷ 全体 で 1/3・2/3 を境に3段階
 */
export function positionLabel(requiredDone: number, requiredTotal: number): PositionLabel {
  if (requiredDone <= 0 || requiredTotal <= 0) return POSITION_LABELS.none;
  if (requiredDone >= requiredTotal - 1) return POSITION_LABELS.last;
  const p = requiredDone / requiredTotal;
  if (p < 1 / 3) return POSITION_LABELS.early;
  if (p < 2 / 3) return POSITION_LABELS.middle;
  return POSITION_LABELS.high;
}

/** 段階ごとの できている数（done は「チェック + 前提の閉包」） */
export function stageCounts(done: ReadonlySet<SkillStateId>): StageCount[] {
  return STAGE_GROUPS.map((g) => ({
    id: g.id,
    stageLabel: g.stageLabel,
    done: g.stateIds.filter((id) => done.has(id)).length,
    total: g.stateIds.length,
  }));
}

export function computeSummary(goal: SkillStateId, checked: Iterable<SkillStateId> = []): DiagnosisSummary {
  const checkedList = [...checked].filter((id) => id !== goal);
  const { path, first, weeks } = computePath(goal, checkedList);
  const done = doneStates(checkedList);
  const stages = stageCounts(done);
  const required = LEARNING_ORDER.filter((id) => closure([goal]).has(id));
  const requiredDone = required.filter((id) => done.has(id)).length;
  return {
    goal,
    next: first,
    stages,
    doneTotal: done.size,
    label: positionLabel(requiredDone, required.length),
    progress: required.length > 0 ? requiredDone / required.length : 0,
    requiredTotal: required.length,
    requiredDone,
    remainingSteps: path.length,
    weeks,
  };
}
