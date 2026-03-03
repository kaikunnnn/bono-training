/**
 * Idea 9: 講師中心
 * MasterClass/DesignLab スタイル - 講師の存在感を最大化
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  Quote,
  Award,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  Star,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const instructorStats = [
  { label: '受講生数', value: '2,400+', icon: Users },
  { label: '総レッスン', value: '12', icon: BookOpen },
  { label: '評価', value: '4.9', icon: Star },
];

const testimonials = [
  {
    text: 'BONOさんの説明はとてもわかりやすく、デザインの本質を理解できました。',
    author: 'デザイナー転職成功 / Yuki',
  },
  {
    text: '実務で使えるスキルが身につきました。今では自信を持ってデザインできています。',
    author: 'Webデザイナー / Ken',
  },
];

const LessonIdea9 = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
        </div>
      </nav>

      {/* 講師ヒーロー */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* 装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 講師アバター */}
            <div className="flex justify-center md:order-2">
              <div className="relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-8xl sm:text-9xl font-bold shadow-2xl shadow-blue-500/30">
                  {lessonData.instructor.avatar}
                </div>
                {/* バッジ */}
                <div className="absolute -bottom-2 -right-2 bg-amber-400 rounded-full p-3 shadow-lg">
                  <Award className="w-8 h-8 text-amber-900" />
                </div>
              </div>
            </div>

            {/* 講師情報 */}
            <div className="text-center md:text-left md:order-1">
              <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4">
                {lessonData.instructor.title}
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-rounded-mplus">
                {lessonData.instructor.name}
              </h1>
              <p className="text-lg text-white/60 mb-6">
                が教える
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
                {lessonData.title}
              </h2>
              <button className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
                <Play className="w-6 h-6" fill="currentColor" />
                {getCTAText()}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 講師メッセージ */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl -mt-20 relative">
            <Quote className="w-12 h-12 text-gray-200 absolute top-8 left-8" />
            <div className="relative z-10">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-medium mb-6 pl-8">
                {lessonData.instructor.message}
              </p>
              <div className="flex items-center gap-4 pl-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {lessonData.instructor.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {lessonData.instructor.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {lessonData.instructor.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 講師実績 */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {instructorStats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* このレッスンで学べること */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 font-rounded-mplus">
            このレッスンで学べること
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {lessonData.learningOutcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-800">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* レッスン構成 */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 font-rounded-mplus">
            レッスン構成
          </h2>
          <div className="flex items-center justify-center gap-6 text-center mb-10">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {lessonData.quests.length}
              </p>
              <p className="text-sm text-gray-500">クエスト</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {lessonData.totalArticles}
              </p>
              <p className="text-sm text-gray-500">記事</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div>
              <p className="text-3xl font-bold text-gray-900">60</p>
              <p className="text-sm text-gray-500">分</p>
            </div>
          </div>
          <div className="space-y-4">
            {lessonData.quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                      {quest.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{quest.title}</h3>
                      <p className="text-sm text-gray-500">
                        {quest.articles.length}記事 • {quest.description}
                      </p>
                    </div>
                  </div>
                  {quest.completed && (
                    <span className="text-green-500 text-sm font-medium">
                      完了
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 受講生の声 */}
      <section className="py-16 px-4 sm:px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10 font-rounded-mplus">
            受講生の声
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {testimonials.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <MessageCircle className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-4">{item.text}</p>
                <p className="text-sm text-gray-500">{item.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッターCTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-xl shadow-blue-500/30">
            {lessonData.instructor.avatar}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-rounded-mplus">
            {lessonData.instructor.name}と一緒に学ぼう
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            {lessonData.description}
          </p>
          <button className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
            <Play className="w-6 h-6" fill="currentColor" />
            {getCTAText()}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-600 shadow-lg">
        Idea 9: 講師中心
      </div>
    </div>
  );
};

export default LessonIdea9;
