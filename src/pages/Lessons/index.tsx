import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageTopHeading from '@/components/common/PageTopHeading';
import HeadingBlock2 from '@/components/common/HeadingBlock2';
import LessonCard from '@/components/lessons/LessonCard';
import { lessons } from '@/data/lessons';

/**
 * レッスン一覧ページ
 *
 * 利用可能なレッスンを一覧表示するページ
 */
const Lessons: React.FC = () => {
  const navigate = useNavigate();

  const handleLessonClick = (slug: string) => {
    // 将来的に詳細ページへ遷移
    console.log('Navigate to:', `/lessons/${slug}`);
    // navigate(`/lessons/${slug}`);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center py-12 px-4 md:px-6 lg:px-0 bg-white">
        <div className="flex flex-col justify-center gap-10 w-full max-w-[1088px]">
          {/* ページヘッダー */}
          <PageTopHeading
            title="レッスン"
            subtitle="あなたに合った学習コンテンツを見つけよう"
          />

          {/* メインコンテンツ */}
          <div className="flex flex-col gap-6 w-full">
            <HeadingBlock2>レッスン一覧</HeadingBlock2>

            {/* レッスンリスト - 3列グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => handleLessonClick(lesson.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Lessons;
