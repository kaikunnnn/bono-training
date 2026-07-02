import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DocPageHeader from "@/components/workshop/DocPageHeader";
import WorkshopMarkdown from "@/components/workshop/WorkshopMarkdown";
import { getAllSlugs, getDocBySlug } from "@/lib/workshop/content";
import { WORKSHOP_META } from "@/lib/workshop/config";

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
    title: `${doc.title} | ${WORKSHOP_META.title} | BONO`,
    description: doc.description,
    robots: { index: false }, // テスト運用中のため noindex
  };
}

export default async function WorkshopDocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-[648px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-24">
        <DocPageHeader doc={doc} />

        <hr className="my-10 border-border-light" />

        <WorkshopMarkdown content={doc.content} />

        <footer className="mt-20 pt-8 border-t border-border-light">
          <Link
            href="/docs/workshop"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            ワークショップトップに戻る
          </Link>
        </footer>
      </div>
    </main>
  );
}
