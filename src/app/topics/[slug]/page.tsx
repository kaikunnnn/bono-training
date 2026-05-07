import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Lock, Play } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import DottedDivider from "@/components/common/DottedDivider";
import { Button } from "@/components/ui/button";
import { TOPIC_COURSES, getTopicBySlug } from "../data";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOPIC_COURSES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "コースが見つかりません" };
  return {
    title: `${topic.title} | コース | BONO`,
    description: topic.description,
  };
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const nextTopic = topic.nextTopicSlug
    ? TOPIC_COURSES.find((t) => t.slug === topic.nextTopicSlug)
    : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        {/* 戻るボタン */}
        <div className="pt-4">
          <BackButton href="/topics" />
        </div>

        {/* ① ヒーロー — 到達状態を伝える */}
        <section className="pt-10 pb-12 flex flex-col items-center text-center gap-6">
          <span className="text-[64px]">{topic.emoji}</span>
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-text-primary font-rounded-mplus leading-tight">
              {topic.title}
            </h1>
            <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[560px]">
              {topic.description}
            </p>
          </div>

          {/* 到達状態 */}
          <div className="bg-[rgba(70,87,83,0.04)] rounded-[20px] px-6 py-5 w-full max-w-[560px]">
            <p className="text-xs font-bold text-text-disabled mb-2 font-noto-sans-jp">このコースを終えると</p>
            <p className="text-[15px] font-bold text-text-primary font-noto-sans-jp leading-relaxed">
              {topic.outcome}
            </p>
          </div>

          {/* メタ情報 */}
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <span>レッスン {topic.lessonCount}本</span>
            <span>BONO</span>
          </div>
        </section>

        <DottedDivider />

        {/* ② カリキュラム — 何をどの順で学ぶか */}
        <section className="py-12">
          <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-8">
            カリキュラム
          </h2>

          <div className="flex flex-col gap-0">
            {Array.from({ length: topic.lessonCount }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 border-b border-border-light last:border-b-0"
              >
                {/* レッスン番号 */}
                <div className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-text-disabled">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* レッスン情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-primary font-noto-sans-jp leading-snug">
                    レッスン {i + 1}: {topic.title}の{i === 0 ? "基礎" : i === 1 ? "実践" : i === 2 ? "応用" : `ステップ${i + 1}`}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">5-10分</p>
                </div>

                {/* ステータス */}
                {i < 2 ? (
                  <div className="w-6 h-6 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 text-text-muted" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                    <Lock className="w-3 h-3 text-text-disabled" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button asChild size="large" className="w-full sm:w-auto sm:min-w-[240px]">
              <Link href="/subscription">
                コースを購入する
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-text-disabled">全{topic.lessonCount}レッスン</p>
          </div>
        </section>

        <DottedDivider />

        {/* ③ 受講者事例 — 自分を重ねる */}
        {topic.testimonials.length > 0 && (
          <section className="py-12">
            <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-8">
              受講者の声
            </h2>

            <div className="flex flex-col gap-5">
              {topic.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[20px] shadow-[0px_1px_7px_rgba(0,0,0,0.04)] p-6 flex flex-col gap-4"
                >
                  <p className="text-sm font-bold text-text-primary font-noto-sans-jp">
                    {t.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-disabled shrink-0 mt-0.5">Before</span>
                      <p className="text-sm text-text-muted font-noto-sans-jp">{t.before}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-link shrink-0 mt-0.5">After</span>
                      <p className="text-sm text-text-primary font-bold font-noto-sans-jp">{t.after}</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted italic font-noto-sans-jp">
                    「{t.comment}」
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <DottedDivider />

        {/* ④ 関連 — 次の導線 */}
        <section className="py-12">
          <h2 className="text-xl font-bold font-rounded-mplus text-text-primary mb-6">
            関連
          </h2>

          <div className="flex flex-col gap-4">
            {/* 関連ガイド */}
            {topic.relatedGuideTheme && (
              <Link
                href="/guide"
                className="flex items-center gap-4 p-4 rounded-[16px] border border-border-light hover:border-text-link hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                  <span className="text-lg">📖</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-text-disabled mb-0.5">ガイド</p>
                  <p className="text-sm font-bold text-text-primary group-hover:text-text-link transition-colors">
                    このコースが含まれるガイドを見る
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
              </Link>
            )}

            {/* 次のトピック */}
            {nextTopic && (
              <Link
                href={`/topics/${nextTopic.slug}`}
                className="flex items-center gap-4 p-4 rounded-[16px] border border-border-light hover:border-text-link hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-bg-muted flex items-center justify-center shrink-0">
                  <span className="text-lg">{nextTopic.emoji}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-text-disabled mb-0.5">次に学ぶ</p>
                  <p className="text-sm font-bold text-text-primary group-hover:text-text-link transition-colors">
                    {nextTopic.title}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
