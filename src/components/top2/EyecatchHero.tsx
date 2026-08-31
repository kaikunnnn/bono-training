import Link from "next/link";
import Image from "next/image";

/**
 * アイキャッチ（新トップ 2026 / top2 再構築版）
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 662-40038（"Section (Roof–1 | Monochrome)"）
 *
 * スタイル抽出チェックリスト（Figma実測値。今回のFigmaは既存.ds-*ルールに従わない
 * ため、weight/size/line-height/trackingはFigma実測をそのままarbitraryで再現する。
 * 色のみ配線済みトークンを使う）:
 *
 * | 要素 | font-family | weight | size | line-height | tracking | 色 |
 * |---|---|---|---|---|---|---|
 * | 見出し(3行) | M PLUS 1 | Medium(500) | 40px | 1.6 | 2px | #021710→text-text-primary |
 * | サブ見出し | Noto Sans JP | Regular(400) | 24px | 36px(=1.5) | 1.2px | #141419→text-text-primary |
 * | 本文(ダミー) | Noto Sans JP | Regular(400) | 14px | 25.2px(=1.8) | 0.7px | #141419→text-text-primary |
 * | CTA1文字 | Inter | Bold(700) | 14px | 20px | 0.35px | white |
 * | CTA2文字 | Inter | Bold(700) | 14px | 20px | 0.35px | #021710→text-text-primary |
 *
 * 余白: 全体 pt-[76px] pb-[77px] border-b border-black/20。
 * `paddingY`（number）を渡すと外側の上下パディングをinline styleで上書きする
 * （ページ単位の余白統一実験用 / 例: /dev/top4）。未指定時は既存挙動のまま。
 * 見出し→サブ見出し pt-8px(=--s-2)。サブ見出し→本文 pt-32px(=--s-8)。
 * 本文→CTA pt-32px(=--s-8)。CTA間 gap-16px(=--s-4)。
 *
 * 右画像は Figma のダミー画像をそのまま使用（ユーザー指示により今回は試験的に
 * 実画像を使う。/public/images/top2/hero-visual.png、後で本画像に差し替え予定）。
 */

export interface EyecatchHeroProps {
  /** フォントサイズを2px落とした試験用バリアント（/dev/top3 での比較用） */
  compact?: boolean;
  /** 外側の上下パディングをinline styleで上書き（px。ページ単位の余白統一実験用） */
  paddingY?: number;
  className?: string;
}

export default function EyecatchHero({
  compact = false,
  paddingY,
  className,
}: EyecatchHeroProps) {
  return (
    <section
      className={`flex flex-col items-end gap-10 border-b border-black/20 pt-[76px] pb-[77px] lg:flex-row lg:justify-between ${className ?? ""}`}
      style={
        paddingY !== undefined
          ? { paddingTop: paddingY, paddingBottom: paddingY }
          : undefined
      }
    >
      {/* 左: テキストブロック */}
      <div className="flex w-full max-w-[672px] flex-col items-start">
        <h1
          className={`font-rounded-mplus font-medium leading-[1.6] tracking-[2px] text-text-primary ${
            compact ? "text-[38px]" : "text-[40px]"
          }`}
        >
          <span className="block">はじめよう!</span>
          <span className="block">キモチがうごく</span>
          <span className="block">ものづくり</span>
        </h1>

        <p
          className={`pt-2 font-noto-sans-jp font-normal leading-[1.5] tracking-[1.2px] text-text-primary ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          ユーザーを軸にしたデザインを身につける
        </p>

        {/* TODO: ダミー文言（住宅リース会社のテンプレ文言）。BONO向けの実文言に差し替え予定 */}
        <p className="pt-8 font-noto-sans-jp text-sm font-normal leading-[1.8] tracking-[0.7px] text-text-primary">
          「初期費用」0円のリースもしくは一括購入。お客様のファイナンスプランに合わせて選択可能です。
        </p>

        <div className="flex gap-4 pt-8">
          <Link
            href="/subscription"
            className="inline-flex h-9 items-center justify-center rounded-[14px] bg-cta-primary-bg px-6 font-inter text-sm font-bold tracking-[0.35px] text-white transition-colors hover:bg-cta-primary-hover"
          >
            メンバーになってはじめる
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex h-9 w-[154px] items-center justify-center rounded-[14px] border-2 border-text-primary font-inter text-sm font-bold tracking-[0.35px] text-text-primary transition-colors hover:bg-hover"
          >
            ロードマップへ
          </Link>
        </div>
      </div>

      {/* 右: 画像（Figma実測比 650.92/486 ≈ 1.34:1。Figmaにモバイル版が無いため lg: 以上でのみ表示） */}
      <div className="relative hidden aspect-[650.92/486] w-full max-w-[650px] overflow-hidden lg:block">
        <Image
          src="/images/top2/hero-visual.png"
          alt=""
          fill
          sizes="650px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
