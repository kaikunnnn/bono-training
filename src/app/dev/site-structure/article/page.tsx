/**
 * #267 試作1 — 記事ページの改善案（Before / After）
 *
 * 本物の記事（Sanity・読み取りのみ）を、本物の記事部品で描く。
 * - Before: 今の /contents/[slug] と同じ部品・同じロック（ContentPreviewOverlay）
 * - After : 上にパンくずと「現在地」、ロックの中身を変え、最後に「ステップへ戻る」とコース1つ
 *
 * 題材は ui-architect-beginner-65（検索に戻している会員限定記事＝検索で着地する記事）。
 * レッスン「ゼロからはじめるUI情報設計」は、転職ロードマップ v6 のステップ3（画面の流れを設計する）の話。
 *
 * 会員限定の本文は無料範囲だけを切り出して渡す（有料部分は描画にも RSC にも載せない）。
 * 見え方は ?view=before|after をサーバーで読み分ける（h1 が1つになるよう、片方だけ描く）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, LogIn, MapPin } from "lucide-react";
import { getArticleWithContext } from "@/lib/sanity";
import { freeBlockCountForIndexablePremium } from "@/lib/seo/indexablePremium";
import { PREMIUM_PREVIEW_BLOCK_COUNT } from "@/lib/seo/articleDescription";
import { ArticleSideNavNew } from "@/components/article/sidebar";
import VideoSection from "@/components/article/VideoSection";
import HeadingSection from "@/components/article/HeadingSection";
import TodoSection from "@/components/article/TodoSection";
import RichTextSection from "@/components/article/RichTextSection";
import ContentNavigation from "@/components/article/ContentNavigation";
import { Button } from "@/components/ui/button";
import { getCourse, lessonSlugs } from "../../course-pages/data";
import { fetchLessons } from "../../course-pages/data/sanity-lessons";
import { getV6Step } from "../../course-pages/data/roadmap-career-change-v6";
import { Breadcrumb, CourseCard } from "../../course-pages/prototyping/roadmap/career-change-v6/_parts/parts";
import { T } from "../../course-pages/template/kari";
import { Kari, ProtoBar, V6_BASE, v6Step } from "../_parts/shared";

export const metadata: Metadata = {
  title: "記事ページの改善案（#267 試作）",
  robots: { index: false, follow: false },
};

const SLUG = "ui-architect-beginner-65";
const STEP_N = 3;

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ArticleProtoPage({ searchParams }: PageProps) {
  const { view: viewParam } = await searchParams;
  const view: "before" | "after" = viewParam === "after" ? "after" : "before";

  const article = await getArticleWithContext(SLUG);
  if (!article) {
    return (
      <div className="p-8 font-noto-sans-jp text-text-secondary">
        記事（{SLUG}）を Sanity から取得できませんでした。
      </div>
    );
  }

  // 非会員に見える範囲だけを切り出す（本番の /contents と同じ計算）
  const freeCount =
    freeBlockCountForIndexablePremium(SLUG, article.content) ?? PREMIUM_PREVIEW_BLOCK_COUNT;
  const previewBlocks = (article.content ?? []).slice(0, article.isPremium ? freeCount : undefined);

  // サイドナビ（Client）には本文・動画URLを渡さない（layout.tsx と同じ）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content: _content, videoUrl: _videoUrl, ...navArticle } = article;

  // レッスン内の位置・前後・無料で読める次の記事
  const flat = (article.lessonInfo?.quests ?? []).flatMap((q) =>
    (q.articles ?? []).map((a) => ({ slug: a.slug.current, title: a.title, isPremium: !!a.isPremium }))
  );
  const index = flat.findIndex((a) => a.slug === SLUG);
  const position = index + 1;
  const total = flat.length;
  const freeTotal = flat.filter((a) => !a.isPremium).length;
  const nextFree =
    flat.slice(index + 1).find((a) => !a.isPremium) ?? [...flat.slice(0, index)].reverse().find((a) => !a.isPremium);
  const navigation = {
    previous: index > 0 ? { slug: flat[index - 1].slug, title: flat[index - 1].title } : undefined,
    next: index >= 0 && index < flat.length - 1 ? { slug: flat[index + 1].slug, title: flat[index + 1].title } : undefined,
  };

  const lessonSlug = article.lessonInfo?.slug?.current ?? "";
  const lessonTitle = article.lessonInfo?.title ?? "レッスン";
  const articleIndex = article.questInfo?.articles
    ? article.questInfo.articles.findIndex((a) => a._id === article._id) + 1
    : undefined;

  const step = getV6Step(STEP_N);
  const course = step && step.course.type === "course" ? getCourse(step.course.slug) : null;
  const lessons = await fetchLessons([...(course ? lessonSlugs(course) : []), lessonSlug].filter(Boolean));
  const lessonDescription = lessons[lessonSlug]?.description ?? null;

  const isAfter = view === "after";

  return (
    <div className="font-noto-sans-jp">
      <ProtoBar
        title="試作1 記事ページの改善案"
        note={`本物の記事「${article.title}」を、本物の記事部品で表示（非会員の見え方）。本番の記事ページは全体ナビ（左のサイドバー）を出さないが、ここは /dev なので出ている。`}
        options={[
          { label: "Before（今）", href: "?view=before", active: !isAfter },
          { label: "After（改善案）", href: "?view=after", active: isAfter },
        ]}
      />

      <div className="mx-auto flex w-full max-w-[1400px]">
        {/* 左: レッスンの目次（本番と同じ部品） */}
        <aside className="hidden w-[300px] shrink-0 md:block">
          <ArticleSideNavNew
            article={navArticle}
            currentArticleId={article._id}
            completedArticleIds={[]}
            showLogo={false}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4 px-4 pb-12 pt-6 sm:px-6">
          {isAfter ? (
            <div className="flex flex-col gap-3">
              <Breadcrumb
                items={[
                  { label: "ロードマップ（転職）", href: V6_BASE },
                  { label: `ステップ${STEP_N} ${step?.short ?? ""}`, href: v6Step(STEP_N) },
                  { label: lessonTitle, href: `/lessons/${lessonSlug}` },
                  { label: "記事" },
                ]}
              />
              {/* 現在地（記事の冒頭で「全体のどこの話か」を言う） */}
              <div className="flex gap-3 rounded-[20px] border border-border-light bg-surface p-4">
                <MapPin size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-text-muted" />
                <div className="min-w-0 text-sm leading-[1.8] text-text-secondary">
                  <p>
                    この記事は、転職ロードマップのステップ{STEP_N}『{step?.short}』で使うレッスン『{lessonTitle}』の
                    {total > 0 ? ` ${position}本目（全${total}本）` : ""}です。
                  </p>
                  <p>
                    作った画面を一度壊して、テーブルUIを例に情報の置き方を見直す回です。
                    <Kari />
                  </p>
                  <Link href={v6Step(STEP_N)} className="mt-1 inline-flex items-center gap-1 font-bold text-text-link hover:underline">
                    ステップ{STEP_N}の全体を見る
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <VideoSection
            videoUrl={undefined}
            thumbnail={article.thumbnail}
            thumbnailUrl={article.thumbnailUrl}
            isPremium={article.isPremium}
            hasAccess={false}
            isLoggedIn={false}
            redirectTo={`/contents/${SLUG}`}
          />

          <div className="flex flex-col gap-3">
            <HeadingSection
              tagType={article.articleType as "explain" | "intro" | "practice" | "challenge" | "demo" | undefined}
              title={article.title}
              description={article.excerpt}
              questInfo={
                article.questInfo
                  ? { questNumber: article.questInfo.questNumber, title: article.questInfo.title }
                  : undefined
              }
              articleIndex={articleIndex}
              articleId={article._id}
              lessonId={article.lessonInfo?._id ?? ""}
              isPremium={article.isPremium}
              actions={null}
            />
            <TodoSection items={article.learningObjectives} />

            {isAfter ? (
              <>
                {/* 無料範囲だけ描き、ロックは新しい箱に置き換える */}
                <RichTextSection content={previewBlocks} isPremium={false} hasAccess />
                <ImprovedLock
                  lessonDescription={lessonDescription}
                  position={position}
                  total={total}
                  freeTotal={freeTotal}
                  nextFree={nextFree ?? null}
                />
              </>
            ) : (
              <RichTextSection
                content={previewBlocks}
                isPremium={article.isPremium}
                hasAccess={false}
                previewBlockCount={freeCount}
                isLoggedIn={false}
                redirectTo={`/contents/${SLUG}`}
              />
            )}

            <ContentNavigation previous={navigation.previous} next={navigation.next} />

            {isAfter && step ? (
              <div className="mt-6 flex flex-col gap-8 rounded-[20px] bg-surface p-5 md:p-8">
                <section aria-labelledby="hub-back-title">
                  <h2 id="hub-back-title" className="font-heading text-xl font-bold text-text-primary">
                    この記事は、全体のどこの話？
                  </h2>
                  <p className="mt-2 text-sm leading-[1.8] text-text-secondary">
                    転職ロードマップのステップ{STEP_N}「{step.canDo}」の一部です。
                    ステップのページで、ほかに何をやるか・どんなアウトプットを作るかを確かめられます。
                  </p>
                  <Button asChild variant="outline" size="lg" className="mt-4">
                    <Link href={v6Step(STEP_N)}>
                      <ArrowLeft size={16} aria-hidden="true" />
                      ステップ{STEP_N}「{step.short}」へ戻る
                    </Link>
                  </Button>
                </section>

                <section aria-labelledby="course-title">
                  <h2 id="course-title" className="font-heading text-xl font-bold text-text-primary">
                    このステップを実践できるコース
                  </h2>
                  {step.course.type === "course" ? (
                    <p className="mt-2 text-sm leading-[1.8] text-text-secondary">
                      <T f={step.course.reason} />
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <CourseCard course={step.course} lessons={lessons} headingLevel="h3" />
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

/** 改善したロックの箱: 何ができるようになるか → 何本目か → 無料で読める次の記事 → 会員CTA */
function ImprovedLock({
  lessonDescription,
  position,
  total,
  freeTotal,
  nextFree,
}: {
  lessonDescription: string | null;
  position: number;
  total: number;
  freeTotal: number;
  nextFree: { slug: string; title: string } | null;
}) {
  const percent = total > 0 ? Math.round((position / total) * 100) : 0;
  return (
    <section
      aria-labelledby="lock-title"
      className="flex flex-col gap-5 rounded-[20px] border border-border-light bg-surface p-5 md:p-8"
    >
      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted">
        <Lock size={14} aria-hidden="true" />
        ここから先はメンバー限定です
      </p>

      <div>
        <h2 id="lock-title" className="font-heading text-xl font-bold leading-[1.5] text-text-primary">
          このレッスンで、できるようになること
        </h2>
        {lessonDescription ? (
          <p className="mt-2 text-sm leading-[1.8] text-text-secondary">{lessonDescription}</p>
        ) : null}
        <ul className="mt-2 list-disc pl-5 text-sm leading-[1.8] text-text-secondary">
          <li>
            要件から、画面に置く情報と並べ方を、理由つきで決められる
            <Kari />
          </li>
          <li>
            一度つくった画面を自分で見直して、Ver.2に直せる
            <Kari />
          </li>
        </ul>
      </div>

      {total > 0 ? (
        <div>
          <p className="text-sm text-text-secondary">
            この記事は、レッスンの <span className="font-bold text-text-primary">{position}/{total}本目</span>
            （無料で読めるのは{freeTotal}本）
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted-strong" aria-hidden="true">
            <div className="h-full rounded-full bg-text-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>
      ) : null}

      {nextFree ? (
        <div className="rounded-[16px] bg-muted-custom p-4">
          <p className="text-xs font-bold text-text-muted">無料で読める次の記事</p>
          <Link
            href={`/contents/${nextFree.slug}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-text-link hover:underline"
          >
            {nextFree.title}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* 試作なので計測付きの PricingCtaLink は使わない（本番では group="content_lock"） */}
        <Button asChild size="large" className="flex-1 text-base">
          <Link href="/subscription">メンバーになって続きを読む</Link>
        </Button>
        <Button asChild variant="outline" size="large" className="flex-1 text-base">
          <Link href={`/login?redirectTo=${encodeURIComponent(`/contents/${SLUG}`)}`}>
            <LogIn size={16} aria-hidden="true" />
            ログインする
          </Link>
        </Button>
      </div>
    </section>
  );
}
