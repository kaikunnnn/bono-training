/**
 * /dev/story-detail-a — ストーリー詳細 パターン1（/blog 完全踏襲版）
 *
 * ストーリー固有情報（人物・bio・SNS・使ったロードマップ）は
 * すべて本文中の見出し下に普通に埋め込む。
 * /blog のレイアウトと完全に揃え、統一感を最大化する叩き。
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";

export const metadata: Metadata = {
  title: "ストーリー詳細 パターン1（/blog 完全踏襲） (/dev/story-detail-a)",
  robots: { index: false, follow: false },
};

export default function DevStoryDetailAPage() {
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

          <article className="space-y-8">
            {/* === 記事ヘッダー（シンプル）=== */}
            <header className="space-y-4">
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

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary font-rounded-mplus leading-tight">
                {story.title}
              </h1>

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

            {/* === 本文（パターン1: 人物・bio・SNS・ロードマップは本文中に埋め込む）=== */}
            <div className="prose prose-lg max-w-none">
              <div className="w-full mx-auto lg:max-w-[648px] space-y-6 font-noto-sans-jp text-text-primary leading-[200%]">
                <p>
                  ※ パターン1は <strong className="font-bold">/blog 完全踏襲版</strong>です。
                  ストーリー固有の情報（人物プロフィール・bio・SNS・使ったロードマップ）は
                  本文の見出し下に普通に書きます。
                </p>

                {/* 「インタビュー対象」が本文の見出しになる */}
                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  インタビュー対象
                </h2>
                <p>
                  <strong className="font-bold">{story.person.name}</strong>（{story.person.currentRole}）
                </p>
                {story.person.bio && <p>{story.person.bio}</p>}
                {story.person.socialLinks && story.person.socialLinks.length > 0 && (
                  <p>
                    SNS:{" "}
                    {story.person.socialLinks.map((sns, i) => (
                      <span key={sns.label}>
                        {i > 0 && " / "}
                        <a
                          href={sns.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {sns.label}
                        </a>
                      </span>
                    ))}
                  </p>
                )}

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
                  <strong className="font-bold">「なぜこれをやるのか」が言語化されている</strong>&nbsp;こと。
                </p>

                <blockquote className="border-l-4 border-gray-300 bg-muted-custom py-4 px-6 my-6 italic text-text-primary/80">
                  ただ手を動かすだけじゃなくて、「次に何を学べばいいか」が常に見えていたのが大きかったです。
                </blockquote>

                {/* 「使ったコンテンツ」もただの段落 */}
                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  使ったコンテンツ
                </h2>
                <p>
                  📚{" "}
                  {story.usedRoadmap ? (
                    <Link
                      href={story.usedRoadmap.href}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {story.usedRoadmap.title}
                    </Link>
                  ) : (
                    "UIUX転職ロードマップ"
                  )}
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  ポートフォリオ作成と転職活動
                </h2>
                <p>
                  最終ステップで作ったポートフォリオを使って、5社にカジュアル面談を申し込みました。結果、3社から書類選考を経て面接へ進み、最終的に現在の会社に内定をもらえました。
                </p>
              </div>
            </div>

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

      {/* === 他のストーリー === */}
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
