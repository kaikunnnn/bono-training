"use client";

import { useEffect } from "react";
import { Play } from "lucide-react";
import HeadingSection from "@/components/article/HeadingSection";
import { QuestCompletionModal } from "@/components/celebration/QuestCompletionModal";
import { CelebrationModal } from "@/components/celebration/CelebrationModal";
import { useCelebration } from "@/hooks/useCelebration";
import { detectCompletionLevelClient } from "@/lib/completion-detection-client";
import { BodyPortal } from "../../../progress-feed/_proto/BodyPortal";
import { ProtoCompletionButton } from "../../../progress-feed/_proto/article/ProtoCompletionButton";
import { findArticleBySlug, prevNextArticles } from "../data";
import { useDesignTogether } from "../ProtoProvider";
import { WorkingBar } from "../WorkingBar";
import { ProtoContentNavigation } from "./ProtoContentNavigation";
import { ProtoSideNav } from "./ProtoSideNav";

/**
 * 動画ページの複製（#251 の progress-feed/_proto/article/ProtoArticleView.tsx をコピー。
 * 元は src/app/contents/[slug]/ArticleDetailClient.tsx ＋ page.tsx の見た目）。
 *
 * #251 で足した「学習中」「がんばろ」「みんなの進捗に流れました」は外し、
 * 動画の下・見出しの上に #253 の「作業中 ◯分・作業を終える」を置いた（動画にはかけない）。
 *
 * 本番の記事ページはグローバルのサイドバーを出さないため、body 直下に画面全体を覆う層で描画している（#251 と同じ）。
 */
export function ProtoArticleView({ slug }: { slug: string }) {
  const { state, dispatch } = useDesignTogether();
  const celebration = useCelebration();
  const isWorking = state.mySession !== null;

  // 作業中に動画ページを開いたか（体験ガイドの✓用）
  useEffect(() => {
    if (isWorking) dispatch({ type: "visitArticle" });
  }, [isWorking, dispatch]);

  const found = findArticleBySlug(slug);
  if (!found) return null;
  const { lesson, quest, article, indexInQuest } = found;

  const isCompleted = state.completedArticleIds.includes(article.id);
  const { previous, next } = prevNextArticles(lesson, slug);

  const handleToggle = () => {
    if (isCompleted) {
      dispatch({ type: "uncompleteArticle", articleId: article.id });
      return;
    }
    const nextCompleted = [...state.completedArticleIds, article.id];
    // 完了レベルの判定は本番と同じ関数を使う
    const result = detectCompletionLevelClient({
      currentQuestId: quest.id,
      quests: lesson.quests.map((q) => ({
        _id: q.id,
        title: q.title,
        articles: q.articles.map((a) => ({ _id: a.id })),
      })),
      completedArticleIds: nextCompleted,
      lessonTitle: lesson.title,
    });
    dispatch({ type: "completeArticle", articleId: article.id });
    if (result.level === "quest") {
      celebration.celebrateQuestComplete(result.questTitle ?? quest.title);
    } else if (result.level === "lesson") {
      celebration.celebrateLessonComplete(result.lessonTitle ?? lesson.title);
    } else {
      celebration.celebrateArticleComplete();
    }
  };

  const actions = (
    <div className="w-full py-2 flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between">
      <ProtoCompletionButton isCompleted={isCompleted} onToggle={handleToggle} />
      <p className="text-xs text-text-muted">
        目安{article.minutes}分・クエストの{indexInQuest}/{quest.articles.length}本目
      </p>
    </div>
  );

  return (
    <BodyPortal>
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-[var(--bg-base)]">
        <div className="min-h-screen">
          <div className="flex w-full max-w-[1920px] mx-auto">
            <aside className="hidden md:block flex-shrink-0 sticky top-0 h-screen overflow-y-auto" style={{ width: 320 }}>
              <div className="relative h-full">
                <ProtoSideNav
                  lesson={lesson}
                  currentArticleId={article.id}
                  completedArticleIds={state.completedArticleIds}
                />
              </div>
            </aside>

            {/* メインコンテンツ（本番の page.tsx と同じ並び。右端に少し余白を足している） */}
            <main className="flex-1 min-w-0 flex flex-col items-center gap-4 pb-12 md:pr-8">
              <div className="w-full px-4 sm:px-6 md:px-0 pt-16 md:pt-8">
                {/* 動画の場所（プロトでは再生しない） */}
                <div className="w-full bg-black rounded-2xl shadow-[var(--shadow-board-card)] overflow-hidden">
                  <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-2 text-text-inverse">
                    <Play className="h-10 w-10" strokeWidth={1.5} />
                    <p className="text-xs opacity-80">動画（プロトでは再生しません）</p>
                  </div>
                </div>
              </div>

              <div className="w-full px-4 sm:px-6 md:px-0 py-0">
                <div className="flex flex-col gap-3">
                  {/* #253: 作業中の帯（動画の下。スクロールすると上に貼り付く） */}
                  <WorkingBar variant="inline" />

                  <HeadingSection
                    tagType={article.articleType}
                    title={article.title}
                    description={article.excerpt}
                    questInfo={{ questNumber: quest.questNumber, title: quest.title }}
                    articleIndex={indexInQuest}
                    articleId={article.id}
                    lessonId={lesson.id}
                    actions={actions}
                  />

                  {/* 本文の場所（ダミー） */}
                  <div className="w-full rounded-[20px] bg-white px-6 py-8">
                    <div className="flex flex-col gap-4 text-base leading-[200%] text-text-primary">
                      <p>{article.excerpt}</p>
                      <p>
                        この記事では、動画で見た手順を自分のファイルでもう一度なぞります。うまくいかないところがあっても大丈夫です。どこで手が止まったかを残しておくと、次に開いたときに続きから始めやすくなります。
                      </p>
                      <p>
                        今日の分が終わったら、動画の下の「作業を終える」を押してください。どれくらい作業したかが記録に残ります。
                      </p>
                    </div>
                    <div className="mt-8 border-t border-neutral-200 pt-4">
                      <ProtoCompletionButton isCompleted={isCompleted} onToggle={handleToggle} />
                    </div>
                  </div>

                  <ProtoContentNavigation previous={previous} next={next} />
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* 本番と同じ演出 */}
        <QuestCompletionModal
          isOpen={celebration.showQuestModal}
          onClose={celebration.closeQuestModal}
          questTitle={celebration.questModalTitle}
        />
        {celebration.lessonModalData && (
          <CelebrationModal
            isOpen={celebration.showLessonModal}
            onClose={celebration.closeLessonModal}
            mainTitle={celebration.lessonModalData.mainTitle}
            subTitle={celebration.lessonModalData.subTitle}
            body={celebration.lessonModalData.body}
            footer={celebration.lessonModalData.footer}
          />
        )}
      </div>
    </BodyPortal>
  );
}
