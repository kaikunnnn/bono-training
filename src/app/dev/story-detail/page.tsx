/**
 * /dev/story-detail — ストーリー詳細ページの叩き（パターン2）
 *
 * パターン2: /blog ベース + 人物プロフィールカード強化
 * - /blog の世界観・読みやすさを踏襲
 * - 人物プロフィールを独立ブロックで強化
 * - 使ったロードマップを独立カードで配置
 *
 * 本番には出さない検証用。
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";

export const metadata: Metadata = {
  title: "ストーリー詳細 叩き (/dev/story-detail)",
  robots: { index: false, follow: false },
};

export default function DevStoryDetailPage() {
  const story = dummyStories[0];
  const relatedStories = dummyStories.slice(1, 3);

  return (
    <div className="min-h-screen">
      {/* dev portal 戻りリンク */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        <Link
          href="/dev/bon-327"
          className="text-xs text-text-primary/50 hover:underline font-noto-sans-jp"
        >
          ← /dev/bon-327 (BON-327 受講者まわり) に戻る
        </Link>
      </div>
      <main className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* パンくず */}
          <nav className="pt-6 pb-4 text-sm text-text-primary/60 font-noto-sans-jp">
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

          {/* === 記事ヘッダー === */}
          <article className="space-y-8">
            <header className="space-y-4">
              {/* カテゴリ + タグ + 公開日 */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-noto-sans-jp">
                <span className="px-3 py-1 rounded-full bg-muted-custom text-text-primary/70 text-xs font-bold">
                  {story.categoryLabel}
                </span>
                {story.tags.map((tag) => (
                  <span key={tag} className="text-text-primary/60 text-xs">
                    #{tag}
                  </span>
                ))}
                <span className="text-text-primary/40 text-xs ml-auto">
                  {story.publishedAt}
                </span>
              </div>

              {/* タイトル */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary font-rounded-mplus leading-tight">
                {story.title}
              </h1>

              {/* リード文 */}
              <p className="text-base md:text-lg text-text-primary/70 font-noto-sans-jp leading-relaxed">
                {story.excerpt}
              </p>
            </header>

            {/* アイキャッチ */}
            <div className="w-full rounded-xl overflow-hidden shadow-md aspect-[16/9] relative bg-muted-custom">
              <Image
                src={story.heroImageUrl}
                alt={story.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>

            {/* === 人物プロフィールカード（パターン2の目玉） === */}
            <div className="bg-surface rounded-[24px] border border-gray-200/60 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                {/* プロフィール画像 */}
                {story.person.profileImageUrl && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-muted-custom">
                    <Image
                      src={story.person.profileImageUrl}
                      alt={story.person.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* テキスト情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-1">
                    インタビュー対象
                  </p>
                  <h2 className="text-xl font-bold text-text-primary font-rounded-mplus">
                    {story.person.name}
                  </h2>
                  <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-0.5">
                    {story.person.currentRole}
                  </p>

                  {story.person.bio && (
                    <p className="text-sm text-text-primary/80 font-noto-sans-jp leading-relaxed mt-3">
                      {story.person.bio}
                    </p>
                  )}

                  {/* SNS リンク */}
                  {story.person.socialLinks && story.person.socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {story.person.socialLinks.map((sns) => (
                        <a
                          key={sns.label}
                          href={sns.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:border-text-primary hover:bg-muted-custom transition-colors text-text-primary/80 font-noto-sans-jp"
                        >
                          {sns.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === 本文（ダミー）=== */}
            <div className="prose prose-lg max-w-none">
              <div className="w-full mx-auto lg:max-w-[648px] space-y-6 font-noto-sans-jp text-text-primary leading-[200%]">
                <p>
                  ※ ここに本文が入ります。実装時は Sanity の PortableText を{" "}
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">
                    RichTextSection
                  </code>{" "}
                  で描画します。<code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">/articles</code>{" "}
                  と同じ書式が全部使えるので、見出し・引用・画像・テーブル・コールアウト・リンクカードが配置できます。
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  BONOに出会うまで
                </h2>
                <p>
                  営業の仕事を続けていく中で、「自分が作ったもので誰かを動かしたい」という想いが強くなっていきました。最初はオンラインスクールをいくつか試したのですが、課題が浅くて手応えが感じられず…。
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  ロードマップを進めた3ヶ月間
                </h2>
                <p>
                  BONOの「UIUX転職ロードマップ」を1日2時間ペースで進めました。特に良かったのは、各ステップで&nbsp;
                  <strong className="font-bold">「なぜこれをやるのか」が言語化されている</strong>
                  &nbsp;こと。
                </p>

                <blockquote className="border-l-4 border-gray-300 bg-muted-custom py-4 px-6 my-6 italic text-text-primary/80">
                  ただ手を動かすだけじゃなくて、「次に何を学べばいいか」が常に見えていたのが大きかったです。
                </blockquote>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  ポートフォリオ作成と転職活動
                </h2>
                <p>
                  最終ステップで作ったポートフォリオを使って、5社にカジュアル面談を申し込みました。結果、3社から書類選考を経て面接へ進み、最終的に現在の会社に内定をもらえました。
                </p>
              </div>
            </div>

            {/* === 使ったロードマップカード === */}
            {story.usedRoadmap && (
              <div className="w-full mx-auto lg:max-w-[648px]">
                <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-2 px-1">
                  〇〇さんが使ったロードマップ
                </p>
                <Link
                  href={story.usedRoadmap.href}
                  className="group block bg-surface rounded-[20px] border border-gray-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-0">
                    {story.usedRoadmap.imageUrl && (
                      <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-square flex-shrink-0 bg-muted-custom">
                        <Image
                          src={story.usedRoadmap.imageUrl}
                          alt={story.usedRoadmap.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                      <span className="text-xs font-bold text-text-primary/50 font-noto-sans-jp">
                        📚 ロードマップ
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus mt-1 group-hover:underline">
                        {story.usedRoadmap.title}
                      </h3>
                      <p className="text-sm text-text-primary/70 font-noto-sans-jp mt-2 leading-relaxed">
                        {story.usedRoadmap.description}
                      </p>
                      <span className="text-sm font-bold text-text-primary font-noto-sans-jp mt-3">
                        詳しく見る →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* === シェアセクション === */}
            <div className="mt-12 flex flex-col items-center gap-3 px-6 py-8 w-full mx-auto lg:max-w-[648px] bg-surface rounded-[36px] border border-gray-200/60">
              <p className="text-sm text-text-primary/60 font-noto-sans-jp font-semibold">
                よかったらシェアしてね🙋
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="bg-white border border-gray-200 flex gap-2 items-center px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                  <span className="font-noto-sans-jp font-semibold text-sm text-text-primary">
                    URLをコピー
                  </span>
                </button>
                <button
                  type="button"
                  className="bg-white border border-gray-200 flex gap-2 items-center px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition"
                >
                  <span className="font-noto-sans-jp font-semibold text-sm text-text-primary">
                    Xでシェア
                  </span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* === 関連ストーリー === */}
      <section className="border-t border-gray-200/60 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus text-center">
              他のストーリー
            </h2>
            <p className="text-sm text-text-primary/60 text-center mt-2 font-noto-sans-jp">
              こちらもよかったらどぞっ🍕
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {relatedStories.map((s) => (
                <StoryCardPatternB
                  key={s.slug}
                  slug={s.slug}
                  title={s.title}
                  heroImageUrl={s.heroImageUrl}
                  person={s.person}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
