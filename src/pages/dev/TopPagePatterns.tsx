/**
 * トップページパターン一覧
 * 悩み→トレーニングの情報設計パターン
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Grid3X3, Layers, GitBranch } from 'lucide-react';

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
    id: 'A',
    title: 'Pattern A: 悩みグリッド型',
    description: '悩みカードをグリッドで表示。クリックすると対応するトレーニングが展開。',
    path: '/dev/top-pattern-a',
    concept: '悩み一覧 → クリックでトレーニング表示',
    icon: <Grid3X3 className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  },
  {
    id: 'B',
    title: 'Pattern B: 悩みタブ型',
    description: 'スキル/キャリア/ツールのカテゴリタブで悩みを分類。アコーディオンで詳細表示。',
    path: '/dev/top-pattern-b',
    concept: 'カテゴリタブ → 悩み選択 → トレーニング表示',
    icon: <Layers className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-purple-50 to-pink-50',
  },
  {
    id: 'C',
    title: 'Pattern C: 悩みフロー型',
    description: 'ステップバイステップで悩み選択→トレーニング→実践の流れを体験。',
    path: '/dev/top-pattern-c',
    concept: 'Step1:悩み → Step2:トレーニング → Step3:実践',
    icon: <GitBranch className="w-6 h-6" />,
    preview: 'bg-gradient-to-br from-green-50 to-teal-50',
  },
];

const TopPagePatterns = () => {
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
            Top Page Patterns
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            「悩み → トレーニング → 実践」の情報設計パターン
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>コンセプト:</strong> BONOは転職サービスではなく「デザインが鍛えられるトレーニングサービス」。
              ユーザーの悩みに対して、対応するトレーニング内容がわかり実践できる構成。
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

        {/* Documentation */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">関連ドキュメント</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">.claude/docs/features/top-page/SITE-STRUCTURE.md</code>
              <span className="ml-2">- bo-no.designサイト構成分析</span>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">.claude/docs/features/top-page/DESIGN-CONCEPTS.md</code>
              <span className="ml-2">- 情報設計コンセプト</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopPagePatterns;
