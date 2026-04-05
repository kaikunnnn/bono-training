/**
 * トップページアイキャッチセクション プレビュー・チェック用ページ
 *
 * 用途:
 * - Figmaデザインとの比較確認
 * - レスポンシブ動作確認
 * - 各要素のサイズ・色・配置確認
 */

import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import TrainingCard, { TRAINING_CARDS_DATA } from '@/components/top/TrainingCard';

// ============================================
// サブコンポーネント
// ============================================

/** NEWバッジ */
function NewBadge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-[7px] bg-white rounded-full">
      <span className="text-xs font-bold text-[#f95a16]">NEW!</span>
      <div className="flex items-baseline gap-0">
        <span className="text-[13px] font-bold text-[#0f172a]">{text}</span>
        <span className="text-xs font-normal text-[#0f172a]">！</span>
      </div>
    </div>
  );
}

/** CTAボタン - Primary（濃緑） */
function CTAButtonPrimary({
  children,
  href,
  external = false,
}: {
  children: React.ReactNode;
  href: string;
  external?: boolean;
}) {
  const className =
    "inline-flex items-center justify-center h-14 px-6 rounded-[14px] bg-[#102720] text-white text-sm font-bold leading-5 tracking-[0.35px] text-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] hover:bg-[#1a3a30] transition-colors w-full sm:w-auto sm:min-w-[174px]";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

/** CTAボタン - Secondary（アウトライン） */
function CTAButtonSecondary({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="inline-flex items-center justify-center h-14 px-[25px] py-px rounded-[14px] border border-[#0f172a] text-[#0f172a] text-sm font-bold leading-5 tracking-[0.35px] text-center hover:bg-gray-50 transition-colors w-full sm:w-auto sm:min-w-[154px]"
    >
      {children}
    </Link>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export default function TrainingCardPreview() {
  return (
    <Layout headerGradient="top">
      {/* ヘッダー（Figmaリンク） */}
      <div className="bg-blue-50 border-b border-blue-200 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-blue-900">
              📐 トップページアイキャッチセクション - Figmaデザイン実装
            </h1>
            <Link
              to="/dev"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              ← DEVホームに戻る
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=293-29400"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              → Figmaデザイン全体を見る
            </a>
            <a
              href="https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=280-16610"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              カード #1: 情報設計
            </a>
            <a
              href="https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=280-18090"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              カード #2: UIUX転職
            </a>
            <a
              href="https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=280-21225"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              カード #3: UXデザイン
            </a>
            <a
              href="https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=288-23905"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              カード #4: UIビジュアル
            </a>
          </div>
        </div>
      </div>

      {/* ================================================
          アイキャッチセクション全体
      ================================================ */}
      <section className="relative pt-0 pb-0">
        {/* コンテナ全体（h-[1186px] をベースにレスポンシブ調整） */}
        {/* デスクトップでサイドバー200px分を考慮してコンテンツを中央配置 */}
        <div className="relative h-auto min-h-[1020px] sm:min-h-[1120px] lg:h-[1186px]">
          {/* 上部: NEWバッジ + キャッチコピー + CTAボタン */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-[950px] flex flex-col items-center gap-8 px-4 sm:px-6 lg:px-0">
            {/* コンテンツグループ */}
            <div className="flex flex-col items-center gap-8">
              {/* NEWバッジ */}
              <div className="mt-8 sm:mt-12 lg:mt-0">
                <NewBadge text="AIプロトタイピングコースがリリース" />
              </div>

              {/* メインキャッチコピー + サブキャッチコピー */}
              <div className="flex flex-col items-center gap-4 text-center leading-none">
                {/* メインキャッチコピー */}
                <h1 className="font-[LINE_Seed_JP,sans-serif] text-[40px] sm:text-[56px] lg:text-[74px] font-bold text-[#0f172a] leading-[1.32]">
                  はじめよう！
                  <br />
                  キモチがうごく
                  <br />
                  ものづくり
                </h1>

                {/* サブキャッチコピー */}
                <div className="w-full max-w-[681px] px-4 font-noto-sans-jp text-base sm:text-xl lg:text-2xl text-[#0f172a] leading-[1.76]">
                  <p className="mb-0">ボノはユーザー起点で未来のワクワクを</p>
                  <p className="mb-0">
                    &quot;つくる&quot;力を磨く<span className="font-bold">デザイントレーニングサービス</span>です。
                  </p>
                </div>
              </div>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
              <CTAButtonPrimary href="https://www.bo-no.design/plan" external>
                メンバーになってはじめる
              </CTAButtonPrimary>
              <CTAButtonSecondary href="/roadmaps">
                ロードマップをを見る
              </CTAButtonSecondary>
            </div>
          </div>

          {/* 下部: トレーニングカード（absolute配置） */}
          {/* デスクトップでは中央配置、モバイル・タブレットでは横スクロール */}
          <div className="absolute left-0 top-[580px] sm:top-[620px] lg:top-[616px] w-full">
            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-5 px-4 sm:px-6 lg:px-0 min-w-max lg:justify-center">
                {TRAINING_CARDS_DATA.map((cardData) => (
                  <TrainingCard key={cardData.id} data={cardData} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          パートナーシップセクション
      ================================================ */}
      <section className="border-b border-[#dfdfdf] py-6 px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2">
          <p className="text-[13px] font-bold text-[rgba(41,53,37,0.8)] leading-[27px] whitespace-nowrap">
            キャリアパートナーシップ
          </p>
          <div className="w-[149px] h-[61px]">
            <img
              src="/images/partners/gmo-beauty.png"
              alt="GMO BEAUTY"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* デバッグ情報 */}
      <div className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📏 デザイン仕様</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">NEWバッジ</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 背景: #ffffff</li>
                <li>• 枠線: なし</li>
                <li>• 角丸: 50px（pill形状）</li>
                <li>• NEW!: #f95a16 / 12px</li>
                <li>• テキスト: #0f172a / 13px</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">メインキャッチ</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• フォント: LINE Seed JP</li>
                <li>• サイズ: 74px（デスクトップ）</li>
                <li>• 色: #0f172a</li>
                <li>• 行間: 1.32</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">サブキャッチ</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• フォント: Noto Sans JP</li>
                <li>• サイズ: 24px</li>
                <li>• 最大幅: 681px</li>
                <li>• 行間: 1.76</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">CTAボタン</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 高さ: 56px (h-14)</li>
                <li>• プライマリ: #102720</li>
                <li>• セカンダリ: border #0f172a</li>
                <li>• 影: 0px 4px 12px rgba(0,0,0,0.12)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">トレーニングカード</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• デスクトップ: 420×570px</li>
                <li>• タブレット: 350×476px</li>
                <li>• モバイル: 300×407px</li>
                <li>• gap: 20px</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">レイアウト</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• コンテナ最大幅: 950px</li>
                <li>• 全体高さ: 1186px (デスクトップ)</li>
                <li>• カード top: 616px</li>
                <li>• 背景色: bg-base (#F9F9F7)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">パートナーシップ</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• ラベル色: rgba(41,53,37,0.8)</li>
                <li>• フォントサイズ: 13px</li>
                <li>• ロゴサイズ: 149×61px</li>
                <li>• border-bottom: #dfdfdf</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Layout設定</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• headerGradient: &quot;top&quot;</li>
                <li>• サイドバー: 表示（200px）</li>
                <li>• ヘッダーグラデ: 表示</li>
                <li>• デスクトップで中央配置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
