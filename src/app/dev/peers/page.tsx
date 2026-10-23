/**
 * /dev/peers — 同期が見えるプロトタイプ（4パターン比較・#255）
 *
 * 休憩中のスマホで、同じ週に始めた同期の取り組みが見えて1タップで反応できると、
 * 作業に戻ってくるかを確かめるためのプロト。A 同期フィード / B いま作業中 / C 1歩先の人 / D いつもいる人。
 * ?pattern=a|b|c|d で直接開ける。データはすべて _data.ts のダミー（Supabase・Server Action なし）。
 * 仕様: rebono/issues/255_同期が見えるプロトタイプ_4パターン比較.md
 */

import type { Metadata } from "next";
import { toPatternKey } from "./_data";
import { PeersPrototype } from "./_components/PeersPrototype";

export const metadata: Metadata = {
  title: "同期が見えるプロト (/dev/peers)",
  robots: { index: false, follow: false },
};

export default async function PeersPage({
  searchParams,
}: {
  searchParams: Promise<{ pattern?: string | string[] }>;
}) {
  const { pattern } = await searchParams;
  return <PeersPrototype initialPattern={toPatternKey(pattern)} />;
}
