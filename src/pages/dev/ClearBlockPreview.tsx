/**
 * ClearBlock プレビューページ
 *
 * ClearBlockコンポーネントの確認用
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";

export default function ClearBlockPreview() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white border-b px-8 py-4">
        <Link
          to="/dev"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          開発メニューに戻る
        </Link>
        <h1 className="text-xl font-bold">ClearBlock プレビュー</h1>
        <p className="text-sm text-gray-500">ロードマップクリア祝福ブロック</p>
      </div>

      {/* 変更内容 */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <h2 className="font-bold text-lg mb-4">変更内容（2026-04-01）</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">項目</th>
                <th className="px-4 py-2 text-left">Before</th>
                <th className="px-4 py-2 text-left">After</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-medium">水玉背景</td>
                <td className="px-4 py-2 text-red-600">あり（ランダム配置の丸）</td>
                <td className="px-4 py-2 text-green-600">削除</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">背景色</td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    bg-gradient-to-br from-[#f8f9f7] to-[#e8ebe6]
                  </code>
                </td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    bg-[#F9F9F7]
                  </code>
                  <span className="ml-2 inline-block w-4 h-4 rounded" style={{ background: '#F9F9F7', border: '1px solid #ccc' }} />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">ボーダー</td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">#d4dbd1</code>
                </td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">#E8ECE8</code>
                  <span className="ml-2 inline-block w-4 h-4 rounded" style={{ background: '#E8ECE8', border: '1px solid #ccc' }} />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">ボタン</td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    カスタム紫グラデーション
                  </code>
                </td>
                <td className="px-4 py-2">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    Button variant="default" size="large"
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 実際のコンポーネント */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <h2 className="font-bold text-lg mb-2">実際の表示</h2>
          <p className="text-sm text-gray-500 mb-4">ボタンをクリックすると紙吹雪が出ます</p>
        </div>
        <ClearBlock roadmapTitle="UIUXデザイナー転職ロードマップ" />
      </div>
    </div>
  );
}
