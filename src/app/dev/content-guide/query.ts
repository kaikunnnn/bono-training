/**
 * /dev/content-guide の URL クエリ（ブラウザ内の状態。保存はしない）。
 *
 * - goal=S10          選んだ目標
 * - done=S1,S6        チェックした「いまできること」（目標の前提以外は無視）
 * - step=result       結果画面（前提がない目標は goal だけで結果）
 * - viewer=member     確認用: 会員表示（既定は未ログイン表示）
 */

import { isSkillStateId, type SkillStateId } from "@/lib/content-guide/skill-states";
import { hasPrerequisites, prerequisitesOf } from "@/lib/content-guide/path";

export type Viewer = "guest" | "member";
export type Step = "goal" | "check" | "result";

export interface GuideQuery {
  goal: SkillStateId | null;
  checked: SkillStateId[];
  step: Step;
  viewer: Viewer;
}

export function parseGuideQuery(params: URLSearchParams): GuideQuery {
  const viewer: Viewer = params.get("viewer") === "member" ? "member" : "guest";
  const rawGoal = params.get("goal");
  const goal = isSkillStateId(rawGoal) ? rawGoal : null;
  if (!goal) return { goal: null, checked: [], step: "goal", viewer };

  const allowed = new Set(prerequisitesOf(goal));
  const checked = (params.get("done") ?? "")
    .split(",")
    .filter(isSkillStateId)
    .filter((id) => allowed.has(id));

  const step: Step =
    !hasPrerequisites(goal) || params.get("step") === "result" ? "result" : "check";
  return { goal, checked: [...new Set(checked)], step, viewer };
}

export function buildGuideSearch(q: GuideQuery): string {
  const params = new URLSearchParams();
  if (q.goal) {
    params.set("goal", q.goal);
    if (q.checked.length > 0) params.set("done", q.checked.join(","));
    if (q.step === "result" && hasPrerequisites(q.goal)) params.set("step", "result");
  }
  if (q.viewer === "member") params.set("viewer", "member");
  const s = params.toString();
  return s ? `?${s}` : "";
}
