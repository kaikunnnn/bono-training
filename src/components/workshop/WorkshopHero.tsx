import Image from "next/image";
import AccentBadge from "./AccentBadge";
import { WORKSHOP_META } from "@/lib/workshop/config";

/**
 * トップページ ブロック1：アイキャッチ + タイトル + ディスクリプション
 */
export default function WorkshopHero() {
  return (
    <header className="relative">
      {/* アイキャッチ（テスト用プレースホルダー画像） */}
      <div className="relative w-full aspect-[1080/400] rounded-[20px] overflow-hidden">
        <Image
          src={WORKSHOP_META.eyecatch}
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="relative mt-10 md:mt-14">
        {/* 遊びのアクセントバッジ（アイキャッチとタイトルの境界に重ねる） */}
        <AccentBadge className="absolute -top-[76px] right-4 md:right-10 w-[96px] h-[96px] md:w-[112px] md:h-[112px] rotate-6" />

        <p className="text-[12px] md:text-[13px] font-semibold tracking-[0.2em] uppercase text-text-muted mb-4">
          BONO Workshop
        </p>
        <h1 className="text-[32px] md:text-[44px] font-bold leading-[1.4] tracking-[-0.02em] text-text-primary font-rounded-mplus">
          {WORKSHOP_META.title}
        </h1>
        <p className="mt-5 max-w-[648px] text-[16px] md:text-[18px] font-medium leading-[200%] tracking-[0.03em] text-text-secondary">
          {WORKSHOP_META.description}
        </p>
      </div>
    </header>
  );
}
