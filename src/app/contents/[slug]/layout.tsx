import "server-only";
import { notFound } from "next/navigation";
import { getArticleWithContext } from "@/lib/sanity";
import { getLessonProgress, getLessonStatus } from "@/lib/services/progress";
import ArticleDetailClient from "./ArticleDetailClient";

// ISR: 1時間キャッシュ（ユーザー固有データはレッスンID単位で再フェッチ）
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
  const article = await getArticleWithContext(slug);

  if (!article) {
    notFound();
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

  // レッスン進捗・status を並列取得
  const [lessonProgress, lessonStatus] = await Promise.all([
    lessonId && allLessonArticleIds.length > 0
      ? getLessonProgress(lessonId, allLessonArticleIds)
      : Promise.resolve(null),
    lessonId ? getLessonStatus(lessonId) : Promise.resolve("not_started" as const),
  ]);

  const initialCompletedArticleIds = lessonProgress?.completedArticleIds ?? [];

  return (
    <ArticleDetailClient
      key={lessonId || slug}
      article={article}
      initialCompletedArticleIds={initialCompletedArticleIds}
      initialLessonStatus={lessonStatus}
    >
      {children}
    </ArticleDetailClient>
  );
}
