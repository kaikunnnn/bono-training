import type { Metadata } from "next";
import { getAllRoadmaps, getAllLessons } from "@/lib/sanity";
import TopPageClient from "@/components/top/TopPageClient";
import { generateWebSiteJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BONO - UIUXデザインを学ぶ",
  description:
    "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。ロードマップ、レッスン、記事で効率的にスキルアップ。未経験からUIUXデザイナーへ。",
};

/**
 * トップページ（/top）
 *
 * mainと同じ: ログイン状態に関係なくトップページを表示する。
 * サイドナビの「トップ」リンクからアクセス。
 */
export default async function TopPage() {
  const [roadmaps, lessons] = await Promise.all([
    getAllRoadmaps(),
    getAllLessons(),
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(generateWebSiteJsonLd())} />
      <TopPageClient roadmaps={roadmaps} lessons={lessons} />
    </>
  );
}
