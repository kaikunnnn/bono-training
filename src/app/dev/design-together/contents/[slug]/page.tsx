/**
 * /dev/design-together/contents/[slug] — 動画ページの複製（#253）
 *
 * slug は #251 と同じダミーのレッスン（Figma入門 / UIビジュアル基礎）の記事だけ。
 * 作業中は動画の下に「作業中 ◯分・作業を終える」が出る（動画にはかからない）。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findArticleBySlug } from "../../_proto/data";
import { ProtoArticleView } from "../../_proto/article/ProtoArticleView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = findArticleBySlug(slug);
  return {
    title: found
      ? `${found.article.title} | ${found.lesson.title}（いっしょにデザインのプロト）`
      : "記事が見つかりません",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  if (!findArticleBySlug(slug)) notFound();
  return <ProtoArticleView slug={slug} />;
}
