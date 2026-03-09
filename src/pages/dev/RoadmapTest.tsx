/**
 * ロードマップデータ取得テストページ
 * Phase 1 完了確認用
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { careerChangeRoadmap } from "@/data/roadmaps";
import { getAllLessonsForRoadmap } from "@/services/roadmapService";
import type { RoadmapLesson } from "@/types/roadmap";
import { isStepCourse, isStepSpecial } from "@/types/roadmap";

const RoadmapTest = () => {
  const [lessons, setLessons] = useState<RoadmapLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllLessonsForRoadmap();
        setLessons(data);
        console.log("[RoadmapTest] Fetched lessons:", data);
      } catch (err) {
        console.error("[RoadmapTest] Error fetching lessons:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dev"
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
          >
            ← Dev Resources
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Phase 1: データ層テスト
          </h1>
          <p className="text-gray-600">
            型定義、静的データ、Sanity連携の確認
          </p>
        </div>

        {/* 静的データ確認 */}
        <section className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">✅ 静的データ</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">基本情報</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm font-mono">
                <p>
                  <span className="text-gray-500">title:</span>{" "}
                  {careerChangeRoadmap.title}
                </p>
                <p>
                  <span className="text-gray-500">slug:</span>{" "}
                  {careerChangeRoadmap.slug}
                </p>
                <p>
                  <span className="text-gray-500">duration:</span>{" "}
                  {careerChangeRoadmap.stats.duration}
                </p>
                <p>
                  <span className="text-gray-500">stepsCount:</span>{" "}
                  {careerChangeRoadmap.stats.stepsCount}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">
                得られるもの ({careerChangeRoadmap.benefits.length}件)
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {careerChangeRoadmap.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-gray-400">{b.icon}</span>
                    <span>{b.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-700">
                ステップ ({careerChangeRoadmap.steps.length}件)
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {careerChangeRoadmap.steps.map((step) => (
                  <li
                    key={step.stepNumber}
                    className="p-2 bg-gray-50 rounded flex items-start gap-2"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        isStepSpecial(step)
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      Step {step.stepNumber}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-gray-500 text-xs">
                        {step.type === "special"
                          ? "特殊ステップ（リンク集）"
                          : isStepCourse(step)
                          ? `→ ${step.linkedCourseSlug}`
                          : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Sanityデータ確認 */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-bold mb-4">
            {loading
              ? "⏳ Sanityデータ取得中..."
              : error
              ? "❌ エラー"
              : "✅ Sanityデータ"}
          </h2>

          {loading && (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                取得したレッスン数: <strong>{lessons.length}</strong>件
              </p>

              {lessons.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {lessons.slice(0, 8).map((lesson) => (
                    <div
                      key={lesson._id}
                      className="p-3 bg-gray-50 rounded flex items-center gap-3"
                    >
                      {lesson.iconImageUrl ? (
                        <img
                          src={lesson.iconImageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">{lesson.slug}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  レッスンが見つかりませんでした
                </p>
              )}

              {lessons.length > 8 && (
                <p className="mt-3 text-xs text-gray-400">
                  + {lessons.length - 8}件
                </p>
              )}
            </div>
          )}
        </section>

        {/* Phase 1 完了チェック */}
        <section className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">
            Phase 1 完了チェック
          </h3>
          <ul className="text-sm space-y-1 text-green-700">
            <li>✅ 型定義: Roadmap, RoadmapStep, etc.</li>
            <li>✅ 静的データ: careerChangeRoadmap</li>
            <li>
              {loading
                ? "⏳"
                : lessons.length > 0
                ? "✅"
                : "⚠️"}{" "}
              Sanity連携: getLessonsBySlugs
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default RoadmapTest;
