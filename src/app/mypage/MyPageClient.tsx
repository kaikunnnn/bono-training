"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IconButton } from "@/components/ui/button/IconButton";
import { Star, Clock, ArrowRight } from "lucide-react";
import { toggleBookmark } from "@/lib/services/bookmarks";
import { markLessonAsCompleted } from "@/lib/services/progress";
import { useToast } from "@/hooks/use-toast";
import type { LessonProgress } from "@/lib/services/progress";

// --- Types ---

interface BookmarkedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  resolvedThumbnailUrl?: string;
  questInfo?: {
    lessonInfo?: { title: string };
  };
  isPremium?: boolean;
}

interface ViewedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  resolvedThumbnailUrl?: string;
  questInfo?: {
    lessonInfo?: { title: string };
  };
  viewedAt?: string;
}

interface LessonWithProgress {
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

interface MyPageClientProps {
  bookmarkedArticles: BookmarkedArticle[];
  viewHistory: ViewedArticle[];
  lessonsWithProgress: LessonWithProgress[];
}

// --- Tabs ---

type TabId = "all" | "progress" | "favorite" | "history" | "questions";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  { id: "favorite", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
  { id: "questions", label: "あなたの質問" },
];

// --- Main Component ---

export default function MyPageClient({
  bookmarkedArticles: initialBookmarks,
  viewHistory,
  lessonsWithProgress,
}: MyPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) || "all";
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const { toast } = useToast();

  const setActiveTab = useCallback((tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(`/mypage${query ? `?${query}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  // 進捗のあるレッスン（0%のものは除外）
  const inProgressLessons = lessonsWithProgress.filter(
    (l) => l.progress && l.progress.percentage > 0 && l.lessonStatus !== "completed"
  );
  const completedLessons = lessonsWithProgress.filter(
    (l) => l.lessonStatus === "completed"
  );

  const handleRemoveBookmark = async (articleId: string, isPremium?: boolean) => {
    const result = await toggleBookmark(articleId, isPremium || false);
    if (result.success && !result.isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b._id !== articleId));
      toast({ title: "ブックマークを解除しました" });
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    const result = await markLessonAsCompleted(lessonId);
    if (result.success) {
      toast({ title: "レッスンを完了しました！" });
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="pt-10 pb-0 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold leading-6 font-rounded-mplus text-slate-950">マイページ</h1>
          <Link href="/profile">
            <IconButton
              icon={null}
              label="プロフィール"
              onClick={() => {}}
            />
          </Link>
        </div>

        {/* タブナビ（main の TabGroup 仕様準拠） */}
        <div
          className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1.5 rounded-md flex justify-center items-center text-xs font-bold leading-3 transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]"
                  : "text-black/50 hover:text-black/70"
              }`}
              style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-4 py-8 max-w-3xl mx-auto space-y-6">
        {/* === すべてタブ === */}
        {activeTab === "all" && (
          <>
            {/* 進捗プレビュー */}
            <MySection
              title="進行中"
              onViewAll={() => setActiveTab("progress")}
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

            {/* お気に入りプレビュー */}
            <MySection
              title="お気に入り"
              onViewAll={() => setActiveTab("favorite")}
              isEmpty={bookmarks.length === 0}
              emptyMessage="記事をお気に入りするとこちらに表示されます"
            >
              {bookmarks.slice(0, 4).map((article) => (
                <BookmarkItem
                  key={article._id}
                  article={article}
                  onRemove={handleRemoveBookmark}
                />
              ))}
            </MySection>

            {/* 閲覧履歴プレビュー */}
            <MySection
              title="閲覧履歴"
              onViewAll={() => setActiveTab("history")}
              isEmpty={viewHistory.length === 0}
              emptyMessage="記事を閲覧した履歴がこちらに表示されます"
            >
              {viewHistory.slice(0, 4).map((article) => (
                <HistoryItem key={article._id} article={article} />
              ))}
            </MySection>
          </>
        )}

        {/* === 進捗タブ === */}
        {activeTab === "progress" && (
          <>
            {inProgressLessons.length === 0 && completedLessons.length === 0 ? (
              <EmptyState
                message="デザインスキルの獲得をはじめよう"
                link="/lessons"
              />
            ) : (
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
            )}
          </>
        )}

        {/* === お気に入りタブ === */}
        {activeTab === "favorite" && (
          <>
            {bookmarks.length === 0 ? (
              <EmptyState message="記事をお気に入りするとこちらに表示されます" />
            ) : (
              <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
                {bookmarks.map((article) => (
                  <BookmarkItem
                    key={article._id}
                    article={article}
                    onRemove={handleRemoveBookmark}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* === 閲覧履歴タブ === */}
        {activeTab === "history" && (
          <>
            {viewHistory.length === 0 ? (
              <EmptyState message="記事を閲覧した履歴がこちらに表示されます" />
            ) : (
              <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
                {viewHistory.map((article) => (
                  <HistoryItem key={article._id} article={article} />
                ))}
              </div>
            )}
          </>
        )}

        {/* === 質問タブ === */}
        {activeTab === "questions" && (
          <EmptyState
            message="質問を投稿するとこちらに表示されます"
            link="/lessons"
          />
        )}
      </div>
    </div>
  );
}

// --- Sub Components ---

function MySection({
  title,
  onViewAll,
  isEmpty,
  emptyMessage,
  emptyLink,
  horizontal,
  children,
}: {
  title: string;
  onViewAll: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  emptyLink?: string;
  horizontal?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
      <div className="flex items-center justify-between w-full" style={{ gap: 16 }}>
        <h2
          className="text-slate-950"
          style={{
            fontFamily: "'Rounded Mplus 1c', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            lineHeight: "24px",
          }}
        >
          {title}
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs font-medium"
          style={{ color: "rgba(2, 8, 23, 0.64)" }}
        >
          すべてみる
        </button>
      </div>
      {isEmpty ? (
        <EmptyState message={emptyMessage} link={emptyLink} />
      ) : horizontal ? (
        <div className="flex gap-[10px] w-full">
          {React.Children.map(children, (child) => (
            <div className="flex-1 min-w-0">{child}</div>
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)]">
          {children}
        </div>
      )}
    </section>
  );
}

function EmptyState({
  message,
  link,
}: {
  message: string;
  link?: string;
}) {
  return (
    <div className="text-center py-12 text-black/40">
      <p className="font-medium">{message}</p>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-500 hover:underline"
        >
          レッスンを見る <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
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
  const iconImageUrl = lesson.iconImageUrl || "https://via.placeholder.com/48x73";

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
          <div style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8, width: "100%", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400, fontSize: 10, color: "#4B5563" }}>
              <span style={{ fontWeight: 700 }}>次</span>👉️
            </span>
            <span style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontWeight: 700, fontSize: 12, lineHeight: "20px", color: "#000000" }}>
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

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] cursor-pointer transition-shadow hover:shadow-[0px_4px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-3">
        <img
          src={lesson.iconImageUrl || "https://via.placeholder.com/48x73"}
          alt={lesson.title}
          className="w-12 h-[73px] object-cover rounded-r-lg"
        />
        <div>
          <h4
            className="text-base font-bold text-[#020817] m-0 mb-1"
            style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
          >
            {lesson.title}
          </h4>
          <span className="text-sm font-semibold text-[#EC4899]">
            ✓ 完了
          </span>
        </div>
      </div>
    </div>
  );
}

function BookmarkItem({
  article,
  onRemove,
}: {
  article: BookmarkedArticle;
  onRemove: (id: string, isPremium?: boolean) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const thumbnailUrl = article.resolvedThumbnailUrl || "/placeholder-thumbnail.svg";
  const lessonTitle = article.questInfo?.lessonInfo?.title || "";

  return (
    <div
      className="w-full flex items-center gap-3 bg-white cursor-pointer"
      style={{ minHeight: "68px", padding: "16px" }}
    >
      <Link
        href={`/articles/${article.slug.current}`}
        className="flex items-center gap-3 flex-1 min-w-0 no-underline"
      >
        {/* サムネイル */}
        <div
          className="flex-shrink-0 overflow-hidden bg-[#F5F5F5]"
          style={{ width: 85, minWidth: 85, height: 48, borderRadius: 8 }}
        >
          <Image
            src={thumbnailUrl}
            alt=""
            width={85}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* テキスト */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <p
            className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-black"
            style={{
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "32px",
            }}
          >
            {article.title}
          </p>
          {lessonTitle && (
            <div className="flex items-center w-full overflow-hidden">
              <span
                className="text-gray-500 whitespace-nowrap flex-shrink-0"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}
              >
                by&nbsp;
              </span>
              <span
                className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontSize: 12, lineHeight: "20px" }}
              >
                {lessonTitle}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* お気に入りボタン */}
      <div
        role="button"
        tabIndex={0}
        aria-label="お気に入りを解除"
        onClick={() => onRemove(article._id, article.isPremium)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer relative"
        style={{
          padding: 8,
          transition: "transform 0.2s ease",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <Star
          style={{ width: 20, height: 20, transition: "all 0.2s ease" }}
          fill="#FFC107"
          stroke="#FFC107"
          strokeWidth={1.5}
        />
        {/* ツールチップ */}
        <div
          className="absolute bottom-full right-1/2 translate-x-1/2 bg-gray-800 px-2 py-1 rounded pointer-events-none whitespace-nowrap"
          style={{
            fontSize: 11,
            lineHeight: "16px",
            color: "#fff",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          解除
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ article }: { article: ViewedArticle }) {
  const thumbnailUrl = article.resolvedThumbnailUrl || "/placeholder-thumbnail.svg";
  const lessonTitle = article.questInfo?.lessonInfo?.title || "";

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className="w-full block no-underline"
      style={{
        minHeight: 68,
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        padding: 16,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
    >
      {/* サムネイル */}
      <div
        className="flex-shrink-0 overflow-hidden bg-[#F5F5F5]"
        style={{ width: 85, minWidth: 85, height: 48, borderRadius: 8 }}
      >
        <Image
          src={thumbnailUrl}
          alt=""
          width={85}
          height={48}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <p
          className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap text-black"
          style={{
            fontFamily: "'Rounded Mplus 1c', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "32px",
          }}
        >
          {article.title}
        </p>
        {lessonTitle && (
          <div className="flex items-center w-full overflow-hidden">
            <span
              className="text-gray-500 whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}
            >
              by&nbsp;
            </span>
            <span
              className="text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif", fontSize: 12, lineHeight: "20px" }}
            >
              {lessonTitle}
            </span>
          </div>
        )}
      </div>

      {/* 閲覧日時 */}
      {article.viewedAt && (
        <div className="flex-shrink-0 flex items-center gap-1" style={{ color: "#9CA3AF" }}>
          <Clock style={{ width: 16, height: 16 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, lineHeight: "20px" }}>
            {formatRelativeTime(article.viewedAt)}
          </span>
        </div>
      )}
    </Link>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${diffWeeks}週間前`;

  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}
