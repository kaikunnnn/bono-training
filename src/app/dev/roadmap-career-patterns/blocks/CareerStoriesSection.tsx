/**
 * パターンB：流れの直後に「BONOで学んで転職した人」（#282, H2）
 * スマホは横スクロール、PCは横並び。最後に料金ページへの小さな導線と、インタビュー一覧へのリンク。
 * story の relatedRoadmaps が空なので「このロードマップで」とは書かない（issue 282）。
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CareerStoryView } from "../career-stories";
import { BeforeAfter, StoryAvatar, StoryName } from "../parts";

export default function CareerStoriesSection({ stories }: { stories: CareerStoryView[] }) {
  if (stories.length === 0) return null;

  return (
    <section id="career-stories" className="scroll-mt-24 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-6">
          <div className="mb-4 inline-flex items-center justify-center rounded-full border border-text-secondary px-[8px] py-[2px]">
            <span className="text-[12px] font-bold text-text-secondary">実例</span>
          </div>
          <h2 className="text-[24px] font-extrabold leading-[36px] text-text-secondary">
            BONOで学んで転職した人
          </h2>
        </div>

        {/* スマホ: 横スクロール（端まで見せるため左右の余白を打ち消す） / PC: 3列 */}
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {stories.map((story) => (
            <li
              key={story.slug}
              // relative: カード内の sr-only（absolute）がスクロール枠の外を基準にしてページ幅を広げないように
              className="relative flex w-[82%] shrink-0 snap-start flex-col rounded-[20px] border border-border-light bg-white p-5 md:w-auto"
            >
              <div className="flex gap-3">
                <StoryAvatar url={story.photoUrl} size={48} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold leading-[22px] text-text-primary">
                    <StoryName story={story} />
                  </h3>
                  <BeforeAfter story={story} />
                </div>
              </div>
              <p className="mt-4 flex-1 text-[14px] leading-[22px] text-text-primary">「{story.quote}」</p>
              <Link
                href={`/stories/${story.slug}`}
                className="mt-3 inline-flex min-h-11 items-center gap-1 self-start text-[14px] font-bold text-text-primary underline underline-offset-4 hover:opacity-70"
              >
                話を読む
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild variant="secondary" size="large">
            <Link href="/subscription">料金とプランを見る</Link>
          </Button>
          <Link
            href="/stories"
            className="inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-text-primary underline underline-offset-4 hover:opacity-70"
          >
            インタビューをもっと見る
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
