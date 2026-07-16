import type { Metadata } from "next";
import EyecatchSection from "@/components/top/home/EyecatchSection";
import NewContentSection, {
  type NewContentItem,
} from "@/components/top/home/NewContentSection";
import CourseBannerSection from "@/components/top/home/CourseBannerSection";

/**
 * /dev/top — 新トップページ（2026）組み立て用プレビュー
 *
 * Figma: PRD🏠_topUI_newBONO2026 node-id: 497-3
 *
 * ブロック単位で実装し、ここで確認する。完成後に / へ接続する。
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。
 */

export const metadata: Metadata = {
  title: "新トップ プレビュー (/dev/top)",
  robots: { index: false, follow: false },
};

// ブロック2 のモックデータ（Figma の見た目確認用）
const MOCK_NEW_ITEMS: NewContentItem[] = [
  {
    type: "レッスン",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new1.png",
    href: "/lessons",
  },
  {
    type: "ガイド",
    title: "生成AIと共創するデザインプロセスだよ〜ね〜",
    thumbnail: "/images/top/new/new2.png",
    href: "/guide",
  },
  {
    type: "フィードバック",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new3.png",
    href: "/feedbacks",
  },
  {
    type: "レッスン",
    title: "生成AIと共創するデザインプロセス",
    thumbnail: "/images/top/new/new4.png",
    href: "/lessons",
  },
];

export default function DevTopPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-16 sm:gap-24">
        {/* ブロック1: アイキャッチ */}
        <EyecatchSection />

        {/* ブロック2: 新着コンテンツ一覧（モックデータ。承認後に実Sanity接続） */}
        <NewContentSection items={MOCK_NEW_ITEMS} />

        {/* ブロック3: コース訴求バナー（モックデータ。承認後に実データ接続） */}
        <CourseBannerSection />

        {/* 以降のブロックは順次追加 */}
      </div>
    </div>
  );
}
