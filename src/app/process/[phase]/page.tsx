import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import DottedDivider from "@/components/common/DottedDivider";
import { PROCESS_PHASES, getPhaseBySlug } from "../data";
import { TOPIC_COURSES } from "../../topics/data";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ phase: string }>;
}

export async function generateStaticParams() {
  return PROCESS_PHASES.map((p) => ({ phase: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { phase } = await params;
  const p = getPhaseBySlug(phase);
  if (!p) return { title: "フェーズが見つかりません" };
  return {
    title: `${p.titleJa}（${p.titleEn}）| プロダクトを作る | BONO`,
    description: p.description,
  };
}

export default async function PhaseDetailPage({ params }: PageProps) {
  const { phase } = await params;
  const currentPhase = getPhaseBySlug(phase);

  if (!currentPhase) {
    notFound();
  }

  const currentIndex = PROCESS_PHASES.findIndex((p) => p.slug === phase);
  const prevPhase = currentIndex > 0 ? PROCESS_PHASES[currentIndex - 1] : null;
  const nextPhase = currentIndex < PROCESS_PHASES.length - 1 ? PROCESS_PHASES[currentIndex + 1] : null;

  const relatedTopics = currentPhase.relatedTopicSlugs
    .map((slug) => TOPIC_COURSES.find((t) => t.slug === slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <div className="max-w-[740px] mx-auto px-4 sm:px-6">
        {/* 戻る */}
        <div className="pt-4">
          <BackButton href="/process" />
        </div>

        {/* ヒーロー */}
        <section className="pt-10 pb-12 flex flex-col items-center text-center gap-5">
          {/* フェーズ番号 */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: currentPhase.color }}
          >
            {currentPhase.number}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: currentPhase.color }}>
              {currentPhase.titleEn}
            </span>
          </div>

          <h1 className="text-[32px] sm:text-[40px] font-bold text-text-primary font-rounded-mplus leading-tight flex items-center gap-3">
            <span>{currentPhase.emoji}</span>
            {currentPhase.titleJa}
          </h1>

          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[560px]">
            {currentPhase.description}
          </p>
        </section>

        <DottedDivider />

        {/* 概要 */}
        <section className="py-12">
          <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
            このフェーズについて
          </h2>
          <p className="text-[15px] leading-[26px] text-foreground/80 font-noto-sans-jp">
            {currentPhase.overview}
          </p>
        </section>

        <DottedDivider />

        {/* 関連記事 */}
        <section className="py-12">
          <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
            関連する解説記事
          </h2>
          <div className="flex flex-col">
            {currentPhase.relatedArticles.map((article, i) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="flex items-center gap-3 py-4 border-b border-border-light last:border-b-0 group"
              >
                <span className="text-[10px] font-bold text-text-disabled w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[15px] font-bold text-text-primary font-noto-sans-jp group-hover:text-text-link transition-colors">
                  {article.title}
                </span>
                <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        <DottedDivider />

        {/* 関連トピック */}
        {relatedTopics.length > 0 && (
          <section className="py-12">
            <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
              関連するコース
            </h2>
            <div className="flex flex-col gap-4">
              {relatedTopics.map((topic) => topic && (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="flex items-center gap-4 p-4 rounded-[16px] border border-border-light hover:border-transparent hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-all group"
                >
                  <span className="text-2xl">{topic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary font-noto-sans-jp group-hover:text-text-link transition-colors">
                      {topic.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{topic.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <DottedDivider />

        {/* 前後ナビ */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            {prevPhase ? (
              <Link
                href={`/process/${prevPhase.slug}`}
                className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-link transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {prevPhase.number} {prevPhase.titleJa}
              </Link>
            ) : <div />}

            {nextPhase ? (
              <Link
                href={`/process/${nextPhase.slug}`}
                className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-link transition-colors"
              >
                {nextPhase.number} {nextPhase.titleJa}
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/process"
                className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-link transition-colors"
              >
                一覧に戻る
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
