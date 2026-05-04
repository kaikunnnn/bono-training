"use client";

import { useState } from "react";
import { GuideCardPlaceholder } from "./GuideCard";

interface GuideCardImageProps {
  src: string;
  alt: string;
}

/**
 * ガイドカードのサムネイル画像（Client Component）
 * 画像読み込みエラー時はプレースホルダーにフォールバック
 */
export function GuideCardImage({ src, alt }: GuideCardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <GuideCardPlaceholder title={alt} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
