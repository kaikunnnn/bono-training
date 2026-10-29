/**
 * #267 新しいトップの試作（267-M 試作計画 / 中身は 267-L 6章・7章）
 *
 * 並び（オーナー回答で 4=コース、5=転職の道のり）:
 * 0 会員だけ「続きから」の帯 → 1 ヒーロー → 2 4つの入口 → 3 悩みの帯 → 4 コース → 5 転職の道のり
 * → 6 ひとりで抱えない → 7 勉強法・キャリアの帯 → 8 みんなの実績 → 9 メンバーの案内（未ログインだけ）
 * 左ナビは SiteStructureSidebar。未ログイン／会員は ?state=member（右下の確認用の切り替え）。
 * 本番は proxy の DEV_ONLY_PATH_PREFIXES（/dev）で 404。
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { DevStateToggle } from "./_parts/DevStateToggle";
import { EntryTiles, TOP_BASE, TopHero } from "./_parts/top-parts";
import {
  Achievements,
  AchievementsSkeleton,
  CareerPathSection,
  ContinueBand,
  ContinueBandSkeleton,
  CourseSection,
  CourseSectionSkeleton,
  GuideBand,
  MemberGuide,
  SupportSection,
  TroubleBand,
} from "./_parts/sections";

export const metadata: Metadata = {
  title: "新しいトップの試作（#267）",
  robots: { index: false, follow: false },
};

export default async function SiteStructureTopPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const member = state === "member";

  return (
    <div className="pb-16">
      <div className="mx-auto w-full max-w-[1440px]">
        {member && (
          <Suspense fallback={<ContinueBandSkeleton />}>
            <ContinueBand />
          </Suspense>
        )}
        <TopHero member={member} />
        <EntryTiles member={member} />
        <TroubleBand member={member} />
        <Suspense fallback={<CourseSectionSkeleton />}>
          <CourseSection />
        </Suspense>
        <CareerPathSection member={member} />
        <SupportSection />
        <GuideBand />
        <Suspense fallback={<AchievementsSkeleton />}>
          <Achievements />
        </Suspense>
        {!member && <MemberGuide />}
      </div>

      <DevStateToggle base={TOP_BASE} member={member} />
    </div>
  );
}
