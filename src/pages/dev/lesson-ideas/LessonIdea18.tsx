/**
 * Idea 18: 成功事例ファースト
 * DesignLab スタイル - 成功した卒業生のストーリーを前面に
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Quote,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Check,
} from 'lucide-react';
import { lessonData, getCTAText } from '@/components/dev/lesson-ideas/lessonData';

const successStories = [
  {
    id: 1,
    name: '山田さん',
    avatar: 'Y',
    before: '営業職',
    after: 'UIデザイナー',
    company: 'IT企業',
    quote: 'このレッスンでデザインの考え方が根本から変わりました。今では自信を持って提案できています。',
    achievement: '未経験から3ヶ月で転職成功',
  },
  {
    id: 2,
    name: '佐藤さん',
    avatar: 'S',
    before: 'Webエンジニア',
    after: 'デザインエンジニア',
    company: 'スタートアップ',
    quote: 'エンジニアリングの知識と組み合わせることで、より価値を出せるようになりました。',
    achievement: '年収150万円アップ',
  },
  {
    id: 3,
    name: '田中さん',
    avatar: 'T',
    before: '学生',
    after: 'UIデザイナー',
    company: 'デザイン会社',
    quote: 'BONOさんの実践的な教え方のおかげで、すぐに現場で使えるスキルが身につきました。',
    achievement: '新卒でデザイナー職に内定',
  },
];

const stats = [
  { label: '受講者数', value: '2,400+', icon: BookOpen },
  { label: '満足度', value: '98%', icon: Award },
  { label: '転職成功率', value: '87%', icon: TrendingUp },
];

const LessonIdea18 = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/dev/lesson-detail-patterns"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">アイデア一覧</span>
          </Link>
          <span className="text-sm text-gray-500">{lessonData.category}</span>
        </div>
      </nav>

      {/* ヒーロー - 成功事例メイン */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-blue-600 text-sm font-medium mb-4">成功事例</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 font-rounded-mplus">
            このレッスンで
            <br className="sm:hidden" />
            <span className="text-blue-600">人生が変わった</span>人たち
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {lessonData.title}を受講した方々の声をご紹介します
          </p>
        </div>
      </section>

      {/* 成功ストーリー */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8">
            {successStories.map((story, i) => (
              <div
                key={story.id}
                className={`rounded-3xl p-6 sm:p-8 ${
                  i % 2 === 0
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* アバター & 情報 */}
                  <div className="flex items-start gap-4 sm:w-1/3">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ${
                        i % 2 === 0
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}
                    >
                      {story.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {story.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{story.before}</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="font-medium text-gray-900">
                          {story.after}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        @{story.company}
                      </p>
                    </div>
                  </div>

                  {/* 引用 */}
                  <div className="sm:w-2/3">
                    <Quote
                      className={`w-8 h-8 mb-3 ${
                        i % 2 === 0 ? 'text-blue-200' : 'text-purple-200'
                      }`}
                    />
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                      {story.quote}
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        i % 2 === 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      {story.achievement}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 統計 */}
      <section className="py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* レッスン概要 */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center font-rounded-mplus">
            {lessonData.title}
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            {lessonData.description}
          </p>

          {/* メタ情報 */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {lessonData.totalDuration}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {lessonData.totalArticles}記事
            </span>
            <span>{lessonData.difficulty}</span>
          </div>

          {/* 学べること */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {lessonData.learningOutcomes.map((outcome, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 講師 */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold flex-shrink-0">
              {lessonData.instructor.avatar}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-blue-200 text-sm mb-2">インストラクター</p>
              <h3 className="text-2xl font-bold mb-2">
                {lessonData.instructor.name}
              </h3>
              <p className="text-blue-200 mb-4">{lessonData.instructor.title}</p>
              <p className="text-white/80 leading-relaxed">
                「{lessonData.instructor.message}」
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-rounded-mplus">
            次の成功事例は、あなたかもしれません
          </h2>
          <p className="text-gray-600 mb-8">
            今すぐ始めて、デザインスキルを身につけましょう
          </p>
          <button className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors">
            <Play className="w-6 h-6" fill="white" />
            {getCTAText()}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* アイデア情報 */}
      <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-white">
        Idea 18: 成功事例ファースト
      </div>
    </div>
  );
};

export default LessonIdea18;
