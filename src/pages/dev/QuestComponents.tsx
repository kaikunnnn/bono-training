import { useState } from "react";
import { SectionQuest } from "@/components/lesson/quest";
import { IconCheck } from "@/components/ui/icon-check";

export default function QuestComponents() {
  const [completedIds, setCompletedIds] = useState<string[]>(["article-1"]);

  // サンプル記事データ
  const sampleArticles = [
    {
      _id: "article-1",
      articleNumber: 1,
      title: "UIデザインサイクルとは？全体像を把握しよう",
      slug: { current: "ui-design-cycle-overview" },
      articleType: "video" as const,
      videoDuration: 755,
      tag: "解説",
      isPremium: false,
    },
    {
      _id: "article-2",
      articleNumber: 2,
      title: "デザインの「なぜ」を考える重要性",
      slug: { current: "design-why-importance" },
      articleType: "video" as const,
      videoDuration: 480,
      tag: "解説",
      isPremium: false,
    },
    {
      _id: "article-3",
      articleNumber: 3,
      title: "【実践】ワイヤーフレームを作ってみよう",
      slug: { current: "wireframe-practice" },
      articleType: "text" as const,
      tag: "実践",
      isPremium: true,
    },
    {
      _id: "article-4",
      articleNumber: 4,
      title: "UIコンポーネントの基本パターン",
      slug: { current: "ui-component-patterns" },
      articleType: "video" as const,
      videoDuration: 620,
      isPremium: true,
    },
  ];

  // 完了/未完了をトグル
  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Quest Components Preview</h1>

        {/* IconCheck */}
        <section className="mb-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">IconCheck</h2>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <IconCheck status="empty" />
              <span className="text-sm text-gray-600">empty（未完了）</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck status="on" />
              <span className="text-sm text-gray-600">on（完了）</span>
            </div>
          </div>
        </section>

        {/* SectionQuest - 未完了 */}
        <section className="mb-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">SectionQuest（未完了）</h2>
          <SectionQuest
            questNumber={1}
            title="UIデザインサイクル習得の旅をはじめよう🚢"
            goal="👉️「UIデザインサイクル」を身に付けるための基礎知識を学びます"
            articles={sampleArticles}
            completedArticleIds={completedIds}
          />
        </section>

        {/* SectionQuest - 完了 */}
        <section className="mb-12 bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">SectionQuest（全完了）</h2>
          <SectionQuest
            questNumber={2}
            title="デザインの基本原則をマスターしよう✨"
            goal="👉️デザインの4原則を実践で使えるレベルまで習得します"
            articles={sampleArticles.slice(0, 2)}
            completedArticleIds={["article-1", "article-2"]}
          />
        </section>

        {/* 完了状態トグル */}
        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">完了状態をトグル</h2>
          <div className="space-y-2">
            {sampleArticles.map((article) => (
              <label
                key={article._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={completedIds.includes(article._id)}
                  onChange={() => toggleComplete(article._id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {article.title}
                  {article.isPremium && (
                    <span className="ml-2 text-xs text-orange-500">
                      [Premium]
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            現在の完了: {completedIds.join(", ") || "なし"}
          </p>
        </section>
      </div>
    </div>
  );
}
