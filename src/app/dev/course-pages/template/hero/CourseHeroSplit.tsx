/**
 * ヒーロー パターン01: 左右分割 — #241（Figma 70:5567）
 *
 * 左に文字（バッジ・コース名・サブ行・つくった人・ボタン）、右に画像パネル。
 * パネルはヒーローの上端まで裁ち落とし、右端は器の右端。角は四角。
 * 画像: Figma のグラデの上に「このコースでつくるもの」の仮画像（WorkMock）。
 * スマホ: 文字 → ボタン → 画像パネル（画面幅いっぱい・4:3）。
 */

import {
  CourseBadge,
  type CourseHeroProps,
  FigmaGradient,
  HERO_CONTAINER,
  HeroAuthor,
  HeroCtas,
  HeroSub,
  HeroTitle,
  OutcomeMock,
} from "./parts";

export default function CourseHeroSplit({
  course,
  startHref,
  curriculumHref,
  headingLevel = 1,
}: CourseHeroProps) {
  return (
    <section className="w-full">
      <div className={HERO_CONTAINER}>
        <div className="grid lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,581px)] lg:gap-12">
          <div className="max-w-[492px] pb-10 pt-10 lg:pb-[70px] lg:pt-[129px]">
            <CourseBadge />
            <HeroTitle course={course} level={headingLevel} className="mt-[15px]" />
            <HeroSub course={course} className="mt-[15px]" />
            <HeroAuthor course={course} className="mt-2.5" />
            <HeroCtas startHref={startHref} curriculumHref={curriculumHref} className="mt-9" />
          </div>

          <div className="relative -mx-4 aspect-[4/3] overflow-hidden md:-mx-10 lg:mx-0 lg:aspect-auto">
            <FigmaGradient priority />
            <div className="absolute inset-0 flex items-center justify-center p-[6%]">
              <OutcomeMock course={course} className="w-full max-w-[540px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
