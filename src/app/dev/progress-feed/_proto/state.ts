/**
 * フェーズ2プロトの状態（#251）
 *
 * ページをまたいで引き継ぐ（始めた → 記事 → 完了 → マイページで自分の投稿 → 通知）。
 * 保存先は sessionStorage だけ。DB・Sanity・Server Action は使わない。
 */

import {
  BONO_ID,
  CHEERERS_FOR_ME,
  INCOMING_CHEER_FROM,
  INITIAL_LIVE,
  INITIAL_POSTS,
  LATER_POSTS,
  ME_ID,
  type FeedPost,
  type LiveEntry,
  type Milestone,
} from "../_data";
import type { MockNotification } from "../_state";
import { INITIAL_COMPLETED_ARTICLE_IDS, MINE_POST_ID, findLesson } from "./data";

/** sessionStorage の形が変わったら上げる（古い保存は捨てる） */
export const STATE_VERSION = 1;
export const STORAGE_KEY = "bono.dev.progressFeed.v1";

export interface ProtoState {
  v: number;
  /** 今日やると決めて学習中のもの（null＝学習中ではない） */
  learning: { lessonId: string; articleSlug: string } | null;
  hasStarted: boolean;
  live: LiveEntry[];
  sentCheerTo: string[];
  receivedCheerFrom: string | null;
  completedArticleIds: string[];
  posts: FeedPost[];
  /** 「取り消す」で外した自分の投稿（「もう一度流す」で戻す） */
  retractedPost: FeedPost | null;
  reactionsDelivered: boolean;
  notifications: MockNotification[];
  /** 通知から自分の投稿に戻ってきたか（ガイドの✓用） */
  hasReturned: boolean;
  /** マイページを一度でも開いたか（ガイドの✓用） */
  visitedMypage: boolean;
}

export const initialProtoState: ProtoState = {
  v: STATE_VERSION,
  learning: null,
  hasStarted: false,
  live: INITIAL_LIVE,
  sentCheerTo: [],
  receivedCheerFrom: null,
  completedArticleIds: INITIAL_COMPLETED_ARTICLE_IDS,
  posts: INITIAL_POSTS,
  retractedPost: null,
  reactionsDelivered: false,
  notifications: [],
  hasReturned: false,
  visitedMypage: false,
};

export type ProtoAction =
  | { type: "hydrate"; state: ProtoState }
  | { type: "visitMypage" }
  | { type: "start"; lessonId: string; articleSlug: string }
  | { type: "receiveCheer" }
  | { type: "sendCheer"; learnerId: string }
  | {
      type: "completeArticle";
      articleId: string;
      /** 節目（クエスト完了・レッスン完了）のときだけ自動で流す投稿 */
      milestone?: { contentText: string; milestone: Milestone };
    }
  | { type: "uncompleteArticle"; articleId: string }
  | { type: "retractPost" }
  | { type: "republishPost" }
  | { type: "toggleStamp"; postId: string }
  | { type: "deliverReactions" }
  | { type: "markAllRead" }
  | { type: "openNotification"; notificationId: string }
  | { type: "reset" };

export function findMyPost(state: ProtoState): FeedPost | undefined {
  return state.posts.find((p) => p.id === MINE_POST_ID);
}

function withoutMe(live: LiveEntry[]): LiveEntry[] {
  return live.filter((l) => l.learnerId !== ME_ID);
}

export function protoReducer(state: ProtoState, action: ProtoAction): ProtoState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "visitMypage":
      return state.visitedMypage ? state : { ...state, visitedMypage: true };

    case "start": {
      const lesson = findLesson(action.lessonId);
      if (!lesson) return state;
      return {
        ...state,
        learning: { lessonId: lesson.id, articleSlug: action.articleSlug },
        hasStarted: true,
        live: [
          { learnerId: ME_ID, contentTitle: lesson.title, startedMinutesAgo: 0 },
          ...withoutMe(state.live),
        ],
      };
    }

    case "receiveCheer":
      if (state.receivedCheerFrom || !state.learning) return state;
      return { ...state, receivedCheerFrom: INCOMING_CHEER_FROM };

    case "sendCheer":
      if (state.sentCheerTo.includes(action.learnerId)) return state;
      return { ...state, sentCheerTo: [...state.sentCheerTo, action.learnerId] };

    case "completeArticle": {
      const completedArticleIds = state.completedArticleIds.includes(action.articleId)
        ? state.completedArticleIds
        : [...state.completedArticleIds, action.articleId];
      if (!action.milestone) return { ...state, completedArticleIds };
      const myPost: FeedPost = {
        id: MINE_POST_ID,
        authorId: ME_ID,
        contentText: action.milestone.contentText,
        milestone: action.milestone.milestone,
        minutesAgo: 0,
        // 反応ゼロ対策: 節目の投稿には運営の応援が最初の1件として付く
        cheeredBy: [BONO_ID],
      };
      return {
        ...state,
        completedArticleIds,
        // 節目まで終えたら「今やっている人」からは外れる
        learning: null,
        live: withoutMe(state.live),
        retractedPost: null,
        posts: [myPost, ...state.posts.filter((p) => p.id !== MINE_POST_ID)],
      };
    }

    case "uncompleteArticle":
      return {
        ...state,
        completedArticleIds: state.completedArticleIds.filter((id) => id !== action.articleId),
      };

    case "retractPost": {
      const mine = findMyPost(state);
      if (!mine) return state;
      return {
        ...state,
        retractedPost: mine,
        posts: state.posts.filter((p) => p.id !== MINE_POST_ID),
      };
    }

    case "republishPost":
      if (!state.retractedPost) return state;
      return {
        ...state,
        posts: [state.retractedPost, ...state.posts.filter((p) => p.id !== MINE_POST_ID)],
        retractedPost: null,
      };

    case "toggleStamp":
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (p.id !== action.postId) return p;
          const mine = p.cheeredBy.includes(ME_ID);
          return {
            ...p,
            cheeredBy: mine ? p.cheeredBy.filter((id) => id !== ME_ID) : [...p.cheeredBy, ME_ID],
          };
        }),
      };

    case "deliverReactions": {
      const mine = findMyPost(state);
      if (!mine || state.reactionsDelivered) return state;
      // 時間がたった想定: 自分の投稿は少し前になり、他の人の投稿も流れてくる
      const aged: FeedPost = {
        ...mine,
        minutesAgo: 40,
        cheeredBy: [...mine.cheeredBy, ...CHEERERS_FOR_ME.filter((id) => !mine.cheeredBy.includes(id))],
        bumped: true,
      };
      const others = state.posts
        .filter((p) => p.id !== MINE_POST_ID)
        .map((p) => ({ ...p, minutesAgo: p.minutesAgo + 40 }));
      const later = LATER_POSTS.filter((lp) => !others.some((o) => o.id === lp.id));
      return {
        ...state,
        reactionsDelivered: true,
        // 応援がついた投稿は一番上に戻る
        posts: [aged, ...later, ...others],
        notifications: [
          {
            id: "n-cheer",
            actorIds: CHEERERS_FOR_ME,
            postId: MINE_POST_ID,
            contentText: mine.contentText,
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case "markAllRead":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case "openNotification":
      return {
        ...state,
        hasReturned: true,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n,
        ),
      };

    case "reset":
      return initialProtoState;

    default:
      return state;
  }
}

/** sessionStorage から読んだ値が今の形か、ざっくり確かめる */
export function parseStoredState(raw: string | null): ProtoState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ProtoState>;
    if (parsed?.v !== STATE_VERSION || !Array.isArray(parsed.posts) || !Array.isArray(parsed.live)) {
      return null;
    }
    return { ...initialProtoState, ...parsed } as ProtoState;
  } catch {
    return null;
  }
}
