import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOPIC_COURSES } from "./data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "コース",
  description: "スキルを体系的に習得しよう。UIスタイリング、UXリサーチ、Figmaなど実践的なコース。",
  openGraph: { title: "コース | BONO" },
  alternates: { canonical: "/topics" },
};

function TopicCard({ topic }: { topic: (typeof TOPIC_COURSES)[number] }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group bg-white rounded-[22px] shadow-[0px_1px_7px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 overflow-hidden flex flex-col"
    >
      {/* ビジュアル */}
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed] flex items-center justify-center">
        <span className="text-[56px] group-hover:scale-110 transition-transform duration-200">{topic.emoji}</span>
      </div>

      {/* 内容 */}
      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
        <h2 className="text-lg font-bold text-text-primary font-rounded-mplus">
          {topic.title}
        </h2>
        <p className="text-sm text-text-muted font-noto-sans-jp leading-relaxed line-clamp-2">
          {topic.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-text-disabled font-noto-sans-jp">
            レッスン {topic.lessonCount}本
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-text-muted group-hover:text-text-link transition-colors">
            詳しく見る
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TopicsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <section className="pt-8 pb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-rounded-mplus text-text-primary mb-4">
            コース
          </h1>
          <p className="text-base text-text-muted font-noto-sans-jp leading-relaxed max-w-[600px]">
            スキルを体系的に習得しよう。プロが設計したカリキュラムで、現場で使えるレベルまで到達できます。
          </p>
        </section>

        {/* コースカードグリッド */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
          {TOPIC_COURSES.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </section>
      </div>
    </div>
  );
}
