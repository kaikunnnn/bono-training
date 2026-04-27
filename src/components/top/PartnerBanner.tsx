/**
 * PartnerBanner - キャリアパートナーシップバナー
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 35-16839
 */

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// 型定義
// ============================================

interface Partner {
  /** パートナー名 */
  name: string;
  /** ロゴ画像URL */
  logoUrl: string;
  /** ロゴの幅（px） */
  logoWidth?: number;
  /** 採用情報URL */
  recruitUrl?: string;
}

interface PartnerBannerProps {
  /** バナーラベル */
  label?: string;
  /** パートナー情報 */
  partners: Partner[];
  /** 追加のクラス名 */
  className?: string;
}

// ============================================
// メインコンポーネント
// ============================================

export default function PartnerBanner({
  label = "キャリアパートナーシップ",
  partners,
  className,
}: PartnerBannerProps) {
  return (
    <section
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12",
        "py-6 sm:py-8 px-4 border-b border-border-default",
        className
      )}
    >
      {/* ラベル */}
      <p className="text-[13px] sm:text-sm font-bold text-text-primary/80 whitespace-nowrap">
        {label}
      </p>

      {/* パートナー一覧 */}
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex flex-col items-center gap-2 sm:gap-3"
          >
            {/* ロゴ */}
            <img
              src={partner.logoUrl}
              alt={partner.name}
              className="h-10 sm:h-12 lg:h-[61px] w-auto object-contain"
              style={partner.logoWidth ? { width: partner.logoWidth } : undefined}
            />

            {/* 採用情報リンク */}
            {partner.recruitUrl && (
              <a
                href={partner.recruitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5",
                  "text-[11px] sm:text-xs font-medium text-text-secondary",
                  "border border-border-default rounded-full",
                  "hover:border-text-primary/30 hover:text-text-primary transition-colors"
                )}
              >
                採用情報はこちら
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// デフォルトのパートナーデータをエクスポート
export const DEFAULT_PARTNERS: Partner[] = [
  {
    name: "GMO BEAUTY",
    logoUrl: "/images/partners/gmo-beauty.png",
    logoWidth: 149,
    recruitUrl: "https://beauty.gmo/recruit-design/",
  },
];
