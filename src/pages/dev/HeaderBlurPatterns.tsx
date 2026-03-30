/**
 * ヘッダー + カテゴリタブのブラー/透過一体化パターン比較
 *
 * 課題: 2つの別々のDOM要素にbackdrop-blurをかけると、
 *       それぞれが背後の異なるコンテンツをブラーするため色が異なって見える
 *
 * 前提: タブのsticky動作（スクロールで固定）は維持する
 *
 * 検証するパターン:
 * A: 高不透明度（bg-white/70）- ブラー効果を抑える
 * B: グラデーション接続 - 境界をグラデーションでなじませる
 * D: ライトブラー - backdrop-blur-sm + 軽い不透明度
 * E: 境界線除去 - 視覚的な境界をなくす
 * F: saturate調整 - 色の鮮やかさを調整
 * G: 中間ブラー - backdrop-blur-md + 高不透明度
 * H: ベース色に近い半透明 - ほぼソリッド
 *
 * ※ パターンC（単一ラッパー）は除外 - タブのsticky動作が変わるため
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '@/components/common/Logo';

// ダミーカテゴリタブ
const TABS = ['おすすめ', '進め方', 'UIデザイン', 'UXデザイン', 'キャリア', 'AI', 'ビジュアル', 'Figma', 'ラジオ'];

// ダミーコンテンツ（スクロール検証用）
const DummyContent = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="h-24 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
        <span className="text-gray-500">コンテンツブロック {i + 1}</span>
      </div>
    ))}
  </div>
);

// パターンA: 高不透明度
const PatternA = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      {/* グラデーション背景 */}
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/70">
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
      <div className="sticky top-14 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンB: グラデーション接続
const PatternB = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー - 下にグラデーション */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-white/60 to-white/30">
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ - 上にグラデーション */}
      <div className="sticky top-14 z-10 backdrop-blur-xl bg-gradient-to-t from-white/60 to-white/30 border-b border-gray-200/30">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンC: 単一ラッパー（2つを1つのblur要素で囲む）
const PatternC = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* 単一ラッパーでblur */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/40">
        {/* ヘッダーバー */}
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>

        {/* カテゴリタブ */}
        <div className="border-b border-gray-200/50">
          <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
            {TABS.map((tab, i) => (
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
      </div>

      <DummyContent />
    </div>
  );
};

// パターンD: ライトブラー（blur-sm + 軽い不透明度）
const PatternD = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/50">
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
      <div className="sticky top-14 z-10 backdrop-blur-sm bg-white/50 border-b border-gray-200/50">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンE: 境界線なし + 同色
const PatternE = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー - 境界線なし */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/30">
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ - 上に境界線なし */}
      <div className="sticky top-14 z-10 backdrop-blur-xl bg-white/30 border-b border-gray-200/30">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンF: 背景色統一（saturateで色調整）
const PatternF = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー - saturate調整 */}
      <div className="sticky top-0 z-20 backdrop-blur-xl backdrop-saturate-150 bg-[#f5f4f2]/80">
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ - 同じsaturate調整 */}
      <div className="sticky top-14 z-10 backdrop-blur-xl backdrop-saturate-150 bg-[#f5f4f2]/80 border-b border-gray-200/50">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンG: 高不透明度 + blur-md（中間）
const PatternG = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-[#faf9f7]/85">
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
      <div className="sticky top-14 z-10 backdrop-blur-md bg-[#faf9f7]/85 border-b border-gray-200/50">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

// パターンH: ベース色に近い半透明
const PatternH = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative h-[500px] overflow-y-auto bg-[#f9f8f6]">
      <div
        className="fixed inset-x-0 top-0 h-[148px] pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgb(230, 230, 239) 0%, rgb(250, 242, 237) 44.3%, rgb(249, 248, 246) 84.3%, rgba(249, 248, 246, 0) 100%)",
        }}
      />

      {/* ヘッダーバー - ベース色に近い半透明 */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#f9f8f6]/90">
        <div className="h-14 flex items-center justify-center relative px-4">
          <div className="absolute left-4">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
          <Logo width={68} height={20} />
        </div>
      </div>

      {/* カテゴリタブ - 同じ色 */}
      <div className="sticky top-14 z-10 backdrop-blur-xl bg-[#f9f8f6]/90 border-b border-gray-200/50">
        <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab, i) => (
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

const HeaderBlurPatterns = () => {
  // ※ パターンC（単一ラッパー）は除外 - タブのsticky動作が変わるため
  const patterns = [
    { id: 'A', name: '高不透明度 (bg-white/70)', desc: 'ブラー効果を抑えて色差を減らす', component: PatternA },
    { id: 'B', name: 'グラデーション接続', desc: '境界をグラデーションでなじませる', component: PatternB },
    { id: 'D', name: 'ライトブラー (blur-sm)', desc: '軽いブラー + 軽い不透明度', component: PatternD },
    { id: 'E', name: '境界線なし + 低不透明度', desc: '視覚的な境界をなくす', component: PatternE },
    { id: 'F', name: 'saturate調整', desc: 'backdrop-saturate-150で色調整', component: PatternF },
    { id: 'G', name: '中間ブラー (blur-md)', desc: 'backdrop-blur-md + 85%不透明度', component: PatternG },
    { id: 'H', name: 'ベース色に近い半透明', desc: 'bg-[#f9f8f6]/90 - ほぼソリッド', component: PatternH },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link to="/dev" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Dev Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">ヘッダー + タブ ブラー一体化パターン</h1>
          <p className="text-gray-600 mb-4">
            2つの別々のsticky要素（ヘッダーバー + カテゴリタブ）をブラー/透過で一体化させるパターン比較
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">技術的な課題</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 2つの別々のDOM要素に`backdrop-blur`をかけると、それぞれが背後の異なるコンテンツをブラーする</li>
              <li>• スクロール時、各要素の背後にあるコンテンツが異なるため、ブラー後の色が異なって見える</li>
              <li>• 解決策: 不透明度を上げる / ブラーを弱める / 1つの要素にまとめる / 色調整</li>
            </ul>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {patterns.map(({ id, name, desc, component: Component }) => (
            <div key={id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold">
                  パターン {id}: {name}
                </h2>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
              <div className="relative">
                <Component />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">比較ポイント</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-green-700 mb-2">✅ 推奨アプローチ</h3>
              <ul className="text-sm space-y-2">
                <li><strong>G/H: 高不透明度</strong> - ブラー効果は残しつつ色差を最小化</li>
                <li><strong>F: saturate調整</strong> - 色の鮮やかさを調整して統一感</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-700 mb-2">💡 トレードオフ</h3>
              <ul className="text-sm space-y-2">
                <li>不透明度↑ = ブラー効果↓（背後のコンテンツ見えにくい）</li>
                <li>ブラー強度↓ = 色差↓（ただしブラー感も減る）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-700 mb-2">⚠️ 注意点</h3>
              <ul className="text-sm space-y-2">
                <li>2つの別々のsticky要素なので、完全な色一致は難しい</li>
                <li>スクロール量によって背後のコンテンツが変わる</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBlurPatterns;
