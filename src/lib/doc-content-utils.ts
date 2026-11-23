/**
 * 作業資料（#307）用のレッスン・クエスト・記事の印。
 *
 * 作業資料は本番 Sanity にレッスンの形で置くが、URL を直接開いた人にだけ見せる。
 * 資料用スクリプト（scripts/doc-lesson-write.ts）は _id の頭が `doc-` のものしか書かないので、
 * この印で一覧・新着・検索・サイトマップ・AIチャットから外し、ページには noindex を付ける。
 *
 * isHidden は使わない: 既存の公開レッスン（例: rick-rubin-creativity）が isHidden=true のまま
 * 一覧に出ており、isHidden で外すとそれも消えてしまうため。
 */
export const DOC_ID_PREFIX = "doc-";

/** GROQ の絞り込み条件: 作業資料ではないもの */
export const NOT_DOC_FILTER = `!string::startsWith(_id, "${DOC_ID_PREFIX}")`;

/** GROQ の射影: 作業資料かどうか */
export const IS_DOC_PROJECTION = `"isDoc": string::startsWith(_id, "${DOC_ID_PREFIX}")`;

export function isDocId(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith(DOC_ID_PREFIX);
}
