"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import type { GuideTheme } from "./data";

function ThemeCard({ theme }: { theme: GuideTheme }) {
  return (
    <div className="w-[320px] sm:w-[360px] shrink-0 bg-white rounded-[22px] shadow-[0px_1px_7px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* テーマビジュアル */}
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed] flex items-center justify-center">
        <span className="text-[56px]">{theme.emoji}</span>
      </div>

      {/* テーマ内容 */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-bold text-text-primary font-rounded-mplus">
            {theme.title}
          </h2>
          <p className="text-xs text-text-muted font-noto-sans-jp">
            {theme.forWho}
          </p>
        </div>

        {/* サブトピック3件 */}
        <div className="flex flex-col">
          {theme.topics.slice(0, 3).map((topic) => (
            <Link
              key={topic.slug}
              href={`/guide/${topic.slug}`}
              className="flex items-center gap-3 py-2.5 border-b border-border-light last:border-b-0 group"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg-muted shrink-0">
                <img
                  src={topic.thumbnail}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
              <span className="flex-1 text-[13px] font-bold text-text-primary font-noto-sans-jp group-hover:text-text-link transition-colors leading-snug">
                {topic.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-text-disabled group-hover:text-text-link transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* もっと見る */}
        {theme.topics.length > 3 && (
          <Link
            href={`/guide?theme=${theme.slug}`}
            className="flex items-center gap-1.5 text-[13px] font-bold text-text-muted hover:text-text-link transition-colors mt-auto pt-1"
          >
            もっと見る
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ThemeScroller({ themes }: { themes: GuideTheme[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* スクロールコンテナ */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {themes.map((theme) => (
          <div key={theme.slug} style={{ scrollSnapAlign: "start" }}>
            <ThemeCard theme={theme} />
          </div>
        ))}
      </div>

      {/* 左矢印 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
          aria-label="左にスクロール"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
      )}

      {/* 右矢印 */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
          aria-label="右にスクロール"
        >
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </button>
      )}
    </div>
  );
}
