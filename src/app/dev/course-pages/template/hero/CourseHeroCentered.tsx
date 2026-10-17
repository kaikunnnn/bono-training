/**
 * ヒーロー パターン03: 中央寄せ＋全幅の帯 — #241（Figma 70:6403）
 *
 * 文字は幅492で中央寄せ（バッジ・コース名・サブ行・つくった人）、その下にボタン。
 * 下に高さ590の画像の帯（コンテンツ領域の端から端・角丸なし）。
 * 画像: Figma の横長の端末画像（80:7131）を帯いっぱいに cover。端末は中央なので、スマホの4:3でも左右が切れるだけで端末は残る。
 * スマホ: 中央寄せのまま縦積み、帯は画面幅いっぱい（4:3）。
 */

import { cn } from "@/lib/utils";
import {
  CourseBadge,
  type CourseHeroProps,
  HERO_CONTAINER,
  HeroAuthor,
  HeroCtas,
  HeroImageWide,
  HeroSub,
  HeroTitle,
} from "./parts";

export default function CourseHeroCentered({
  course,
  startHref,
  curriculumHref,
  headingLevel = 1,
}: CourseHeroProps) {
  return (
    <section className="w-full">
      <div className={cn(HERO_CONTAINER, "pt-10 text-center")}>
        <div className="mx-auto flex max-w-[492px] flex-col items-center gap-4">
          <CourseBadge />
          <HeroTitle course={course} level={headingLevel} />
          <HeroSub course={course} />
          <HeroAuthor course={course} className="justify-center" />
        </div>
        <HeroCtas startHref={startHref} curriculumHref={curriculumHref} className="mt-10 justify-center md:mt-11" />
      </div>

      <div className="relative mt-12 aspect-[4/3] w-full overflow-hidden md:mt-[71px] md:aspect-auto md:h-[590px]">
        <HeroImageWide />
      </div>
    </section>
  );
}
