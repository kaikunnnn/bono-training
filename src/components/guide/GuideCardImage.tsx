"use client";

import Image from "next/image";
import { useState } from "react";
import { GuideCardPlaceholder } from "./GuideCard";

interface GuideCardImageProps {
  src: string;
  alt: string;
  sizes?: string;
  preload?: boolean;
}

// Vercel の画像最適化(/_next/image)が上限超過で402を返し、新しい画像が出ないため最適化を通さない。
// Sanity の画像は Sanity CDN 側で縮小・形式変換する（/events と同じ回避策）
function toDirectSrc(src: string) {
  if (!src.startsWith("https://cdn.sanity.io/images/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", "1296");
  url.searchParams.set("auto", "format");
  return url.toString();
}

/**
 * ガイドカードのサムネイル画像（Client Component）
 * 画像読み込みエラー時はプレースホルダーにフォールバック
 */
export function GuideCardImage({
  src,
  alt,
  sizes = "100vw",
  preload = false,
}: GuideCardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <GuideCardPlaceholder title={alt} />;
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={toDirectSrc(src)}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? undefined : "lazy"}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
