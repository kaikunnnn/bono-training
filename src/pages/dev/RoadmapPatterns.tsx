/**
 * ロードマップページパターン一覧
 * 学習コースを「ロードマップ」として表示するUIパターン
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Sparkles, Heart, Folder } from 'lucide-react';

interface PatternCard {
  id: string;
  title: string;
  description: string;
  path: string;
  concept: string;
  icon: React.ReactNode;
  preview: string;
}

const patterns: PatternCard[] = [
  {
    id: '1',
    title: 'Pattern 1: Webflow完全コピー版',
    description: 'Webflowの構造を100%再現。ヒーロー、STEP 01-04の縦並び、矢印コネクタ、CLEARセクション。',
    path: '/dev/roadmap-pattern-1',
    concept: '詳細ページ: Webflowの見た目を忠実に再現',
    icon: <Copy className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-emerald-50 to-teal-50',
  },
  {
    id: '2',
    title: 'Pattern 2: クリーン版',
    description: 'Framer.comを参考にしたシンプルで繰り返しのコンポーネント構成。bono-trainingデザインシステム準拠。',
    path: '/dev/roadmap-pattern-2',
    concept: '詳細ページ: タイポグラフィ重視、余白活用',
    icon: <Sparkles className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-gray-50 to-slate-50',
  },
  {
    id: '3',
    title: 'Pattern 3: 洗練されたライフスタイル',
    description: 'Airbnbのような温かみと洗練さ。余白を活かした呼吸感、2026年Webデザイントレンド。',
    path: '/dev/roadmap-pattern-3',
    concept: '詳細ページ: ブランドデザインエージェンシークオリティ',
    icon: <Heart className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-orange-50 to-amber-50',
  },
  {
    id: '4',
    title: 'Pattern 4: Modern Lifestyle',
    description: 'Airbnbのような洗練されたビジュアル階層。余白を贅沢に使い、大きな角丸と繊細なシャドウで親しみやすさと高品質さを両立。',
    path: '/dev/roadmap-pattern-4',
    concept: '詳細ページ: Airbnb Style & High Quality',
    icon: <Sparkles className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-rose-50 to-pink-50',
  },
  {
    id: '5',
    title: 'Pattern 5: Craft Docs Style',
    description: 'Craft Docs (craft.do) をリファレンスにしたBento Gridレイアウト。情報をフォルダのように美しく整理。',
    path: '/dev/roadmap-pattern-5',
    concept: '詳細ページ: Bento Grid & Apple-like UI',
    icon: <Folder className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  },
];

const RoadmapPatterns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/dev"
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
          >
            ← Dev Resources
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Roadmap Page Patterns
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            学習ロードマップのUIパターン検討
          </p>
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <p className="text-sm text-cyan-800">
              <strong>対象コース:</strong> UIビジュアル入門 / 情報設計入門 / UX入門
            </p>
          </div>
        </div>

        {/* Pattern Grid */}
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <Link
              key={pattern.id}
              to={pattern.path}
              className="group block"
            >
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all">
                <div className="flex">
                  {/* Preview */}
                  <div className={`w-40 h-32 flex-shrink-0 ${pattern.preview} flex items-center justify-center`}>
                    <div className="w-14 h-14 rounded-xl bg-white shadow-sm text-gray-700 flex items-center justify-center">
                      {pattern.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {pattern.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">
                      {pattern.description}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {pattern.concept}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center pr-5">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* コース情報 */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">コース概要</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium">UIビジュアル入門</span>
              <span className="text-sm text-gray-500">4 STEP / 1-2ヶ月</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="font-medium">情報設計入門</span>
              <span className="text-sm text-gray-500">3 セクション / 1-2ヶ月</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="font-medium">UX入門</span>
              <span className="text-sm text-gray-500">4 ステージ / 1-2ヶ月</span>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">関連ドキュメント</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">.claude/docs/features/webflow-import/roadmap-uivisual-course.md</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">.claude/docs/features/webflow-import/roadmap-infomationarchitect-analysis.md</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">.claude/docs/features/roadmap-page-analysis.md</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPatterns;
