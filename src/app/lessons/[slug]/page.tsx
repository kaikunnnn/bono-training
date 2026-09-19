import { Metadata } from "next";
import { Suspense } from "react";
import { OG_DEFAULTS } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import { getLessonMetadata, urlFor } from "@/lib/sanity";
import {
  getEffectiveLearningPlanType,
  isContentLocked,
} from "@/lib/subscription";
import LessonDetailClient from "./LessonDetailClient";
import PersonaLessonTopClient from "./PersonaLessonTopClient";
import { PERSONA_LESSON_SLUG } from "@/lib/persona-lesson-top-config";
import { generateCourseJsonLd, jsonLdScriptProps } from "@/lib/jsonld";
import { traceServerStep } from "@/lib/performance/server-trace";
import { LessonProgressBar } from "@/components/ui/LessonProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import QuestList from "@/components/lesson/QuestList";
import {
  buildPublicLesson,
  startLessonPageData,
  startStandardLessonPresentation,
  type LessonPageLesson,
} from "./lesson-page-data";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

type LessonPresentationPromise = ReturnType<
  typeof startStandardLessonPresentation
>;

async function PersonalizedLessonProgress({
  presentationPromise,
}: {
  presentationPromise: LessonPresentationPromise;
}) {
  const { progressPercent } = await presentationPromise;
  return <LessonProgressBar progress={progressPercent} width="64%" />;
}

async function PersonalizedLessonCurriculum({
  lesson,
  presentationPromise,
}: {
  lesson: LessonPageLesson;
  presentationPromise: LessonPresentationPromise;
}) {
  const { processedLesson, questProgressMap } = await presentationPromise;
  return (
    <QuestList
      contentHeading={lesson.contentHeading}
      quests={processedLesson.quests || []}
      questProgressMap={questProgressMap}
    />
  );
}

function LessonProgressFallback() {
  return (
    <div
      className="flex items-center gap-[9px]"
      style={{ width: "64%" }}
      aria-label="レッスン進捗を読み込み中"
    >
      <Skeleton className="flex-1 h-[7px] rounded-full" />
      <Skeleton className="h-6 w-10" />
    </div>
  );
}

function LessonCurriculumFallback() {
  return (
    <div className="w-full space-y-6" aria-label="カリキュラムを読み込み中">
      {Array.from({ length: 2 }).map((_, questIndex) => (
        <div key={questIndex} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="rounded-[24px] bg-white p-4 space-y-3">
            {Array.from({ length: 3 }).map((__, articleIndex) => (
              <Skeleton key={articleIndex} className="h-[77px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await traceServerStep("lesson.metadata.cms", () =>
    getLessonMetadata(slug)
  );

  if (!lesson) {
    return {
      title: "レッスンが見つかりません",
    };
  }

  const title = `${lesson.seoTitle || lesson.title}`;
  const description = lesson.description || `${lesson.title}のレッスン内容を学習できます。`;
  const imageUrl = lesson.thumbnailUrl || lesson.iconImageUrl;

  return {
    title,
    description,
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      type: "article",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: { canonical: `/lessons/${slug}` },
  };
}

// ページコンポーネント（Server Component）
export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lessonRequest = startLessonPageData(slug);
  const lesson = await lessonRequest.lessonPromise;

  if (!lesson) {
    notFound();
  }

  if (slug === PERSONA_LESSON_SLUG) {
    // 専用ページは通常レッスンと表示構造が異なるため、このバッチでは
    // 従来どおりアクセス判定完了後に一体で描画する。
    const subscription = await lessonRequest.subscriptionPromise;
    const effectivePlanType = getEffectiveLearningPlanType(
      subscription.planType,
      subscription.hasLearningAccess
    );
    const personaLesson = {
      _id: lesson._id,
      title: lesson.title,
      slug: lesson.slug,
      iconImageUrl: lesson.iconImageUrl,
      quests: (lesson.quests || []).map((quest, questIndex) => ({
        _id: quest._id,
        questNumber: quest.questNumber || questIndex + 1,
        title: quest.title,
        articles: (quest.articles || []).map((article, articleIndex) => ({
          _id: article._id,
          articleNumber: articleIndex + 1,
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          thumbnailUrl:
            article.thumbnailUrl ||
            (article.thumbnail?.asset?._ref
              ? urlFor(article.thumbnail)
                  .width(320)
                  .height(180)
                  .fit("crop")
                  .auto("format")
                  .url()
              : undefined),
          videoUrl: article.videoUrl,
          videoDuration: article.videoDuration,
          articleType:
            questIndex === 0 && /トレーニング(?:の)?準備/.test(article.title)
              ? ("intro" as const)
              : article.articleType,
          isPremium: article.isPremium,
          isLocked: isContentLocked(
            article.isPremium || false,
            effectivePlanType
          ),
        })),
      })),
    };

    return (
      <>
        <script
          {...jsonLdScriptProps(
            generateCourseJsonLd({
              title: lesson.title,
              description:
                lesson.description || `${lesson.title}のレッスン内容を学習できます。`,
              url: `/lessons/${slug}`,
              image: lesson.thumbnailUrl || lesson.iconImageUrl,
            })
          )}
        />
        <PersonaLessonTopClient
          lesson={personaLesson}
          hasFullAccess={subscription.hasLearningAccess}
        />
      </>
    );
  }

  // CMSシェルを先に返し、購読と進捗は同じPromiseを共有して段階表示する。
  // 進捗はlesson取得直後に開始するため、購読完了後のwaterfallにならない。
  const publicLesson = buildPublicLesson(lesson);
  const presentationPromise = startStandardLessonPresentation(
    lesson,
    lessonRequest.subscriptionPromise,
  );

  return (
    <>
      <script
        {...jsonLdScriptProps(
          generateCourseJsonLd({
            title: lesson.title,
            description: lesson.description || `${lesson.title}のレッスン内容を学習できます。`,
            url: `/lessons/${slug}`,
            image: lesson.thumbnailUrl || lesson.iconImageUrl,
          })
        )}
      />
      <LessonDetailClient
        lesson={publicLesson}
        progress={0}
        questProgressMap={{}}
        progressContent={
          <Suspense fallback={<LessonProgressFallback />}>
            <PersonalizedLessonProgress
              presentationPromise={presentationPromise}
            />
          </Suspense>
        }
        contentTab={
          <Suspense fallback={<LessonCurriculumFallback />}>
            <PersonalizedLessonCurriculum
              lesson={lesson}
              presentationPromise={presentationPromise}
            />
          </Suspense>
        }
      />
    </>
  );
}
