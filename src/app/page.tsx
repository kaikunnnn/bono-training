import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllRoadmaps, getAllLessons } from "@/lib/sanity";
import { createClient } from "@/lib/supabase/server";
import TopPageClient from "@/components/top/TopPageClient";
import { generateWebSiteJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BONO - UIUXデザインを学ぶ",
  description:
    "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。ロードマップ、レッスン、記事で効率的にスキルアップ。未経験からUIUXデザイナーへ。",
  openGraph: {
    title: "BONO - UIUXデザインを学ぶ",
    description:
      "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。ロードマップ、レッスン、記事で効率的にスキルアップ。未経験からUIUXデザイナーへ。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BONO - UIUXデザインを学ぶ",
    description:
      "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。ロードマップ、レッスン、記事で効率的にスキルアップ。",
  },
  alternates: { canonical: "/" },
};

/**
 * インデックスページ（Server Component）
 *
 * mainと同じ挙動:
 * - ログイン済み → /mypage にリダイレクト
 * - 未ログイン → トップページを表示
 */
export default async function IndexPage() {
  // ログインチェック: mainの Index.tsx と同じリダイレクトロジック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/mypage");
  }

  // 未ログイン → トップページを表示
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
