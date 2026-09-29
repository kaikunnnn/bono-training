/**
 * コンテンツガイド（診断）A案: スキルマップの各ノードの状態（12_診断UI_A案B案_仕様書 §4-1）。
 *
 * - pick（Q1 目標を選ぶ）: すべて「選べる」
 * - check（Q2 できること）: 目標 = ゴール、目標の前提 = できている／選べる（前提として連動したものはロック）、他 = 対象外
 * - result（診断結果）: できている／いまここ（最初の状態）／これから（道筋の残り）／対象外。目標には isGoal
 *
 * 純粋関数のみ。道筋は path.ts の computePath をそのまま使う。
 */

import { closure, computePath, doneStates, prerequisitesOf } from "./path";
import { SKILL_STATE_IDS, type SkillStateId } from "./skill-states";

export type MapMode = "pick" | "check" | "result";
export type NodeStatus = "selectable" | "goal" | "done" | "current" | "upcoming" | "inactive";

export interface NodeState {
  status: NodeStatus;
  /** 目標のノード（旗のアイコン）。status が current／goal のどちらでも立つ */
  isGoal: boolean;
  /** Q2 で、チェックした状態の前提として「できている」になっている（外せない） */
  locked: boolean;
}

export const NODE_STATUS_LABELS: Record<NodeStatus, string> = {
  selectable: "選べる",
  goal: "ゴール",
  done: "できている",
  current: "いまここ",
  upcoming: "これから",
  inactive: "対象外",
};

export function mapNodeStates(
  mode: MapMode,
  goal: SkillStateId | null,
  checked: readonly SkillStateId[] = []
): Record<SkillStateId, NodeState> {
  const out = {} as Record<SkillStateId, NodeState>;
  const set = (id: SkillStateId, status: NodeStatus, locked = false) => {
    out[id] = { status, isGoal: id === goal, locked };
  };

  if (mode === "pick" || goal === null) {
    for (const id of SKILL_STATE_IDS) set(id, "selectable");
    return out;
  }

  if (mode === "check") {
    const candidates = new Set(prerequisitesOf(goal));
    const checkedSet = new Set(checked.filter((id) => candidates.has(id)));
    const implied = new Set<SkillStateId>();
    for (const id of checkedSet) for (const pre of closure([id])) if (pre !== id) implied.add(pre);
    for (const id of SKILL_STATE_IDS) {
      if (id === goal) set(id, "goal");
      else if (!candidates.has(id)) set(id, "inactive");
      else if (implied.has(id)) set(id, "done", true);
      else if (checkedSet.has(id)) set(id, "done");
      else set(id, "selectable");
    }
    return out;
  }

  const checkedList = checked.filter((id) => id !== goal);
  const { path, first } = computePath(goal, checkedList);
  const required = closure([goal]);
  const done = doneStates(checkedList);
  const remaining = new Set(path);
  for (const id of SKILL_STATE_IDS) {
    if (!required.has(id)) set(id, done.has(id) ? "done" : "inactive");
    else if (done.has(id)) set(id, "done");
    else if (id === first) set(id, "current");
    else if (id === goal) set(id, "goal");
    else if (remaining.has(id)) set(id, "upcoming");
    else set(id, "inactive");
  }
  return out;
}
