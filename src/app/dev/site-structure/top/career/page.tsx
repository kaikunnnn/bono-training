/**
 * #267 01 UIUXデザイナーへの転職を進める（入口ページ）— 267-N 試作計画 / 中身は 267-L 3章・4章
 *
 * 新しい左ナビ（SiteStructureSidebar）が出る /dev/site-structure/top の下に置く。
 * 本文は v6 ロードマップ（career-change-v6/_parts/V6Body.tsx）をそのまま使い、スロットで差し込む:
 * 会員だけ「続きから」→ 見出し＋どんな人向け（仮）→ ゴール → 全体図 → 6つのステップ
 * → このタイプのよくある悩み（新）→ 先輩の道のり → よくある質問 → 次に整えたいこと（新）→ 出典
 * 未ログイン／会員は ?state=member（右下の確認用の切り替え）。本番は proxy の /dev 遮断で 404。
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { CareerChangeV6Body } from "../../../course-pages/prototyping/roadmap/career-change-v6/_parts/V6Body";
import { DevStateToggle } from "../_parts/DevStateToggle";
import {
  CareerAudience,
  CareerContinue,
  CareerContinueSkeleton,
  CareerNext,
  CareerTopLinks,
  CareerTroubles,
} from "../_parts/career-parts";
import { CAREER_BASE } from "../_parts/top-parts";

export const metadata: Metadata = {
  title: "01 UIUXデザイナーへの転職を進める（#267 試作）",
  robots: { index: false, follow: false },
};

export default async function CareerEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const member = state === "member";

  return (
    <>
      <CareerChangeV6Body
        topLinks={<CareerTopLinks member={member} />}
        beforeHero={
          member ? (
            <Suspense fallback={<CareerContinueSkeleton />}>
              <CareerContinue member={member} />
            </Suspense>
          ) : null
        }
        audience={<CareerAudience />}
        afterSteps={<CareerTroubles member={member} />}
        afterFaq={<CareerNext member={member} />}
      />
      {/* スマホでは v6 の「仮」タグの切り替え（下の中央）と重ならないよう少し上へ */}
      <DevStateToggle base={CAREER_BASE} member={member} className="bottom-16 md:bottom-4" />
    </>
  );
}
