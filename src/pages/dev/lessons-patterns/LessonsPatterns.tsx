/**
 * /lessons パターン比較ページ
 *
 * 6つのパターンを比較検討するためのハブページ
 * A-C: 目的/課題/ジャーニー設計
 * D-F: Netflix/Apple Store/Duolingo風体験設計
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Target, MessageCircle, Map, ArrowRight, Eye, BookOpen, Tv, Newspaper, Gamepad2 } from 'lucide-react';

interface PatternCard {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  insights: string[];
}

const patterns: PatternCard[] = [
  {
    id: 'pattern-a',
    title: 'パターン A',
    subtitle: '目的起点設計',
    concept: '「あなたが得たい状態」から逆引き',
    description: 'ユーザーは「レッスン」を探しているのではなく「なりたい自分」を探している。「〇〇ができるようになる」という結果から逆算して提示する。',
    icon: <Target className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    path: '/dev/lessons-pattern-a',
    insights: [
      'ヒーローで「何が得られるか」を先に見せる',
      '目的別カテゴリで脳内整理を助ける',
      'カードに「学習時間」「難易度」「得られるスキル」を明示',
    ],
  },
  {
    id: 'pattern-b',
    title: 'パターン B',
    subtitle: '課題起点設計',
    concept: '「あなたの悩み」から共感して導く',
    description: 'ユーザーは自分の課題に名前をつけられないことが多い。「こういう悩みありませんか？」と言語化して、共感から解決策へ導く。',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    path: '/dev/lessons-pattern-b',
    insights: [
      '課題別のタブUIで整理',
      '「〇〇で困っていませんか？」のコピーで共感',
      '解決後のビフォーアフターをイメージさせる',
    ],
  },
  {
    id: 'pattern-c',
    title: 'パターン C',
    subtitle: '学習ジャーニー設計',
    concept: '「今のあなたに最適な次のステップ」を示す',
    description: 'ユーザーは「成長の道筋」が見えると安心する。段階的なステップがあると継続しやすく、「今ここ」「次はここ」がわかると行動しやすい。',
    icon: <Map className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-600',
    path: '/dev/lessons-pattern-c',
    insights: [
      '学習ロードマップ風の表示',
      'ステップバイステップのビジュアル',
      'おすすめレッスンを目立たせる',
    ],
  },
  {
    id: 'pattern-d',
    title: 'パターン D',
    subtitle: 'Netflix風 横スクロール発見',
    concept: '複数の切り口で同じコンテンツを横スクロールで探索',
    description: 'Netflixのように複数の「行」で異なる視点からレッスンを提示。縦は有限に感じるが横は無限の可能性を感じさせる。フィルタなしで発見の楽しさを演出。',
    icon: <Tv className="w-8 h-8" />,
    color: 'from-slate-700 to-slate-900',
    path: '/dev/lessons-pattern-d',
    insights: [
      '横スクロールで探索の楽しさ',
      '複数の切り口（人気、初心者向け、UIなど）',
      'ヒーローセクションで注目コンテンツを強調',
    ],
  },
  {
    id: 'pattern-e',
    title: 'パターン E',
    subtitle: 'Apple Store風 エディトリアル',
    concept: '雑誌のように編集された特集コンテンツで魅せる',
    description: 'Apple Storeのように製品を「ストーリー」として語る。大きなビジュアルと編集されたコピー、キュレーションされたコレクションで「選ばれた感」を演出。',
    icon: <Newspaper className="w-8 h-8" />,
    color: 'from-slate-500 to-slate-700',
    path: '/dev/lessons-pattern-e',
    insights: [
      '今週のピックアップで注目を集める',
      '特集コレクションでストーリー性',
      '引用セクションで感情に訴える',
    ],
  },
  {
    id: 'pattern-f',
    title: 'パターン F',
    subtitle: 'Duolingo風 ゲーミフィケーション',
    concept: 'ゲームのように進捗を可視化し「次に何をすべきか」を明確に',
    description: 'Duolingoのように選択肢を減らして次のアクションを明確に。視覚的な進捗パス、アンロック/ロック状態で達成感を演出。XPやストリークでモチベーション維持。',
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'from-emerald-500 to-blue-600',
    path: '/dev/lessons-pattern-f',
    insights: [
      '学習パスで「次に何をすべきか」を明確化',
      'XP・ストリークで継続モチベーション',
      'ステージのロック解除で達成感',
    ],
  },
];

export default function LessonsPatterns() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
          >
            ← Dev Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold">Lessons Page Patterns</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            /lessonsページのUI/UXを6つのパターンで比較検討。
            A-C: 目的/課題/ジャーニー起点の設計。
            D-F: Netflix/Apple Store/Duolingo風の体験設計。
            ユーザーが「あ、私の欲しい状態はこれだ」と思い、
            そのためにはこういうレッスン達が良さそうなんだな、とわかる体験を目指す。
          </p>
        </div>

        {/* ユーザーインサイト */}
        <div className="mb-12 p-6 bg-white rounded-2xl border border-gray-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Airbnb PdM視点 - ユーザーインサイト
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium mb-1">本当の欲求</p>
              <p className="text-blue-900">
                「レッスンを受けたい」ではなく<br />
                <strong>「デザインできる自分になりたい」</strong>
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-600 font-medium mb-1">本当のニーズ</p>
              <p className="text-purple-900">
                「カテゴリで選びたい」ではなく<br />
                <strong>「今の自分に必要なものを知りたい」</strong>
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-600 font-medium mb-1">本当の願い</p>
              <p className="text-emerald-900">
                「たくさん学びたい」ではなく<br />
                <strong>「迷わず進みたい」</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Pattern Cards */}
        <div className="grid gap-6">
          {patterns.map((pattern) => (
            <Link
              key={pattern.id}
              to={pattern.path}
              className="block group"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 lg:w-64 flex-shrink-0">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${pattern.color} text-white`}>
                      {pattern.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                        {pattern.title}
                      </h3>
                      <p className="text-sm text-gray-500">{pattern.subtitle}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {pattern.concept}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {pattern.description}
                    </p>

                    {/* Insights */}
                    <div className="flex flex-wrap gap-2">
                      {pattern.insights.map((insight, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {insight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center lg:self-center">
                    <div className="flex items-center gap-2 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>プレビュー</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Current Page Comparison */}
        <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-200">
          <h3 className="text-lg font-bold text-amber-900 mb-2">現在の /lessons ページの課題</h3>
          <ul className="space-y-2 text-amber-800">
            <li>• レッスンがただ並んでいるだけで、ユーザーの目的や課題に寄り添っていない</li>
            <li>• カテゴリフィルタがあるが、それが「何を選ぶべきか」の助けになっていない</li>
            <li>• 「次に何をすべきか」「どこから始めるべきか」が不明確</li>
            <li>• レッスンの価値（得られるスキル、所要時間、難易度）が一目でわからない</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/lessons"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            現在の /lessons を見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
