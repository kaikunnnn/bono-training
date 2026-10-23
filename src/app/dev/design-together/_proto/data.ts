/**
 * いっしょにデザインのプロト（#253）のダミーデータと定数
 *
 * レッスン・記事のダミーは #251（/dev/progress-feed/_proto/data.ts）の純粋なデータをそのまま使う。
 * リンク先（articleHref など）は /dev/design-together 配下に向けたものをここで持つ。
 * 保存はしない（Supabase・API・Server Action なし）。
 */

import type { Learner } from "../../progress-feed/_data";

export {
  PROTO_LESSONS,
  INITIAL_COMPLETED_ARTICLE_IDS,
  DUMMY_BOOKMARKS,
  DUMMY_HISTORY,
  findArticleBySlug,
  firstIncompleteArticle,
  lessonPercentage,
  prevNextArticles,
  type ProtoLesson,
} from "../../progress-feed/_proto/data";

export const DT_BASE = "/dev/design-together";
export const DT_MYPAGE = `${DT_BASE}/mypage`;
export const DT_FEED = `${DT_BASE}/feed`;
export const DT_SQUAD = `${DT_BASE}/squad`;
export const DT_CONTENTS = `${DT_BASE}/contents`;

/** 体験の主役になる動画ページ（Figma入門の続き） */
export const MAIN_ARTICLE_SLUG = "frame-and-layer";

export function articleHref(slug: string): string {
  return `${DT_CONTENTS}/${slug}`;
}

/** 押し忘れの自動終了まで（3時間） */
export const AUTO_END_MS = 3 * 60 * 60 * 1000;
/** 体験ガイドの「時間を進める」の幅 */
export const ADVANCE_MS = 3 * 60 * 60 * 1000;
/** 宣言の最大文字数 */
export const DECLARATION_MAX = 60;
export const DECLARATION_PLACEHOLDER = "ペルソナ作成の動画を1本見る";

/** ダミーの他の人が始めたり終えたりする間隔（ミリ秒・この範囲でランダム） */
export const SIM_MIN_MS = 20_000;
export const SIM_MAX_MS = 40_000;

export const ME_ID = "me";
export const ME: Learner = { id: ME_ID, name: "あなた", week: 2, tone: "brand" };

/** ダミーユーザー6人（BONOを始めて1〜2週目の人たち。呼ぶときは「さん」を付ける） */
export const MEMBERS: Learner[] = [
  { id: "dt-misaki", name: "みさき", week: 1, tone: "visual" },
  { id: "dt-kenta", name: "けんた", week: 2, tone: "ux" },
  { id: "dt-yui", name: "ゆい", week: 1, tone: "info" },
  { id: "dt-haruto", name: "はると", week: 2, tone: "career" },
  { id: "dt-natsumi", name: "なつみ", week: 1, tone: "orange" },
  { id: "dt-kohei", name: "こうへい", week: 2, tone: "olive" },
];

/** 最初から作業中の2人（体験ガイドの「2人」に戻すときもこの2人） */
export const INITIAL_WORKING_IDS = ["dt-misaki", "dt-kenta"];
/** 最初の2人が何分前に始めたことにするか */
export const INITIAL_WORKING_MINUTES_AGO = [24, 9];

export function findMember(id: string): Learner {
  if (id === ME_ID) return ME;
  return MEMBERS.find((m) => m.id === id) ?? { id, name: "メンバー", week: 0, tone: "night" };
}

/** 表示名（自分は「あなた」、ほかは「さん」付け） */
export function displayName(id: string): string {
  return id === ME_ID ? "あなた" : `${findMember(id).name}さん`;
}
