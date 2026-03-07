import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">
          BONO Next.js 移行版
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">✅ セットアップ完了</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• Next.js 15 + App Router</li>
            <li>• Tailwind CSS + shadcn/ui</li>
            <li>• Supabase SSR対応</li>
            <li>• Sanity CMS接続</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📝 進捗状況</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="line-through text-green-600">✓ /lessons/[slug] ページを作成（SSR + OGP）</li>
            <li>2. /articles/[slug] ページを作成</li>
            <li>3. 共通レイアウト（ヘッダー/フッター）</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 テストリンク</h2>
          <div className="space-y-2">
            <Link
              href="/lessons/zerokara-userinterview"
              className="text-blue-600 hover:underline block"
            >
              /lessons/zerokara-userinterview（SSR + OGP動作確認済み）
            </Link>
            <Link
              href="/lessons/bannerbeginner"
              className="text-blue-600 hover:underline block"
            >
              /lessons/bannerbeginner
            </Link>
            <Link
              href="/lessons/rookiesaction"
              className="text-blue-600 hover:underline block"
            >
              /lessons/rookiesaction
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
