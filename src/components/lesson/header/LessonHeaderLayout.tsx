import React from "react";
import { LessonHeader } from "./LessonHeader";
import { LessonSidebar } from "./LessonSidebar";
import { LessonTitleArea } from "./LessonTitleArea";

interface Lesson {
  _id: string;
  title: string;
  slug?: { current: string };
  description?: string;
  iconImage?: any;
  iconImageUrl?: string;
  category?: string;
  isPremium?: boolean;
}

interface LessonHeaderLayoutProps {
  lesson: Lesson;
  /** 進捗率 0-100 */
  progress: number;
  /** 「スタートする」クリック時のコールバック */
  onStart?: () => void;
  /** 「概要・目的ですべてみる」クリック時のコールバック（タブ切替） */
  onViewAllDetails?: () => void;
  /** 右側ブロックに追加するコンテンツ（タブなど） */
  children?: React.ReactNode;
}

/**
 * レッスンヘッダーレイアウト（統合コンポーネント）
 *
 * 構成:
 * - LessonHeader: 戻る + シェアボタン
 * - LessonSidebar: 左側アイコン画像（デスクトップのみ）
 * - LessonTitleArea: カテゴリ + タイトル + 進捗 + 説明 + CTA
 *
 * レイアウト:
 * デスクトップ: サイドバー + メインコンテンツを横並び
 * モバイル: メインコンテンツのみ（アイコンなし）
 *
 * @example
 * <LessonHeaderLayout
 *   lesson={lesson}
 *   progress={72}
 *   onStart={handleStart}
 *   onViewAllDetails={() => setActiveTab('overview')}
 * />
 */
export function LessonHeaderLayout({
  lesson,
  progress,
  onStart,
  onViewAllDetails,
  children,
}: LessonHeaderLayoutProps) {
  return (
    <div className="w-full px-[20px] pt-[32px] lg:max-w-[1200px] lg:mx-auto">
      {/* ヘッダー（戻る + シェア） */}
      <LessonHeader shareTitle={lesson.title} />

      {/* メインコンテンツエリア */}
      {/* モバイル: 縦並び（サイドバー上、コンテンツ下） */}
      {/* デスクトップ: 横並び（サイドバー左、コンテンツ右） */}
      <div className="flex flex-col md:flex-row gap-[24px] md:gap-[32px]">
        {/* サイドバー（モバイル: 上部、デスクトップ: 左側） */}
        <LessonSidebar lesson={lesson} />

        {/* メインエリア（TitleArea + Tabs） */}
        {/* レスポンシブ: 画面幅に応じて右ブロックの幅を制限 */}
        <div className="flex-1 md:basis-[60%] lg:basis-[55%] xl:basis-[50%] flex flex-col gap-[20px] md:pl-[48px]">
          <LessonTitleArea
            lesson={lesson}
            progress={progress}
            onStart={onStart}
            onViewAllDetails={onViewAllDetails}
          />
          {/* タブコンテンツ等 */}
          {children}
        </div>
        {/* 右側の余白スペーサー（大画面用） */}
        <div className="hidden xl:block xl:flex-1" />
      </div>
    </div>
  );
}

export default LessonHeaderLayout;
