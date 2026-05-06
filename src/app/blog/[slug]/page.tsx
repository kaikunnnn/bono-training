import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, getLatestBlogPosts, getAllBlogSlugs, getPrevBlogPost, getNextBlogPost } from "@/lib/sanity";
import { removeEmojiFromText } from "@/utils/blog/emojiUtils";
import BlogDetailClient from "./BlogDetailClient";
import { generateArticleJsonLd, jsonLdScriptProps } from "@/lib/jsonld";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
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

  // 最新の記事と前後の記事を並列取得
  const [latestPosts, prevPost, nextPost] = await Promise.all([
    getLatestBlogPosts(4, post.id),
    getPrevBlogPost(post.id),
    getNextBlogPost(post.id),
  ]);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          generateArticleJsonLd({
            title: post.title,
            description: post.description || "",
            url: `/blog/${slug}`,
            publishedAt: post.publishedAt,
            author: post.author,
            image: post.thumbnail,
          })
        )}
      />
      <BlogDetailClient
        post={post}
        prevPost={prevPost}
        nextPost={nextPost}
        latestPosts={latestPosts}
      />
    </>
  );
}
