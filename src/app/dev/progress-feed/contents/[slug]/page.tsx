/**
 * /dev/progress-feed/contents/[slug] — 記事ページの複製（#251 フェーズ2）
 *
 * slug はダミーのレッスン（Figma入門 / UIビジュアル基礎）の記事だけ。
 * 「frame-and-layer」はクエスト1の最後の記事なので、完了にすると節目（クエスト完了）になり、みんなの進捗に流れる。
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
    title: found ? `${found.article.title} | ${found.lesson.title}（進捗フィードのプロト）` : "記事が見つかりません",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  if (!findArticleBySlug(slug)) notFound();
  return <ProtoArticleView slug={slug} />;
}
