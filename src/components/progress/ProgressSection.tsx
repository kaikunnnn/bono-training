import React from 'react';
import { ProgressLesson, ProgressLessonProps } from './ProgressLesson';
import styles from './ProgressSection.module.css';

export interface ProgressSectionProps {
  /** 表示するレッスン一覧 */
  lessons: Omit<ProgressLessonProps, 'onCardClick' | 'onNextArticleClick'>[];
  /** 「すべてみる」クリック時のコールバック */
  onViewAll?: () => void;
  /** レッスンカードクリック時のコールバック */
  onCardClick?: (lessonSlug: string) => void;
  /** 次の記事クリック時のコールバック */
  onNextArticleClick?: (articleUrl: string) => void;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  lessons,
  onViewAll,
  onCardClick,
  onNextArticleClick,
}) => {
  // レッスンが0件の場合はセクション非表示
  if (lessons.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      {/* 見出し行 */}
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>進行中</h2>
        {onViewAll && (
          <button
            type="button"
            className={styles.viewAllLink}
            onClick={onViewAll}
          >
            すべてみる
          </button>
        )}
      </div>

      {/* サブ見出し */}
      <h3 className={styles.subHeading}>レッスン</h3>

      {/* カードグリッド */}
      <div className={styles.grid}>
        {lessons.map((lesson, index) => (
          <ProgressLesson
            key={`${lesson.title}-${index}`}
            {...lesson}
            onCardClick={
              onCardClick ? () => onCardClick(lesson.title) : undefined
            }
            onNextArticleClick={
              onNextArticleClick && lesson.nextArticleUrl
                ? () => onNextArticleClick(lesson.nextArticleUrl!)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
};

export default ProgressSection;
