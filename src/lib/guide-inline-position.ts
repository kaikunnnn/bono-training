/**
 * /guide 記事の本文中ブロック（#280）を差し込む位置を決める（純粋関数）。
 *
 * 機械的なルール（最初の見出しの手前など）はやめた。記事の流れと関係なく出て広告に見えたため（2026-11-12 オーナー判断）。
 * 本文が「学ぶ順番」やロードマップの話をしている段落を記事ごとに選び、その段落の `_key` を
 * GUIDE_INLINE_BLOCKS（guide-roadmap-map.ts）に書く。ここではその段落のすぐ後ろの位置を返す。
 *
 * 戻り値は「この index のブロックの手前に差し込む」位置（content.slice(0, i) / content.slice(i)）。
 * 段落が見つからない（Sanity で本文を書き換えた等）ときは null（出さない）。
 */

interface KeyedBlock {
  _key?: string;
}

export function findInsertIndexAfterKey(
  content: readonly KeyedBlock[] | null | undefined,
  afterKey: string
): number | null {
  if (!content) return null;
  const i = content.findIndex((b) => b?._key === afterKey);
  if (i < 0 || i + 1 >= content.length) return null;
  return i + 1;
}
