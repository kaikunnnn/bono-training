import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import OutputBannerCardItem from "@/components/output/OutputBannerCardItem";
import { getOutputsList } from "@/lib/sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "アウトプット一覧",
  description:
    "BONOのコンテンツを使った受講者が、実際に書いた記事を集めた場所。15分FBを受けた作品・気づきを一覧で。",
  openGraph: {
    title: "アウトプット一覧 | BONO",
    description:
      "BONOのコンテンツを使った受講者が、実際に書いた記事を集めた場所。",
  },
  twitter: {
    title: "アウトプット一覧 | BONO",
    description:
      "BONOのコンテンツを使った受講者が、実際に書いた記事を集めた場所。",
  },
  alternates: { canonical: "/outputs" },
};

export default async function OutputsPage() {
  const outputs = await getOutputsList();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <PageHeader
          label="OUTPUTS"
          title="アウトプット一覧"
          description="BONOのコンテンツを使った受講者が、実際に書いた記事を集めた場所。"
        />

        <div className="mb-6">
          <Link
            href="/achievements"
            className="inline-flex items-center gap-1 text-sm text-text-primary/60 hover:underline font-noto-sans-jp"
          >
            ← みんなの成果 に戻る
          </Link>
        </div>

        {outputs.length === 0 ? (
          <p className="text-text-primary/50 text-center py-16 font-noto-sans-jp">
            まだアウトプットが公開されていません。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {outputs.map((output) => (
              <OutputBannerCardItem key={output._id} output={output} />
            ))}
          </div>
        )}

        {/* 回遊CTA: /stories へ */}
        <div className="mt-16 pt-12 border-t border-gray-200/60">
          <Link
            href="/stories"
            className="group block bg-surface rounded-[24px] border border-gray-200/60 shadow-sm p-6 sm:p-8 hover:shadow-md hover:border-gray-300 transition-all max-w-2xl mx-auto"
          >
            <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp">
              受講者ストーリー
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-text-primary font-rounded-mplus mt-1">
              人生を動かした受講者のインタビューも読んでみる →
            </h3>
            <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-2">
              転職・独立など、BONOで動き出した人たちのストーリー集。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
