/**
 * トップページアイキャッチセクション プレビュー・チェック用ページ
 *
 * 用途:
 * - Figmaデザインとの比較確認
 * - レスポンシブ動作確認
 * - 各要素のサイズ・色・配置確認
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import TrainingCard, { TRAINING_CARDS_DATA } from '@/components/top/TrainingCard';

// パターン2のアニメーション設定（スケール＋フェードイン＋バウンス）
const PATTERN2_ANIMATION = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
};

// スクロール時のサイドバー問題の解決パターン
type ScrollPattern = 'breakthrough' | 'fade-edge' | 'sidebar-avoid';

const SCROLL_PATTERNS = {
  breakthrough: {
    name: 'パターン1: サイドバーを突き抜ける',
    description: 'カードがサイドバーの上に重なって表示される',
  },
  'fade-edge': {
    name: 'パターン2: 左端フェードアウト（スクロール時）',
    description: '左にスクロールした時、左端32pxがグラデーションで消える',
  },
  'sidebar-avoid': {
    name: 'パターン3: サイドバー回避（左端表示）',
    description: 'サイドバー領域を避けて、ブラウザの左端から表示を開始',
  },
};

// 中央配置のパターン
type CenterPattern = 'block-center' | 'card2-center';

const CENTER_PATTERNS = {
  'block-center': {
    name: 'カードブロック全体の中央',
    description: '4枚のカード全体の真ん中を画面中央に配置',
  },
  'card2-center': {
    name: '2個目のカードを中央',
    description: '2個目のカード（UXデザイン）を画面中央に配置',
  },
};

// ============================================
// サブコンポーネント
// ============================================

/** 進め方カテゴリ「デザインサイクル」レッスン詳細 */
const DESIGN_CYCLE_LESSON_HREF = "/lessons/ui-design-flow-lv1";

/** NEWバッジ（任意でレッスン詳細へリンク） */
function NewBadge({ text, href }: { text: string; href?: string }) {
  const className =
    "inline-flex items-center gap-2.5 px-4 py-[7px] bg-white rounded-full border border-transparent hover:border-black hover:bg-white/95 transition-colors duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]";
  const inner = (
    <>
      <span className="text-xs font-bold text-[#f95a16]">NEW!</span>
      <div className="flex items-baseline gap-0">
        <span className="text-[13px] font-bold text-[#0f172a]">{text}</span>
        <span className="text-xs font-normal text-[#0f172a]">！</span>
      </div>
    </>
  );
  if (href) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
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
  const [animationKey, setAnimationKey] = useState(0);
  const [scrollPattern, setScrollPattern] = useState<ScrollPattern>('breakthrough');
  const [centerPattern, setCenterPattern] = useState<CenterPattern>('block-center');
  const [isScrolledLeft, setIsScrolledLeft] = useState(false);
  const [shouldCenterCards, setShouldCenterCards] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  // スクロール監視: 左にスクロールした時のみフェードアウト表示
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolledLeft(container.scrollLeft > 10);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初期状態をチェック
    return () => container.removeEventListener('scroll', handleScroll);
  }, [centerPattern]);

  // 画面幅監視: スクロール不要な場合は中央揃え（デスクトップのみ）
  useEffect(() => {
    const checkIfShouldCenter = () => {
      // デスクトップ（xl: 1280px以上）でのみ判定
      if (window.innerWidth < 1280) {
        setShouldCenterCards(false);
        return;
      }

      // カード4枚の合計幅を計算
      // デスクトップ: 420px × 4 + gap 20px × 3 + 左右余白 192px × 2
      const cardWidth = 420;
      const cardCount = 4;
      const gap = 20;
      const padding = 192 * 2;
      const totalContentWidth = cardWidth * cardCount + gap * (cardCount - 1) + padding;

      // 画面幅がコンテンツ幅以上ならスクロール不要 → 中央揃え
      setShouldCenterCards(window.innerWidth >= totalContentWidth);
    };

    checkIfShouldCenter();
    window.addEventListener('resize', checkIfShouldCenter, { passive: true });
    return () => window.removeEventListener('resize', checkIfShouldCenter);
  }, []);

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
          アニメーションコントロール
      ================================================ */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-900">
              🎬 同時アニメーション（テキスト＋カード）
            </h2>
            <p className="text-sm text-purple-600 mt-1">
              パターン2: スケール＋フェードイン＋バウンス
            </p>
          </div>
          <button
            onClick={handleReplay}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold text-sm"
          >
            🔄 リプレイ
          </button>
        </div>
      </div>

      {/* ================================================
          中央配置パターン比較
      ================================================ */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            🎯 中央配置パターン比較
          </h2>
          <p className="text-sm text-blue-700 mb-4">
            カードをどこを基準に中央配置するか
          </p>

          {/* パターン選択ボタン */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(CENTER_PATTERNS) as CenterPattern[]).map((key) => (
              <button
                key={key}
                onClick={() => setCenterPattern(key)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${
                    centerPattern === key
                      ? 'border-blue-600 bg-blue-100 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
                  }
                `}
              >
                <div className="font-bold text-sm text-gray-900 mb-1">
                  {CENTER_PATTERNS[key].name}
                </div>
                <div className="text-xs text-gray-600">
                  {CENTER_PATTERNS[key].description}
                </div>
              </button>
            ))}
          </div>

          {/* 選択中のパターン表示 */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-blue-600">現在選択中:</span>{' '}
              {CENTER_PATTERNS[centerPattern].name}
            </p>
          </div>
        </div>
      </div>

      {/* ================================================
          スクロール時のサイドバー問題 - パターン比較
      ================================================ */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-orange-900 mb-4">
            📱 スクロール時のサイドバー問題 - 解決パターン比較
          </h2>
          <p className="text-sm text-orange-700 mb-4">
            デスクトップで左にスクロールした時、サイドバーでカードがぶつ切りにならないようにする方法
          </p>

          {/* パターン選択ボタン */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(SCROLL_PATTERNS) as ScrollPattern[]).map((key) => (
              <button
                key={key}
                onClick={() => setScrollPattern(key)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${
                    scrollPattern === key
                      ? 'border-orange-600 bg-orange-100 shadow-lg scale-105'
                      : 'border-gray-300 bg-white hover:border-orange-400 hover:shadow-md'
                  }
                `}
              >
                <div className="font-bold text-sm text-gray-900 mb-1">
                  {SCROLL_PATTERNS[key].name}
                </div>
                <div className="text-xs text-gray-600">
                  {SCROLL_PATTERNS[key].description}
                </div>
              </button>
            ))}
          </div>

          {/* 選択中のパターン表示 */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-orange-600">現在選択中:</span>{' '}
              {SCROLL_PATTERNS[scrollPattern].name}
            </p>
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
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-[950px] flex flex-col items-center gap-8 px-4 sm:px-6 lg:px-0 pt-8 pb-0 mb-0">
            {/* コンテンツグループ */}
            <div className="flex flex-col items-center gap-8">
              {/* NEWバッジ */}
              <motion.div
                key={`badge-${animationKey}`}
                initial={PATTERN2_ANIMATION.initial}
                animate={PATTERN2_ANIMATION.animate}
                transition={{ ...PATTERN2_ANIMATION.transition, delay: 0 }}
                className="mt-8 sm:mt-12 lg:mt-0"
              >
                <NewBadge
                  text='AI時代に生きる「デザインの進め方」をリリース'
                  href={DESIGN_CYCLE_LESSON_HREF}
                />
              </motion.div>

              {/* メインキャッチコピー + サブキャッチコピー */}
              <div className="flex flex-col items-center gap-4 text-center leading-none">
                {/* メインキャッチコピー */}
                <motion.h1
                  key={`main-catch-${animationKey}`}
                  initial={PATTERN2_ANIMATION.initial}
                  animate={PATTERN2_ANIMATION.animate}
                  transition={{ ...PATTERN2_ANIMATION.transition, delay: 0.15 }}
                  className="font-[LINE_Seed_JP,sans-serif] text-[40px] sm:text-[56px] font-bold text-[#0f172a] leading-[1.32]"
                >
                  はじめよう！
                  <br />
                  キモチがうごく
                  <br />
                  ものづくり
                </motion.h1>

                {/* サブキャッチコピー */}
                <motion.div
                  key={`sub-catch-${animationKey}`}
                  initial={PATTERN2_ANIMATION.initial}
                  animate={PATTERN2_ANIMATION.animate}
                  transition={{ ...PATTERN2_ANIMATION.transition, delay: 0.3 }}
                  className="w-full max-w-[681px] px-4 font-noto-sans-jp text-base sm:text-xl text-[#0f172a] leading-[1.76]"
                >
                  <p className="mb-0">ボノはユーザー起点で未来のワクワクを</p>
                  <p className="mb-0">
                    &quot;つくる&quot;力を磨く<span className="font-bold">デザイントレーニングサービス</span>です。
                  </p>
                </motion.div>
              </div>
            </div>

            {/* CTAボタン */}
            <motion.div
              key={`cta-${animationKey}`}
              initial={PATTERN2_ANIMATION.initial}
              animate={PATTERN2_ANIMATION.animate}
              transition={{ ...PATTERN2_ANIMATION.transition, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center"
            >
              <CTAButtonPrimary href="https://www.bo-no.design/plan" external>
                メンバーになってはじめる
              </CTAButtonPrimary>
              <CTAButtonSecondary href="/roadmaps">
                ロードマップをを見る
              </CTAButtonSecondary>
            </motion.div>
          </div>

          {/* 下部: トレーニングカード（absolute配置） */}
          {/* テキストブロックの中央に対してセンター配置 */}
          <div
            className="absolute top-[580px] sm:top-[620px] lg:top-[616px] w-full"
            style={{
              // パターン3（サイドバー回避）の場合は左端配置、それ以外は中央配置
              left: scrollPattern === 'sidebar-avoid' ? '0' : '50%',
              transform: scrollPattern === 'sidebar-avoid' ? 'none' : 'translateX(-50%)',
            }}
          >
            {/* スクロールコンテナ - パターンごとに異なるスタイル */}
            <div
              className={`relative ${scrollPattern === 'sidebar-avoid' ? 'xl:ml-[200px]' : ''}`}
            >
              {/* パターン2: 左端フェードアウト - スクロール時のみ表示（デスクトップのみ） */}
              {scrollPattern === 'fade-edge' && isScrolledLeft && (
                <div
                  className="hidden lg:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F9F9F7] via-[#F9F9F7]/60 to-transparent z-20 pointer-events-none"
                  style={{
                    opacity: isScrolledLeft ? 1 : 0,
                    transition: 'opacity 700ms ease-out',
                  }}
                />
              )}

              <div
                ref={scrollContainerRef}
                className="overflow-x-auto overflow-y-visible scrollbar-hide py-4"
                style={{
                  // パターン1: サイドバーを突き抜ける場合のみz-indexを高く
                  position: 'relative',
                  zIndex: scrollPattern === 'breakthrough' ? 50 : 1,
                }}
              >
                <div
                  className={`flex gap-5 min-w-max py-5 px-8 sm:px-12 -ml-8 sm:-ml-12 ${
                    !shouldCenterCards
                      ? 'lg:px-[120px] lg:-ml-[88px]'
                      : 'lg:pl-0 lg:pr-[120px] lg:ml-0'
                  }`}
                  style={{
                    // デスクトップでスクロール不要な場合のみ中央揃え、それ以外は左端固定
                    justifyContent:
                      shouldCenterCards && centerPattern === 'block-center'
                        ? 'center'
                        : centerPattern === 'block-center'
                          ? 'flex-start'
                          : 'flex-start',
                    marginLeft:
                      shouldCenterCards && centerPattern === 'card2-center'
                        ? 'calc(50% - 150px - 10px - 210px)'
                        : centerPattern === 'card2-center' && !shouldCenterCards
                            ? '0'
                            : '0',
                  }}
                >
                  {TRAINING_CARDS_DATA.map((cardData, index) => (
                    <motion.div
                      key={`${cardData.id}-${animationKey}`}
                      initial={PATTERN2_ANIMATION.initial}
                      animate={PATTERN2_ANIMATION.animate}
                      transition={{
                        ...PATTERN2_ANIMATION.transition,
                        delay: index * 0.12,
                      }}
                    >
                      <TrainingCard data={cardData} />
                    </motion.div>
                  ))}
                </div>
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
