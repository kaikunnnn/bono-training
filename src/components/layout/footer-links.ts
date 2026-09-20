/**
 * 共通フッターのリンク定義（単一の真実）。
 * 表示順・ラベル・リンク先の追加/変更はこのファイルだけで行う。
 * Footer.tsx が参照する。存在しないページへはリンクしない（実在ルートのみ）。
 */

export type FooterLink = {
  label: string;
  href: string;
  /** 外部リンク（新規タブ + rel="noopener noreferrer"）。内部は操作意図時のみprefetch。 */
  external?: boolean;
};

export type FooterGroup = {
  label: string;
  links: FooterLink[];
};

/** ブランド領域のサービス説明（1文）。 */
export const FOOTER_DESCRIPTION =
  "BONOは、UI/UXデザインとAIを実践形式で学び、ユーザーの気持ちを動かす力を身につけるデザイン学習サービスです。";

/** 公式SNS（実在アカウントのみ）。 */
export const FOOTER_SNS: FooterLink[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCghPjck_LzxNMs2tI4PPYlQ/",
    external: true,
  },
  { label: "X", href: "https://x.com/takumii_kai", external: true },
];

/** 主要リンク列（右ブロックのクラスター）。 */
export const FOOTER_GROUPS: FooterGroup[] = [
  {
    label: "学ぶ",
    links: [
      { label: "UI/UXデザインのロードマップ", href: "/roadmap" },
      { label: "レッスン一覧", href: "/lessons" },
      { label: "スキルガイド", href: "/guide" },
      { label: "新着", href: "/updates" },
      { label: "デザイン記事", href: "/blog" },
    ],
  },
  {
    label: "コミュニティ",
    links: [
      { label: "掲示板", href: "/questions" },
      { label: "みんなの実績", href: "/achievements" },
      { label: "使い方", href: "/how-to" },
    ],
  },
  {
    label: "サービス",
    links: [
      { label: "料金・プラン", href: "/subscription" },
      { label: "フィードバック", href: "/how-to/feedback" },
      { label: "BONOについて", href: "https://kaikun.bo-no.design/about", external: true },
      { label: "お問い合わせ", href: "https://forms.gle/mC445GwiNUoY9LD3A", external: true },
    ],
  },
];

/** 規約リンク（最下部の規約バー。主要列には重複掲載しない）。 */
export const FOOTER_LEGAL: FooterLink[] = [
  { label: "利用規約", href: "/terms" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "特定商取引法に基づく表示", href: "/tokushoho" },
];
