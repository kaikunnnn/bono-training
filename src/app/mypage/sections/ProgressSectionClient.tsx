"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { markLessonAsCompleted } from "@/lib/services/progress";
import { useToast } from "@/hooks/use-toast";
import type { LessonProgress } from "@/lib/services/progress";
import { MySection } from "../_shared/MySection";
import { EmptyState } from "../_shared/EmptyState";

export interface LessonWithProgress {
  _id: string;
  title: string;
  slug: { current: string };
  iconImageUrl?: string;
  progress: LessonProgress | null;
  lessonStatus: string;
  firstIncompleteArticle?: {
    title: string;
    slug: string;
  } | null;
}

export function ProgressPreview({
  inProgressLessons,
}: {
  inProgressLessons: LessonWithProgress[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleCompleteLesson = async (lessonId: string) => {
    const result = await markLessonAsCompleted(lessonId);
    if (result.success) {
      toast({ title: "レッスンを完了しました！" });
      router.refresh();
    }
  };

  return (
    <MySection
      title="進行中"
      viewAllTab="progress"
      isEmpty={inProgressLessons.length === 0}
      emptyMessage="デザインスキルの獲得をはじめよう"
      emptyLink="/lessons"
      horizontal
    >
      {inProgressLessons.slice(0, 2).map((lesson) => (
        <ProgressLessonCard
          key={lesson._id}
          lesson={lesson}
          onComplete={handleCompleteLesson}
        />
      ))}
    </MySection>
  );
}

export function ProgressFull({
  inProgressLessons,
  completedLessons,
}: {
  inProgressLessons: LessonWithProgress[];
  completedLessons: LessonWithProgress[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleCompleteLesson = async (lessonId: string) => {
    const result = await markLessonAsCompleted(lessonId);
    if (result.success) {
      toast({ title: "レッスンを完了しました！" });
      router.refresh();
    }
  };

  if (inProgressLessons.length === 0 && completedLessons.length === 0) {
    return (
      <EmptyState
        message="デザインスキルの獲得をはじめよう"
        link="/lessons"
      />
    );
  }

  return (
    <>
      {inProgressLessons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-black/60 font-rounded-mplus">
            取り組み中
          </h3>
          {inProgressLessons.map((lesson) => (
            <ProgressLessonCard
              key={lesson._id}
              lesson={lesson}
              onComplete={handleCompleteLesson}
            />
          ))}
        </div>
      )}
      {completedLessons.length > 0 && (
        <div className="space-y-3 mt-8">
          <h3 className="text-sm font-semibold text-black/60 font-rounded-mplus">
            完了
          </h3>
          {completedLessons.map((lesson) => (
            <CompletedLessonCard key={lesson._id} lesson={lesson} />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * ProgressLessonCard — mainのProgressLessonをそのまま移植（inline style維持）
 */
function ProgressLessonCard({
  lesson,
  onComplete,
}: {
  lesson: LessonWithProgress;
  onComplete: (lessonId: string) => void;
}) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [isCompleteHovered, setIsCompleteHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const progress = lesson.progress?.percentage || 0;
  const currentStep = lesson.firstIncompleteArticle?.title || "次のステップ";
  const nextArticleUrl = lesson.firstIncompleteArticle
    ? `/articles/${lesson.firstIncompleteArticle.slug}`
    : undefined;
  const shouldShowCompleteButton = progress === 100;
  const iconImageUrl = lesson.iconImageUrl || "/placeholder-thumbnail.svg";

  const handleCardClick = () => {
    window.location.href = `/lessons/${lesson.slug.current}`;
  };

  const handleNextArticleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextArticleUrl) {
      window.location.href = nextArticleUrl;
    }
  };

  const handleCompleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleting) return;
    setIsCompleting(true);
    await onComplete(lesson._id);
    setIsCompleting(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%", height: "100%" }}>
      {/* メインカード */}
      <div
        role="article"
        aria-label={`${lesson.title}の進捗状況`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingTop: "19px",
          paddingBottom: "19px",
          marginBottom: "-18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          flexShrink: 0,
          boxShadow: isCardHovered
            ? "0px 4px 16px rgba(0, 0, 0, 0.12)"
            : "0px 2px 8px rgba(0, 0, 0, 0.08)",
          cursor: "pointer",
          transition: "box-shadow 0.2s ease",
          zIndex: 2,
          overflow: "clip",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0 }}>
          {/* 左側 */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
            {/* アイコン */}
            <div style={{ width: 48, height: 73, borderTopRightRadius: 8, borderBottomRightRadius: 8, position: "relative", flexShrink: 0, overflow: "hidden", backgroundColor: "#F5F5F5" }}>
              <Image src={iconImageUrl} alt="" fill style={{ objectFit: "cover", pointerEvents: "none" }} />
            </div>

            {/* テキスト + プログレスバー */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-start", minWidth: 0, flex: "1 1 0" }}>
              <div style={{ fontFamily: "'Rounded Mplus 1c', sans-serif", fontWeight: 600, fontSize: 16, color: "#000000", width: "100%", maxWidth: 320 }}>
                <p style={{ margin: 0, lineHeight: "normal" }}>{lesson.title}</p>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ backgroundColor: "#EAEAEA", height: 6, width: "100%", borderRadius: 1000, overflow: "clip", position: "relative" }}
              >
                <div style={{ backgroundColor: "#000000", width: `${progress}%`, height: 6, minWidth: 1, borderRadius: 40, transition: "width 0.3s ease" }} />
              </div>
            </div>
          </div>

          {/* 右側: パーセンテージ */}
          <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "'Rounded Mplus 1c', sans-serif", fontWeight: 700, color: "#000000", whiteSpace: "nowrap", flexShrink: 0, lineHeight: 0 }}>
            <div style={{ fontSize: 24, letterSpacing: "-0.48px" }}>
              <p style={{ lineHeight: "normal", margin: 0 }}>{progress}</p>
            </div>
            <div style={{ fontSize: 10 }}>
              <p style={{ lineHeight: "normal", margin: 0 }}>%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 下部: 完了ボタン or 次の記事 */}
      {shouldShowCompleteButton ? (
        <button
          type="button"
          disabled={isCompleting}
          onClick={handleCompleteClick}
          onMouseEnter={() => setIsCompleteHovered(true)}
          onMouseLeave={() => setIsCompleteHovered(false)}
          style={{
            backgroundColor: isCompleting ? "#9CA3AF" : isCompleteHovered ? "#16A34A" : "#22C55E",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            paddingTop: 18,
            paddingBottom: 8,
            paddingLeft: 24,
            paddingRight: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            zIndex: 1,
            cursor: isCompleting ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            border: "none",
          }}
        >
          <span style={{ fontFamily: "'Rounded Mplus 1c', 'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 14, color: "#FFFFFF" }}>
            {isCompleting ? "処理中..." : "✓ レッスンを完了する"}
          </span>
        </button>
      ) : (
        <div
          role="link"
          tabIndex={0}
          onClick={handleNextArticleClick}
          onMouseEnter={() => setIsNextHovered(true)}
          onMouseLeave={() => setIsNextHovered(false)}
          style={{
            backgroundColor: isNextHovered ? "#E5E5E5" : "#EFEFEF",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            paddingTop: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            zIndex: 1,
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8, width: "100%", minWidth: 0 }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400, fontSize: 10, color: "#4B5563", flexShrink: 0, whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 700 }}>次</span>👉️
            </span>
            <span style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 12, lineHeight: "20px", color: "#000000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
              {currentStep}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CompletedLessonCard — mainからそのまま移植
 */
function CompletedLessonCard({
  lesson,
}: {
  lesson: LessonWithProgress;
}) {
  const handleClick = () => {
    window.location.href = `/lessons/${lesson.slug.current}`;
  };

  const iconImageUrl = lesson.iconImageUrl || "/placeholder-thumbnail.svg";

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] cursor-pointer transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-[73px] rounded-r-lg overflow-hidden bg-muted-custom flex-shrink-0">
          <Image
            src={iconImageUrl}
            alt={lesson.title}
            fill
            sizes="48px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div>
          <h4
            className="text-base font-bold text-text-primary m-0 mb-1"
            style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
          >
            {lesson.title}
          </h4>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.78 5.22a.75.75 0 0 0-1.06 0L7 8.94 5.28 7.22a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0 0-1.06Z" /></svg>
            完了
          </span>
        </div>
      </div>
    </div>
  );
}
