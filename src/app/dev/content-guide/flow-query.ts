/**
 * A案（/dev/content-guide/map）・B案（/dev/content-guide/quiz）の URL クエリ（ブラウザ内の状態。保存しない）。
 * 12_診断UI_A案B案_仕様書 §2・§4・§5。
 *
 * 現行（query.ts）と同じ名前の goal / done / step=result / viewer を使うので、
 * 「現行／A案／B案」を切り替えても、選んだ目標とチェックを引き継げる。
 *
 * - (なし)                 導入
 * - step=stage             B案 Q1（どの段階から）
 * - step=goal&stage=basic  B案 Q2（選んだ段階の目標）／ A案 Q1（step=goal。stage は使わない）
 * - goal=S10               いまできること（前提がない目標は、そのまま結果）
 * - goal=S10&step=result   診断結果
 * 「診断中…」は URL に持たない（ブラウザの戻るで止まらないように、一時的な表示だけ）。
 */

import { isSkillStateId, type SkillStateId } from "@/lib/content-guide/skill-states";
import { hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";
import { STAGE_GROUPS, type StageGroupId } from "@/lib/content-guide/display";
import type { Viewer } from "./query";

export type Variant = "list" | "map" | "quiz";
export type FlowStep = "intro" | "stage" | "goal" | "check" | "result";

export interface FlowQuery {
  goal: SkillStateId | null;
  checked: SkillStateId[];
  step: FlowStep;
  /** B案 Q2 で見ている段階（目標があるときは、その目標の段階） */
  stage: StageGroupId | null;
  viewer: Viewer;
}

export const VARIANT_PATHS: Record<Variant, string> = {
  list: "/dev/content-guide",
  map: "/dev/content-guide/map",
  quiz: "/dev/content-guide/quiz",
};

function isStageGroupId(value: unknown): value is StageGroupId {
  return STAGE_GROUPS.some((g) => g.id === value);
}

export function stageOfGoal(goal: SkillStateId): StageGroupId {
  return (STAGE_GROUPS.find((g) => g.stateIds.includes(goal)) ?? STAGE_GROUPS[0]).id;
}

export function parseFlowQuery(params: URLSearchParams, variant: Exclude<Variant, "list">): FlowQuery {
  const viewer: Viewer = params.get("viewer") === "member" ? "member" : "guest";
  const rawGoal = params.get("goal");
  const goal = isSkillStateId(rawGoal) ? rawGoal : null;
  const rawStep = params.get("step");

  if (!goal) {
    const rawStage = params.get("stage");
    const stage = isStageGroupId(rawStage) ? rawStage : null;
    if (variant === "quiz") {
      if (rawStep === "goal" && stage) return { goal: null, checked: [], step: "goal", stage, viewer };
      if (rawStep === "stage" || rawStep === "goal") return { goal: null, checked: [], step: "stage", stage: null, viewer };
    } else if (rawStep === "goal") {
      return { goal: null, checked: [], step: "goal", stage: null, viewer };
    }
    return { goal: null, checked: [], step: "intro", stage: null, viewer };
  }

  const allowed = new Set(prerequisitesOf(goal));
  const checked = (params.get("done") ?? "")
    .split(",")
    .filter(isSkillStateId)
    .filter((id) => allowed.has(id));
  const step: FlowStep = !hasPrerequisites(goal) || rawStep === "result" ? "result" : "check";
  return { goal, checked: [...new Set(checked)], step, stage: stageOfGoal(goal), viewer };
}

export function buildFlowSearch(q: FlowQuery): string {
  const params = new URLSearchParams();
  if (q.goal) {
    params.set("goal", q.goal);
    if (q.checked.length > 0) params.set("done", q.checked.join(","));
    if (q.step === "result" && hasPrerequisites(q.goal)) params.set("step", "result");
  } else if (q.step === "stage") {
    params.set("step", "stage");
  } else if (q.step === "goal") {
    params.set("step", "goal");
    if (q.stage) params.set("stage", q.stage);
  }
  if (q.viewer === "member") params.set("viewer", "member");
  const s = params.toString();
  return s ? `?${s}` : "";
}

/**
 * 「現行／A案／B案」の切り替えで引き継ぐクエリ。目標・チェック・結果かどうか・表示する人だけを渡す
 * （途中の質問の位置は案ごとに違うため引き継がない）。
 */
export function carryOverSearch(state: {
  goal: SkillStateId | null;
  checked: readonly SkillStateId[];
  isResult: boolean;
  viewer: Viewer;
}): string {
  const params = new URLSearchParams();
  if (state.goal) {
    params.set("goal", state.goal);
    if (state.checked.length > 0) params.set("done", state.checked.join(","));
    if (state.isResult && hasPrerequisites(state.goal)) params.set("step", "result");
  }
  if (state.viewer === "member") params.set("viewer", "member");
  const s = params.toString();
  return s ? `?${s}` : "";
}
