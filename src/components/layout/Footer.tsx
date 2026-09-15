import Link from "next/link";
import { Youtube, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";
import {
  FOOTER_DESCRIPTION,
  FOOTER_GROUPS,
  FOOTER_LEGAL,
  FOOTER_SNS,
  type FooterLink,
} from "./footer-links";

interface FooterProps {
  className?: string;
}

/** SNSラベル → lucideアイコン（プロジェクト標準）。 */
const SNS_ICON = {
  YouTube: Youtube,
  X: Twitter,
} as const;

/**
 * 共通フッター。
 * - 左=ブランドブロック（ロゴ→トップ / 説明1文 / SNS）、右=リンク列クラスター（学ぶ/コミュニティ/サービス）。
 * - 規約は最下部の規約バーへ（主要列に重複掲載しない）。背景色は持たない（ページ背景の上に上罫線のみ）。
 * - リンク定義は footer-links.ts に集約。
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border-light px-6 pt-12 pb-6 lg:px-11 lg:pt-14",
        className
      )}
    >
      {/* 上段: 左=ブランド / 右=リンク列クラスター（均等カラムにしない） */}
      <div className="flex flex-col gap-9 lg:flex-row lg:items-start lg:justify-between lg:gap-[72px]">
        {/* ブランド領域 */}
        <div className="max-w-[320px]">
          <Link href="/" aria-label="BONO ホームへ" className="inline-block leading-none">
            <Logo width={82} height={24} />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {FOOTER_DESCRIPTION}
          </p>
          <div className="mt-5 flex gap-4">
            {FOOTER_SNS.map((sns) => {
              const Icon = SNS_ICON[sns.label as keyof typeof SNS_ICON];
              return (
                <a
                  key={sns.label}
                  href={sns.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sns.label}
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  {Icon ? <Icon size={20} aria-hidden="true" /> : sns.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* リンク列クラスター（右ブロック） */}
        <nav
          aria-label="フッターナビゲーション"
          className="flex flex-wrap gap-x-14 gap-y-8"
        >
          {FOOTER_GROUPS.map((group) => (
            <div key={group.label} className="min-w-[140px]">
              <h2 className="mb-4 font-heading text-xs font-bold tracking-wide text-text-primary">
                {group.label}
              </h2>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* 下段: 規約バー + コピーライト */}
      <div className="mt-10 flex flex-col gap-3 border-t border-border-light pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER_LEGAL.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-text-muted">© BONO. All rights reserved.</p>
      </div>
    </footer>
  );
}

/** 内部リンク=next/link、外部リンク=新規タブ + rel="noopener noreferrer"。 */
function FooterAnchor({ link }: { link: FooterLink }) {
  const cls =
    "text-sm text-text-secondary transition-colors hover:text-text-primary";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {link.label}
    </Link>
  );
}

export default Footer;
