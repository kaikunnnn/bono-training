/**
 * コース一覧ページパターン一覧
 * 8つのUIパターンを比較確認できるページ
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Layers,
  LayoutGrid,
  Sidebar,
  ScrollText,
  SlidersHorizontal,
  LayoutList,
  ArrowUp,
  Rows,
  Grid3X3,
  SquareStack,
} from 'lucide-react';

interface PatternCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const PatternCard: React.FC<PatternCardProps> = ({
  number,
  title,
  description,
  icon,
  path,
  color,
}) => (
  <Link
    to={path}
    className="group block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all overflow-hidden"
  >
    <div
      className="h-32 flex items-center justify-center"
      style={{ backgroundColor: `${color}10` }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          Pattern {number}
        </span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

const patterns: Omit<PatternCardProps, 'path'>[] = [
  {
    number: 1,
    title: 'タブナビゲーション型',
    description: '水平タブでカテゴリを切り替え。シンプルで標準的なパターン',
    icon: <LayoutGrid className="w-8 h-8" />,
    color: '#6366F1',
  },
  {
    number: 2,
    title: 'サイドバー型',
    description: '左にカテゴリナビ+説明、右にコースグリッド。デスクトップ最適',
    icon: <Sidebar className="w-8 h-8" />,
    color: '#8B5CF6',
  },
  {
    number: 3,
    title: 'Magazineスクロール型',
    description: '各カテゴリがセクションとして縦に並ぶ。全コースを俯瞰できる',
    icon: <ScrollText className="w-8 h-8" />,
    color: '#EC4899',
  },
  {
    number: 4,
    title: 'フィルタチップ型',
    description: 'Airbnb検索風。複数カテゴリを選択可能で絞り込み',
    icon: <SlidersHorizontal className="w-8 h-8" />,
    color: '#F59E0B',
  },
  {
    number: 5,
    title: 'アイコンカテゴリバー型',
    description: 'Airbnbホーム風。アイコン+ラベルで視覚的にカテゴリを識別',
    icon: <LayoutList className="w-8 h-8" />,
    color: '#10B981',
  },
  {
    number: 6,
    title: 'スティッキーヘッダー型',
    description: 'スクロール時にカテゴリヘッダーが追従。今どこにいるか常にわかる',
    icon: <ArrowUp className="w-8 h-8" />,
    color: '#3B82F6',
  },
  {
    number: 7,
    title: 'カテゴリ別キャロセル型',
    description: 'Netflix風。各カテゴリが水平キャロセルで全体像と深掘りを両立',
    icon: <Rows className="w-8 h-8" />,
    color: '#EF4444',
  },
  {
    number: 8,
    title: 'カテゴリプレビュー型',
    description: '各カテゴリから数コースずつプレビュー→展開で全体把握',
    icon: <Grid3X3 className="w-8 h-8" />,
    color: '#14B8A6',
  },
  {
    number: 9,
    title: 'プレビュー + 詳細ページ型',
    description: 'パターン7+8の組み合わせ。ヘッダーにチップナビ、詳細は別ページ遷移',
    icon: <SquareStack className="w-8 h-8" />,
    color: '#7C3AED',
  },
];

const CourseListPatterns = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Dev Home</span>
          </Link>
        </div>
      </nav>

      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                コース一覧ページ UIパターン
              </h1>
              <p className="text-gray-500">
                カテゴリ構造の見せ方を検討する8パターン
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 mt-6">
            <h2 className="font-bold text-indigo-900 mb-2">設計原則</h2>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• <strong>コースが主役</strong>：コースカードが常に見えている状態を維持</li>
              <li>• <strong>カテゴリはナビ手段</strong>：カテゴリ構造は探索を助ける道具</li>
              <li>• <strong>スキル分解の教育的価値</strong>：「なるほど、こう分類されるのか」と学べる</li>
            </ul>
          </div>
        </div>
      </header>

      {/* パターン一覧 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {patterns.map((pattern) => (
            <PatternCard
              key={pattern.number}
              {...pattern}
              path={`/dev/course-list-idea-${pattern.number}`}
            />
          ))}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 text-sm">
            Airbnb的プロダクト思考で設計されたUIパターン集
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CourseListPatterns;
