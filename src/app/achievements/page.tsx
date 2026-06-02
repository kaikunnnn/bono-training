import { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import StoryCardItem from "@/components/story/StoryCardItem";
import OutputBannerCardItem from "@/components/output/OutputBannerCardItem";
import { getStoriesList, getOutputsList } from "@/lib/sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "BONOで動き出した人たち",
  description:
    "BONOで学んだ受講者の転職ストーリーと、実際に手を動かして生まれたアウトプットを紹介します。",
  openGraph: {
    title: "BONOで動き出した人たち | BONO",
    description:
      "BONOで学んだ受講者の転職ストーリーと、実際に手を動かして生まれたアウトプットを紹介します。",
  },
  twitter: {
    title: "BONOで動き出した人たち | BONO",
    description:
      "BONOで学んだ受講者の転職ストーリーと、実際に手を動かして生まれたアウトプットを紹介します。",
  },
  alternates: { canonical: "/achievements" },
};

export default async function AchievementsPage() {
  // ストーリーは最新6件（3列 × 2段）、アウトプットは最新6件
  const [stories, outputs] = await Promise.all([
    getStoriesList(6),
    getOutputsList(6),
  ]);

  return (
    <div className="min-h-screen">
      {/* ヒーロー（/guide と同じ独自セクションスタイル、幅はコンテンツに合わせる） */}
      <section className="px-4 sm:px-6 pt-16 pb-10 max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-bold font-rounded-mplus mb-4">みんなの成果</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
          BONOで動き出した人たち
        </p>
      </section>

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 pb-8 min-w-0">

        {/* ストーリーセクション（縦長グリッド・Discovery 体験） */}
        <section className="mb-12">
          <div className="mb-6">
            <SectionHeading
              label="STORIES"
              title="ストーリー"
              description="受講者が人生を動かした転職ストーリー"
              showUnderline={false}
            />
          </div>

          {stories.length === 0 ? (
            <p className="text-text-primary/50 text-sm font-noto-sans-jp py-8 text-center">
              まだストーリーが公開されていません。
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stories.map((story) => (
                  <StoryCardItem key={story._id} story={story} />
                ))}
              </div>

              <div className="mt-6 text-right">
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:opacity-70 transition-opacity font-noto-sans-jp"
                >
                  ストーリーをすべて見る
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          )}
        </section>

        <DottedDivider className="my-12" />

        {/* アウトプットセクション（横長バナー型・Efficiency 体験） */}
        <section className="mb-12">
          <div className="mb-6">
            <SectionHeading
              label="OUTPUTS"
              title="アウトプット"
              description="BONOのコンテンツを使って生まれた作品・記事たち"
              showUnderline={false}
            />
          </div>

          {outputs.length === 0 ? (
            <p className="text-text-primary/50 text-sm font-noto-sans-jp py-8 text-center">
              まだアウトプットが公開されていません。
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {outputs.map((output) => (
                  <OutputBannerCardItem key={output._id} output={output} />
                ))}
              </div>

              <div className="mt-6 text-right">
                <Link
                  href="/outputs"
                  className="inline-flex items-center gap-1 text-sm font-bold text-text-primary hover:opacity-70 transition-opacity font-noto-sans-jp"
                >
                  アウトプットをすべて見る
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
