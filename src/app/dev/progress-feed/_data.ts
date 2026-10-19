/**
 * /dev/progress-feed のダミーデータ（#251）
 *
 * 保存はしない。ページを開くたびにここの値から始まる。
 * 時刻は「◯分前」の数値で持つ（Date.now() を使うとSSRとブラウザで表示がずれるため）。
 */

/** アバターの塗り色（DSトークンのみ） */
export type AvatarTone =
  | "career"
  | "ux"
  | "info"
  | "visual"
  | "olive"
  | "orange"
  | "link"
  | "night"
  | "brand";

export interface Learner {
  id: string;
  name: string;
  /** BONOを始めて何週目か（表示用） */
  week: number;
  tone: AvatarTone;
}

export const ME_ID = "me";
export const BONO_ID = "bono";

export const ME: Learner = { id: ME_ID, name: "あなた", week: 2, tone: "brand" };

/** 運営アカウント（反応ゼロ対策で最初の応援を付ける） */
export const BONO_STAFF: Learner = {
  id: BONO_ID,
  name: "BONO運営",
  week: 0,
  tone: "brand",
};

export const LEARNERS: Learner[] = [
  { id: "sato", name: "佐藤", week: 3, tone: "visual" },
  { id: "suzuki", name: "すずき", week: 1, tone: "ux" },
  { id: "tanaka", name: "たなか", week: 2, tone: "info" },
  { id: "yamamoto", name: "山本", week: 4, tone: "career" },
  { id: "maiko", name: "まいこ", week: 1, tone: "orange" },
  { id: "kobayashi", name: "小林", week: 2, tone: "olive" },
  { id: "yuto", name: "ゆうと", week: 3, tone: "link" },
  { id: "nakamura", name: "中村", week: 1, tone: "night" },
  { id: "aoi", name: "あおい", week: 2, tone: "visual" },
  { id: "kimura", name: "木村", week: 4, tone: "ux" },
];

const ALL_PEOPLE: Learner[] = [ME, BONO_STAFF, ...LEARNERS];

export function findPerson(id: string): Learner {
  return ALL_PEOPLE.find((p) => p.id === id) ?? { id, name: "メンバー", week: 0, tone: "night" };
}

export interface ContentItem {
  id: string;
  /** コンテンツ名 */
  title: string;
  /** その中のレッスン名（1本分） */
  lesson: string;
  /** 1本あたりの目安時間（分） */
  minutes: number;
}

/** 「学習を始める」で選べるコンテンツ */
export const CONTENTS: ContentItem[] = [
  { id: "figma", title: "Figma入門", lesson: "フレームとレイヤーの基本", minutes: 15 },
  { id: "visual", title: "UIビジュアル基礎", lesson: "余白でまとまりを作る", minutes: 20 },
  { id: "ia", title: "情報設計の基本", lesson: "画面に載せる情報を洗い出す", minutes: 25 },
  { id: "cycle", title: "デザインサイクル", lesson: "目的を言葉にする", minutes: 20 },
];

export function findContent(id: string): ContentItem {
  return CONTENTS.find((c) => c.id === id) ?? CONTENTS[0];
}

export function contentLabel(c: ContentItem): string {
  return `${c.title}「${c.lesson}」`;
}

/** 流れる節目（お祝いしやすい区切りだけ） */
export type Milestone = "first" | "streak3" | "lesson" | "quest" | "content";

export const MILESTONE_LABEL: Record<Milestone, string> = {
  first: "はじめての完了",
  streak3: "3日続いた",
  lesson: "レッスン1本完了",
  /** フェーズ2（実ページ組み込み版）でクエストの最後の記事を終えたとき */
  quest: "クエスト完了",
  content: "コンテンツを1つ完走",
};

/** 「今やっている人」帯の1人分 */
export interface LiveEntry {
  learnerId: string;
  contentTitle: string;
  startedMinutesAgo: number;
}

export const INITIAL_LIVE: LiveEntry[] = [
  { learnerId: "tanaka", contentTitle: "UIビジュアル基礎", startedMinutesAgo: 3 },
  { learnerId: "maiko", contentTitle: "Figma入門", startedMinutesAgo: 8 },
  { learnerId: "yamamoto", contentTitle: "情報設計の基本", startedMinutesAgo: 15 },
  { learnerId: "aoi", contentTitle: "デザインサイクル", startedMinutesAgo: 22 },
];

/** 自分が始めたあとに「がんばろ」を送ってくれる人 */
export const INCOMING_CHEER_FROM = "maiko";

/** フィードの投稿 */
export interface FeedPost {
  id: string;
  authorId: string;
  /** 例: Figma入門「オートレイアウトを使う」 */
  contentText: string;
  milestone: Milestone;
  minutesAgo: number;
  /** 応援した人のID（自分＝ME_ID を含めば押下済み） */
  cheeredBy: string[];
  /** 反応がついてフィードの上に戻ってきた投稿か */
  bumped?: boolean;
}

export const INITIAL_POSTS: FeedPost[] = [
  {
    id: "p1",
    authorId: "suzuki",
    contentText: "Figma入門「フレームとレイヤーの基本」",
    milestone: "first",
    minutesAgo: 12,
    cheeredBy: ["sato", "kimura"],
  },
  {
    id: "p2",
    authorId: "sato",
    contentText: "UIビジュアル基礎「文字の大きさで強弱をつける」",
    milestone: "streak3",
    minutesAgo: 34,
    cheeredBy: ["tanaka", "yuto", "aoi", "kobayashi"],
  },
  {
    id: "p3",
    authorId: "nakamura",
    contentText: "情報設計の基本「画面に載せる情報を洗い出す」",
    milestone: "first",
    minutesAgo: 58,
    cheeredBy: [BONO_ID],
  },
  {
    id: "p4",
    authorId: "kobayashi",
    contentText: "デザインサイクル「目的を言葉にする」",
    milestone: "lesson",
    minutesAgo: 95,
    cheeredBy: ["sato"],
  },
  {
    id: "p5",
    authorId: "yuto",
    contentText: "Figma入門「オートレイアウトを使う」",
    milestone: "lesson",
    minutesAgo: 140,
    cheeredBy: ["maiko", "aoi"],
  },
  {
    id: "p6",
    authorId: "kimura",
    contentText: "UIビジュアル基礎",
    milestone: "content",
    minutesAgo: 210,
    cheeredBy: ["yamamoto", "sato", "tanaka", "yuto", "suzuki", "aoi"],
  },
  {
    id: "p7",
    authorId: "aoi",
    contentText: "情報設計の基本「ユーザーの行動を順に並べる」",
    milestone: "streak3",
    minutesAgo: 320,
    cheeredBy: ["kobayashi", "nakamura"],
  },
  {
    id: "p8",
    authorId: "tanaka",
    contentText: "デザインサイクル「アイデアを3つ出す」",
    milestone: "lesson",
    minutesAgo: 480,
    cheeredBy: [],
  },
  {
    id: "p9",
    authorId: "yamamoto",
    contentText: "UIビジュアル基礎「色の数をしぼる」",
    milestone: "lesson",
    minutesAgo: 900,
    cheeredBy: ["kimura"],
  },
];

/** 「反応が届く」で時間が進んだことにして増える他の人の投稿 */
export const LATER_POSTS: FeedPost[] = [
  {
    id: "p10",
    authorId: "maiko",
    contentText: "Figma入門「フレームとレイヤーの基本」",
    milestone: "first",
    minutesAgo: 2,
    cheeredBy: [BONO_ID],
  },
  {
    id: "p11",
    authorId: "tanaka",
    contentText: "UIビジュアル基礎「余白でまとまりを作る」",
    milestone: "lesson",
    minutesAgo: 6,
    cheeredBy: ["sato"],
  },
];

/** 自分の投稿に応援してくれる3人（通知文の「Aさんたち3人」） */
export const CHEERERS_FOR_ME = ["sato", "suzuki", "yuto"];

export const MY_POST_ID = "my-post";

/** 体験ガイドの場面 */
export interface GuideStep {
  key: "start" | "post" | "browse" | "notify" | "return";
  label: string;
  title: string;
  description: string;
  todo: string;
  /** この場面で取り除きたい障壁（issue #251 の番号） */
  barriers: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    key: "start",
    label: "0",
    title: "始める",
    description:
      "「学習を始める」を押すと、上の「今やっている人」にあなたが加わります。今この時間に進めている人が見えて、ひとことで励まし合えます。",
    todo: "誰かに「👋 がんばろ」を送ってから、「学習を始める」でコンテンツを選んで開始してください。少しすると、あなたにも「がんばろ」が届きます。",
    barriers: "1-6 一人で続けている感覚 / 2-4 覗くだけの理由",
  },
  {
    key: "post",
    label: "1",
    title: "投稿する（自動）",
    description:
      "パターンAは自分で文章を書きません。終えるとお祝いの画面が出て、節目のときだけ「あなたが△△を終えました」がフィードに流れます。流したくないときは止められます。",
    todo: "「今やっている人」のあなたの欄にある「終える」を押して、完了画面で流すかどうかを選んでください。",
    barriers: "1-7 出す自信がない / 1-9 自信がない人は投稿しない",
  },
  {
    key: "browse",
    label: "2",
    title: "他の人の投稿を見る",
    description:
      "フィードに「◯◯さんが△△を終えました」が並びます。スタンプは📣応援の1種類だけで、1タップで送れます。「今週はじめた人」の枠は、始めたばかりの人に応援が集まるように上に置いています。",
    todo: "気になった投稿や「今週はじめた人」に📣応援を押してみてください。",
    barriers: "1-6 仲間が見えない / 1-10 反応ゼロで離れる",
  },
  {
    key: "notify",
    label: "3",
    title: "反応が届く",
    description:
      "時間がたって、他の人の投稿がいくつか流れてきた状態から始まります。あなたの投稿に応援が集まると、右上のベルにバッジが付きます。",
    todo: "「反応を届ける」を押してから、右上のベルを開いてください。",
    barriers: "1-1 外から思い出すきっかけ / 1-8 反応ループに入れない",
  },
  {
    key: "return",
    label: "4",
    title: "戻ってくる",
    description:
      "通知を1タップすると、あなたの投稿まで移動して少しのあいだ強調されます。応援がついた投稿はフィードの一番上に戻ってきます。",
    todo: "ベルの中の通知を押してください。",
    barriers: "5-1 開くハードル / 1-4 習慣になる前に間が空く",
  },
];

/** 「◯分前」の表示 */
export function formatMinutesAgo(minutes: number): string {
  if (minutes <= 0) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}時間前`;
  return `${Math.floor(minutes / (60 * 24))}日前`;
}
