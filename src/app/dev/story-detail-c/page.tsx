/**
 * /dev/story-detail-c — ストーリー詳細 パターン3（物語性強化版）
 *
 * Hero画像オーバーレイで人物名・職種・ビフォー/アフターを目立たせる。
 * Pull Quote（引用ハイライト）で物語性を最大化。
 * 統一感より「人生が変わったストーリー」感を優先した叩き。
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";

export const metadata: Metadata = {
  title: "ストーリー詳細 パターン3（物語性強化） (/dev/story-detail-c)",
  robots: { index: false, follow: false },
};

export default function DevStoryDetailCPage() {
  const story = dummyStories[0];
  const relatedStories = dummyStories.slice(1, 3);

  // ビフォー/アフター（仮：将来 person.before/after フィールドを追加検討）
  const before = "営業職";
  const after = "UIデザイナー";

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

          {/* === Hero（オーバーレイ強調・パターン3の目玉）=== */}
          <div className="relative w-full rounded-[28px] overflow-hidden shadow-lg aspect-[16/9] bg-muted-custom">
            <Image
              src={story.heroImageUrl}
              alt={story.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />

            {/* グラデオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* オーバーレイテキスト */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
              {/* ビフォー/アフター */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-noto-sans-jp text-white/80 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">
                  {before}
                </span>
                <span className="text-xl sm:text-2xl">▸</span>
                <span className="text-xs sm:text-sm font-noto-sans-jp font-bold px-3 py-1 rounded-full bg-white text-text-primary">
                  {after}
                </span>
              </div>

              {/* 人物名 */}
              <p className="text-lg sm:text-xl font-bold font-rounded-mplus">
                {story.person.name}
              </p>
              <p className="text-xs sm:text-sm text-white/80 font-noto-sans-jp mt-1">
                {story.person.currentRole}
              </p>
            </div>
          </div>

          <article className="space-y-8 mt-10">
            {/* === 記事ヘッダー（タイトル + リード）=== */}
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

            {/* === 本文（Pull Quote で物語性強化）=== */}
            <div className="prose prose-lg max-w-none">
              <div className="w-full mx-auto lg:max-w-[648px] space-y-6 font-noto-sans-jp text-text-primary leading-[200%]">
                <p>
                  ※ パターン3は <strong className="font-bold">物語性強化版</strong>です。
                  Heroのオーバーレイで「ビフォー/アフター」を強調し、本文中の重要な発言を
                  Pull Quote（引用ハイライト）で抜粋表示します。
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  BONOに出会うまで
                </h2>
                <p>
                  営業の仕事を続けていく中で、「自分が作ったもので誰かを動かしたい」という想いが強くなっていきました。
                </p>

                {/* === Pull Quote: 物語性強化の目玉 === */}
                <figure className="my-12 -mx-4 sm:mx-0">
                  <blockquote className="relative bg-gradient-to-br from-orange-50 to-yellow-50 border-l-[6px] border-orange-400 px-6 py-8 sm:px-10 sm:py-10 rounded-r-2xl">
                    <span className="absolute top-2 left-4 text-6xl text-orange-300/40 font-serif select-none leading-none">
                      &ldquo;
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-text-primary font-rounded-mplus leading-relaxed relative">
                      ただ手を動かすだけじゃなくて、「次に何を学べばいいか」が常に見えていたのが大きかったです。
                    </p>
                    <figcaption className="text-sm text-text-primary/60 font-noto-sans-jp mt-4">
                      — {story.person.name}
                    </figcaption>
                  </blockquote>
                </figure>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  ロードマップを進めた3ヶ月間
                </h2>
                <p>
                  BONOの「UIUX転職ロードマップ」を1日2時間ペースで進めました。特に良かったのは、各ステップで&nbsp;
                  <strong className="font-bold">「なぜこれをやるのか」が言語化されている</strong>&nbsp;こと。
                </p>

                <h2 className="text-xl md:text-2xl font-bold text-text-primary font-rounded-mplus mt-12 mb-4">
                  ポートフォリオ作成と転職活動
                </h2>
                <p>
                  最終ステップで作ったポートフォリオを使って、5社にカジュアル面談を申し込みました。結果、3社から書類選考を経て面接へ進み、最終的に現在の会社に内定をもらえました。
                </p>

                {/* 2つ目の Pull Quote */}
                <figure className="my-12 -mx-4 sm:mx-0">
                  <blockquote className="relative bg-gradient-to-br from-orange-50 to-yellow-50 border-l-[6px] border-orange-400 px-6 py-8 sm:px-10 sm:py-10 rounded-r-2xl">
                    <span className="absolute top-2 left-4 text-6xl text-orange-300/40 font-serif select-none leading-none">
                      &ldquo;
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-text-primary font-rounded-mplus leading-relaxed relative">
                      未経験でも、ちゃんと積み上げれば見える景色は変わる。
                    </p>
                    <figcaption className="text-sm text-text-primary/60 font-noto-sans-jp mt-4">
                      — {story.person.name}
                    </figcaption>
                  </blockquote>
                </figure>
              </div>
            </div>

            {/* === 使ったロードマップ（小さめカード）=== */}
            {story.usedRoadmap && (
              <div className="w-full mx-auto lg:max-w-[648px]">
                <Link
                  href={story.usedRoadmap.href}
                  className="group block bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <span className="text-xs font-bold text-text-primary/50 font-noto-sans-jp">
                    📚 {story.person.name} が使ったロードマップ
                  </span>
                  <h3 className="text-base font-bold text-text-primary font-rounded-mplus mt-1 group-hover:underline">
                    {story.usedRoadmap.title} →
                  </h3>
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
