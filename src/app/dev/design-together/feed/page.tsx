/**
 * /dev/design-together/feed — 全体フィード（#253 S2 で中身を作る。S0 は入れ物だけ）
 */

import type { Metadata } from "next";
import { Activity } from "iconsax-react";
import { ComingSoonPage } from "../_proto/ComingSoonPage";

export const metadata: Metadata = {
  title: "フィード（いっしょにデザインのプロト）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <ComingSoonPage
      title="フィード"
      lead="みんなの「今日やること」の宣言と、作業を終えたあとのひとこと日報が流れる場所です。絵文字で反応できます。"
      icon={<Activity size={40} color="currentColor" variant="Outline" />}
      emptyTitle="まだ投稿がありません"
      emptyBody="作業を始めるときの宣言と、終えたあとの日報がここに並ぶ予定です。まずはマイページから今日の作業を始めてみてください。"
    />
  );
}
