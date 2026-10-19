"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Timer1 } from "iconsax-react";
import HeadingSection from "@/components/article/HeadingSection";
import { QuestCompletionModal } from "@/components/celebration/QuestCompletionModal";
import { CelebrationModal } from "@/components/celebration/CelebrationModal";
import { Button } from "@/components/ui/button";
import { useCelebration } from "@/hooks/useCelebration";
import { detectCompletionLevelClient } from "@/lib/completion-detection-client";
import { ME_ID, findPerson } from "../../_data";
import { MINE_POST_HREF, PROTO_FEED_TAB, findArticleBySlug, prevNextArticles } from "../data";
import { findMyPost } from "../state";
import { useProto } from "../ProtoProvider";
import { BodyPortal } from "../BodyPortal";
import { ProtoCompletionButton } from "./ProtoCompletionButton";
import { ProtoContentNavigation } from "./ProtoContentNavigation";
import { ProtoSideNav } from "./ProtoSideNav";

/** クエスト完了モーダルの自動で閉じるまで（本番は5秒。中の「取り消す」を押せるよう長めにする） */
const QUEST_MODAL_AUTO_CLOSE_MS = 15000;

/**
 * 節目の演出の中に足す「みんなの進捗に流れました（取り消す）」「みんなの進捗を見る」。
 * パターンAは何もしなくても流れる型なので、先に流してから取り消せるようにする。
 */
function SharedToFeedNotice({ onNavigate }: { onNavigate: () => void }) {
  const { state, dispatch } = useProto();
  const mine = findMyPost(state);
  return (
    <div className="mt-5 flex flex-col items-center gap-2 rounded-[16px] bg-[var(--bg-base)] p-3">
      {mine ? (
        <p role="status" className="text-sm text-text-primary">
          <span aria-hidden>📣</span> みんなの進捗に流れました
          <Button
            variant="link"
            size="unstyled"
            className="ml-2 text-xs font-medium text-text-muted underline"
            onClick={() => dispatch({ type: "retractPost" })}
          >
            取り消す
          </Button>
        </p>
      ) : state.retractedPost ? (
        <p role="status" className="text-sm text-text-secondary">
          流すのを取り消しました
          <Button
            variant="link"
            size="unstyled"
            className="ml-2 text-xs font-medium text-text-muted underline"
            onClick={() => dispatch({ type: "republishPost" })}
          >
            もう一度流す
          </Button>
        </p>
      ) : null}
      <Button asChild size="sm" variant="secondary">
        <Link href={mine ? MINE_POST_HREF : PROTO_FEED_TAB} onClick={onNavigate}>
          みんなの進捗を見る
        </Link>
      </Button>
    </div>
  );
}

/**
 * 記事ページの複製（src/app/contents/[slug]/ArticleDetailClient.tsx ＋ page.tsx の見た目）。
 *
 * 本番の記事ページはグローバルのサイドバーを出さない（Layout.tsx が /contents/ だけを除外している）。
 * /dev 配下はその除外に入らないため、body 直下に画面全体を覆う層を置いて描画し、本番と同じ
 * 「サイドバーなし・独自2カラム」の見え方にしている（本番の Layout には手を入れない）。
 */
export function ProtoArticleView({ slug }: { slug: string }) {
  const { state, dispatch } = useProto();
  const celebration = useCelebration();
  const found = findArticleBySlug(slug);
  if (!found) return null;
  const { lesson, quest, article, indexInQuest } = found;

  const isCompleted = state.completedArticleIds.includes(article.id);
  const othersLearning = state.live.filter((l) => l.learnerId !== ME_ID).length;
  const isLearningThis = state.learning?.lessonId === lesson.id;
  const cheerer = state.receivedCheerFrom ? findPerson(state.receivedCheerFrom) : null;
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

    if (result.level === "quest") {
      dispatch({
        type: "completeArticle",
        articleId: article.id,
        milestone: {
          contentText: `${lesson.title}のクエスト${quest.questNumber}「${quest.title}」`,
          milestone: "quest",
        },
      });
      celebration.celebrateQuestComplete(result.questTitle ?? quest.title);
    } else if (result.level === "lesson") {
      dispatch({
        type: "completeArticle",
        articleId: article.id,
        milestone: { contentText: lesson.title, milestone: "content" },
      });
      celebration.celebrateLessonComplete(result.lessonTitle ?? lesson.title);
    } else {
      // 記事1本だけの完了はトーストのみ（フィードには流さない）
      dispatch({ type: "completeArticle", articleId: article.id });
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
                  {/* #251: 学習中であることだけを小さく出す（記事ページにはベルを足さない） */}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border-subtle)] bg-surface px-3 py-1.5 text-xs text-text-secondary">
                      <span className="relative flex h-2 w-2" aria-hidden>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      {isLearningThis ? (
                        <>
                          <span className="font-bold text-text-primary">学習中</span>・ほか{othersLearning}人も学習中
                        </>
                      ) : (
                        <>いま{othersLearning}人が学習中</>
                      )}
                    </p>
                    {!isLearningThis && !isCompleted && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-3 text-xs"
                        onClick={() => dispatch({ type: "start", lessonId: lesson.id, articleSlug: article.slug })}
                      >
                        <Timer1 size={14} color="currentColor" />
                        学習中にする
                      </Button>
                    )}
                    {cheerer && isLearningThis && (
                      <p role="status" className="text-xs font-medium text-text-success">
                        {cheerer.name}さんから「👋 がんばろ」が届きました
                      </p>
                    )}
                  </div>

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
                        終わったら、下の「完了にする」を押してください。クエストの最後の記事を終えると、ほかの学習者の「みんなの進捗」にも流れます。
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

        {/* 本番と同じ演出（中に「みんなの進捗に流れました」を足している） */}
        <QuestCompletionModal
          isOpen={celebration.showQuestModal}
          onClose={celebration.closeQuestModal}
          questTitle={celebration.questModalTitle}
          autoCloseDelay={QUEST_MODAL_AUTO_CLOSE_MS}
        >
          <SharedToFeedNotice onNavigate={celebration.closeQuestModal} />
        </QuestCompletionModal>
        {celebration.lessonModalData && (
          <CelebrationModal
            isOpen={celebration.showLessonModal}
            onClose={celebration.closeLessonModal}
            mainTitle={celebration.lessonModalData.mainTitle}
            subTitle={celebration.lessonModalData.subTitle}
            body={celebration.lessonModalData.body}
            footer={celebration.lessonModalData.footer}
          >
            <div className="mb-6">
              <SharedToFeedNotice onNavigate={celebration.closeLessonModal} />
            </div>
          </CelebrationModal>
        )}
      </div>
    </BodyPortal>
  );
}
