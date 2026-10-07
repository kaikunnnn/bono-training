/**
 * /dev/event-registration-patterns 用のモックデータ（DB・Sanity には触れない）。
 * /dev/event-registration のモックと同じ作り方（外部に取りに行かない data URI のアイコン）。
 */

import type { PortableTextBlock } from "@portabletext/types";
import type {
  EventParticipant,
  RegistrantProfile,
} from "@/lib/events/onsite-registration";

/** 外部に取りに行かないよう、色つきの丸アイコンを data URI で作る（モック画像なので生の色を使う） */
export function mockAvatar(bg: string, letter: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bg}"/><text x="40" y="53" font-size="34" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** 見ている本人（モック） */
export const VIEWER_ID = "viewer";
export const ME: RegistrantProfile = {
  name: "かい",
  avatarUrl: mockAvatar("#F97316", "K"),
};

/** キックオフの表示 */
export const KICKOFF_LABEL = "10/21（水）20:00";
/** 締め切りの表示（受付中の未申込カードに出す） */
export const DEADLINE_LABEL = "10月21日（水）";

/** 本人がすでに送ったコメント（申込済みから始めるときの初期値） */
export const MY_COMMENT =
  "数字を見ながら改善するのは初めてなので楽しみです。よろしくお願いします！";

/** 本人以外の参加者（新しい申込順） */
export const OTHERS: EventParticipant[] = [
  {
    id: "p-sato",
    name: "デザイン勉強中のさとう",
    avatarUrl: mockAvatar("#0EA5E9", "S"),
    comment: "参加します！",
    createdAt: "2026-10-08T00:00:00.000Z",
  },
  {
    id: "p-yuki",
    name: "Yuki",
    avatarUrl: null,
    comment: "毎週日曜の午前なら参加できそうです。キックオフから出ます。",
    createdAt: "2026-10-05T00:00:00.000Z",
  },
  {
    id: "p-tanaka",
    name: "たなか",
    avatarUrl: mockAvatar("#22C55E", "T"),
    comment: "Figmaで作った画面の改善を数字で検証したいです",
    createdAt: "2026-10-04T00:00:00.000Z",
  },
  {
    id: "p-mizuki",
    name: "みずき",
    avatarUrl: mockAvatar("#A855F7", "M"),
    comment: "よろしくお願いします🙌",
    createdAt: "2026-10-03T00:00:00.000Z",
  },
];

/** 本人の申込（申込済みから始めるときは「2番目に新しい」位置＝自然な位置に入る） */
export function myParticipant(
  comment: string,
  createdAt = "2026-10-06T00:00:00.000Z",
): EventParticipant {
  return {
    id: VIEWER_ID,
    name: ME.name,
    avatarUrl: ME.avatarUrl,
    comment,
    createdAt,
  };
}

/** 新しい申込順に並べる */
export function sortNewestFirst(list: EventParticipant[]): EventParticipant[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** アイコン列用：人数 n のアイコンURL（新しい順・最大4件） */
const STRIP_COLORS = ["#0EA5E9", "#22C55E", "#A855F7", "#EF4444", "#14B8A6"];
export function stripAvatars(n: number): (string | null)[] {
  return Array.from({ length: Math.min(n, 4) }, (_, i) =>
    i === 2 ? null : mockAvatar(STRIP_COLORS[i % STRIP_COLORS.length], String.fromCharCode(65 + i)),
  );
}

/** 本文のモック（本物の RichTextSection で描画する） */
function span(key: string, text: string) {
  return { _type: "span", _key: key, text, marks: [] };
}
function block(
  key: string,
  text: string,
  style: "normal" | "h2" = "normal",
): PortableTextBlock {
  return { _type: "block", _key: key, style, markDefs: [], children: [span(`${key}-s`, text)] };
}
function bullet(key: string, text: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [span(`${key}-s`, text)],
  };
}

export const MOCK_CONTENT: PortableTextBlock[] = [
  block(
    "p1",
    "1か月かけて、自分のプロダクトの数字を見ながら改善するイベントです。初回は10/21（水）20:00のキックオフです。",
  ),
  block("h1", "こんな人におすすめ", "h2"),
  bullet("l1", "作った画面を、数字で振り返ったことがない人"),
  bullet("l2", "改善案は出せるけれど、効果を確かめる方法がわからない人"),
  block("h2", "日程", "h2"),
  block(
    "p2",
    "キックオフ・相談会2回・成果発表の4回です。各回の内容と準備するものは、参加申込のあとに Slack でお知らせします。",
  ),
];
