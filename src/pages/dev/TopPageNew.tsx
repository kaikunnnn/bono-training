/**
 * トップ新デザイン（Figma: PRD🏠_topUI_newBONO2026 node-id: 178-28863）
 *
 * セクション構成:
 * 1. Hero Section - キャッチコピー + CTAボタン
 * 2. Roadmap Cards - 4枚のロードマップカード
 * 3. Goal Selection - 3つのゴール選択ボタン
 * 4. Content Sections - キャリア / UX / UI の3セクション
 */

import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { useLessons, type SanityLesson } from "@/hooks/useLessons";
import { urlFor } from "@/lib/sanity";
import { cn } from "@/lib/utils";
import { type Lesson } from "@/types/lesson";
import RoadmapCardV2 from "@/components/roadmap/RoadmapCardV2";
import type { GradientPreset } from "@/components/roadmap/RoadmapCardV2";
import TrainingCard, { TRAINING_CARDS_DATA } from "@/components/top/TrainingCard";
import LessonCard from "@/components/lessons/LessonCard";
import GoalButton, { type GoalButtonData } from "@/components/top/GoalButton";
import { GOAL_FLUENT_ICONS } from "@/components/top/goalFluentIcons";
import ContentCard, { type ContentCardProps } from "@/components/top/ContentCard";

// ============================================
// 型定義
// ============================================

// ============================================
// アニメーション設定
// ============================================

// ページ表示時のアニメーション（スケール＋フェードイン＋バウンス）
const PATTERN2_ANIMATION = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
};

// トレーニングカード用アニメーション（右から左にスライド＋ポップアップ）
const CARD_SLIDE_ANIMATION = {
  initial: { opacity: 0, scale: 0.9, x: 100 },
  animate: { opacity: 1, scale: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
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
      className="inline-flex items-center justify-center h-14 px-[25px] py-px rounded-[14px] border-2 border-[#0f172a] text-[#0f172a] text-sm font-bold leading-5 tracking-[0.35px] text-center hover:bg-[#0f172a] hover:text-white transition-all duration-300 w-full sm:w-auto sm:min-w-[154px]"
    >
      {children}
    </Link>
  );
}



/** セクションヘッダー（ゴール別セクション用） */
function GoalSectionHeader({
  icon,
  iconSrc,
  iconAlt,
  title,
  description,
}: {
  icon: string;
  iconSrc?: string;
  iconAlt?: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 py-10 sm:py-12 lg:pt-12 lg:pb-[56px] px-4 sm:px-8 lg:px-22 border-b border-[#d6d6d6]">
      <div className="flex h-8 w-8 items-center justify-center sm:h-9 sm:w-9 lg:h-[42px] lg:w-[42px]">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={iconAlt ?? ""}
            className="h-full w-full object-contain select-none"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <span className="text-[32px] leading-none sm:text-[36px] lg:text-[42px]">{icon}</span>
        )}
      </div>
      <h2 className="flex flex-col items-center gap-y-2 sm:gap-y-3 text-xl sm:text-2xl lg:text-[32px] font-extrabold text-center text-text-primary leading-[132%] font-['Rounded_Mplus_1c',sans-serif]">
        {title}
      </h2>
      <p className="flex flex-col items-center gap-y-2 sm:gap-y-2.5 text-base sm:text-lg lg:text-xl text-center text-text-primary/80 leading-[1.66]">
        {description}
      </p>
    </div>
  );
}

// ============================================
// ゴールボタンデータ
// ============================================

/** ゴールボタン（3つ）— `GOAL_FLUENT_ICONS` と同じアセット */
const GOAL_BUTTONS_DATA: GoalButtonData[] = [
  {
    icon: GOAL_FLUENT_ICONS.career.emoji,
    iconSrc: GOAL_FLUENT_ICONS.career.src,
    iconAlt: GOAL_FLUENT_ICONS.career.alt,
    text: "UIUXデザイナーに転職",
    href: "#section-career",
  },
  {
    icon: GOAL_FLUENT_ICONS.ux.emoji,
    iconSrc: GOAL_FLUENT_ICONS.ux.src,
    iconAlt: GOAL_FLUENT_ICONS.ux.alt,
    text: "ユーザー課題を解決",
    href: "#section-ux",
  },
  {
    icon: GOAL_FLUENT_ICONS.ui.emoji,
    iconSrc: GOAL_FLUENT_ICONS.ui.src,
    iconAlt: GOAL_FLUENT_ICONS.ui.alt,
    text: "使いやすいUIを提案",
    href: "#section-ui",
  },
];

// ============================================
// コンテンツカードデータ
// ============================================

/** キャリアセクション: ガイドカード */
const CAREER_GUIDE_CARD: ContentCardProps = {
  href: 'https://kaikun.bo-no.design/career/beginner',
  external: true,
  label: 'ガイド',
  title: '未経験からのUIUXデザイナー転職攻略ガイド',
  description: '使いやすいUI体験をつくるための表現の基礎を身につけよう。',
  thumbnailSrc: '/images/content/career/career-guide.jpg',
  thumbnailAlt: 'キャリアガイド',
  fallbackEmoji: '📚',
  variant: 'large',
};

/** キャリアセクション: 読みものカード（3つ） */
const CAREER_CONTENT_CARDS: ContentCardProps[] = [
  {
    href: 'https://www.bo-no.design/rdm/users/all',
    external: true,
    label: 'メンバー',
    title: 'BONOで転職した人のインタビュー集',
    description: '転職成功者の体験談と学習方法',
    thumbnailSrc: '/images/content/career/interviews.png',
    thumbnailAlt: '転職インタビュー',
    fallbackEmoji: '👩‍💻',
  },
  {
    href: 'https://takumikai.notion.site/7f32157367744c84b5cd3a61cdf55716?source=copy_link',
    external: true,
    label: 'BONOサービス',
    title: 'フィードバックでコーチをつけて学習する',
    description: 'プロからのアドバイスで成長を加速',
    thumbnailSrc: '/images/content/career/feedback.png',
    thumbnailAlt: 'フィードバックサービス',
    fallbackEmoji: '💬',
  },
  {
    href: 'https://note.com/design_school/m/m5f641069767f',
    external: true,
    label: 'メンバー',
    title: 'メンバーのアウトプットnote',
    description: '学習の成果をアウトプットした記事集',
    thumbnailSrc: '/images/content/career/outputs.png',
    thumbnailAlt: 'アウトプット集',
    fallbackEmoji: '📝',
    className: 'sm:col-span-2 lg:col-span-1',
  },
];

// ============================================
// ヘルパー関数
// ============================================

/**
 * SanityLessonをLesson型に変換
 */
function convertSanityLessonToLesson(sanityLesson: SanityLesson): Lesson {
  const categoryValue =
    typeof sanityLesson.category === "string"
      ? sanityLesson.category
      : sanityLesson.categoryTitle || "";

  const thumbnailUrl =
    sanityLesson.iconImageUrl ||
    (sanityLesson.iconImage
      ? urlFor(sanityLesson.iconImage).width(216).height(326).url()
      : null) ||
    sanityLesson.thumbnailUrl ||
    (sanityLesson.thumbnail
      ? urlFor(sanityLesson.thumbnail).width(600).height(450).url()
      : null) ||
    "";

  return {
    id: sanityLesson._id,
    title: sanityLesson.title,
    description: sanityLesson.description || "",
    category: categoryValue,
    thumbnail: thumbnailUrl,
    slug: sanityLesson.slug.current,
    linkedRoadmaps: sanityLesson.linkedRoadmaps || [],
  };
}

// ============================================
// メインコンポーネント
// ============================================

export default function TopPageNew() {
  const navigate = useNavigate();

  // Sanityからロードマップデータを取得（セクション4で使用）
  const { data: roadmaps } = useRoadmaps();

  // Sanityからレッスンデータを取得
  const { data: sanityLessons } = useLessons();

  // 特定slugのロードマップを取得するヘルパー
  const getRoadmapBySlug = (slug: string) =>
    roadmaps?.find((rm) => rm.slug.current === slug);

  // 各セクション用のロードマップ
  const careerRoadmap = getRoadmapBySlug("uiux-career-change");
  const uxRoadmap = getRoadmapBySlug("ux-design-basic");
  const uiRoadmap = getRoadmapBySlug("information-architecture");
  const uiVisualRoadmap = getRoadmapBySlug("ui-visual");

  // section-ux用のレッスン（ユーザー課題を解決する）
  const uxSectionLessons = useMemo(() => {
    if (!sanityLessons) return [];

    // タイトルの部分一致でフィルタリング（Lessons.tsxと同じロジック）
    const titlePatterns = ['ゼロからはじめるUI情報設計', '顧客体験デザイン', 'ユーザーインタビュー'];
    return sanityLessons
      .filter(l => titlePatterns.some(pattern => l.title.includes(pattern)))
      .slice(0, 3)
      .map(convertSanityLessonToLesson);
  }, [sanityLessons]);

  // section-ui用のレッスン（使いやすいUI体験）
  const uiSectionLessons = useMemo(() => {
    if (!sanityLessons) return [];

    // タイトルの部分一致でフィルタリング（Lessons.tsxと同じロジック）
    const titlePatterns = ['UIビジュアル基礎', 'デザインサイクル', 'UIビジュアル'];
    return sanityLessons
      .filter(l => titlePatterns.some(pattern => l.title.includes(pattern)))
      .slice(0, 3)
      .map(convertSanityLessonToLesson);
  }, [sanityLessons]);

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
          <div className="relative h-auto min-h-[1050px] sm:min-h-[1150px] lg:h-[1186px]">
            {/* 上部: NEWバッジ + キャッチコピー + CTAボタン */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-[950px] flex flex-col items-center gap-8 px-4 sm:px-6 lg:px-0 pt-2 sm:pt-12 pb-0 mb-0">
              {/* コンテンツグループ */}
              <div className="flex flex-col items-center gap-8">
                {/* NEWバッジ */}
                <motion.div
                  initial={PATTERN2_ANIMATION.initial}
                  animate={PATTERN2_ANIMATION.animate}
                  transition={{ ...PATTERN2_ANIMATION.transition, delay: 0 }}
                  className="mt-8 sm:mt-12 lg:mt-0"
                >
                  <NewBadge
                    text='AI時代に活きる「デザインの進め方」をリリース'
                    href={DESIGN_CYCLE_LESSON_HREF}
                  />
                </motion.div>

                {/* メインキャッチコピー + サブキャッチコピー */}
                <div className="flex flex-col items-center gap-4 text-center leading-none">
                  {/* メインキャッチコピー */}
                  <motion.h1
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
                    initial={PATTERN2_ANIMATION.initial}
                    animate={PATTERN2_ANIMATION.animate}
                    transition={{ ...PATTERN2_ANIMATION.transition, delay: 0.3 }}
                    className="w-full max-w-[681px] px-4 font-noto-sans-jp text-base sm:text-xl text-[#0f172a] leading-[188%]"
                  >
                    <p className="mb-0">ボノはユーザー起点で未来のワクワクを</p>
                    <p className="mb-0">
                      "つくる"力を磨く<span className="font-bold">デザイントレーニングサービス</span>です。
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* CTAボタン */}
              <motion.div
                initial={PATTERN2_ANIMATION.initial}
                animate={PATTERN2_ANIMATION.animate}
                transition={{ ...PATTERN2_ANIMATION.transition, delay: 0.45 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center"
              >
                <CTAButtonPrimary href="https://www.bo-no.design/plan" external>
                  メンバーになってはじめる
                </CTAButtonPrimary>
                <CTAButtonSecondary href="/roadmaps">
                  ロードマップへ
                </CTAButtonSecondary>
              </motion.div>
            </div>

            {/* 下部: トレーニングカード（absolute配置） */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[550px] lg:top-[540px] w-full">
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
                    className={`flex gap-5 min-w-max pt-5 pb-7 px-8 sm:px-12 -ml-8 sm:-ml-12 ${
                      !shouldCenterCards
                        ? 'lg:px-[120px] lg:-ml-[88px]'
                        : 'lg:pl-0 lg:pr-[120px] lg:ml-0'
                    }`}
                    style={{
                      justifyContent: shouldCenterCards ? 'center' : 'flex-start',
                    }}
                  >
                    {TRAINING_CARDS_DATA.map((cardData, index) => (
                      <motion.div
                        key={cardData.id}
                        initial={CARD_SLIDE_ANIMATION.initial}
                        animate={CARD_SLIDE_ANIMATION.animate}
                        transition={{
                          ...CARD_SLIDE_ANIMATION.transition,
                          delay: 0.6 + index * 0.12,
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
            セクション2: Partnership Section
        ================================================ */}
        <section className="-mt-[32px] py-6 px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2">
            <p className="text-[13px] font-bold text-[rgba(41,53,37,0.8)] leading-[27px] whitespace-nowrap">
              キャリアパートナーシップ
            </p>
            <a
              href="https://beauty.gmo/recruit-design/"
              target="_blank"
              rel="noopener noreferrer"
              className="block h-[61px] w-[149px] shrink-0 rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
              aria-label="GMOビューティー デザイン採用サイト（新しいタブで開く）"
            >
              <img
                src="/images/partners/gmo-beauty.png"
                alt="GMO BEAUTY"
                className="h-full w-full rounded-none object-cover"
              />
            </a>
          </div>
        </section>

        {/* ================================================
            セクション3: Goal Selection Section
        ================================================ */}
        <section className="flex flex-col items-center justify-start px-0 py-0">
          <div className="w-full max-w-[1120px] mx-0 h-fit bg-white px-4 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-[72px] rounded-[32px] sm:rounded-[48px] lg:rounded-[64px]">
            {/* ヘッダー */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-center text-text-primary leading-[1.5] font-['Rounded_Mplus_1c',sans-serif]">
                「なりたいゴール」で
                <br />
                デザインをはじめよう
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
                  iconSrc={goal.iconSrc}
                  iconAlt={goal.iconAlt}
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
        <section id="section-career" className="py-6 sm:py-8 mx-4">
          <div className="bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] pt-6 pb-6">
            <GoalSectionHeader
              icon={GOAL_FLUENT_ICONS.career.emoji}
              iconSrc={GOAL_FLUENT_ICONS.career.src}
              iconAlt={GOAL_FLUENT_ICONS.career.alt}
              title={
                <>
                  <span className="block">UIUXデザイナーに転職</span>
                  <span className="block">キャリアチェンジ</span>
                </>
              }
              description={
                <>
                  <span className="block">ユーザーに受け入れられるUI体験のための、</span>
                  <span className="block">表現の&quot;ふつう&quot;の構築方法を学ぶよ</span>
                </>
              }
            />

            <div className="max-w-[1120px] mx-auto">
              {/* サブセクション: ロードマップ */}
              <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-12">
              <SectionHeading
                label="ロードマップ"
                title="UIUXデザイナー転職をはじめよう"
                showUnderline={false}
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
                <div className="flex-1">
                  <ContentCard {...CAREER_GUIDE_CARD} />
                </div>
              </div>
            </div>
            </div>

            <div className="max-w-[1120px] mx-auto">
              <div className="px-4 sm:px-8 lg:px-14">
                <DottedDivider />
              </div>
            </div>

            <div className="max-w-[1120px] mx-auto">
            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-12">
              <SectionHeading
                label="読みもの"
                title="転職の参考になるコンテンツ"
                showUnderline={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {CAREER_CONTENT_CARDS.map((card) => (
                  <ContentCard key={card.href} {...card} />
                ))}
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* section-ux */}
        <section id="section-ux" className="py-6 sm:py-8">
          <div className="bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon={GOAL_FLUENT_ICONS.ux.emoji}
              iconSrc={GOAL_FLUENT_ICONS.ux.src}
              iconAlt={GOAL_FLUENT_ICONS.ux.alt}
              title={
                <>
                  <span className="block">ユーザー課題を解決する</span>
                  <span className="block">デザインをはじめる</span>
                </>
              }
              description={
                <>
                  <span className="block">なんのためにUIは必要か？</span>
                  <span className="block">それはユーザーが満足する「体験」のためです</span>
                </>
              }
            />

            <div className="max-w-[1120px] mx-auto">
              {/* サブセクション: ロードマップ */}
              <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-8">
              <SectionHeading
                label="ロードマップ"
                title="課題解決スキルを獲得しよう"
                showUnderline={false}
              />

              {/* 横型ロードマップカード */}
              {uxRoadmap ? (
                <div className="mt-6">
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
                    orientation="horizontal"
                    thumbnailStyle="wave"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[320px] bg-gray-100 rounded-[32px] mt-6">
                  <p className="text-gray-500">読み込み中...</p>
                </div>
              )}
            </div>
            </div>

            <div className="max-w-[1120px] mx-auto">
              <div className="px-4 sm:px-8 lg:px-14">
                <DottedDivider />
              </div>
            </div>

            <div className="max-w-[1120px] mx-auto">
            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-12">
              <SectionHeading
                label="読みもの"
                title="UXリサーチと要件定義を習得しよう"
                showUnderline={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                {uxSectionLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    onClick={() => navigate(`/lessons/${lesson.slug}`)}
                  />
                ))}
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* section-ui */}
        <section id="section-ui" className="py-6 sm:py-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon={GOAL_FLUENT_ICONS.ui.emoji}
              iconSrc={GOAL_FLUENT_ICONS.ui.src}
              iconAlt={GOAL_FLUENT_ICONS.ui.alt}
              title={
                <>
                  <span className="block">使いやすいUI体験を</span>
                  <span className="block">提案できるようになろう</span>
                </>
              }
              description={
                <>
                  <span className="block">ユーザーに受け入れられるUI体験のための、</span>
                  <span className="block">表現の&quot;ふつう&quot;の構築方法を学ぶよ</span>
                </>
              }
            />

            <div className="max-w-[1120px] mx-auto">
              <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-12">
              <SectionHeading
                label="ロードマップ"
                title="UIデザインの基本を体系的に習得しよう"
                showUnderline={false}
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
            </div>

            <div className="max-w-[1120px] mx-auto">
              <div className="px-4 sm:px-8 lg:px-14">
                <DottedDivider />
              </div>
            </div>

            <div className="max-w-[1120px] mx-auto">
            {/* サブセクション: 読みもの */}
            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-12">
              <SectionHeading
                label="読みもの"
                title="UIデザインの原則・進め方を学ぼう"
                showUnderline={false}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                {uiSectionLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.slug}
                    lesson={lesson}
                    onClick={() => navigate(`/lessons/${lesson.slug}`)}
                  />
                ))}
              </div>
            </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
