import Link from "next/link";
import Image from "next/image";
import type { Guide } from "@/types/guide";
import { getCategoryInfo } from "@/lib/guideCategories";
import { GuideCardImage } from "./GuideCardImage";
import { GuideCardPlaceholder } from "./GuideCard";
import { getVideoInfo } from "@/lib/videoUtils";
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

export default function GuideHeader({ guide }: GuideHeaderProps) {
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
                <Link href="/guide">ガイド</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/guide?category=${guide.category}`}>
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

      {/* メインヘッダー：左揃え */}
      <div className="flex flex-col items-center gap-8 px-4 pt-8 pb-0">
        <div className="flex flex-col items-start gap-5 w-full max-w-[648px]">
          {/* カテゴリ */}
          <p className="text-xs font-medium text-text-secondary">
            {categoryInfo?.label ?? guide.category}
          </p>

          {/* タイトル */}
          <h1
            className="text-[28px] md:text-[36px] font-bold text-left leading-[1.5] text-text-primary font-rounded-mplus break-words"
          >
            {guide.title}
          </h1>

          {/* 著者・日付 */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Image
              src="/images/authors/kaikun.jpg"
              alt={guide.author}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="font-medium text-text-primary text-[13px]">
              {guide.author}
            </span>
            {publishedDate && (
              <>
                <span>・</span>
                <span className="text-[14px]">{publishedDate}</span>
              </>
            )}
          </div>
        </div>

        {/* メディア: 動画 > サムネ > プレースホルダー */}
        <div className="w-full max-w-[648px]">
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-muted">
            {(() => {
              const videoInfo = guide.videoUrl ? getVideoInfo(guide.videoUrl) : null;
              if (videoInfo) {
                return (
                  <iframe
                    src={videoInfo.embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={guide.title}
                  />
                );
              }
              if (guide.thumbnailUrl) {
                return <GuideCardImage src={guide.thumbnailUrl} alt={guide.title} />;
              }
              return <GuideCardPlaceholder title={guide.title} />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
