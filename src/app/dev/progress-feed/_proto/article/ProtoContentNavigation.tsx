"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { articleHref } from "../data";

interface NavigationItem {
  slug: string;
  title: string;
}

/**
 * 前後の記事ナビ（src/components/article/ContentNavigation.tsx の複製。クラス・inline style は本番のまま）。
 * 本番は /contents/[slug] に固定で飛ぶため、遷移先を /dev/progress-feed/contents 配下にした。
 */
export function ProtoContentNavigation({ previous, next }: { previous?: NavigationItem; next?: NavigationItem }) {
  if (!previous && !next) return null;

  return (
    <div className="w-full flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-8 mt-12">
      {previous ? (
        <Link
          href={articleHref(previous.slug)}
          className="flex items-center gap-3 px-6 py-5 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors flex-1 min-w-0"
        >
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
            <span
              className="text-[10px] font-medium leading-[10px] text-text-muted"
              style={{ fontFamily: '"Noto Sans JP", sans-serif', letterSpacing: "-3.125%" }}
            >
              前
            </span>
            <span
              className="text-sm font-semibold leading-4 text-text-primary truncate"
              style={{ fontFamily: "Hind, sans-serif" }}
            >
              {previous.title}
            </span>
          </div>
        </Link>
      ) : (
        <div className="hidden md:block flex-1" />
      )}

      {next ? (
        <Link
          href={articleHref(next.slug)}
          className="flex items-center gap-3 px-6 py-5 bg-white rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] hover:bg-gray-50 transition-colors flex-1 min-w-0"
        >
          <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
            <span
              className="text-[10px] font-medium leading-[10px] text-text-muted"
              style={{ fontFamily: '"Noto Sans JP", sans-serif', letterSpacing: "-3.125%" }}
            >
              次
            </span>
            <span
              className="text-sm font-semibold leading-4 text-text-primary truncate"
              style={{ fontFamily: "Hind, sans-serif" }}
            >
              {next.title}
            </span>
          </div>
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </Link>
      ) : (
        <div className="hidden md:block flex-1" />
      )}
    </div>
  );
}
