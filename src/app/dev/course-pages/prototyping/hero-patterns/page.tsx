/**
 * /dev/course-pages/prototyping/hero-patterns — コースのヒーロー 4パターン（#241・Figma 70:7129）
 *
 * 文言は今のコースページと同じコースのデータ。既定は UI体験デザイン基礎（Figma と同じコース）。
 * - ?course=<slug> でコースを切り替え
 * - ?p=01〜04 で1パターンだけを本番のページに近い形で見る（このときはコース名が h1）
 * 各パターンの下に「このコースで目指す状態」の頭だけを置いて、つながりを見られるようにしている。
 * 実測とトークン対応: rebono/issues/241-B_コースヒーロー_Figma仕様.md
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { courses, getCourse, lessonSlugs } from "../../data";
import { fetchLessons } from "../../data/sanity-lessons";
import type { Course, Field, LessonMap } from "../../data/types";
import CourseHeroBand from "../../template/hero/CourseHeroBand";
import CourseHeroCards from "../../template/hero/CourseHeroCards";
import CourseHeroCentered from "../../template/hero/CourseHeroCentered";
import CourseHeroSplit from "../../template/hero/CourseHeroSplit";
import { HERO_CONTAINER, type CourseHeroProps } from "../../template/hero/parts";
import { KariProvider, T } from "../../template/kari";
import { splitTitle } from "../../template/shared";

export const metadata: Metadata = {
  title: "コースのヒーロー 4パターン（プロト）",
  robots: { index: false, follow: false },
};

const FIGMA = "https://www.figma.com/design/MdxNPIfXUIhSYivR7Tg2EK/Course2026?node-id=";
const BASE = "/dev/course-pages/prototyping/hero-patterns";
const DEFAULT_COURSE = "ui-experience";

const PATTERNS: {
  id: "01" | "02" | "03" | "04";
  name: string;
  node: string;
  image: string;
  Hero: (props: CourseHeroProps) => React.ReactNode;
}[] = [
  { id: "01", name: "左右分割", node: "70-5567", image: "つくるものの仮画像（Figmaのグラデの上）", Hero: CourseHeroSplit },
  { id: "02", name: "見出し＋カード3枚", node: "70-5756", image: "つくるもの（仮）／使うレッスン（実画像）／進め方", Hero: CourseHeroCards },
  { id: "03", name: "中央寄せ＋全幅の帯", node: "70-6403", image: "Figmaの素材そのまま", Hero: CourseHeroCentered },
  { id: "04", name: "左右の見出し＋全幅の帯", node: "70-6929", image: "実レッスンの表紙（実画像）", Hero: CourseHeroBand },
];

type SearchParams = Promise<{ p?: string; course?: string }>;

const k = (text: string): Field => ({ text, kari: true });

/** 区切り線の下「このコースで目指す状態」の頭（Figma の続きの部分） */
function GoalPeek({ course, level }: { course: Course; level: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  const meta: { label: string; value: Field }[] = [
    { label: "形式", value: k("オンライン") },
    { label: "期間", value: course.period },
    { label: "サポート", value: k("相談・質問有") },
  ];
  return (
    <div className="border-t border-border-light">
      <div className={cn(HERO_CONTAINER, "pb-16 pt-10 md:pt-14")}>
        <div className="max-w-[640px]">
          <p className="font-mono text-[11px] uppercase leading-[1.5] tracking-[0.12em] text-text-muted">Goal</p>
          <Heading className="mt-3 font-heading text-[26px] font-bold leading-[1.45] tracking-[-0.04em] text-text-primary md:text-[32px]">
            このコースで目指す状態
          </Heading>
          <dl className="mt-4 flex max-w-[492px] items-center justify-between gap-3 rounded-[13px] border border-border-default px-5 py-3 md:px-6">
            {meta.map((m, i) => (
              <div key={m.label} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden="true" className="h-6 w-px bg-border-default" /> : null}
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-text-primary">{m.label}</dt>
                  <dd className="text-sm font-bold text-text-primary">
                    <T f={m.value} />
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-[1.9] text-text-secondary md:text-[15px]">
            <T f={course.change} />
            。進める前と後で、こう変わることを目指します。
          </p>
        </div>
      </div>
    </div>
  );
}

function heroProps(course: Course, lessons: LessonMap, headingLevel: 1 | 2): CourseHeroProps {
  const first = course.steps.flatMap((s) => s.items).find((i) => i.type === "lesson");
  return {
    course,
    lessons,
    startHref: first && first.type === "lesson" ? `/lessons/${first.slug}` : null,
    curriculumHref: `/dev/course-pages/v2/${course.slug}#curriculum`,
    headingLevel,
  };
}

function href(p: string | null, slug: string) {
  const params = new URLSearchParams();
  if (p) params.set("p", p);
  if (slug !== DEFAULT_COURSE) params.set("course", slug);
  const qs = params.toString();
  return qs ? `${BASE}?${qs}` : BASE;
}

/** コースの切り替え（小さなピル） */
function CourseSwitch({ current, p }: { current: string; p: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Object.values(courses).map((c) => (
        <Link
          key={c.slug}
          href={href(p, c.slug)}
          aria-current={c.slug === current ? "page" : undefined}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-bold transition-colors",
            c.slug === current
              ? "border-text-primary bg-text-primary text-text-inverse"
              : "border-border-light bg-surface text-text-secondary hover:border-border-default"
          )}
        >
          {c.shortTitle.text}
        </Link>
      ))}
    </div>
  );
}

export default async function HeroPatternsPage({ searchParams }: { searchParams: SearchParams }) {
  const { p, course: courseParam } = await searchParams;
  const course = getCourse(courseParam ?? DEFAULT_COURSE) ?? getCourse(DEFAULT_COURSE)!;
  const lessons = await fetchLessons(lessonSlugs(course));
  const single = PATTERNS.find((x) => x.id === p) ?? null;

  /* ---------- 1パターンだけ（本番のページに近い形・コース名が h1） ---------- */
  if (single) {
    const { Hero } = single;
    return (
      <KariProvider>
        <div className="min-h-screen w-full bg-[var(--bg-base)] pb-24 font-noto-sans-jp text-text-primary">
          <div className="border-b border-border-light bg-muted-custom">
            <div className={cn(HERO_CONTAINER, "flex flex-wrap items-center gap-x-4 gap-y-2 py-2 text-xs")}>
              <Link href={href(null, course.slug)} className="inline-flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary">
                <ArrowLeft size={14} />
                4パターン
              </Link>
              <div className="flex items-center gap-1">
                {PATTERNS.map((x) => (
                  <Link
                    key={x.id}
                    href={href(x.id, course.slug)}
                    aria-current={x.id === single.id ? "page" : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-bold",
                      x.id === single.id ? "bg-text-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    {x.id}
                  </Link>
                ))}
              </div>
              <CourseSwitch current={course.slug} p={single.id} />
            </div>
          </div>
          <Hero {...heroProps(course, lessons, 1)} />
          <GoalPeek course={course} level={2} />
        </div>
      </KariProvider>
    );
  }

  /* ---------- 4パターンを縦に並べる ---------- */
  const { main } = splitTitle(course.title.text);
  return (
    <KariProvider>
      <div className="min-h-screen w-full bg-[var(--bg-base)] pb-24 font-noto-sans-jp text-text-primary">
        <div className={cn(HERO_CONTAINER, "pb-10 pt-10 md:pt-14")}>
          <Link
            href="/dev/course-pages/prototyping"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} />
            プロトタイピングに戻る
          </Link>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">#241 · Hero</p>
          <h1 className="mt-3 font-heading text-[30px] font-bold leading-[1.4] tracking-[-0.05em] md:text-[40px]">
            コースのヒーロー 4パターン
          </h1>
          <p className="mt-3 max-w-[680px] text-[15px] leading-[1.9] text-text-secondary">
            Figma の4案を、今のコースページと同じ文言（{main}）で組んだもの。各パターンの下に「このコースで目指す状態」の頭だけを置いて、つながりも見られるようにしています。「このパターンだけ見る」で本番に近い1枚表示に切り替わります。
          </p>
          <div className="mt-5">
            <CourseSwitch current={course.slug} p={null} />
          </div>
        </div>

        {PATTERNS.map(({ id, name, node, image, Hero }) => (
          <div key={id} className="mt-16 first:mt-0">
            <div className="border-y border-border-light bg-muted-custom">
              <div className={cn(HERO_CONTAINER, "flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3 text-xs")}>
                <p className="font-bold text-text-primary">
                  パターン{id}
                  <span className="ml-2">{name}</span>
                </p>
                <p className="text-text-muted">画像: {image}</p>
                <div className="ml-auto flex items-center gap-4">
                  <a
                    href={`${FIGMA}${node}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary"
                  >
                    Figma {node.replace("-", ":")}
                    <ExternalLink size={12} />
                  </a>
                  <Link
                    href={href(id, course.slug)}
                    className="inline-flex items-center gap-1 font-bold text-text-link hover:underline"
                  >
                    このパターンだけ見る
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
            <Hero {...heroProps(course, lessons, 2)} />
            <GoalPeek course={course} level={3} />
          </div>
        ))}
      </div>
    </KariProvider>
  );
}
