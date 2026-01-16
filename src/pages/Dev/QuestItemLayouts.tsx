import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Play, FileText, ChevronRight, Check } from "lucide-react";
import { ArticleTag } from "@/components/article/sidebar/ArticleTag";

/**
 * クエストアイテムのレイアウト比較ページ
 * パターンA: 現在（タグ + タイトル 1行）
 * パターンB: 改行版（タグ改行 + タイトル2行まで）
 */

// サンプルデータ
const sampleItems = [
  {
    articleNumber: 1,
    title: "はじめに：UI初心者の上達が早くなる2つのポイント",
    articleType: "解説" as const,
    videoDuration: 420,
    isCompleted: true,
  },
  {
    articleNumber: 2,
    title: "AIを使ってリサーチを進める「3ステップ」",
    articleType: "解説" as const,
    videoDuration: 755,
    isCompleted: true,
  },
  {
    articleNumber: 3,
    title: "「探す内容」を相談ーAIに知るべきUIを聞く",
    articleType: "解説" as const,
    videoDuration: 600,
    isCompleted: true,
  },
  {
    articleNumber: 4,
    title: "類似サービスを探すー比較軸をつくるAI活用術",
    articleType: "解説" as const,
    videoDuration: 510,
    isCompleted: true,
  },
  {
    articleNumber: 5,
    title: "構造別のUIパターンを探すーリアルなUIを収集する",
    articleType: "解説" as const,
    videoDuration: null,
    isCompleted: true,
  },
  {
    articleNumber: 6,
    title: "AIとつくるUIプロトタイプ ー 素早く作り、素早く検証する方法",
    articleType: "解説" as const,
    videoDuration: 890,
    isCompleted: true,
  },
  {
    articleNumber: 7,
    title: "AIで工夫してつくる構造別のUIプロトタイプ",
    articleType: "解説" as const,
    videoDuration: 720,
    isCompleted: true,
  },
];

// 動画時間フォーマット
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

// パターンA: 現在のレイアウト（タグ + タイトル 1行、横並び）
function PatternA({ item }: { item: typeof sampleItems[0] }) {
  return (
    <div className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full">
      {/* 番号 or チェック */}
      {item.isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-luckiest text-[12px] text-[#414141]">{item.articleNumber}</span>
        </div>
      )}

      {/* サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          {item.videoDuration ? (
            <div className="size-4 bg-white rounded-full flex items-center justify-center">
              <Play className="size-1 text-[#17102d]" fill="#17102d" />
            </div>
          ) : (
            <div className="bg-white/[0.72] rounded-[3px] h-4 w-4 flex items-center justify-center">
              <FileText className="size-2 text-black" />
            </div>
          )}
        </div>
        {item.videoDuration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded-[3px]">
            <span className="text-[8px] text-white">{formatDuration(item.videoDuration)}</span>
          </div>
        )}
      </div>

      {/* タイトルエリア（現在: タグ上、タイトル下） */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <ArticleTag type={item.articleType} />
          </div>
          <span className="font-noto-sans-jp font-bold text-[14px] text-[#1e1b1b] leading-[20px] truncate">
            {item.title}
          </span>
        </div>
        <div className="size-5 border border-black/[0.32] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </div>
  );
}

// パターンB: 改行版（タグ + タイトル2行まで）
function PatternB({ item }: { item: typeof sampleItems[0] }) {
  return (
    <div className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full">
      {/* 番号 or チェック */}
      {item.isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-luckiest text-[12px] text-[#414141]">{item.articleNumber}</span>
        </div>
      )}

      {/* サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          {item.videoDuration ? (
            <div className="size-4 bg-white rounded-full flex items-center justify-center">
              <Play className="size-1 text-[#17102d]" fill="#17102d" />
            </div>
          ) : (
            <div className="bg-white/[0.72] rounded-[3px] h-4 w-4 flex items-center justify-center">
              <FileText className="size-2 text-black" />
            </div>
          )}
        </div>
        {item.videoDuration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded-[3px]">
            <span className="text-[8px] text-white">{formatDuration(item.videoDuration)}</span>
          </div>
        )}
      </div>

      {/* タイトルエリア（改行版: タグ + タイトル2行まで） */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <ArticleTag type={item.articleType} />
          </div>
          <span className="font-noto-sans-jp font-bold text-[14px] text-[#1e1b1b] leading-[20px] line-clamp-2">
            {item.title}
          </span>
        </div>
        <div className="size-5 border border-black/[0.32] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </div>
  );
}

// パターンC: タグとタイトルを横一行（タグ タイトル truncate）
function PatternC({ item }: { item: typeof sampleItems[0] }) {
  return (
    <div className="flex items-center gap-4 px-8 py-4 border-b border-black/[0.08] cursor-pointer hover:bg-gray-50 transition w-full">
      {/* 番号 or チェック */}
      {item.isCompleted ? (
        <div className="size-4 rounded-full bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)] flex items-center justify-center flex-shrink-0">
          <Check className="size-2.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        <div className="size-4 flex items-center justify-center flex-shrink-0">
          <span className="font-luckiest text-[12px] text-[#414141]">{item.articleNumber}</span>
        </div>
      )}

      {/* サムネイル */}
      <div className="relative w-20 h-[45px] rounded-[6px] overflow-hidden bg-[#e0dfdf] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          {item.videoDuration ? (
            <div className="size-4 bg-white rounded-full flex items-center justify-center">
              <Play className="size-1 text-[#17102d]" fill="#17102d" />
            </div>
          ) : (
            <div className="bg-white/[0.72] rounded-[3px] h-4 w-4 flex items-center justify-center">
              <FileText className="size-2 text-black" />
            </div>
          )}
        </div>
        {item.videoDuration && (
          <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded-[3px]">
            <span className="text-[8px] text-white">{formatDuration(item.videoDuration)}</span>
          </div>
        )}
      </div>

      {/* タイトルエリア（横一行: タグ + タイトル） */}
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <ArticleTag type={item.articleType} />
          <span className="font-noto-sans-jp font-bold text-[14px] text-[#1e1b1b] leading-[20px] truncate">
            {item.title}
          </span>
        </div>
        <div className="size-5 border border-black/[0.32] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
          <ChevronRight className="size-[15px] text-black/50" />
        </div>
      </div>
    </div>
  );
}

export default function QuestItemLayouts() {
  const [selectedPattern, setSelectedPattern] = useState<"A" | "B" | "C">("A");

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            クエストアイテム レイアウト比較
          </h1>
          <p className="text-gray-600">
            タグ + タイトルの表示パターンを比較
          </p>
        </div>

        {/* パターン切り替えボタン */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedPattern("A")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedPattern === "A"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            A: 現在（1行 truncate）
          </button>
          <button
            onClick={() => setSelectedPattern("B")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedPattern === "B"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            B: 改行（2行まで表示）
          </button>
          <button
            onClick={() => setSelectedPattern("C")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedPattern === "C"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            C: 横一行（タグ + タイトル）
          </button>
        </div>

        {/* セクションヘッダー */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-8 py-4 border-b border-black/10">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-600">
                2
              </span>
              <h2 className="font-bold text-[16px] text-gray-900">
                2. AIでUIリサーチを進める ー 探す力を鍛える
              </h2>
            </div>
          </div>

          {/* アイテムリスト */}
          {sampleItems.map((item, index) => (
            <div key={index}>
              {selectedPattern === "A" && <PatternA item={item} />}
              {selectedPattern === "B" && <PatternB item={item} />}
              {selectedPattern === "C" && <PatternC item={item} />}
            </div>
          ))}
        </div>

        {/* パターン説明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${selectedPattern === "A" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <h3 className="font-bold text-gray-900 mb-2">A: 現在（1行 truncate）</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>・タグが上、タイトルが下</li>
              <li>・タイトルは1行で切り捨て</li>
              <li>・コンパクトな表示</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg border-2 ${selectedPattern === "B" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <h3 className="font-bold text-gray-900 mb-2">B: 改行（2行まで表示）</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>・タグが上、タイトルが下</li>
              <li>・タイトルは2行まで表示</li>
              <li>・内容がわかりやすい</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg border-2 ${selectedPattern === "C" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
            <h3 className="font-bold text-gray-900 mb-2">C: 横一行</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>・タグとタイトルが横並び</li>
              <li>・1行で切り捨て</li>
              <li>・よりコンパクト</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
