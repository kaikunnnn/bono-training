import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, getLatestBlogPosts, getAllBlogSlugs } from "@/lib/sanity";
import { removeEmojiFromText } from "@/utils/blog/emojiUtils";
import BlogDetailClient from "./BlogDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "記事が見つかりません" };
  }

  // OGP用の画像URL（SVGは非対応なのでフォールバックは動的生成画像を使用）
  const ogImage = post.thumbnail && post.thumbnail !== '/placeholder-thumbnail.svg'
    ? post.thumbnail
    : null;

  return {
    title: `${removeEmojiFromText(post.title)} | BONO Blog`,
    description: post.description,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: `${removeEmojiFromText(post.title)} | BONO Blog`,
      description: post.description,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: removeEmojiFromText(post.title),
      description: post.description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // 最新の記事を取得（現在の記事を除外）
  const latestPosts = await getLatestBlogPosts(4, post.id);

  // 前後の記事ナビゲーションは現在無効化されているのでnullを渡す
  return (
    <BlogDetailClient
      post={post}
      prevPost={null}
      nextPost={null}
      latestPosts={latestPosts}
    />
  );
}
