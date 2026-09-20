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
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? undefined : "lazy"}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
