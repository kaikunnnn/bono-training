import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PersonCard from "@/components/story/PersonCard";
import UsedRoadmapCard from "@/components/story/UsedRoadmapCard";
import StoryCardItem from "@/components/story/StoryCardItem";
import RichTextSection from "@/components/article/RichTextSection";
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
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const relatedStories = await getRelatedStories(story._id, 2);

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
            {/* === 記事ヘッダー === */}
            <header className="mb-12">
              <div className="mb-6 flex flex-wrap items-center gap-4 text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
                <span>{story.categoryLabel}</span>
                {story.tags.length > 0 && (
                  <>
                    <span className="text-[#d4d6cc]">|</span>
                    {story.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </>
                )}
                <span className="text-[#d4d6cc]">|</span>
                <span>{formatPublishedAt(story.publishedAt)}</span>
              </div>

              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-bold text-text-primary leading-[1.22] tracking-[-0.02em] font-noto-sans-jp">
                {story.title}
              </h1>

              <p className="mt-8 text-[18px] leading-[33.3px] text-text-primary/85 font-noto-sans-jp">
                {story.excerpt}
              </p>
            </header>

            {/* アイキャッチ */}
            {story.heroImageUrl && (
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
            )}

            {/* 人物プロフィールカード */}
            <div className="mb-16">
              <PersonCard person={story.person} />
            </div>

            {/* 本文（PortableText・/articles と同じ書式） */}
            <RichTextSection content={story.body} />

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
          </article>
        </div>
      </main>

      {/* 他のストーリー */}
      {relatedStories.length > 0 && (
        <section className="bg-white border-t border-[#e8e9e2]">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-20">
            <p className="text-[11px] tracking-[1.68px] uppercase text-[#677470] font-noto-sans-jp mb-3 text-center">
              More Stories
            </p>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-text-primary text-center font-rounded-mplus leading-tight">
              他のストーリー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
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
