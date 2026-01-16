import { useState } from "react";
import { LessonProgressBar } from "@/components/ui/LessonProgressBar";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Button } from "@/components/ui/button";
import {
  LessonHeader,
  LessonSidebar,
  LessonTitleArea,
  LessonHeaderLayout,
} from "@/components/lesson/header";

export default function LessonHeaderComponents() {
  const [progress, setProgress] = useState(72);

  // サンプルレッスンデータ
  const sampleLesson = {
    _id: "sample-lesson",
    title: "UIデザインサイクル",
    description:
      "UIデザインのプロセスを体系的に学びます。ユーザーリサーチからプロトタイピング、テストまでの一連の流れを理解し、実践的なスキルを身につけましょう。",
    category: "UIデザイン",
    iconImageUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/1c1c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c-800x1200.png",
    isPremium: false,
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">
          Lesson Header Components Preview
        </h1>

        {/* Phase 1: 共通コンポーネント */}
        <section className="mb-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-6">
            Phase 1: 共通コンポーネント
          </h2>

          {/* LessonProgressBar */}
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">LessonProgressBar</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  進捗: {progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full max-w-[350px]"
                />
              </div>
              <div className="max-w-[350px]">
                <LessonProgressBar progress={progress} />
              </div>
              <div className="max-w-[200px]">
                <LessonProgressBar progress={progress} showPercent={false} />
              </div>
            </div>
          </div>

          {/* CategoryTag */}
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">CategoryTag</h3>
            <div className="flex gap-4">
              <CategoryTag category="UIデザイン" />
              <CategoryTag category="プログラミング" />
              <CategoryTag category="マーケティング" />
            </div>
          </div>

          {/* Button sizes */}
          <div>
            <h3 className="text-md font-semibold mb-4">Button（サイズ）</h3>
            <div className="flex items-center gap-4">
              <Button size="large" className="bg-black text-white">
                Large
              </Button>
              <Button size="medium" className="bg-black text-white">
                Medium
              </Button>
              <Button size="small" className="bg-black text-white">
                Small
              </Button>
            </div>
          </div>
        </section>

        {/* Phase 2: 個別コンポーネント */}
        <section className="mb-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-6">
            Phase 2: 個別コンポーネント
          </h2>

          {/* LessonHeader */}
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">LessonHeader</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <LessonHeader />
            </div>
          </div>

          {/* LessonSidebar */}
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">
              LessonSidebar（デスクトップのみ表示）
            </h3>
            <div className="border border-gray-200 rounded-lg p-4 inline-block">
              <LessonSidebar lesson={sampleLesson} />
              <p className="text-xs text-gray-500 mt-2">
                ※ モバイルでは非表示
              </p>
            </div>
          </div>

          {/* LessonTitleArea */}
          <div className="mb-8">
            <h3 className="text-md font-semibold mb-4">LessonTitleArea</h3>
            <div className="border border-gray-200 rounded-lg p-6 max-w-[800px]">
              <LessonTitleArea
                lesson={sampleLesson}
                progress={progress}
                onStart={() => alert("スタートする clicked")}
                onViewAllDetails={() => alert("概要・目的ですべてみる clicked")}
              />
            </div>
          </div>
        </section>

        {/* Phase 2: 統合レイアウト */}
        <section className="mb-12 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">
              LessonHeaderLayout（統合）
            </h2>
          </div>
          <div className="bg-[#f8f8f8]">
            <LessonHeaderLayout
              lesson={sampleLesson}
              progress={progress}
              onStart={() => alert("スタートする clicked")}
              onViewAllDetails={() => alert("概要・目的ですべてみる clicked")}
            />
          </div>
        </section>

        {/* 進捗コントロール */}
        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">進捗コントロール</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setProgress(0)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              0%
            </button>
            <button
              onClick={() => setProgress(50)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              50%
            </button>
            <button
              onClick={() => setProgress(72)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              72%
            </button>
            <button
              onClick={() => setProgress(100)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              100%
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
