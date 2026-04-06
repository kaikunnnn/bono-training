/**
 * トップページ新デザイン（Figma: PRD🏠_topUI_newBONO2026 node-id: 178-28863）
 *
 * セクション構成:
 * 1. Hero Section - キャッチコピー + CTAボタン
 * 2. Roadmap Cards - 4枚のロードマップカード
 * 3. Goal Selection - 3つのゴール選択ボタン
 * 4. Content Sections - キャリア / UX / UI の3セクション
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import type { GradientPreset } from "@/components/roadmap/RoadmapCardV2";
import TrainingCard, { TRAINING_CARDS_DATA } from "@/components/top/TrainingCard";

// ============================================
// 型定義
// ============================================

interface GoalButtonProps {
  icon: string;
  text: string;
  href: string;
}

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


/** ゴール選択ボタン */
function GoalButton({ icon, text, href }: GoalButtonProps) {
  return (
    <Link
      to={href}
      className="flex-1 flex flex-col items-center justify-center h-[90px] sm:h-[100px] lg:h-[117px] px-4 sm:px-6 lg:px-8 py-1 bg-surface border border-black/12 rounded-[32px] sm:rounded-[40px] lg:rounded-[50px] hover:shadow-md transition-all group"
    >
      <span className="text-2xl sm:text-[28px] lg:text-[32px] mb-1">{icon}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-base font-medium text-text-primary">{text}</span>
        <ChevronRight className="w-3 h-3 text-text-primary rotate-90 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

/** セクションヘッダー（ゴール別セクション用） */
function GoalSectionHeader({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 py-10 sm:py-12 lg:py-16 px-4 sm:px-8 lg:px-22">
      <span className="text-[32px] sm:text-[36px] lg:text-[42px]">{icon}</span>
      <h2 className="text-xl sm:text-2xl lg:text-[32px] font-extrabold text-center text-text-primary leading-[1.59] font-['Rounded_Mplus_1c',sans-serif]">
        {title}
      </h2>
      <p className="text-base sm:text-lg lg:text-xl text-center text-text-primary/80 leading-[1.66]">
        {description}
      </p>
      <div className="w-full h-px bg-gray-300 opacity-35 mt-2 sm:mt-4" />
    </div>
  );
}

// ============================================
// ゴールボタンデータ
// ============================================

const GOAL_BUTTONS_DATA = [
  { icon: "✨", text: "UIUXデザイナーに転職", href: "#section-career" },
  { icon: "🔧", text: "ユーザー課題を解決", href: "#section-ux" },
  { icon: "🛸", text: "使いやすいUIを提案", href: "#section-ui" },
];

// ============================================
// メインコンポーネント
// ============================================

export default function TopPageNew() {
  // Sanityからロードマップデータを取得（セクション4で使用）
  const { data: roadmaps } = useRoadmaps();

  // 特定slugのロードマップを取得するヘルパー
  const getRoadmapBySlug = (slug: string) =>
    roadmaps?.find((rm) => rm.slug.current === slug);

  // 各セクション用のロードマップ
  const careerRoadmap = getRoadmapBySlug("uiux-career-change");
  const uxRoadmap = getRoadmapBySlug("ux-design-basic");
  const uiRoadmap = getRoadmapBySlug("information-architecture");
  const uiVisualRoadmap = getRoadmapBySlug("ui-visual-design");

  // トレーニングカードの動的中央揃え制御
  const [shouldCenterCards, setShouldCenterCards] = useState(false);
  const [isScrolledLeft, setIsScrolledLeft] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <Layout headerGradient="default">
      <div className="min-h-screen">
        {/* ================================================
            セクション1: Hero Section
        ================================================ */}
        <section className="relative pt-0 pb-0">
          {/* コンテナ全体（h-[1186px] をベースにレスポンシブ調整） */}
          <div className="relative h-auto min-h-[900px] sm:min-h-[1100px] lg:h-[1186px]">
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
                      "つくる"力を磨く<span className="font-bold">デザイントレーニングサービス</span>です。
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
            <div className="absolute left-1/2 -translate-x-1/2 top-[500px] sm:top-[550px] lg:top-[616px] w-full">
              {/* スクロールコンテナ */}
              <div className="relative">
                {/* パターン2: 左端フェードアウト - スクロール時のみ表示（デスクトップのみ） */}
                {isScrolledLeft && (
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
                >
                  <div
                    className={`flex gap-5 min-w-max px-8 sm:px-12 ${!shouldCenterCards ? 'lg:px-48' : 'lg:pl-0 lg:pr-48'}`}
                    style={{
                      justifyContent: shouldCenterCards ? 'center' : 'flex-start',
                    }}
                  >
                    {TRAINING_CARDS_DATA.map((cardData) => (
                      <TrainingCard key={cardData.id} data={cardData} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            セクション2: Partnership Section
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

        {/* ================================================
            セクション3: Goal Selection Section
        ================================================ */}
        <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-[72px] rounded-[32px] sm:rounded-[48px] lg:rounded-[64px]">
            {/* ヘッダー */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-center text-text-primary leading-[1.5] font-['Rounded_Mplus_1c',sans-serif]">
                「なりたい自分」へのロードマップで、
                <br />
                デザインの楽しさをアップデートしよう
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-text-primary/80 text-center">
                今の自分にぴったりのスキルを選んで、トレーニングをスタート！
              </p>
            </div>

            {/* ゴールボタン3つ */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 mt-6">
              {GOAL_BUTTONS_DATA.map((goal) => (
                <GoalButton
                  key={goal.text}
                  icon={goal.icon}
                  text={goal.text}
                  href={goal.href}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================
            セクション4: Content Sections
        ================================================ */}

        {/* section-career */}
        <section id="section-career" className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon="✨"
              title="UIUX転職 キャリアチェンジしたい"
              description="ユーザーに受け入れられるUI体験のための、表現の&quot;ふつう&quot;の構築方法を学ぶよ"
            />

            {/* サブセクション: ロードマップ */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="ロードマップ"
                title="デザインスキルを獲得して転職を目指そう"
              />

              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* ロードマップカード */}
                {careerRoadmap ? (
                  <div className="flex-1">
                    <RoadmapCardV2
                      slug={careerRoadmap.slug.current}
                      title={careerRoadmap.title}
                      description={careerRoadmap.description}
                      thumbnailUrl={careerRoadmap.thumbnailUrl}
                      stepCount={careerRoadmap.stepCount}
                      estimatedDuration={careerRoadmap.estimatedDuration}
                      shortTitle={careerRoadmap.shortTitle}
                      gradientPreset={careerRoadmap.gradientPreset as GradientPreset}
                      variant="gradient"
                      orientation="vertical"
                      thumbnailStyle="wave"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[320px] bg-gray-100 rounded-[32px]">
                    <p className="text-gray-500">読み込み中...</p>
                  </div>
                )}

                {/* ガイドカード */}
                <Link to="/lessons/career-guide-uiux" className="flex-1 group">
                  <div className="bg-surface rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] border-2 border-white shadow-sm min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[140px] sm:h-[170px] lg:h-[209px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-gray-400 text-sm">サムネイル</span>
                    </div>
                    <div className="p-5 sm:p-6 lg:p-8">
                      <span className="text-[10px] sm:text-[11px] font-bold text-text-primary">ガイド</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">未経験からのUIUXデザイナー転職攻略ガイド</h3>
                      <p className="text-sm sm:text-base text-text-primary/80 mt-2">使いやすいUI体験をつくるための表現の基礎を身につけよう。</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <DottedDivider className="mx-4 sm:mx-8 lg:mx-14" />

            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="読みもの"
                title="お役立ちコンテンツ"
                showUnderline={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Link to="/guide/career-interviews" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">👩‍💻</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">メンバー</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">BONOで転職した人のインタビュー集</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">転職成功者の体験談と学習方法</p>
                    </div>
                  </div>
                </Link>

                <Link to="/feedback" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">💬</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">BONOサービス</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">フィードバックでコーチをつけて学習する</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">プロからのアドバイスで成長を加速</p>
                    </div>
                  </div>
                </Link>

                <Link to="/guide/member-outputs" className="group sm:col-span-2 lg:col-span-1">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">📝</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">メンバー</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">メンバーのアウトプットnote</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">学習の成果をアウトプットした記事集</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* section-ux */}
        <section id="section-ux" className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon="🔧"
              title="ユーザー課題を解決するデザインをはじめよう"
              description="なんのためにUIは必要か？それはユーザーが満足する「体験」のためです"
            />

            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="ロードマップ"
                title="デザインスキルを獲得して転職を目指そう"
              />

              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* ロードマップカード */}
                {uxRoadmap ? (
                  <div className="flex-1">
                    <RoadmapCardV2
                      slug={uxRoadmap.slug.current}
                      title={uxRoadmap.title}
                      description={uxRoadmap.description}
                      thumbnailUrl={uxRoadmap.thumbnailUrl}
                      stepCount={uxRoadmap.stepCount}
                      estimatedDuration={uxRoadmap.estimatedDuration}
                      shortTitle={uxRoadmap.shortTitle}
                      gradientPreset={uxRoadmap.gradientPreset as GradientPreset}
                      variant="gradient"
                      orientation="vertical"
                      thumbnailStyle="wave"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[320px] bg-gray-100 rounded-[32px]">
                    <p className="text-gray-500">読み込み中...</p>
                  </div>
                )}

                {/* レッスンカード */}
                <Link to="/lessons/ux-design-basics" className="flex-1 group">
                  <div className="bg-surface rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] border-2 border-white shadow-sm min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[140px] sm:h-[170px] lg:h-[209px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🎯</span>
                    </div>
                    <div className="p-5 sm:p-6 lg:p-8">
                      <span className="text-[10px] sm:text-[11px] font-bold text-text-primary">レッスン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">UXデザインってなに？</h3>
                      <p className="text-sm sm:text-base text-text-primary/80 mt-2">ユーザー体験をデザインする考え方の基礎</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <DottedDivider className="mx-4 sm:mx-8 lg:mx-14" />

            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="読みもの"
                title="お役立ちコンテンツ"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Link to="/lessons/information-architecture" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">📐</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">ゼロから始める情報設計</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>

                <Link to="/lessons/cx-design-basics" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🎨</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">顧客体験デザイン入門</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>

                <Link to="/lessons/user-interview-basics" className="group sm:col-span-2 lg:col-span-1">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🎤</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">ゼロから始めるユーザーインタビュー</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* section-ui */}
        <section id="section-ui" className="py-6 sm:py-8 px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-[1120px] mx-auto bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon="🛸"
              title="使いやすいUI体験を提案できるようになろう"
              description="ユーザーに受け入れられるUI体験のための、表現の&quot;ふつう&quot;の構築方法を学ぶよ"
            />

            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="ロードマップ"
                title="デザインスキルを獲得して転職を目指そう"
              />

              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* ロードマップカード */}
                {uiRoadmap ? (
                  <div className="flex-1">
                    <RoadmapCardV2
                      slug={uiRoadmap.slug.current}
                      title={uiRoadmap.title}
                      description={uiRoadmap.description}
                      thumbnailUrl={uiRoadmap.thumbnailUrl}
                      stepCount={uiRoadmap.stepCount}
                      estimatedDuration={uiRoadmap.estimatedDuration}
                      shortTitle={uiRoadmap.shortTitle}
                      gradientPreset={uiRoadmap.gradientPreset as GradientPreset}
                      variant="gradient"
                      orientation="vertical"
                      thumbnailStyle="wave"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[320px] bg-gray-100 rounded-[32px]">
                    <p className="text-gray-500">読み込み中...</p>
                  </div>
                )}

                {/* UIビジュアルロードマップカード */}
                {uiVisualRoadmap ? (
                  <div className="flex-1">
                    <RoadmapCardV2
                      slug={uiVisualRoadmap.slug.current}
                      title={uiVisualRoadmap.title}
                      description={uiVisualRoadmap.description}
                      thumbnailUrl={uiVisualRoadmap.thumbnailUrl}
                      stepCount={uiVisualRoadmap.stepCount}
                      estimatedDuration={uiVisualRoadmap.estimatedDuration}
                      shortTitle={uiVisualRoadmap.shortTitle}
                      gradientPreset={uiVisualRoadmap.gradientPreset as GradientPreset}
                      variant="gradient"
                      orientation="vertical"
                      thumbnailStyle="wave"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center min-h-[320px] bg-gray-100 rounded-[32px]">
                    <p className="text-gray-500">読み込み中...</p>
                  </div>
                )}
              </div>
            </div>

            <DottedDivider className="mx-4 sm:mx-8 lg:mx-14" />

            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="読みもの"
                title="お役立ちコンテンツ"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Link to="/lessons/ui-visual-basics" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🎨</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">ゼロから始めるUIビジュアル入門</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>

                <Link to="/lessons/design-cycle" className="group">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🔄</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">デザインが上手くなる「デザインサイクル」</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>

                <Link to="/lessons/ui-visual-foundation" className="group sm:col-span-2 lg:col-span-1">
                  <div className="bg-surface rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-4 border-white shadow-sm overflow-hidden transition-all group-hover:shadow-lg">
                    <div className="h-[140px] sm:h-[160px] lg:h-[180px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">✨</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-500">UIデザイン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">UIデザインビジュアル基礎</h3>
                      <p className="text-sm sm:text-base text-gray-500 mt-2">UI設計がラクになる3つの役割を知ろう</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
