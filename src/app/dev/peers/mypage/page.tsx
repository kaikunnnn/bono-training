/**
 * /dev/peers/mypage — 同期が見えるプロトのマイページ組み込み版（#255）
 *
 * マイページ（src/app/mypage の複製）のタブの下・進行中の上に「同期」ブロックを入れ、
 * /dev/peers の4パターンをコンパクトにして切り替えられるようにした。右下の「プロト用の切り替え」か ?pattern=a|b|c|d で選ぶ。
 * データはすべてダミー（Supabase・Server Action なし）。
 */

import type { Metadata } from "next";
import { toPatternKey } from "../_data";
import { PeersMyPage } from "./_components/PeersMyPage";

export const metadata: Metadata = {
  title: "同期が見えるプロト マイページ版 (/dev/peers/mypage)",
  robots: { index: false, follow: false },
};

export default async function PeersMyPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ pattern?: string | string[] }>;
}) {
  const { pattern } = await searchParams;
  return <PeersMyPage initialPattern={toPatternKey(pattern)} />;
}
