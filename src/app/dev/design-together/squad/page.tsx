/**
 * /dev/design-together/squad — 仲間グループ（#253 S3 で中身を作る。S0 は入れ物だけ）
 */

import type { Metadata } from "next";
import { People } from "iconsax-react";
import { ComingSoonPage } from "../_proto/ComingSoonPage";

export const metadata: Metadata = {
  title: "仲間グループ（いっしょにデザインのプロト）",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <ComingSoonPage
      title="仲間グループ"
      lead="同じ週に始めた3人でグループになり、今週の目標（3人で合計6回）に向けて進める場所です。グループの中だけのフィードもここに出ます。"
      icon={<People size={40} color="currentColor" variant="Outline" />}
      emptyTitle="まだグループに入っていません"
      emptyBody="参加すると、同じ週に始めた人とグループが組まれます。グループの目標とメンバーの今週の様子がここに並ぶ予定です。"
    />
  );
}
