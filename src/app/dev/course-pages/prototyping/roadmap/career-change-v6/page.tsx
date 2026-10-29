/**
 * /dev/course-pages/prototyping/roadmap/career-change-v6 — 未経験からUIデザイナーへ（v6・A 全体のページ）#243
 *
 * 計画: rebono/issues/243-C_試作計画_v6.md §3。本文は _parts/V6Body.tsx（#267 の 01 転職の入口ページと共用）。
 * ここではスロットを渡さない＝v6 の元の見た目のまま。
 */

import type { Metadata } from "next";
import { CareerChangeV6Body } from "./_parts/V6Body";

export const metadata: Metadata = {
  title: "未経験からUIデザイナーへ（v6・ロードマップ）",
  robots: { index: false, follow: false },
};

export default async function CareerChangeV6Page() {
  return <CareerChangeV6Body />;
}
