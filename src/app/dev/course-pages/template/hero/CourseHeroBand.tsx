/**
 * ヒーロー パターン04: 左右に分けた見出し＋全幅の帯 — #241（Figma 70:6929）
 *
 * 左: バッジ・コース名・ボタン。右: サブ行・つくった人（右の下端をボタンの下端に揃える）。
 * 下に高さ590の画像の帯（コンテンツ領域の端から端・角丸なし）。
 * 画像: Figma の横長の端末画像（80:7131）を帯いっぱいに cover。端末は中央なので、スマホの4:3でも端末は残る。
 * スマホ: コース名 → サブ行・つくった人 → ボタン → 帯 の順に縦積み。
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

export default function CourseHeroBand({
  course,
  startHref,
  curriculumHref,
  headingLevel = 1,
}: CourseHeroProps) {
  return (
    <section className="w-full">
      <div className={cn(HERO_CONTAINER, "pt-10 lg:pt-20")}>
        <div className="grid gap-y-4 lg:grid-cols-[minmax(0,492px)_minmax(0,568px)] lg:justify-between lg:gap-x-10 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <CourseBadge />
            <HeroTitle course={course} level={headingLevel} className="mt-4" />
          </div>
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-end">
            <HeroSub course={course} />
            <HeroAuthor course={course} className="mt-4" />
          </div>
          <HeroCtas
            startHref={startHref}
            curriculumHref={curriculumHref}
            className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-0"
          />
        </div>
      </div>

      <div className="relative mt-12 aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-[590px] lg:mt-16">
        <HeroImageWide />
      </div>
    </section>
  );
}
