/**
 * /dev/story-detail-d — ストーリー詳細 パターン4（Figma Blog 風タイポ）
 *
 * Figma の「PROD-Guide-Blog_2026」(node 50:725) のスタイル踏襲:
 * - 本文 16px / line-height 1.85
 * - H1 56px / H2 34px / H3 22px
 * - 本文幅 max-w-[700px]
 * - 背景 #f9f9f7、本文色 #354540
 * - 余白たっぷり
 *
 * パターン2のレイアウトベース、タイポと余白のみ差し替え。
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { dummyStories } from "@/app/achievements/dummy-data";
import StoryCardPatternB from "@/components/story/_patterns/StoryCardPatternB";

export const metadata: Metadata = {
  title: "ストーリー詳細 パターン4（Figma Blog風タイポ） (/dev/story-detail-d)",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ font?: string }>;
}

export default async function DevStoryDetailDPage({ searchParams }: PageProps) {
  const { font } = await searchParams;
  // フォント切替: "ds" = デザインシステム（M PLUS Rounded 1c）/ default = Figma準拠（Noto Sans JP）
  const useDesignSystem = font === "ds";
  const titleFontClass = useDesignSystem ? "font-rounded-mplus" : "font-noto-sans-jp";

  const story = dummyStories[0];
  const relatedStories = dummyStories.slice(1, 3);

  return (
    <div className="min-h-screen">
      {/* dev portal 戻りリンク + フォント切替トグル */}
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 pt-4 flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/dev/bon-327"
          className="text-xs text-[#677470] hover:underline font-noto-sans-jp"
        >
          ← /dev/bon-327 (BON-327 受講者まわり) に戻る
        </Link>

        {/* タイトルフォント切替 */}
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1 text-xs font-noto-sans-jp">
          <span className="px-2 text-gray-500">タイトルフォント:</span>
          <Link
            href="/dev/story-detail-d"
            className={`px-3 py-1 rounded-full transition-colors ${
              !useDesignSystem
                ? "bg-white text-text-primary font-bold shadow-sm"
                : "text-gray-600 hover:text-text-primary"
            }`}
          >
            Figma風 (Noto Sans JP)
          </Link>
          <Link
            href="/dev/story-detail-d?font=ds"
            className={`px-3 py-1 rounded-full transition-colors ${
              useDesignSystem
                ? "bg-white text-text-primary font-bold shadow-sm"
                : "text-gray-600 hover:text-text-primary"
            }`}
          >
            デザインシステム (M PLUS Rounded)
          </Link>
        </div>
      </div>

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
              {/* メタタグ */}
              <div className="mb-6 flex flex-wrap items-center gap-4 text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
                <span>{story.categoryLabel}</span>
                <span className="text-[#d4d6cc]">|</span>
                {story.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
                <span className="text-[#d4d6cc]">|</span>
                <span>{story.publishedAt}</span>
              </div>

              {/* H1: -8px した版（28 / 40 / 48）。フォントは切替可（Noto Sans JP ↔ M PLUS Rounded）*/}
              <h1 className={`text-[28px] sm:text-[40px] lg:text-[48px] font-bold text-text-primary leading-[1.22] tracking-[-0.02em] ${titleFontClass}`}>
                {story.title}
              </h1>

              {/* リード文: 16px */}
              <p className="mt-8 text-[18px] leading-[33.3px] text-text-primary/85 font-noto-sans-jp">
                {story.excerpt}
              </p>
            </header>

            {/* アイキャッチ */}
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

            {/* === 人物プロフィールカード（Figma風・控えめ） === */}
            <div className="mb-16 bg-white rounded-[12px] border border-[#e8e9e2] p-8">
              <div className="flex items-start gap-5">
                {story.person.profileImageUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#e8e9e2]">
                    <Image
                      src={story.person.profileImageUrl}
                      alt={story.person.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp mb-1">
                    Interviewee
                  </p>
                  <h2 className="text-[22px] font-bold text-text-primary leading-[1.3] font-noto-sans-jp">
                    {story.person.name}
                  </h2>
                  <p className="text-[13px] text-[#677470] mt-1 font-noto-sans-jp">
                    {story.person.currentRole}
                  </p>

                  {story.person.bio && (
                    <p className="text-[18px] leading-[33.3px] text-text-primary mt-4 font-noto-sans-jp">
                      {story.person.bio}
                    </p>
                  )}

                  {story.person.socialLinks && story.person.socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-5 text-[12px] font-noto-sans-jp">
                      {story.person.socialLinks.map((sns, i) => (
                        <span key={sns.label} className="flex items-center gap-3">
                          {i > 0 && <span className="text-[#d4d6cc]">/</span>}
                          <a
                            href={sns.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-primary underline-offset-4 hover:underline"
                          >
                            {sns.label} ↗
                          </a>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === 本文（Figma Blog 風タイポ） === */}
            <div className="text-text-primary font-noto-sans-jp">
              {/* H2: 34px / 44.2px */}
              <h2 className="text-[28px] sm:text-[34px] font-bold leading-[1.3] tracking-[-0.01em] mb-8">
                BONOに出会うまで
              </h2>

              {/* 本文 16px / 29.6px */}
              <div className="space-y-7 text-[18px] leading-[33.3px]">
                <p>
                  営業の仕事を続けていく中で、「自分が作ったもので誰かを動かしたい」という想いが強くなっていきました。最初はオンラインスクールをいくつか試したのですが、課題が浅くて手応えが感じられず…。
                </p>
                <p>
                  そんなときに友人から紹介されたのが BONO でした。<strong className="font-bold">「ただ動画を見るだけのスクール」ではなく、自分でアウトプットして人にフィードバックをもらえる場</strong>という構造に惹かれて、すぐに登録しました。
                </p>
              </div>

              <h2 className="text-[28px] sm:text-[34px] font-bold leading-[1.3] tracking-[-0.01em] mt-20 mb-8">
                ロードマップを進めた3ヶ月間
              </h2>

              <div className="space-y-7 text-[18px] leading-[33.3px]">
                <p>
                  BONO の「UIUX転職ロードマップ」を 1日 2時間ペースで進めました。特に良かったのは、各ステップで「なぜこれをやるのか」が言語化されていること。
                </p>
              </div>

              {/* 引用 */}
              <blockquote className="my-12 border-l-[3px] border-[#d4d6cc] pl-6 py-2">
                <p className="text-[18px] sm:text-[22px] leading-[1.7] font-bold text-text-primary">
                  ただ手を動かすだけじゃなくて、「次に何を学べばいいか」が常に見えていたのが大きかった。
                </p>
                <footer className="mt-3 text-[12px] text-[#677470]">
                  — {story.person.name}
                </footer>
              </blockquote>

              <div className="space-y-7 text-[18px] leading-[33.3px]">
                <p>
                  3ヶ月の間、平日は仕事終わりの 2時間、休日は 5〜6時間。ロードマップの順番通りに進めると、自然に「次やること」が決まるので、迷う時間が圧倒的に減りました。
                </p>
              </div>

              {/* H3 セクション */}
              <h3 className="text-[20px] sm:text-[22px] font-bold leading-[1.4] mt-16 mb-6">
                特に役立った 3つのレッスン
              </h3>

              <ul className="space-y-4 text-[18px] leading-[33.3px] list-disc pl-6 marker:text-[#677470]">
                <li>UIスタイリング基礎 — ピクセル単位で詰める意識が身についた</li>
                <li>情報設計 — 画面遷移を「ユーザーの頭の中」で考える視点</li>
                <li>リサーチ実践 — 30人インタビューでユーザー像を立体化</li>
              </ul>

              <h2 className="text-[28px] sm:text-[34px] font-bold leading-[1.3] tracking-[-0.01em] mt-20 mb-8">
                ポートフォリオ作成と転職活動
              </h2>

              <div className="space-y-7 text-[18px] leading-[33.3px]">
                <p>
                  最終ステップで作ったポートフォリオを使って、5社にカジュアル面談を申し込みました。結果、3社から書類選考を経て面接へ進み、最終的に現在の会社に内定をもらえました。
                </p>
              </div>
            </div>

            {/* === 使ったロードマップ（Figma風・控えめ） === */}
            {story.usedRoadmap && (
              <div className="mt-20">
                <p className="text-[11px] tracking-[1.68px] uppercase text-[#677470] mb-3">
                  Used Content
                </p>
                <Link
                  href={story.usedRoadmap.href}
                  className="group block bg-white rounded-[12px] border border-[#e8e9e2] p-6 hover:border-[#354540]/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {story.usedRoadmap.imageUrl && (
                      <div className="relative w-full sm:w-32 aspect-[16/10] sm:aspect-square flex-shrink-0 rounded-[8px] overflow-hidden bg-[#e8e9e2]">
                        <Image
                          src={story.usedRoadmap.imageUrl}
                          alt={story.usedRoadmap.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470]">
                        Roadmap
                      </p>
                      <h3 className="text-[18px] font-bold text-text-primary mt-1 group-hover:underline">
                        {story.usedRoadmap.title}
                      </h3>
                      <p className="text-[14px] text-text-primary/75 mt-2 leading-[1.7]">
                        {story.usedRoadmap.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* === シェア（Figma風・極めて控えめ） === */}
            <div className="mt-20 pt-8 border-t border-[#e8e9e2] flex items-center justify-between">
              <p className="text-[11px] tracking-[1.2px] uppercase text-[#677470] font-noto-sans-jp">
                Share this story
              </p>
              <div className="flex gap-3 text-[12px] font-noto-sans-jp">
                <button
                  type="button"
                  className="text-text-primary hover:underline underline-offset-4"
                >
                  URLをコピー
                </button>
                <span className="text-[#d4d6cc]">/</span>
                <button
                  type="button"
                  className="text-text-primary hover:underline underline-offset-4"
                >
                  Xでシェア
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* === 他のストーリー === */}
      <section className="bg-white border-t border-[#e8e9e2]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-20">
          <p className="text-[11px] tracking-[1.68px] uppercase text-[#677470] font-noto-sans-jp mb-3 text-center">
            More Stories
          </p>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-text-primary text-center font-noto-sans-jp leading-tight">
            他のストーリー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
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
      </section>
    </div>
  );
}
