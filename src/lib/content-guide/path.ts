/**
 * コンテンツガイド（診断）: 前提関係から道筋を出す純粋関数。
 *
 * ルール（10_プロトタイプ仕様書 §4）:
 * - 道筋 = 目標の前提の閉包（目標自身を含む）から、できている状態
 *   （チェックした状態とその前提の閉包）を除き、学ぶ順に並べたもの。
 * - 最初の状態 = 道筋の先頭。
 */

import {
  LEARNING_ORDER,
  SKILL_STATES,
  WEEKS_PER_STATE,
  type SkillStateId,
} from "./skill-states";

/** 指定した状態と、その前提を推移的にすべて含む集合 */
export function closure(ids: Iterable<SkillStateId>): Set<SkillStateId> {
  const result = new Set<SkillStateId>();
  const stack = [...ids];
  while (stack.length > 0) {
    const id = stack.pop() as SkillStateId;
    if (result.has(id)) continue;
    result.add(id);
    for (const pre of SKILL_STATES[id].prerequisites) {
      if (!result.has(pre)) stack.push(pre);
    }
  }
  return result;
}

/** 集合を学ぶ順に並べる */
export function sortByLearningOrder(ids: Iterable<SkillStateId>): SkillStateId[] {
  const set = new Set(ids);
  return LEARNING_ORDER.filter((id) => set.has(id));
}

/** 目標の前提になる状態（目標自身は含まない）。ステップ2でチェックさせる候補。学ぶ順 */
export function prerequisitesOf(goal: SkillStateId): SkillStateId[] {
  const all = closure([goal]);
  all.delete(goal);
  return sortByLearningOrder(all);
}

/** 前提がない目標（ステップ2を飛ばす） */
export function hasPrerequisites(goal: SkillStateId): boolean {
  return SKILL_STATES[goal].prerequisites.length > 0;
}

/** できているものとして扱う状態（チェックした状態 + その前提の閉包） */
export function doneStates(checked: Iterable<SkillStateId>): Set<SkillStateId> {
  return closure(checked);
}

export interface GuidePath {
  goal: SkillStateId;
  /** まだできていない状態の並び（学ぶ順）。目標は必ず末尾に含む */
  path: SkillStateId[];
  /** 最初に取り掛かる状態（= path[0]） */
  first: SkillStateId;
  /** 目安期間（週） */
  weeks: number;
}

/**
 * 目標とチェック（いまできること）から道筋を出す。
 * チェックは目標の前提だけが並ぶ想定。目標自身がチェックに含まれていても、
 * 目標は「目指す状態」なので道筋から除かない（道筋は最低でも目標1つ）。
 */
export function computePath(goal: SkillStateId, checked: Iterable<SkillStateId> = []): GuidePath {
  const required = closure([goal]);
  const done = doneStates([...checked].filter((id) => id !== goal));
  const path = LEARNING_ORDER.filter((id) => required.has(id) && !done.has(id));
  return {
    goal,
    path,
    first: path[0] ?? goal,
    weeks: path.length * WEEKS_PER_STATE,
  };
}
