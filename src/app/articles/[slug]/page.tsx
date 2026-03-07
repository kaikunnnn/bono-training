import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { getArticleWithContext, getArticleMetadata } from "@/lib/sanity";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// OGP用メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleMetadata(slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  const title = article.lessonTitle
    ? `${article.title} | ${article.lessonTitle} | BONO`
    : `${article.title} | BONO`;
  const description = article.excerpt || `${article.title}の学習コンテンツ`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
    },
  };
}

// PortableText コンポーネント設定
const portableTextComponents = {
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string } }) => {
      if (!value?.asset?.url) return null;
      return (
        <img
          src={value.asset.url}
          alt={value.alt || ""}
          className="rounded-lg my-4 max-w-full"
        />
      );
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => {
      return (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),
  },
};

// ページコンポーネント（Server Component）
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleWithContext(slug);

  if (!article) {
    notFound();
  }

  // 動画時間をフォーマット
  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return null;
    const seconds = typeof duration === "string" ? parseInt(duration, 10) : duration;
    if (isNaN(seconds)) return null;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  // 記事タイプのラベル
  const getArticleTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      intro: "イントロ",
      explain: "解説",
      practice: "実践",
      challenge: "チャレンジ",
      demo: "デモ",
    };
    return type ? labels[type] || type : null;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* ヘッダー部分 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* パンくずリスト */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">
              ホーム
            </Link>
            {article.lessonInfo && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/lessons/${article.lessonInfo.slug.current}`}
                  className="hover:text-gray-700"
                >
                  {article.lessonInfo.title}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>

          {/* タイトルとメタ情報 */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {/* 記事タイプバッジ */}
              {article.articleType && (
                <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded mb-2">
                  {getArticleTypeLabel(article.articleType)}
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {article.title}
              </h1>

              {/* メタ情報 */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {article.videoDuration && (
                  <span>{formatDuration(article.videoDuration)}</span>
                )}
                {article.isPremium && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    プレミアム
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* 動画プレイヤー */}
          {article.videoUrl && (
            <div className="mb-8">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white text-sm">
                  動画プレイヤー: {article.videoUrl}
                </p>
              </div>
            </div>
          )}

          {/* 学習目標 */}
          {article.learningObjectives && article.learningObjectives.length > 0 && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-bold text-gray-900 mb-2">この記事で学ぶこと</h2>
              <ul className="space-y-1">
                {article.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-500">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 本文 */}
          {article.content && (
            <div className="prose prose-gray max-w-none">
              <PortableText value={article.content} components={portableTextComponents} />
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="mt-8 flex justify-between items-center">
          {article.lessonInfo ? (
            <Link
              href={`/lessons/${article.lessonInfo.slug.current}`}
              className="text-blue-600 hover:underline"
            >
              ← {article.lessonInfo.title}に戻る
            </Link>
          ) : (
            <Link href="/" className="text-blue-600 hover:underline">
              ← ホームに戻る
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
