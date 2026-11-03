/**
 * 試作ページ内で共通に使う小さな部品（#282）
 */

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { CareerStoryView } from "./career-stories";

/** 仮の文言・未確定の情報に付ける札（試作用。オレンジは使わない） */
export function ProvisionalTag({ children = "仮" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[4px] border border-dashed border-border-strong bg-muted-custom px-1.5 py-px align-middle text-[11px] font-bold leading-[16px] text-text-muted">
      {children}
    </span>
  );
}

/** 顔写真（写真が無ければイニシャル無しのグレー丸） */
export function StoryAvatar({ url, size }: { url: string | null; size: number }) {
  if (!url) {
    return (
      <span
        aria-hidden="true"
        className="block shrink-0 rounded-full bg-muted-strong"
        style={{ width: size, height: size }}
      />
    );
  }
  // Vercel の画像最適化（/_next/image）を通さず Sanity CDN で縮小する（/events と同じ回避策）
  const px = size * 2;
  return (
    <Image
      src={`${url}?w=${px}&h=${px}&fit=crop&auto=format`}
      alt=""
      width={size}
      height={size}
      unoptimized
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/** 名前（未確定なら「（名前確認中）」＋仮札） */
export function StoryName({ story }: { story: CareerStoryView }) {
  if (story.displayName) return <>{story.displayName}</>;
  return (
    <>
      （名前確認中） <ProvisionalTag />
    </>
  );
}

/** 前 → 今 */
export function BeforeAfter({ story }: { story: CareerStoryView }) {
  return (
    <p className="text-[13px] leading-[20px] text-text-muted">
      {story.before}
      <span className="sr-only">から</span>
      <ArrowRight aria-hidden="true" className="mx-1 inline size-3 align-[-1px]" />
      <span className="font-bold text-text-primary">{story.after}</span>
    </p>
  );
}
