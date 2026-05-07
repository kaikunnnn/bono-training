import { Metadata } from "next";
import { TOPIC_COURSES } from "./data";
import CourseCards from "./CourseCards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "コース",
  description: "スキルを体系的に習得しよう。プロが設計したカリキュラムで、現場で使えるレベルまで到達できます。",
  openGraph: { title: "コース | BONO" },
  alternates: { canonical: "/topics" },
};

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

        {/* コースカード（3パターン切り替え） */}
        <section className="pb-16">
          <CourseCards courses={TOPIC_COURSES} />
        </section>
      </div>
    </div>
  );
}
