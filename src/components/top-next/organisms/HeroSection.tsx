import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * ヒーロー（新トップページ /dev/top5 / HeroSection）
 *
 * 参照: Figma Make HANDOFF「ページ実装計画作成 2」の Section-1（Pattern 2）。
 * 左: 見出しのみ。右: 説明文 + CTA。
 * PC時は PurposeNav と同じ grid-cols-4 gap-[21px] を共有し、見出しを1-2列目、
 * 説明文+CTAを3-4列目に配置する（右グループの左端を PurposeNav 3番目の項目の
 * 左端に揃えるため。ユーザー指定）。モバイルは縦積み（grid-cols-1で自然に積む）。
 * ヒーロー画像はこのデザインには存在しないため無し。
 *
 * CTA 出し分け（ユーザー指定）:
 * - 「ロードマップへ」ボタンは表示しない（削除）
 * - 「メンバーになってはじめる」は非会員のみ表示。アクティブ会員（isMember=true）は
 *   既にメンバーのため CTA 自体を出さない。判定は page 側の getSubscriptionStatus().hasMemberAccess
 */
export interface HeroSectionProps {
  /** アクティブ会員なら true（standard/feedback）。true のとき入会 CTA を非表示にする */
  isMember?: boolean;
}

export function HeroSection({ isMember = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 lg:px-12">
      <div className="pt-12 pb-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-end lg:gap-[21px]">
          {/* 左: 見出しのみ */}
          <div className="w-full shrink-0 lg:col-span-2">
            {/* ページの主見出し。h1はページ内でここのみ */}
            <h1
              className="text-[28px] font-medium leading-[1.6] tracking-[1px] text-text-primary lg:text-[32px]"
              style={{
                fontFamily:
                  "var(--font-mplus-1-var), 'M PLUS 1', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif",
              }}
            >
              <span className="block">UI/UXデザインとAIで</span>
              <span className="block">ユーザーのきもちを動かす力を</span>
              <span className="block">実践でトレーニングしよう</span>
            </h1>
          </div>
          {/* 右: 説明文 + CTA2つ（PurposeNav 3番目の項目と左端を揃える） */}
          <div className="w-full lg:col-span-2">
            <p className="font-noto-sans-jp text-sm font-normal leading-[1.8] tracking-[0.7px] text-text-primary">
              ユーザーのゴールから逆算し、自ら考えて提案できるUI/UX・AIのデザインスキルを、実践形式で身につけるトレーニングサービスです。
            </p>
            {!isMember && (
              <div className="flex max-w-full flex-wrap items-center gap-4 pt-6">
                <Button variant="primary" size="top-cta" className="w-fit" asChild>
                  <Link href="/subscription">メンバーになってはじめる</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
