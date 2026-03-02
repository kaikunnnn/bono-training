/**
 * RoadmapPattern1: Webflowロードマップ完全コピー版
 * UIビジュアル入門コースのロードマップをWebflowの構造・見た目を100%再現
 *
 * 参照: .claude/docs/features/webflow-import/roadmap-uivisual-course.md
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { uivisualCourse } from '@/data/roadmap/courses';
import type { RoadmapStep, RoadmapContent, RelatedCourse } from '@/data/roadmap/types';

// ========================================
// コンポーネント: コースヘッダー
// ========================================
const CourseHeader = () => {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* コースタイトル */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#151834] font-rounded-mplus mb-6">
          {uivisualCourse.title}
        </h1>

        {/* 完了目安 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-[#6F7178]">完了目安</span>
          <span className="text-lg font-bold text-[#151834] font-rounded-mplus">
            {uivisualCourse.duration}
          </span>
        </div>

        {/* コース説明文 */}
        <p className="text-base md:text-lg text-[#4A4A4A] leading-relaxed mb-8 font-noto-sans-jp">
          {uivisualCourse.description}
        </p>

        {/* 価格表示 */}
        <div className="mb-8">
          <span className="text-2xl md:text-3xl font-bold text-[#151834] font-rounded-mplus">
            {uivisualCourse.price}
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/subscription"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#151834] text-white font-bold rounded-full hover:bg-[#252a4d] transition-colors font-noto-sans-jp text-base"
          >
            メンバーになってはじめる
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/membership"
            className="text-sm text-[#6F7178] hover:text-[#151834] underline transition-colors font-noto-sans-jp"
          >
            メンバーシップについてはこちら
          </Link>
        </div>
      </div>
    </section>
  );
};

// ========================================
// コンポーネント: 矢印コネクタ
// ========================================
const ArrowConnector = () => {
  return (
    <div className="flex justify-center py-6">
      <div className="flex flex-col items-center">
        <ChevronDown className="w-8 h-8 text-[#C4C4C4]" />
        <ChevronDown className="w-8 h-8 text-[#C4C4C4] -mt-4" />
      </div>
    </div>
  );
};

// ========================================
// コンポーネント: コンテンツカード
// ========================================
interface ContentCardProps {
  content: RoadmapContent;
}

const ContentCard = ({ content }: ContentCardProps) => {
  // ラベルの背景色を決定
  const getLabelStyles = (label: string) => {
    switch (label) {
      case 'チュートリアル':
        return 'bg-[#E8F5E9] text-[#2E7D32]';
      case '実践して理解':
        return 'bg-[#FFF3E0] text-[#E65100]';
      case '実践しながら理解':
        return 'bg-[#FFF3E0] text-[#E65100]';
      case 'DailyUI TUTORIAL':
        return 'bg-[#E3F2FD] text-[#1565C0]';
      default:
        return 'bg-[#F5F5F5] text-[#616161]';
    }
  };

  return (
    <Link
      to={content.link}
      className="block bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow"
    >
      {/* サムネイル */}
      <div className="aspect-video bg-[#F3F3F3] relative">
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">UI</span>
            </div>
          </div>
        )}
      </div>

      {/* コンテンツ情報 */}
      <div className="p-4">
        {/* ラベル */}
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getLabelStyles(
            content.label
          )}`}
        >
          {content.label}
        </span>

        {/* タイトル */}
        <h4 className="text-base font-bold text-[#151834] mb-2 font-rounded-mplus line-clamp-2">
          {content.title}
        </h4>

        {/* 説明文 */}
        <p className="text-sm text-[#6F7178] line-clamp-3 font-noto-sans-jp">
          {content.description}
        </p>

        {/* 備考（あれば） */}
        {content.note && (
          <p className="mt-2 text-xs text-[#9E9E9E] font-noto-sans-jp">
            ※ {content.note}
          </p>
        )}
      </div>
    </Link>
  );
};

// ========================================
// コンポーネント: ステップセクション
// ========================================
interface StepSectionProps {
  step: RoadmapStep;
}

const StepSection = ({ step }: StepSectionProps) => {
  const stepNumber = String(step.number).padStart(2, '0');

  return (
    <section className="px-4">
      <div className="max-w-4xl mx-auto">
        {/* ステップヘッダー */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* STEP番号 */}
          <div className="mb-4">
            <span className="text-sm font-bold tracking-[0.2em] text-[#3B82F6] uppercase font-rounded-mplus">
              STEP {stepNumber}
            </span>
            <div className="w-full h-[2px] bg-gradient-to-r from-[#3B82F6] to-transparent mt-2" />
          </div>

          {/* ステップタイトル */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#151834] mb-6 font-rounded-mplus">
            {step.title}
          </h2>

          {/* ゴールと完了目安 */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9E9E9E] font-noto-sans-jp">ゴール:</span>
              <span className="text-sm font-medium text-[#151834] font-noto-sans-jp">
                {step.goal}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#9E9E9E] font-noto-sans-jp">完了目安:</span>
              <span className="text-sm font-medium text-[#151834] font-noto-sans-jp">
                {step.duration}
              </span>
            </div>
          </div>

          {/* 説明文 */}
          {step.description && (
            <p className="text-base text-[#6F7178] font-noto-sans-jp">
              {step.description}
            </p>
          )}
        </div>

        {/* コンテンツカードグリッド */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {step.contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================================
// コンポーネント: CLEAR!セクション
// ========================================
const ClearSection = () => {
  return (
    <section className="px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        {/* CLEAR バッジ */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full mb-6">
          <span className="text-2xl">&#127923;</span>
          <span className="text-xl font-bold text-white font-rounded-mplus tracking-wider">
            CLEAR!!
          </span>
          <span className="text-2xl">&#127923;</span>
        </div>

        {/* メッセージ */}
        <p className="text-base md:text-lg text-[#4A4A4A] leading-relaxed mb-4 font-noto-sans-jp">
          {uivisualCourse.completionMessage}
          <span className="ml-1">&#127861;</span>
        </p>

        {/* 追加提案 */}
        <p className="text-sm text-[#9E9E9E] font-noto-sans-jp">
          よかったら学びの過程と成果をブログにまとめて旅をセーブしましょう
        </p>
      </div>
    </section>
  );
};

// ========================================
// コンポーネント: 関連コースカード
// ========================================
interface RelatedCourseCardProps {
  course: RelatedCourse;
}

const RelatedCourseCard = ({ course }: RelatedCourseCardProps) => {
  // コースカラーを決定
  const getCourseColor = (id: string) => {
    switch (id) {
      case 'ia':
        return '#F97316';
      case 'ux':
        return '#8B5CF6';
      case 'uivisual':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const color = getCourseColor(course.id);

  return (
    <Link
      to={`/roadmap/${course.slug}`}
      className="block bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-shadow"
    >
      {/* カラーヘッダー */}
      <div
        className="h-3"
        style={{ backgroundColor: color }}
      />

      {/* コンテンツ */}
      <div className="p-5">
        <h4 className="text-lg font-bold text-[#151834] mb-2 font-rounded-mplus">
          {course.title}
        </h4>
        <p className="text-sm text-[#6F7178] mb-4 font-noto-sans-jp">
          {course.description}
        </p>

        {/* トピックタグ */}
        <div className="flex flex-wrap gap-2">
          {course.topics.slice(0, 4).map((topic, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-1 bg-[#F5F5F5] rounded text-xs text-[#616161] font-noto-sans-jp"
            >
              #{topic}
            </span>
          ))}
          {course.topics.length > 4 && (
            <span className="inline-block px-2 py-1 text-xs text-[#9E9E9E]">
              +{course.topics.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ========================================
// コンポーネント: 関連コースセクション
// ========================================
const RelatedCoursesSection = () => {
  return (
    <section className="px-4 py-12 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        {/* セクションタイトル */}
        <h3 className="text-xl md:text-2xl font-bold text-[#151834] text-center mb-8 font-rounded-mplus">
          他の入門基礎もクリアしよう
        </h3>

        {/* コースカードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uivisualCourse.relatedCourses.map((course) => (
            <RelatedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ========================================
// メインコンポーネント
// ========================================
const RoadmapPattern1 = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* 戻るリンク */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link
          to="/dev/roadmap-patterns"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          パターン一覧に戻る
        </Link>
      </div>

      {/* コースヘッダー */}
      <CourseHeader />

      {/* STEPセクション */}
      {uivisualCourse.steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {index > 0 && <ArrowConnector />}
          <StepSection step={step} />
        </React.Fragment>
      ))}

      {/* 矢印コネクタ */}
      <ArrowConnector />

      {/* CLEARセクション */}
      <ClearSection />

      {/* 関連コースセクション */}
      <RelatedCoursesSection />

      {/* パターン情報 */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Pattern 1: Webflow完全コピー版</h3>
            <p className="text-sm text-gray-600 mb-4">
              Webflowの構造を100%再現。ヒーロー、STEP 01-04の縦並び、矢印コネクタ、CLEARセクション、関連コースの完全な再現。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Webflow忠実再現</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">縦スクロール</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">線形フロー</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoadmapPattern1;
