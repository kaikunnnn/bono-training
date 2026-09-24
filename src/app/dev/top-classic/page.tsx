import type { Metadata } from "next";
import { ClassicTopHero } from "@/components/dev-preview/top/ClassicTopHero";

export const metadata: Metadata = {
  title: "過去のトップアイキャッチ プレビュー",
  robots: { index: false, follow: false },
};

export default function ClassicTopPreviewPage() {
  return <ClassicTopHero />;
}
