import type { Metadata } from "next";
import { getAllRoadmaps, getAllLessons } from "@/lib/sanity";
import TopPageClient from "@/components/top/TopPageClient";

export const metadata: Metadata = {
  title: "過去のトップページ（全セクション） プレビュー",
  robots: { index: false, follow: false },
};

/**
 * /dev/top-classic-full — 新トップ昇格（d63894b1）直前まで本番 `/` だった旧トップの全体プレビュー。
 * 旧 src/app/page.tsx の未ログイン表示部分をそのまま再現（ログインリダイレクト・JSON-LDは除外）。
 */
export default async function ClassicTopFullPreviewPage() {
  const [roadmaps, lessons] = await Promise.all([getAllRoadmaps(), getAllLessons()]);
  return <TopPageClient roadmaps={roadmaps} lessons={lessons} />;
}
