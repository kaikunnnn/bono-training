"use client";

import LogoBlock from "@/components/article/sidebar/LogoBlock";
import LessonDetailCard from "@/components/article/sidebar/LessonDetailCard";
import QuestItem from "@/components/article/sidebar/QuestItem";
import { PROTO_MYPAGE, articleHref, lessonPercentage, type ProtoLesson } from "../data";

/**
 * 記事ページのサイドナビ（src/components/article/sidebar/ArticleSideNavNew.tsx の複製）。
 * 中の部品（LogoBlock / LessonDetailCard / QuestItem）は本番のものをそのまま使う。
 * 変えたのは、記事のリンク先を /dev/progress-feed/contents 配下にしたことと、
 * レッスンカードの遷移先をプロトのマイページにしたことだけ。
 */
export function ProtoSideNav({
  lesson,
  currentArticleId,
  completedArticleIds,
}: {
  lesson: ProtoLesson;
  currentArticleId: string;
  completedArticleIds: string[];
}) {
  return (
    <div className="flex flex-col items-stretch w-full gap-4 p-4 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
      <LogoBlock />
      <LessonDetailCard
        iconUrl={lesson.iconImageUrl}
        title={lesson.title}
        progress={lessonPercentage(lesson, completedArticleIds)}
        href={PROTO_MYPAGE}
      />
      <div className="flex flex-col gap-2 w-full">
        {lesson.quests.map((quest) => (
          <QuestItem
            key={quest.id}
            questNumber={quest.questNumber}
            questTitle={quest.title}
            articles={quest.articles.map((a) => ({
              id: a.id,
              title: a.title,
              tag: a.articleType,
              isCompleted: completedArticleIds.includes(a.id),
              href: articleHref(a.slug),
            }))}
            activeArticleId={currentArticleId}
            articleItemLayoutVariant="B"
          />
        ))}
      </div>
    </div>
  );
}
