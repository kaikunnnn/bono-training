import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DocCard from "@/components/workshop/DocCard";
import DocPageHeader from "@/components/workshop/DocPageHeader";
import DocToc from "@/components/workshop/DocToc";
import { extractHeadings } from "@/lib/workshop/toc";
import WorkshopHeader from "@/components/workshop/WorkshopHeader";
import WorkshopMarkdown from "@/components/workshop/WorkshopMarkdown";
import {
  getAllSlugs,
  getDocBySlug,
  getNextDoc,
} from "@/lib/number-challenge/content";
import {
  NUMBER_CHALLENGE_BACK_LABEL,
  NUMBER_CHALLENGE_BASE_PATH,
  NUMBER_CHALLENGE_META,
  NUMBER_CHALLENGE_STEPS,
} from "@/lib/number-challenge/config";

export const dynamic = "force-static";
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} | ${NUMBER_CHALLENGE_META.title}`,
    description: doc.description,
    robots: { index: false }, // テスト運用中のため noindex（/docs/workshop と同じ扱い）
  };
}

export default async function NumberChallengeDocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();
  const nextDoc = getNextDoc(slug);

  return (
    <main className="min-h-screen bg-surface">
      <WorkshopHeader questionUrl={null} />
      <div className="max-w-[648px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-24">
        <DocPageHeader
          doc={doc}
          steps={NUMBER_CHALLENGE_STEPS}
          basePath={NUMBER_CHALLENGE_BASE_PATH}
          backLabel={NUMBER_CHALLENGE_BACK_LABEL}
        />

        <hr className="my-10 border-border-light" />

        <DocToc headings={extractHeadings(doc.content)} />

        <div className="mt-12">
          <WorkshopMarkdown content={doc.content} figureImages />
        </div>

        {nextDoc && (
          <section className="mt-20">
            <p className="text-[12px] font-bold tracking-[0.18em] uppercase text-text-muted mb-3 font-line-seed-jp">
              Next
            </p>
            <DocCard doc={nextDoc} basePath={NUMBER_CHALLENGE_BASE_PATH} />
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-border-light">
          <Link
            href={NUMBER_CHALLENGE_BASE_PATH}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            {NUMBER_CHALLENGE_BACK_LABEL}
          </Link>
        </footer>
      </div>
    </main>
  );
}
