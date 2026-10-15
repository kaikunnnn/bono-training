/**
 * /dev/course-pages/prototyping/roadmap/applied/mypage — 実物のマイページに当てはめる（#243）
 *
 * 本番のマイページ（MyPageShell ＋ 進行中・お気に入り・閲覧履歴のセクションをそのまま）の一番上に
 * 「続きから」カード（ContinueCourseCard: コースが親・次の記事が主・いまここは小さく1行）を置いた見た目。
 * トピック2の案では「続きから」はトップ（applied/home）へ移り、マイページは記録・お気に入り・設定の場所になる。
 * 会員の状態はモック（未経験から転職の途中・基礎コースを進めている）。ログイン不要・DB書き込みなし。
 * - 進行中・閲覧履歴: 本番のセクションに Sanity の実レッスン・実記事を渡して描く
 * - お気に入り: 空の状態（本番の空表示）。★を押すと書き込みが起きるため、モックでは並べない
 */

import type { Metadata } from "next";
import Link from "next/link";
import { MyPageShell } from "@/app/mypage/MyPageShell";
import { ProgressPreview } from "@/app/mypage/sections/ProgressSectionClient";
import { BookmarksPreview } from "@/app/mypage/sections/BookmarksSectionClient";
import { HistoryPreview } from "@/app/mypage/sections/HistorySectionClient";
import { ROADMAP_BASE } from "../../../../data/roadmaps";
import { KariProvider } from "../../../../template/kari";
import { ContinueCourseCard } from "../../ContinueCourseCard";
import { fetchContinueMock } from "../../continue-data";

export const metadata: Metadata = {
  title: "マイページに当てはめる（ロードマップ・プロト）",
  robots: { index: false, follow: false },
};

/** 本番 MySection の見出しと同じ見た目 */
const SECTION_HEADING = "font-rounded-mplus text-base font-semibold leading-6 text-text-primary";

export default async function AppliedMypagePage() {
  const { card, member } = await fetchContinueMock();

  return (
    <KariProvider>
      {/* 確認用（本番のページには出ない） */}
      <div className="border-b border-dashed border-border-default bg-muted-custom px-6 py-2 font-noto-sans-jp text-xs text-text-secondary lg:px-12">
        <Link href={`${ROADMAP_BASE}/placement`} className="font-bold text-text-primary hover:underline">
          ← サイト内の見せ方
        </Link>
        <span className="ml-3">
          プロト：本番のマイページに「続きから」カードを足した見た目（会員の状態はモック）。トップを会員のホームにする案では、このカードは
        </span>
        <Link href={`${ROADMAP_BASE}/applied/home`} className="font-bold text-text-primary hover:underline">
          トップ（続きから）
        </Link>
        <span>へ移る</span>
      </div>

      <MyPageShell activeTab="all">
        {/* 続きから（新しく一番上に置く） */}
        <section
          aria-labelledby="mypage-resume"
          className="flex w-full flex-col items-start gap-3 border-b border-border-light pb-10"
        >
          <h2 id="mypage-resume" className={SECTION_HEADING}>
            続きから
          </h2>
          <ContinueCourseCard data={card} />
        </section>

        {/* ここから下は本番のセクション（中身はモック） */}
        <ProgressPreview inProgressLessons={member.inProgress} />
        <BookmarksPreview bookmarks={[]} />
        <HistoryPreview viewHistory={member.history} />
      </MyPageShell>
    </KariProvider>
  );
}
