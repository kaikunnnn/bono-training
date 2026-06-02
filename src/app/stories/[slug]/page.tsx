import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import UsedRoadmapCard from "@/components/story/UsedRoadmapCard";
import StoryCardItem from "@/components/story/StoryCardItem";
import RichTextSection from "@/components/article/RichTextSection";
import ContentPreviewOverlay from "@/components/premium/ContentPreviewOverlay";
import { getSubscriptionStatus, canAccessContent } from "@/lib/subscription";

/**
 * 動画URLから iframe embed URL を構築
 * - Vimeo private (例: https://vimeo.com/123/abc?share=copy)
 *   → https://player.vimeo.com/video/123?h=abc
 * - YouTube
 *   → https://www.youtube.com/embed/{id}
 */
function buildEmbedUrl(url: string): string | null {
  const vimeo = url.match(/vimeo\.com\/(\d+)(?:\/([a-f0-9]+))?/);
  if (vimeo) {
    const [, id, hash] = vimeo;
    return hash
      ? `https://player.vimeo.com/video/${id}?h=${hash}`
      : `https://player.vimeo.com/video/${id}`;
  }
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return null;
}
import {
  getStoryBySlug,
  getRelatedStories,
  getAllStorySlugs,
} from "@/lib/sanity";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllStorySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return { title: "ストーリーが見つかりません" };
  }

  const ogImage = story.heroImageUrl;

  return {
    title: `${story.title} | BONO`,
    description: story.excerpt,
    keywords: story.tags?.join(", "),
    openGraph: {
      title: `${story.title} | BONO`,
      description: story.excerpt,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
      publishedTime: story.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: `/stories/${slug}` },
  };
}

function formatPublishedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [story, subscription] = await Promise.all([
    getStoryBySlug(slug),
    getSubscriptionStatus(),
  ]);

  if (!story) {
    notFound();
  }

  const hasAccess = canAccessContent(
    story.isPremium || false,
    subscription.planType
  );
  // 動画以降を一括ブロックするかどうか
  const showLockedContent = !!story.isPremium && !hasAccess;

  const relatedStories = await getRelatedStories(story._id, 3);

  return (
    <div className="min-h-screen">
      <main className="px-4 sm:px-6 pb-24">
        <div className="max-w-[700px] mx-auto">
          {/* パンくず（メタ風） */}
          <nav className="pt-12 pb-6 text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
            <Link href="/achievements" className="hover:underline">
              みんなの成果
            </Link>
            <span className="mx-2">/</span>
            <Link href="/stories" className="hover:underline">
              ストーリー
            </Link>
            <span className="mx-2">/</span>
            <span className="text-text-primary">{story.person.name}</span>
          </nav>

          <article>
            {/* === 記事ヘッダー（カードの並びに揃える）=== */}
            <header className="mb-12">
              {/* カテゴリラベル */}
              <p className="mb-4 text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
                {story.categoryLabel}
              </p>

              {/* タイトル */}
              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-bold text-text-primary leading-[1.22] tracking-[-0.02em] font-noto-sans-jp">
                {story.title}
              </h1>

              {/* リード文 */}
              <p className="mt-8 text-[18px] leading-[33.3px] text-text-primary/85 font-noto-sans-jp">
                {story.excerpt}
              </p>

              {/* 人物（左）+ タグ・日付（右）— モバイルは縦積み、sm 以上は左右配置 */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* 左: 人物（アイコン + 名前 + 職種） */}
                <div className="flex items-center gap-3 min-w-0">
                  {story.person.profileImageUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#e8e9e2]">
                      <Image
                        src={story.person.profileImageUrl}
                        alt={story.person.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#e8e9e2] flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-text-primary/40" strokeWidth={1.75} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary font-noto-sans-jp leading-tight">
                      {story.person.name}
                    </p>
                    {story.person.currentRole && (
                      <p className="text-xs text-text-primary/60 font-noto-sans-jp mt-0.5 truncate">
                        {story.person.currentRole}
                      </p>
                    )}
                  </div>
                </div>

                {/* 右: タグ + 日付 */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-noto-sans-jp text-text-primary/60 sm:flex-shrink-0">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-muted-custom"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-text-primary/40">
                    {formatPublishedAt(story.publishedAt)}
                  </span>
                </div>
              </div>
            </header>

            {showLockedContent ? (
              /* === 有料コンテンツ・未契約: 動画位置で一括ロック（/articles と同じUI） === */
              <div className="w-full mb-16">
                {/* 訴求コピー（ロックブロックの外・本番コンポーネントは触らない） */}
                <p className="text-center mb-8 text-[15px] text-text-primary/70 font-noto-sans-jp leading-relaxed">
                  BONOメンバーになると、メンバーのリアルな体験談を知ることができます。
                </p>
                <ContentPreviewOverlay
                  isLoggedIn={subscription.isLoggedIn}
                  redirectTo={`/stories/${slug}`}
                />
              </div>
            ) : (
              <>
                {/* === 動画 or アイキャッチ === */}
                {story.videoUrl && buildEmbedUrl(story.videoUrl) ? (
                  <div className="w-full mb-16">
                    <div className="w-full rounded-[8px] overflow-hidden aspect-video bg-[#e8e9e2]">
                      <iframe
                        src={buildEmbedUrl(story.videoUrl)!}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                        allowFullScreen
                        title={story.title}
                      />
                    </div>
                  </div>
                ) : (
                  story.heroImageUrl && (
                    <div className="w-full mb-16 rounded-[8px] overflow-hidden aspect-[16/9] relative bg-[#e8e9e2]">
                      <Image
                        src={story.heroImageUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    </div>
                  )
                )}

                {/* 本文（PortableText・/articles と同じ書式） */}
                {story.body && story.body.length > 0 && (
                  <RichTextSection content={story.body} />
                )}

                {/* 使ったロードマップ */}
                {story.relatedRoadmaps && story.relatedRoadmaps.length > 0 && (
                  <div className="mt-20 space-y-6">
                    {story.relatedRoadmaps.map((roadmap) => (
                      <UsedRoadmapCard
                        key={roadmap._id}
                        roadmap={roadmap}
                        personName={story.person.name}
                      />
                    ))}
                  </div>
                )}

                {/* シェアセクション */}
                <div className="mt-20 pt-8 border-t border-[#e8e9e2] flex items-center justify-between">
                  <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
                    Share this story
                  </p>
                  <div className="flex gap-3 text-[12px] font-noto-sans-jp">
                    <Link
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(`https://bono.training/stories/${slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-primary hover:underline underline-offset-4"
                    >
                      Xでシェア
                    </Link>
                  </div>
                </div>
              </>
            )}
          </article>
        </div>
      </main>

      {/* 他のストーリー */}
      {relatedStories.length > 0 && (
        <section className="border-t border-[#e8e9e2]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20">
            <p className="text-[11px] tracking-[1.68px] uppercase text-[#677470] font-noto-sans-jp mb-3 text-center">
              More Stories
            </p>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-text-primary text-center font-rounded-mplus leading-tight">
              他のストーリー
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {relatedStories.map((s) => (
                <StoryCardItem key={s._id} story={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
