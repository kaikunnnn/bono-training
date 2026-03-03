/**
 * Idea 12: ストーリーテリング型
 * Apple スタイル - スクロールでストーリーが展開する没入体験
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const LessonIdea12 = () => {
  return (
    <div className="bg-black text-white">
      {/* ナビゲーション */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-gradient-to-b from-black to-transparent">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
            <Play className="w-4 h-4" fill="black" />
            {getCTAText()}
          </button>
        </div>
      </nav>

      {/* セクション1: イントロ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <div className="text-center max-w-4xl">
          <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-6">
            {lessonData.category}
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 font-rounded-mplus leading-tight">
            デザインは
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              才能じゃない。
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            誰でも学べる。この60分で、あなたのデザインが変わる。
          </p>
        </div>
        <div className="absolute bottom-12 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/40" />
        </div>
      </section>

      {/* セクション2: 問題提起 */}
      <section className="min-h-screen flex items-center px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-red-400 text-sm font-medium mb-4">問題</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                「なんとなく」<br />
                でデザインしていませんか？
              </h2>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✕</span>
                  <span>配色に自信がない</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✕</span>
                  <span>レイアウトがいつも同じ</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400">✕</span>
                  <span>フィードバックにどう対応すればいいかわからない</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center">
                <div className="text-6xl opacity-30">🤔</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* セクション3: 解決策 */}
      <section className="min-h-screen flex items-center px-4 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-medium mb-4">解決策</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            4つのステップで
            <br />
            <span className="text-green-400">根拠のあるデザイン</span>へ。
          </h2>
          <div className="grid sm:grid-cols-4 gap-4 mt-12">
            {['理解', '設計', '実装', '検証'].map((step, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-400 font-bold">{i + 1}</span>
                </div>
                <p className="text-lg font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション4: 学べること */}
      <section className="min-h-screen flex items-center px-4 bg-gradient-to-b from-blue-950 to-purple-950">
        <div className="max-w-4xl mx-auto">
          <p className="text-purple-400 text-sm font-medium mb-4 text-center">
            このレッスンで得られること
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            60分後のあなた
          </h2>
          <div className="space-y-6">
            {lessonData.learningOutcomes.map((outcome, i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-lg">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション5: 講師紹介 */}
      <section className="min-h-screen flex items-center px-4 bg-gradient-to-b from-purple-950 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-purple-500/30">
                {lessonData.instructor.avatar}
              </div>
            </div>
            <div>
              <p className="text-blue-400 text-sm font-medium mb-4">講師</p>
              <h2 className="text-3xl font-bold mb-2">
                {lessonData.instructor.name}
              </h2>
              <p className="text-white/60 mb-6">{lessonData.instructor.title}</p>
              <p className="text-lg text-white/80 leading-relaxed">
                「{lessonData.instructor.message}」
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* セクション6: レッスン構成 */}
      <section className="min-h-screen flex items-center px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 text-sm font-medium mb-4 text-center">
            レッスン構成
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            3つのクエストで<br />着実にマスター
          </h2>
          <div className="space-y-6">
            {lessonData.quests.map((quest, i) => (
              <div
                key={quest.id}
                className="p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xl">
                    {quest.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{quest.title}</h3>
                    <p className="text-white/60">
                      {quest.articles.length}記事 • {quest.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セクション7: CTA */}
      <section className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-black to-blue-900">
        <div className="text-center max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 font-rounded-mplus">
            さあ、始めよう。
          </h2>
          <p className="text-xl text-white/60 mb-12">
            {lessonData.totalDuration}後、あなたのデザインは変わっている。
          </p>
          <button className="group inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:bg-white/90 transition-all">
            <Play className="w-7 h-7" fill="black" />
            {getCTAText()}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white/70">
        Idea 12: ストーリーテリング型
      </div>
    </div>
  );
};

export default LessonIdea12;
