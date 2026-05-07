"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TopicCourse } from "./data";

/**
 * パターンA: Masterclass型（シネマティック）
 * 全面画像 + ダークオーバーレイ + 白テキスト
 */
function CardPatternA({ topic }: { topic: TopicCourse }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group relative block rounded-[20px] overflow-hidden aspect-[4/3]"
    >
      {/* 全面画像 */}
      <img
        src={topic.image}
        alt={topic.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* ダークオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* バッジ */}
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-medium text-white/90 tracking-wide">
            {topic.lessonCount} LESSONS
          </span>
        </div>
        {/* タイトル */}
        <h2 className="text-xl sm:text-2xl font-bold text-white font-rounded-mplus leading-tight mb-1.5">
          {topic.title}
        </h2>
        {/* サブタイトル */}
        <p className="text-sm text-white/70 font-noto-sans-jp">
          {topic.subtitle}
        </p>
      </div>
    </Link>
  );
}

/**
 * パターンB: Brilliant型（カラフル + アイコン）
 * 上半分: カテゴリカラー + 大きめ絵文字、下半分: 白背景
 */
function CardPatternB({ topic }: { topic: TopicCourse }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group flex flex-col rounded-[20px] overflow-hidden shadow-[0px_1px_7px_rgba(0,0,0,0.04)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300"
    >
      {/* 上半分: カラー背景 + 絵文字 */}
      <div
        className="w-full aspect-[16/10] flex items-center justify-center relative"
        style={{ backgroundColor: `${topic.color}12` }}
      >
        {/* デコレーション円 */}
        <div
          className="absolute w-32 h-32 rounded-full opacity-[0.08]"
          style={{ backgroundColor: topic.color }}
        />
        <span className="text-[72px] relative z-10 group-hover:scale-110 transition-transform duration-300">
          {topic.emoji}
        </span>
      </div>

      {/* 下半分: テキスト */}
      <div className="bg-white p-5 sm:p-6 flex flex-col gap-2.5 flex-1">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-rounded-mplus leading-snug">
            {topic.title}
          </h2>
          <p className="text-xs font-medium mt-1" style={{ color: topic.color }}>
            {topic.subtitle}
          </p>
        </div>
        <p className="text-sm text-text-muted font-noto-sans-jp leading-relaxed line-clamp-2">
          {topic.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-xs text-text-disabled">
            {topic.lessonCount}レッスン
          </span>
          <span
            className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: topic.color }}
          >
            はじめる <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * パターンC: Maven×Process型（プロフェッショナル）
 * 横型カード: 左にカラー+画像、右にテキスト+メタデータ
 */
function CardPatternC({ topic }: { topic: TopicCourse }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group flex flex-col sm:flex-row rounded-[16px] overflow-hidden bg-white border border-border-light hover:border-transparent hover:shadow-[0px_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300"
    >
      {/* 左: 画像 */}
      <div className="w-full sm:w-[200px] aspect-[16/10] sm:aspect-auto sm:min-h-[160px] relative shrink-0 overflow-hidden">
        <img
          src={topic.image}
          alt={topic.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* カラーアクセントバー（左端） */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 hidden sm:block"
          style={{ backgroundColor: topic.color }}
        />
      </div>

      {/* 右: テキスト */}
      <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text-primary font-rounded-mplus leading-snug">
              {topic.title}
            </h2>
            <p className="text-sm text-text-muted font-noto-sans-jp mt-1">
              {topic.subtitle}
            </p>
          </div>
          <span className="text-2xl shrink-0">{topic.emoji}</span>
        </div>

        <p className="text-sm text-text-muted font-noto-sans-jp leading-relaxed line-clamp-2">
          {topic.outcome}
        </p>

        {/* メタデータ */}
        <div className="flex items-center gap-3 mt-auto pt-1">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: topic.color }}
          >
            {topic.lessonCount} LESSONS
          </span>
          <span className="text-xs text-text-disabled">BONO</span>
          <span className="flex items-center gap-1 text-xs font-bold text-text-muted group-hover:text-text-link transition-colors ml-auto">
            詳しく見る <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * パターン切り替えUI
 */
export default function CourseCards({ courses }: { courses: TopicCourse[] }) {
  const [pattern, setPattern] = useState<"A" | "B" | "C">("A");

  return (
    <div>
      {/* パターン切り替えタブ */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs text-text-disabled font-noto-sans-jp mr-2">UIパターン:</span>
        {(["A", "B", "C"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPattern(p)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              pattern === p
                ? "bg-cta-primary-bg text-white"
                : "bg-bg-muted text-text-muted hover:bg-bg-muted-strong"
            }`}
          >
            {p === "A" ? "A: シネマティック" : p === "B" ? "B: カラフル" : "C: プロフェッショナル"}
          </button>
        ))}
      </div>

      {/* カードグリッド */}
      {pattern === "C" ? (
        /* パターンC: 横型カードは1列 */
        <div className="flex flex-col gap-4">
          {courses.map((topic) => (
            <CardPatternC key={topic.slug} topic={topic} />
          ))}
        </div>
      ) : (
        /* パターンA/B: グリッド */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((topic) =>
            pattern === "A" ? (
              <CardPatternA key={topic.slug} topic={topic} />
            ) : (
              <CardPatternB key={topic.slug} topic={topic} />
            )
          )}
        </div>
      )}
    </div>
  );
}
