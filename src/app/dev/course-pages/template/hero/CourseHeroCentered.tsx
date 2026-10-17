/**
 * ヒーロー パターン03: 中央寄せ＋全幅の帯 — #241（Figma 70:6403）
 *
 * 文字は幅492で中央寄せ（バッジ・コース名・サブ行・つくった人）、その下にボタン。
 * 下に高さ590の画像の帯（コンテンツ領域の端から端・角丸なし）。
 * 画像: Figma の素材そのまま（グラデ＋ノートPCとスマホの端末画像）。
 * スマホ: 中央寄せのまま縦積み、帯は画面幅いっぱい（4:3）。
 */

import { cn } from "@/lib/utils";
import {
  CourseBadge,
  type CourseHeroProps,
  FigmaDevices,
  FigmaGradient,
  HERO_CONTAINER,
  HeroAuthor,
  HeroCtas,
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
        <FigmaGradient />
        <div className="absolute inset-0 flex items-center justify-center px-[6%]">
          <FigmaDevices className="w-full max-w-[648px]" />
        </div>
      </div>
    </section>
  );
}
