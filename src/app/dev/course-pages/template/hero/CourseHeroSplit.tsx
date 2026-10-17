/**
 * ヒーロー パターン01: 左右分割 — #241（Figma 70:5567）
 *
 * 左に文字（バッジ・コース名・サブ行・つくった人・ボタン）、右に画像パネル。
 * パネルはヒーローの上端まで裁ち落とし、右端は器の右端。角は四角。
 * 画像: Figma の正方形に近い端末画像（80:7139）をパネルいっぱいに cover で敷く。
 * スマホ: 文字 → ボタン → 画像パネル（画面幅いっぱい・4:3）。
 */

import {
  CourseBadge,
  type CourseHeroProps,
  HERO_CONTAINER,
  HeroAuthor,
  HeroCtas,
  HeroImageSquare,
  HeroSub,
  HeroTitle,
} from "./parts";

export default function CourseHeroSplit({
  course,
  startHref,
  curriculumHref,
  headingLevel = 1,
  started = null,
  resume = null,
}: CourseHeroProps) {
  return (
    <section className="w-full">
      <div className={HERO_CONTAINER}>
        <div className="grid lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,581px)] lg:gap-12">
          <div className="max-w-[492px] pb-10 pt-10 lg:pb-[70px] lg:pt-[129px]">
            <CourseBadge started={started} />
            <HeroTitle course={course} level={headingLevel} className="mt-[15px]" />
            <HeroSub course={course} className="mt-[15px]" />
            <HeroAuthor course={course} className="mt-2.5" />
            <HeroCtas
              startHref={startHref}
              resume={resume}
              curriculumHref={curriculumHref}
              className="mt-9"
            />
          </div>

          <div className="relative -mx-4 aspect-[4/3] overflow-hidden md:-mx-10 lg:mx-0 lg:aspect-auto">
            <HeroImageSquare priority />
          </div>
        </div>
      </div>
    </section>
  );
}
