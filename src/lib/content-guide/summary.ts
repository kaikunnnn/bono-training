/**
 * コンテンツガイド（診断）: 診断結果の要約（A案・B案の共通。12_診断UI_A案B案_仕様書 §6）。
 *
 * - あなたの現在地: 段階ごとの「できている数／全体の数」（基礎5・実践7・応用6）と一言のラベル。
 *   できている数は、目標に関係する状態だけでなく「チェックした状態 + その前提の閉包」で数える。
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

export type PositionLabel =
  | "これから始めるところ"
  | "基本を固めている途中"
  | "基本ができている"
  | "実践に入ったところ"
  | "実践を積んでいる"
  | "応用に進んでいる";

export interface DiagnosisSummary {
  goal: SkillStateId;
  /** 次に身につける状態（= 道筋の先頭） */
  next: SkillStateId;
  /** 段階ごとの できている数／全体（基礎・実践・応用の順） */
  stages: StageCount[];
  /** できている状態の合計（18個のうち） */
  doneTotal: number;
  /** 現在地のラベル */
  label: PositionLabel;
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
 * 現在地のラベル（§6 の既定値）。最も進んだ段階から判定する。
 * - できている数が0 → これから始めるところ
 * - 応用に1つ以上 → 応用に進んでいる
 * - 実践に1つ以上 → 実践に入ったところ（実践の半分以上で 実践を積んでいる）
 * - 基礎だけ → 基本を固めている途中（基礎の全部で 基本ができている）
 */
export function positionLabel(stages: readonly StageCount[]): PositionLabel {
  const get = (id: StageGroupId) => stages.find((s) => s.id === id) ?? { done: 0, total: 0 };
  const basic = get("basic");
  const practice = get("practice");
  const advanced = get("advanced");
  if (basic.done + practice.done + advanced.done === 0) return "これから始めるところ";
  if (advanced.done > 0) return "応用に進んでいる";
  if (practice.done > 0) return practice.done * 2 >= practice.total ? "実践を積んでいる" : "実践に入ったところ";
  return basic.total > 0 && basic.done >= basic.total ? "基本ができている" : "基本を固めている途中";
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
  return {
    goal,
    next: first,
    stages,
    doneTotal: done.size,
    label: positionLabel(stages),
    requiredTotal: required.length,
    requiredDone: required.filter((id) => done.has(id)).length,
    remainingSteps: path.length,
    weeks,
  };
}
