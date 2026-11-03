/**
 * パターンA：ヒーロー直下に転職した人を1人（#282, H1・H2）
 * ヒーロー本体は変えず、直下（料金枠の近く）に置く。
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CareerStoryView } from "../career-stories";
import { BeforeAfter, StoryAvatar, StoryName } from "../parts";

export default function HeroStoryCard({ story }: { story: CareerStoryView }) {
  return (
    <div className="px-4 pt-4 md:px-8">
      <div className="mx-auto max-w-[538px] rounded-[20px] border border-border-light bg-white p-4">
        <p className="mb-3 text-[12px] font-bold text-text-muted">BONOで学んで転職した人</p>
        <div className="flex gap-3">
          <StoryAvatar url={story.photoUrl} size={48} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold leading-[20px] text-text-primary">
              <StoryName story={story} />
            </p>
            <BeforeAfter story={story} />
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-[22px] text-text-primary">「{story.quote}」</p>
        <Link
          href={`/stories/${story.slug}`}
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-text-primary underline underline-offset-4 hover:opacity-70"
        >
          話を読む
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}
