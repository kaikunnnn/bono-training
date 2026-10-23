/**
 * /dev/progress-feed の状態とその変え方（#251）
 *
 * すべてブラウザ内だけの状態。保存しないので、リロードで初期状態に戻る。
 */

import {
  BONO_ID,
  CHEERERS_FOR_ME,
  INCOMING_CHEER_FROM,
  INITIAL_LIVE,
  INITIAL_POSTS,
  LATER_POSTS,
  ME_ID,
  MY_POST_ID,
  findContent,
  contentLabel,
  type FeedPost,
  type LiveEntry,
} from "./_data";

export type PatternKey = "A" | "B" | "C";

export interface MockNotification {
  id: string;
  /** 応援してくれた人（先頭が通知文の「◯◯さんたち」） */
  actorIds: string[];
  postId: string;
  contentText: string;
  read: boolean;
}

export interface State {
  pattern: PatternKey;
  /** 体験ガイドの場面（0〜4） */
  step: number;
  /** 自分が学習中のコンテンツID（null＝まだ始めていない／終えた） */
  myContentId: string | null;
  /** 一度でも始めたか（ガイドの✓用） */
  hasStarted: boolean;
  live: LiveEntry[];
  /** 自分が「がんばろ」を送った相手 */
  sentCheerTo: string[];
  /** 自分に「がんばろ」を送ってくれた人 */
  receivedCheerFrom: string | null;
  /** 完了モーダルを開いているコンテンツID */
  completionContentId: string | null;
  /** 完了したが流さなかったか */
  skippedPost: boolean;
  posts: FeedPost[];
  /** 「反応を届ける」をもう実行したか */
  reactionsDelivered: boolean;
  notifications: MockNotification[];
  /** 強調表示中の投稿（通知から戻ってきたとき） */
  highlightPostId: string | null;
  /** 通知から戻ってきたか（ガイドの✓用） */
  hasReturned: boolean;
}

export const initialState: State = {
  pattern: "A",
  step: 0,
  myContentId: null,
  hasStarted: false,
  live: INITIAL_LIVE,
  sentCheerTo: [],
  receivedCheerFrom: null,
  completionContentId: null,
  skippedPost: false,
  posts: INITIAL_POSTS,
  reactionsDelivered: false,
  notifications: [],
  highlightPostId: null,
  hasReturned: false,
};

export type Action =
  | { type: "setPattern"; pattern: PatternKey }
  | { type: "setStep"; step: number }
  | { type: "sendCheer"; learnerId: string }
  | { type: "start"; contentId: string }
  | { type: "receiveCheer" }
  | { type: "finish" }
  | { type: "publish" }
  | { type: "skipPublish" }
  | { type: "toggleStamp"; postId: string }
  | { type: "deliverReactions" }
  | { type: "markAllRead" }
  | { type: "openNotification"; notificationId: string }
  | { type: "clearHighlight" }
  | { type: "reset" };

export function hasMyPost(state: State): boolean {
  return state.posts.some((p) => p.id === MY_POST_ID);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setPattern":
      return { ...state, pattern: action.pattern };

    case "setStep":
      return { ...state, step: Math.max(0, Math.min(4, action.step)) };

    case "sendCheer":
      if (state.sentCheerTo.includes(action.learnerId)) return state;
      return { ...state, sentCheerTo: [...state.sentCheerTo, action.learnerId] };

    case "start": {
      const content = findContent(action.contentId);
      // 自分は「あなた」として帯の先頭に入る（2回目以降は差し替え）
      const others = state.live.filter((l) => l.learnerId !== ME_ID);
      return {
        ...state,
        myContentId: content.id,
        hasStarted: true,
        live: [
          { learnerId: ME_ID, contentTitle: content.title, startedMinutesAgo: 0 },
          ...others,
        ],
      };
    }

    case "receiveCheer":
      if (state.receivedCheerFrom || !state.myContentId) return state;
      return { ...state, receivedCheerFrom: INCOMING_CHEER_FROM };

    case "finish":
      if (!state.myContentId) return state;
      return { ...state, completionContentId: state.myContentId };

    case "publish": {
      if (!state.completionContentId) return state;
      const content = findContent(state.completionContentId);
      const myPost: FeedPost = {
        id: MY_POST_ID,
        authorId: ME_ID,
        contentText: contentLabel(content),
        milestone: "first",
        minutesAgo: 0,
        // 反応ゼロ対策: はじめての完了には運営の応援が最初の1件として付く
        cheeredBy: [BONO_ID],
      };
      return {
        ...state,
        completionContentId: null,
        myContentId: null,
        skippedPost: false,
        live: state.live.filter((l) => l.learnerId !== ME_ID),
        posts: [myPost, ...state.posts.filter((p) => p.id !== MY_POST_ID)],
      };
    }

    case "skipPublish":
      return {
        ...state,
        completionContentId: null,
        myContentId: null,
        skippedPost: true,
        live: state.live.filter((l) => l.learnerId !== ME_ID),
      };

    case "toggleStamp":
      return {
        ...state,
        posts: state.posts.map((p) => {
          if (p.id !== action.postId) return p;
          const mine = p.cheeredBy.includes(ME_ID);
          return {
            ...p,
            cheeredBy: mine
              ? p.cheeredBy.filter((id) => id !== ME_ID)
              : [...p.cheeredBy, ME_ID],
          };
        }),
      };

    case "deliverReactions": {
      const mine = state.posts.find((p) => p.id === MY_POST_ID);
      if (!mine || state.reactionsDelivered) return state;
      // 時間がたった想定: 自分の投稿は少し前になり、他の人の投稿が上に流れてくる
      const aged: FeedPost = {
        ...mine,
        minutesAgo: 40,
        cheeredBy: [...mine.cheeredBy, ...CHEERERS_FOR_ME],
        bumped: true,
      };
      const others = state.posts
        .filter((p) => p.id !== MY_POST_ID)
        .map((p) => ({ ...p, minutesAgo: p.minutesAgo + 40 }));
      const later = LATER_POSTS.filter((lp) => !others.some((o) => o.id === lp.id));
      // 応援がついた投稿は一番上に戻る
      return {
        ...state,
        reactionsDelivered: true,
        posts: [aged, ...later, ...others],
        notifications: [
          {
            id: "n1",
            actorIds: CHEERERS_FOR_ME,
            postId: MY_POST_ID,
            contentText: mine.contentText,
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case "markAllRead":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "openNotification": {
      const n = state.notifications.find((x) => x.id === action.notificationId);
      if (!n) return state;
      return {
        ...state,
        highlightPostId: n.postId,
        hasReturned: true,
        step: Math.max(state.step, 4),
        notifications: state.notifications.map((x) =>
          x.id === n.id ? { ...x, read: true } : x,
        ),
      };
    }

    case "clearHighlight":
      return { ...state, highlightPostId: null };

    case "reset":
      return { ...initialState, pattern: state.pattern };

    default:
      return state;
  }
}
