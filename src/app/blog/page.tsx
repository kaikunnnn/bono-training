import { Metadata } from "next";
import { getBlogPosts } from "@/lib/sanity";
import BlogIndexClient from "./BlogIndexClient";

// ISR: 1時間キャッシュ
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "BONO Blog - HOPE.",
  description: "BONOをつくる30代在宅独身男性のクラフト日誌。デザイン、開発、UI/UXに関する記事をお届けします。",
  keywords: "BONO, ブログ, デザイン, UI/UX, Web開発",
  openGraph: {
    title: "BONO Blog - HOPE.",
    description: "BONOをつくる30代在宅独身男性のクラフト日誌。デザイン、開発、UI/UXに関する記事をお届けします。",
    type: "website",
  },
  twitter: {
    title: "BONO Blog - HOPE.",
    description: "BONOをつくる30代在宅独身男性のクラフト日誌。デザイン、開発、UI/UXに関する記事をお届けします。",
  },
  alternates: { canonical: "/blog" },
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const { posts, pagination } = await getBlogPosts({
    page,
    limit: 9,
  });

  return (
    <BlogIndexClient
      initialPosts={posts}
      initialPagination={pagination}
      currentPage={page}
    />
  );
}
