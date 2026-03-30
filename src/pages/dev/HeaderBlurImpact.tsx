/**
 * パターンD（ライトブラー）の各ページタイプへの影響確認
 *
 * 実際のページ構造を模倣して、ヘッダースタイル変更の影響を確認
 *
 * ※ プレビューカード内では fixed が使えないため sticky + 負のマージンを使用
 *    グラデーションは z-[-1] で最背面に配置
 *    実際の実装では Layout.tsx で fixed を使用
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronRight, Play, Clock, BookOpen, Search, User, Settings } from 'lucide-react';
import Logo from '@/components/common/Logo';

// ダミーカテゴリタブ（Lessons用）
const LESSON_TABS = ['おすすめ', '進め方', 'UIデザイン', '情報設計', 'UXデザイン', 'キャリア'];

// 現在のスタイル
const CURRENT_STYLE = {
  header: 'backdrop-blur-xl bg-white/20',
  tabs: 'bg-[#f9f9f7]', // ソリッドカラー
};

// パターンDのスタイル
const PATTERN_D_STYLE = {
  header: 'backdrop-blur-sm bg-white/50',
  tabs: 'backdrop-blur-sm bg-white/50',
};

// ダミーコンテンツ（スクロール検証用）- relative z-[1]でグラデーションより上に
const DummyContent = () => (
  <div className="relative z-[1] space-y-4 p-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="h-24 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
        <span className="text-gray-500">コンテンツブロック {i + 1}</span>
      </div>
    ))}
  </div>
);

// ====================
// レッスン一覧ページ風（カード表示）
// ====================
const LessonsPageMockCards = ({ usePatternD }: { usePatternD: boolean }) => {
  const [activeTab, setActiveTab] = useState(0);
  const style = usePatternD ? PATTERN_D_STYLE : CURRENT_STYLE;

  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      {/* グラデーション背景 - absoluteでスクロールコンテナ内上部固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー - z-20 */}
      <div className={`sticky top-0 z-20 ${style.header}`}>
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ - z-10 */}
      <div className={`sticky top-14 z-10 ${style.tabs} border-b border-gray-200/50`}>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {LESSON_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 pt-3 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === i ? 'border-black text-black' : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* レッスンカード風コンテンツ - relative z-[1]でグラデーションより上に */}
      <div className="relative z-[1] p-4 grid grid-cols-2 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-100 to-purple-100" />
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">UIデザイン</div>
              <div className="text-sm font-bold line-clamp-2">レッスンタイトル {i + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================
// レッスン一覧ページ風（ダミーブロック - HeaderBlurPatternsと同じ）
// ====================
const LessonsPageMockBlocks = ({ usePatternD }: { usePatternD: boolean }) => {
  const [activeTab, setActiveTab] = useState(0);
  const style = usePatternD ? PATTERN_D_STYLE : CURRENT_STYLE;

  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      {/* グラデーション背景 - absoluteでスクロールコンテナ内上部固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className={`sticky top-0 z-20 ${style.header}`}>
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className={`sticky top-14 z-10 ${style.tabs} border-b border-gray-200/50`}>
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {LESSON_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`pb-3 pt-3 px-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === i ? 'border-black text-black' : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <DummyContent />
    </div>
  );
};

// ====================
// レッスン詳細ページ風
// ====================
const LessonDetailMock = ({ usePatternD }: { usePatternD: boolean }) => {
  const style = usePatternD ? PATTERN_D_STYLE : CURRENT_STYLE;

  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      {/* グラデーション背景 - absoluteでスクロールコンテナ内上部固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className={`sticky top-0 z-20 ${style.header}`}>
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* レッスン詳細コンテンツ - relative z-[1]でグラデーションより上に */}
      <div className="relative z-[1] p-4 space-y-4">
        {/* ビデオプレイヤー風 */}
        <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>

        {/* タイトル */}
        <div>
          <div className="text-xs text-blue-600 font-medium mb-1">UIデザイン</div>
          <h1 className="text-xl font-bold">UIビジュアル基礎</h1>
          <p className="text-sm text-gray-600 mt-2">UIデザインの基本的なビジュアル表現を学びます。</p>
        </div>

        {/* メタ情報 */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock size={14} /> 2時間30分</span>
          <span className="flex items-center gap-1"><BookOpen size={14} /> 12レッスン</span>
        </div>

        {/* チャプターリスト */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">チャプター {i + 1}</div>
                <div className="text-xs text-gray-500">10:30</div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ====================
// マイページ風
// ====================
const MyPageMock = ({ usePatternD }: { usePatternD: boolean }) => {
  const style = usePatternD ? PATTERN_D_STYLE : CURRENT_STYLE;

  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      {/* グラデーション背景 - absoluteでスクロールコンテナ内上部固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className={`sticky top-0 z-20 ${style.header}`}>
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* マイページコンテンツ - relative z-[1]でグラデーションより上に */}
      <div className="relative z-[1] p-4 space-y-4">
        {/* プロフィールカード */}
        <div className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="font-bold">ユーザー名</div>
            <div className="text-sm text-gray-500">user@example.com</div>
          </div>
        </div>

        {/* メニュー */}
        <div className="bg-white rounded-xl divide-y">
          {[
            { icon: BookOpen, label: '学習履歴' },
            { icon: Clock, label: '視聴履歴' },
            { icon: Settings, label: '設定' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 p-4">
              <Icon size={20} className="text-gray-500" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          ))}
        </div>

        {/* 進捗 */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold mb-3">学習進捗</h3>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>レッスン {i + 1}</span>
                  <span className="text-gray-500">{30 + i * 15}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${30 + i * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================
// メインコンポーネント
// ====================
const HeaderBlurImpact = () => {
  const [usePatternD, setUsePatternD] = useState(false);

  const pages = [
    { id: 'lessons-blocks', name: 'レッスン一覧（ブロック）', desc: 'HeaderBlurPatternsと同じダミーコンテンツ', component: LessonsPageMockBlocks },
    { id: 'lessons-cards', name: 'レッスン一覧（カード）', desc: '実際のレッスンカード風', component: LessonsPageMockCards },
    { id: 'detail', name: 'レッスン詳細', desc: '動画プレイヤー + チャプター', component: LessonDetailMock },
    { id: 'mypage', name: 'マイページ', desc: 'プロフィール + メニュー', component: MyPageMock },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link to="/dev" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Dev Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">パターンD 各ページ影響確認</h1>
          <p className="text-gray-600 mb-4">
            ヘッダースタイル変更（パターンD）が各ページタイプでどう見えるか比較
          </p>

          {/* トグルスイッチ */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            <span className={`font-medium ${!usePatternD ? 'text-blue-600' : 'text-gray-400'}`}>
              現在のスタイル
            </span>
            <button
              onClick={() => setUsePatternD(!usePatternD)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                usePatternD ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  usePatternD ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${usePatternD ? 'text-blue-600' : 'text-gray-400'}`}>
              パターンD
            </span>
          </div>

          {/* スタイル詳細 */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">
              {usePatternD ? 'パターンD適用中' : '現在のスタイル'}
            </h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>ヘッダー:</strong> <code className="bg-yellow-100 px-1 rounded">{usePatternD ? PATTERN_D_STYLE.header : CURRENT_STYLE.header}</code></p>
              <p><strong>タブ:</strong> <code className="bg-yellow-100 px-1 rounded">{usePatternD ? PATTERN_D_STYLE.tabs : CURRENT_STYLE.tabs}</code></p>
            </div>
          </div>
        </header>

        {/* ページプレビューグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pages.map(({ id, name, desc, component: Component }) => (
            <div key={id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold">{name}</h2>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <div className="relative">
                <Component usePatternD={usePatternD} />
              </div>
            </div>
          ))}
        </div>

        {/* 比較まとめ */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">影響まとめ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ページ</th>
                <th className="text-left py-2">現在</th>
                <th className="text-left py-2">パターンD</th>
                <th className="text-left py-2">影響度</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">レッスン一覧</td>
                <td className="py-2 text-gray-600">ヘッダー/タブ色が異なる</td>
                <td className="py-2 text-green-600">統一される ✓</td>
                <td className="py-2"><span className="px-2 py-1 bg-green-100 text-green-700 rounded">改善</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">レッスン詳細</td>
                <td className="py-2 text-gray-600">blur-xl + 20%</td>
                <td className="py-2 text-gray-600">blur-sm + 50%</td>
                <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">軽微</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">マイページ</td>
                <td className="py-2 text-gray-600">blur-xl + 20%</td>
                <td className="py-2 text-gray-600">blur-sm + 50%</td>
                <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">軽微</span></td>
              </tr>
              <tr>
                <td className="py-2 font-medium">その他のページ</td>
                <td className="py-2 text-gray-600">blur-xl + 20%</td>
                <td className="py-2 text-gray-600">blur-sm + 50%</td>
                <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">軽微</span></td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>注意:</strong> プレビューカード内では <code>fixed</code> が使えないため、グラデーションは <code>sticky + z-[-1]</code> で実装しています。
              HeaderBlurPatternsのパターンDと同じ見た目になるよう調整済みです。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBlurImpact;
