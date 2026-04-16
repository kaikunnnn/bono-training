import React from "react";
import { Link } from "react-router-dom";
import type { Guide } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import GuideCardMedia from "./GuideCardMedia";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface GuideHeaderProps {
  guide: Guide;
}

const GuideHeader = ({ guide }: GuideHeaderProps) => {
  const categoryInfo = getCategoryInfo(guide.category);
  const publishedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  return (
    <div className="w-full">
      {/* パンくずリスト */}
      <div className="px-7 pt-8 pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/guide">ガイド</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/guide?category=${guide.category}`}>
                  {categoryInfo?.label ?? guide.category}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{guide.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* メインヘッダー：中央揃え */}
      <div className="flex flex-col items-center gap-8 px-4 pt-8 pb-0">
        <div className="flex flex-col items-center gap-5 w-full max-w-[640px]">
          {/* カテゴリ */}
          <p className="text-xs font-medium text-foreground">
            {categoryInfo?.label ?? guide.category}
          </p>

          {/* タイトル */}
          <h1
            className="text-[41px] font-bold text-center leading-[1.5] text-foreground"
            style={{ fontFamily: "'Rounded Mplus 1c', 'M PLUS Rounded 1c', sans-serif", wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {guide.title}
          </h1>

          {/* 著者・日付 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground text-[13px]">{guide.author}</span>
            {publishedDate && (
              <>
                <span>・</span>
                <span className="text-[14px]">{publishedDate}</span>
              </>
            )}
          </div>
        </div>

        {/* メディア: 動画 > サムネ > 非表示 */}
        {(guide.videoUrl || guide.thumbnailUrl) && (
          <div className="w-full max-w-[640px]">
            <GuideCardMedia
              title={guide.title}
              videoUrl={guide.videoUrl}
              thumbnail={guide.thumbnailUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideHeader;
