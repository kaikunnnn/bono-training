/**
 * /dev/peers のダミーデータ（#255）。本番データ・Supabase には繋がない。
 * 時刻は Date を使わず「◯分前」「◯日前」の数値で持つ（サーバーとブラウザで表示がずれないように）。
 */

export type PatternKey = "a" | "b" | "c" | "d";

export const PATTERN_KEYS: PatternKey[] = ["a", "b", "c", "d"];

export function toPatternKey(value: string | string[] | undefined): PatternKey {
  const v = (Array.isArray(value) ? value[0] : value)?.toLowerCase();
  return PATTERN_KEYS.includes(v as PatternKey) ? (v as PatternKey) : "a";
}

export const COURSE_NAME = "UIデザイン基礎コース";

/** 課題の番号と名前（UIデザイン基礎コース） */
export const ASSIGNMENTS: Record<number, string> = {
  1: "好きなアプリの画面を観察する",
  2: "ログイン画面をトレースする",
  3: "カフェアプリのメニュー画面をつくる",
  4: "商品の詳細画面をつくる",
  5: "ポートフォリオの下書きをつくる",
};

export function assignmentLabel(no: number) {
  return `課題${no}「${ASSIGNMENTS[no]}」`;
}

/** 画像が読めないときの頭文字の円の色（DSトークンのみ） */
export type AvatarTone =
  "career" | "ux" | "info" | "visual" | "olive" | "orange" | "link" | "brand";

export type TodayStatus =
  | { kind: "working"; sinceMinutes: number }
  | { kind: "done"; finishedMinutesAgo: number }
  | { kind: "notYet" };

export interface Peer {
  id: string;
  name: string;
  tone: AvatarTone;
  /** 取り組み中の課題番号 */
  assignmentNo: number;
  /** 自分との差の言い方 */
  relation: "同じ課題" | "1つ後ろ" | "1つ先" | "2つ先";
  status: TodayStatus;
  /** 今日やったこと（「今日はまだ」の人は null） */
  todayWork: string | null;
  /** 詰まりメモ */
  stuckNote: string | null;
  /** D 用: 直近7日の「やった日」（古い日 → 今日） */
  last7Days: boolean[];
}

/** 自分（ゆうと） */
export const ME = {
  id: "peer-me-yuto",
  name: "ゆうと",
  tone: "brand" as AvatarTone,
  startedWeek: "10月13日の週",
  assignmentNo: 3,
  todayMinutes: 30,
  stuckOn: "配色",
  last7Days: [true, true, false, true, true, true, true],
};

/** 同期＝自分と同じ週（10月13日の週）にBONOを始めた8人 */
export const PEERS: Peer[] = [
  {
    id: "peer-saki",
    name: "さき",
    tone: "visual",
    assignmentNo: 3,
    relation: "同じ課題",
    status: { kind: "working", sinceMinutes: 25 },
    todayWork: "課題3のワイヤーフレームを描いた",
    stuckNote: "余白の取り方がわからない",
    last7Days: [true, true, true, false, true, true, true],
  },
  {
    id: "peer-kenta",
    name: "けんた",
    tone: "olive",
    assignmentNo: 2,
    relation: "1つ後ろ",
    status: { kind: "working", sinceMinutes: 5 },
    todayWork: "課題2を見直している",
    stuckNote: null,
    last7Days: [true, false, true, false, false, true, true],
  },
  {
    id: "peer-mio",
    name: "みお",
    tone: "ux",
    assignmentNo: 4,
    relation: "1つ先",
    status: { kind: "done", finishedMinutesAgo: 120 },
    todayWork: "課題4を提出した",
    stuckNote: "文字サイズの決め方で1時間悩んだ",
    last7Days: [true, true, true, true, false, true, true],
  },
  {
    id: "peer-ryo",
    name: "りょう",
    tone: "orange",
    assignmentNo: 3,
    relation: "同じ課題",
    status: { kind: "done", finishedMinutesAgo: 70 },
    todayWork: "課題3の配色を3パターンつくった",
    stuckNote: "色が多すぎてまとまらない",
    last7Days: [false, true, true, true, false, true, true],
  },
  {
    id: "peer-aya",
    name: "あや",
    tone: "info",
    assignmentNo: 3,
    relation: "同じ課題",
    status: { kind: "working", sinceMinutes: 50 },
    todayWork: "課題3のボタンの形を考えている",
    stuckNote: null,
    last7Days: [true, true, false, true, true, false, true],
  },
  {
    id: "peer-sho",
    name: "しょう",
    tone: "link",
    assignmentNo: 2,
    relation: "1つ後ろ",
    status: { kind: "notYet" },
    todayWork: null,
    stuckNote: null,
    last7Days: [true, false, false, true, false, false, false],
  },
  {
    id: "peer-nana",
    name: "なな",
    tone: "career",
    assignmentNo: 5,
    relation: "2つ先",
    status: { kind: "done", finishedMinutesAgo: 180 },
    todayWork: "課題5のポートフォリオの下書きを書いた",
    stuckNote: "自己紹介文が書けない",
    last7Days: [true, true, true, true, true, false, true],
  },
  {
    id: "peer-takeru",
    name: "たける",
    tone: "olive",
    assignmentNo: 3,
    relation: "同じ課題",
    status: { kind: "notYet" },
    todayWork: null,
    stuckNote: null,
    last7Days: [true, true, false, true, true, true, false],
  },
];

export function findPeer(id: string) {
  return PEERS.find((p) => p.id === id);
}

export function formatAgo(minutes: number) {
  if (minutes < 60) return `${minutes}分前`;
  return `${Math.floor(minutes / 60)}時間前`;
}

/** 状態の短い文言 */
export function statusLabel(status: TodayStatus) {
  switch (status.kind) {
    case "working":
      return `いま作業中（${status.sinceMinutes}分前から）`;
    case "done":
      return "今日は終了";
    case "notYet":
      return "今日はまだ";
  }
}

/** フィードの並び順用：何分前の動きか（今日はまだ の人は対象外） */
export function lastActivityMinutes(status: TodayStatus) {
  if (status.kind === "working") return status.sinceMinutes;
  if (status.kind === "done") return status.finishedMinutesAgo;
  return Number.POSITIVE_INFINITY;
}

/** パターンごとの反応の名前と絵文字 */
export const REACTIONS: Record<PatternKey, { label: string; emoji: string }> = {
  a: { label: "おつかれ", emoji: "👏" },
  b: { label: "がんばろ", emoji: "🔥" },
  c: { label: "参考になった", emoji: "💡" },
  d: { label: "応援", emoji: "📣" },
};

/** 自分が今日もらった反応（送ってくれた同期の id） */
export const RECEIVED: Record<PatternKey, string[]> = {
  a: ["peer-saki", "peer-mio", "peer-ryo"],
  b: ["peer-aya", "peer-kenta"],
  c: ["peer-ryo"],
  d: ["peer-saki", "peer-ryo"],
};

/** 押す前の反応の数（ほかの同期から届いている分） */
export const BASE_COUNTS: Record<PatternKey, Record<string, number>> = {
  a: {
    "peer-saki": 3,
    "peer-kenta": 1,
    "peer-mio": 5,
    "peer-ryo": 2,
    "peer-aya": 2,
    "peer-nana": 4,
  },
  b: { "peer-saki": 2, "peer-kenta": 0, "peer-aya": 3 },
  c: { "peer-mio": 4, "peer-nana": 6 },
  d: { "peer-saki": 2, "peer-ryo": 1, "peer-takeru": 0 },
};

/**
 * C 1歩先の人：課題3（自分の取り組み中の課題）を先に終えた同期。
 * 8人の中で課題3より先にいるのは みお（1つ先）と なな（2つ先）だけなので、この2人を出す。
 * 詰まりメモは「課題3のとき」のもの（共通データの詰まりメモは今日の課題のもの）。
 */
export const ONE_STEP_AHEAD: {
  peerId: string;
  finishedDaysAgo: number;
  stuckNote: string;
  howSolved: string;
}[] = [
  {
    peerId: "peer-mio",
    finishedDaysAgo: 2,
    stuckNote: "配色で2時間悩んだ。",
    howSolved: "最後は色を3色に減らしたらまとまった",
  },
  {
    peerId: "peer-nana",
    finishedDaysAgo: 5,
    stuckNote: "メニューの写真と文字が詰まって見えて、何度もやり直した。",
    howSolved: "写真の周りの余白を倍にしたら読みやすくなった",
  },
];

/** D いつもいる人：同期から自動で選ばれた3人 */
export const REGULAR_PEER_IDS = ["peer-saki", "peer-ryo", "peer-takeru"];
