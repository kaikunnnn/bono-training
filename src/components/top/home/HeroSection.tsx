import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * トップ ヒーローブロック（新トップ 2026 / ブロックA）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-40038
 *
 * 既存の EyecatchSection（ブロック1）とは別ブロックとして並存させる
 * （/dev/top page.tsx の最上部に追加）。EyecatchSection は変更しない。
 *
 * レイアウト（Figma実寸）:
 * - 左テキストカラム幅 672px
 * - 右画像は絶対配置（left 791px / top 13px / 650x486px）
 *   → 本画像が未確定のため「画像準備中」プレースホルダーで実装
 * - 全体 border-b / pt-76px pb-77px
 */

export interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative border-b border-black/20 pt-[76px] pb-[77px]",
        className
      )}
    >
      {/* 左テキストカラム（Figma: 幅672px） */}
      <div className="max-w-[672px]">
        {/* 見出し（40px / M PLUS / tracking 2px / 3行） */}
        <h1 className="font-rounded-mplus text-[40px] font-medium leading-[1.35] tracking-[2px] text-text-primary">
          はじめよう!
          <br />
          キモチがうごく
          <br />
          ものづくり
        </h1>

        {/* サブ見出し（24px / Noto Sans JP / tracking 1.2px / pt 8px） */}
        <p className="pt-2 font-noto-sans-jp text-2xl font-normal tracking-[1.2px] text-text-primary">
          ユーザーを軸にしたデザインを身につける
        </p>

        {/* 本文（14px / pt 32px） */}
        {/* TODO: ダミー文言。実際のBONOコピーに差し替え予定 */}
        <p className="pt-8 font-noto-sans-jp text-sm leading-[1.8] text-text-primary">
          「初期費用」0円のリースもしくは一括購入。お客様のファイナンスプランに合わせて選択可能です。
        </p>

        {/* CTA（pt 32px / gap 16px） */}
        <div className="flex items-center gap-4 pt-8">
          {/* TODO: 「メンバーになってはじめる」の遷移先を要確認（暫定 /subscription） */}
          <Link
            href="/subscription"
            className="inline-flex h-9 items-center justify-center rounded-[14px] bg-cta-primary-bg px-6 text-sm font-bold tracking-[0.35px] text-white shadow-cta transition-colors hover:bg-cta-primary-hover"
          >
            メンバーになってはじめる
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex h-9 w-[154px] items-center justify-center rounded-[14px] border-2 border-text-primary text-sm font-bold tracking-[0.35px] text-text-primary transition-colors hover:bg-hover"
          >
            ロードマップへ
          </Link>
        </div>
      </div>

      {/*
        右画像（Figma: left 791px / top 13px / 650x486px）。
        本画像が未確定のため next/image は使わず「画像準備中」プレースホルダーで実装。
        lg 未満では絶対配置を解除して非表示（テキストとの重なりを避ける）。
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[791px] top-[13px] hidden h-[486px] w-[650px] items-center justify-center rounded-[8px] border-2 border-dashed border-black/20 bg-muted-custom lg:flex"
      >
        <span className="text-sm text-text-primary/50">画像準備中</span>
      </div>
    </section>
  );
}
