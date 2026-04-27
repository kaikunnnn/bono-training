"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { LessonHeaderLayout } from "@/components/lesson/header";
import LessonTabs from "@/components/lesson/LessonTabs";
import QuestList from "@/components/lesson/QuestList";
import OverviewTab from "@/components/lesson/OverviewTab";

interface Article {
  _id: string;
  articleNumber: number;
  title: string;
  slug: { current: string };
  thumbnail?: { asset?: { _ref?: string } };
  thumbnailUrl?: string;
  videoUrl?: string;
  videoDuration?: string | number;
  articleType?: "explain" | "intro" | "practice" | "challenge" | "demo";
  isPremium?: boolean;
  isLocked?: boolean;
}

interface Quest {
  _id: string;
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  estTimeMins?: number;
  articles: Article[];
}

interface Lesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  iconImage?: { asset?: { _ref?: string } };
  iconImageUrl?: string;
  category?: string;
  isPremium?: boolean;
  contentHeading?: string;
  purposes?: string[];
  overview?: PortableTextBlock[] | null;
  quests: Quest[];
}

interface LessonDetailClientProps {
  lesson: Lesson;
  progress: number;
  questProgressMap: Record<string, { completed: number; total: number; completedArticleIds: string[] }>;
}

export default function LessonDetailClient({
  lesson,
  progress,
  questProgressMap,
}: LessonDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"content" | "overview">("content");
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (lesson?.quests?.[0]?.articles?.[0]) {
      const firstArticle = lesson.quests[0].articles[0];
      router.push(`/articles/${firstArticle.slug.current}`);
    }
  };

  const handleViewAllDetails = () => {
    setActiveTab("overview");
    tabsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 概要・目的データがあるかチェック
  const hasOverviewData = !!(
    (lesson.purposes && lesson.purposes.length > 0) ||
    (lesson.overview && Array.isArray(lesson.overview) && lesson.overview.length > 0)
  );

  return (
    <div className="min-h-screen bg-base">
      <LessonHeaderLayout
        lesson={lesson}
        progress={progress}
        onStart={handleStart}
        onViewAllDetails={hasOverviewData ? handleViewAllDetails : undefined}
      >
        <div ref={tabsRef}>
          <LessonTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showOverviewTab={hasOverviewData}
            contentTab={
              <QuestList
                contentHeading={lesson.contentHeading}
                quests={lesson.quests || []}
                questProgressMap={questProgressMap}
              />
            }
            overviewTab={
              hasOverviewData ? (
                <OverviewTab purposes={lesson.purposes} overview={lesson.overview} />
              ) : undefined
            }
          />
        </div>
      </LessonHeaderLayout>
    </div>
  );
}
