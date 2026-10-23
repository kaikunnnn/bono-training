/**
 * いっしょにデザインのプロト（#253）の状態
 *
 * 保存先は sessionStorage だけ。DB・API・Server Action は使わない。
 * 時刻はすべて「プロト時刻」（Date.now() + timeOffsetMs）のミリ秒で持つ。
 * Date.now() は effect とイベントの中でだけ読む（描画中に読むと SSR とずれるため）。
 */

import {
  AUTO_END_MS,
  INITIAL_COMPLETED_ARTICLE_IDS,
  INITIAL_WORKING_IDS,
  INITIAL_WORKING_MINUTES_AGO,
  MEMBERS,
  ME_ID,
} from "./data";

/** sessionStorage の形が変わったら上げる（古い保存は捨てる） */
export const STATE_VERSION = 1;
export const STORAGE_KEY = "bono.dev.designTogether.v1";

/** 作業中の1人分 */
export interface WorkingEntry {
  memberId: string;
  startedAt: number;
}

/** 自分の作業中のセッション */
export interface MySession {
  id: string;
  startedAt: number;
  /** 今日やること（任意。空なら null） */
  declaration: string | null;
}

/** 終わった作業の記録 */
export interface WorkLog {
  id: string;
  startedAt: number;
  endedAt: number;
  minutes: number;
  endReason: "manual" | "auto_ended";
  declaration: string | null;
}

/** フィードに流れるもの（S1では宣言だけ積む。表示は S2） */
export interface DtPost {
  id: string;
  type: "declaration" | "report";
  authorId: string;
  text: string;
  createdAt: number;
}

export type DummyMode = "two" | "zero";

export interface DtState {
  v: number;
  /** 最初のダミーの作業中を置いたか（初回マウントで時刻つきで置く） */
  seeded: boolean;
  /** プロト時刻のずらし幅（体験ガイドの「時間を進める」で増える） */
  timeOffsetMs: number;
  /** 自分以外の作業中 */
  others: WorkingEntry[];
  /** ダミーの作業中を 2人（動く）/ 0人（止める） */
  dummyMode: DummyMode;
  mySession: MySession | null;
  workLogs: WorkLog[];
  /** 自動終了したあと、まだ日報を書いていない記録 */
  pendingReportLogId: string | null;
  posts: DtPost[];
  completedArticleIds: string[];
  /** 体験ガイドの✓用 */
  visitedMypage: boolean;
  openedStartDialog: boolean;
  visitedArticleWhileWorking: boolean;
}

export const initialDtState: DtState = {
  v: STATE_VERSION,
  seeded: false,
  timeOffsetMs: 0,
  others: [],
  dummyMode: "two",
  mySession: null,
  workLogs: [],
  pendingReportLogId: null,
  posts: [],
  completedArticleIds: INITIAL_COMPLETED_ARTICLE_IDS,
  visitedMypage: false,
  openedStartDialog: false,
  visitedArticleWhileWorking: false,
};

export type DtAction =
  | { type: "hydrate"; state: DtState }
  | { type: "seed"; now: number }
  | { type: "visitMypage" }
  | { type: "openStartDialog" }
  | { type: "visitArticle" }
  | { type: "start"; now: number; declaration: string; id: string }
  | { type: "end"; now: number }
  | { type: "autoEnd" }
  | { type: "dismissPendingReport" }
  | { type: "simulate"; now: number; roll: number; pick: number }
  | { type: "setDummyMode"; mode: DummyMode; now: number }
  | { type: "advanceTime"; ms: number }
  | { type: "completeArticle"; articleId: string }
  | { type: "uncompleteArticle"; articleId: string }
  | { type: "reset"; now: number };

function initialOthers(now: number): WorkingEntry[] {
  return INITIAL_WORKING_IDS.map((memberId, i) => ({
    memberId,
    startedAt: now - (INITIAL_WORKING_MINUTES_AGO[i] ?? 10) * 60_000,
  }));
}

function minutesBetween(from: number, to: number): number {
  return Math.max(0, Math.floor((to - from) / 60_000));
}

function endSession(state: DtState, endedAt: number, endReason: WorkLog["endReason"]): DtState {
  const s = state.mySession;
  if (!s) return state;
  const log: WorkLog = {
    id: s.id,
    startedAt: s.startedAt,
    endedAt,
    minutes: minutesBetween(s.startedAt, endedAt),
    endReason,
    declaration: s.declaration,
  };
  return {
    ...state,
    mySession: null,
    workLogs: [log, ...state.workLogs],
    pendingReportLogId: endReason === "auto_ended" ? log.id : state.pendingReportLogId,
  };
}

export function protoReducer(state: DtState, action: DtAction): DtState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "seed":
      if (state.seeded) return state;
      return { ...state, seeded: true, others: initialOthers(action.now) };

    case "visitMypage":
      return state.visitedMypage ? state : { ...state, visitedMypage: true };

    case "openStartDialog":
      return state.openedStartDialog ? state : { ...state, openedStartDialog: true };

    case "visitArticle":
      if (!state.mySession || state.visitedArticleWhileWorking) return state;
      return { ...state, visitedArticleWhileWorking: true };

    case "start": {
      if (state.mySession) return state;
      const text = action.declaration.trim();
      const declaration = text ? text : null;
      return {
        ...state,
        openedStartDialog: true,
        mySession: { id: action.id, startedAt: action.now, declaration },
        // 空の宣言はフィードに流さない（「作業を始めました」だけの投稿は作らない）
        posts: declaration
          ? [
              { id: `post-${action.id}`, type: "declaration", authorId: ME_ID, text: declaration, createdAt: action.now },
              ...state.posts,
            ]
          : state.posts,
      };
    }

    case "end":
      return endSession(state, action.now, "manual");

    case "autoEnd":
      if (!state.mySession) return state;
      return endSession(state, state.mySession.startedAt + AUTO_END_MS, "auto_ended");

    case "dismissPendingReport":
      return { ...state, pendingReportLogId: null };

    case "simulate": {
      // 0人モードでは動かさない（空の状態を確かめられるように）
      if (state.dummyMode === "zero") return state;
      const working = new Set(state.others.map((o) => o.memberId));
      const idle = MEMBERS.filter((m) => !working.has(m.id));
      const count = state.others.length;
      // 1人以下なら必ず誰かが始める、4人以上なら必ず誰かが終える。間はランダム
      const shouldStart = count <= 1 ? true : count >= 4 ? false : action.roll < 0.5;
      if (shouldStart && idle.length > 0) {
        const m = idle[Math.floor(action.pick * idle.length) % idle.length];
        return { ...state, others: [...state.others, { memberId: m.id, startedAt: action.now }] };
      }
      if (!shouldStart && count > 1) {
        const i = Math.floor(action.pick * count) % count;
        return { ...state, others: state.others.filter((_, idx) => idx !== i) };
      }
      return state;
    }

    case "setDummyMode":
      return {
        ...state,
        dummyMode: action.mode,
        others: action.mode === "zero" ? [] : initialOthers(action.now),
      };

    case "advanceTime":
      // 自動終了の判定は Provider の effect が新しい時刻で行う
      return { ...state, timeOffsetMs: state.timeOffsetMs + action.ms };

    case "completeArticle":
      if (state.completedArticleIds.includes(action.articleId)) return state;
      return { ...state, completedArticleIds: [...state.completedArticleIds, action.articleId] };

    case "uncompleteArticle":
      return {
        ...state,
        completedArticleIds: state.completedArticleIds.filter((id) => id !== action.articleId),
      };

    case "reset":
      return { ...initialDtState, seeded: true, others: initialOthers(action.now) };

    default:
      return state;
  }
}

/** sessionStorage から読んだ値が今の形か、ざっくり確かめる */
export function parseStoredState(raw: string | null): DtState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DtState>;
    if (parsed?.v !== STATE_VERSION || !Array.isArray(parsed.others) || !Array.isArray(parsed.workLogs)) {
      return null;
    }
    return { ...initialDtState, ...parsed } as DtState;
  } catch {
    return null;
  }
}

/** 作業中一覧（自分が作業中なら先頭） */
export function workingIds(state: DtState): string[] {
  const others = state.others.map((o) => o.memberId);
  return state.mySession ? [ME_ID, ...others] : others;
}

export function findPendingLog(state: DtState): WorkLog | null {
  if (!state.pendingReportLogId) return null;
  return state.workLogs.find((l) => l.id === state.pendingReportLogId) ?? null;
}
