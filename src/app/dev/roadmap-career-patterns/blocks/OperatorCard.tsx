/**
 * パターンH：ヒーロー直下に運営者（カイクン）の顔と一言（#282, H5）
 * 肩書と一言は src/lib/persona-lesson-top-config.ts の既存文をそのまま、YouTube は footer-links.ts の URL を使う。
 * 外のサイト（YouTube）につなぐことで信頼につなげる（NN/g Trustworthiness）。
 */

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { personaLessonTopContent } from "@/lib/persona-lesson-top-config";
import { FOOTER_SNS } from "@/components/layout/footer-links";

const YOUTUBE_URL = FOOTER_SNS.find((l) => l.label === "YouTube")?.href;

export default function OperatorCard() {
  const author = personaLessonTopContent.author;

  return (
    <section id="operator" className="px-4 pt-4 md:px-8">
      <div className="mx-auto max-w-[538px] rounded-[20px] border border-border-light bg-white p-4">
        <h2 className="mb-3 text-[12px] font-bold text-text-muted">運営者</h2>
        <div className="flex gap-3">
          <Image
            src={author.image}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-[22px] text-text-primary">{author.name}</p>
            <p className="text-[12px] leading-[18px] text-text-muted">{author.role}</p>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-[22px] text-text-primary">{author.bio}</p>
        {YOUTUBE_URL && (
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1 text-[14px] font-bold text-text-primary underline underline-offset-4 hover:opacity-70"
          >
            YouTubeを見る
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
        )}
      </div>
    </section>
  );
}
