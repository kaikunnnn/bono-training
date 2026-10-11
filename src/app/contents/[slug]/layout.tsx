import "server-only";
import { getArticleWithContext } from "@/lib/sanity";
import { redirectMissingContent } from "@/lib/missingContentRedirect";
import ArticleDetailClient from "./ArticleDetailClient";
import { traceServerStep } from "@/lib/performance/server-trace";

// ISR: 公開CMSデータは1時間。個人進捗はArticleDetailClientがhydration後に取得する。
export const revalidate = 3600;

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

/**
 * Article 詳細ページのレイアウト
 *
 * サイドナビゲーションをここで描画することで、同じレッスン内の記事間で
 * 別記事へ遷移してもサイドナビのクライアント状態（開閉・スクロール位置・進捗）が
 * 保持され、「右側のコンテンツだけ切り替わる」体験を実現する。
 *
 * lessonId を ArticleDetailClient の key にすることで、別レッスンへ遷移した
 * 場合のみサイドナビが remount され、楽観的進捗が新レッスン用に初期化される。
 */
export default async function ArticleDetailLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const article = await traceServerStep("article.layout.cms", () =>
    getArticleWithContext(slug)
  );

  if (!article) {
    // 記事が Sanity に無い場合: 本番 Webflow に存在すれば legacy へリダイレクト、
    // 無ければ notFound()（redirectMissingContent が両分岐を throw で処理する）。
    return await redirectMissingContent(slug);
  }

  // lesson 全体の記事 ID 一覧を集める（楽観的 UI 用の初期値計算に使う）
  const allLessonArticleIds: string[] = [];
  if (article.lessonInfo?.quests) {
    for (const quest of article.lessonInfo.quests) {
      for (const art of quest.articles) {
        allLessonArticleIds.push(art._id);
      }
    }
  }
  const lessonId = article.lessonInfo?._id || "";

  // Client Component の props は RSC ペイロードとして HTML に埋め込まれる。
  // 会員限定の本文・動画URLが非会員の HTML に載らないよう、サイドナビ等に要るものだけ渡す（#236）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { content: _content, videoUrl: _videoUrl, ...navArticle } = article;

  return (
    <ArticleDetailClient
      key={lessonId || slug}
      article={navArticle}
      lessonId={lessonId}
      lessonArticleIds={allLessonArticleIds}
    >
      {children}
    </ArticleDetailClient>
  );
}
