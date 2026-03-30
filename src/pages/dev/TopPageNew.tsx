/**
 * トップページ新デザイン（Figma: PRD🏠_topUI_newBONO2026 node-id: 178-28863）
 *
 * セクション構成:
 * 1. Hero Section - キャッチコピー + CTAボタン
 * 2. Roadmap Cards - 4枚のロードマップカード
 * 3. Goal Selection - 3つのゴール選択ボタン
 * 4. Content Sections - キャリア / UX / UI の3セクション
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/common/SectionHeading";
import DottedDivider from "@/components/common/DottedDivider";

// ============================================
// 型定義
// ============================================

interface RoadmapCardMiniProps {
  slug: string;
  label: string;
  title: string;
  eyecatchUrl?: string;
  gradientStyle?: string;
}

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
    <div className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-[7px] bg-surface border border-text-primary rounded-full">
      <span className="text-[10px] sm:text-xs font-bold text-accent-orange">NEW!</span>
      <span className="text-[11px] sm:text-[13px] font-bold text-text-primary">{text}</span>
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
    "inline-flex items-center justify-center h-11 sm:h-14 px-4 sm:px-6 rounded-[14px] bg-cta-primary-bg text-white text-xs sm:text-sm font-bold tracking-wide shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-cta-primary-hover transition-colors w-full sm:w-auto";

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
      className="inline-flex items-center justify-center h-11 sm:h-14 px-4 sm:px-6 rounded-[14px] border border-text-primary text-text-primary text-xs sm:text-sm font-bold tracking-wide hover:bg-hover transition-colors w-full sm:w-auto"
    >
      {children}
    </Link>
  );
}

/** ロードマップカード（ミニ版・トップページ用） */
function RoadmapCardMini({
  slug,
  label,
  title,
  eyecatchUrl,
  gradientStyle = "linear-gradient(180deg, #110D49 11%, #773F6B 69%, #F5D7C7 95%)",
}: RoadmapCardMiniProps) {
  return (
    <Link
      to={`/roadmaps/${slug}`}
      className="block group flex-shrink-0 w-[200px] sm:w-[230px] lg:w-[263px]"
    >
      <div className="bg-surface border-4 border-white rounded-[28px] sm:rounded-[32px] lg:rounded-[40px] shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
        {/* ヘッダー部分 */}
        <div className="px-5 sm:px-6 lg:px-8 pt-4 sm:pt-5 lg:pt-6 pb-1">
          <div className="inline-flex items-center py-1 sm:py-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-label-olive">{label}</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-[22px] font-bold leading-[1.52] text-black">
            {title}
          </h3>
        </div>

        {/* アイキャッチ部分 */}
        <div
          className="h-[160px] sm:h-[180px] lg:h-[223px] rounded-lg mx-0 flex items-center justify-center overflow-hidden"
          style={{ background: gradientStyle }}
        >
          {eyecatchUrl ? (
            <img
              src={eyecatchUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/60 text-sm">Eyecatch</div>
          )}
        </div>
      </div>
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
// ロードマップデータ（仮データ）
// ============================================

const ROADMAP_CARDS_DATA = [
  {
    slug: "uiux-career-change",
    label: "ロードマップ",
    title: "UIUXデザイナーに転職する",
    gradientStyle:
      "linear-gradient(180deg, #110D49 11%, #773F6B 69%, #F5D7C7 95%)",
  },
  {
    slug: "information-architecture",
    label: "ロードマップ",
    title: "目的に沿った使いやすいUI提案",
    gradientStyle: "linear-gradient(180deg, #3d494e 0%, #696356 100%)",
  },
  {
    slug: "ux-design",
    label: "ロードマップ",
    title: "ユーザー課題を解決する",
    gradientStyle:
      "linear-gradient(180deg, #2f3f6d 8%, #66465f 24%, #e27979 68%, #f1bac1 100%)",
  },
  {
    slug: "ui-design-beginner",
    label: "ロードマップ",
    title: "UIデザインをはじめる",
    gradientStyle: "linear-gradient(180deg, #304750 0%, #5d5b65 100%)",
  },
];

const GOAL_BUTTONS_DATA = [
  { icon: "✨", text: "UIUXデザイナーに転職", href: "#section-career" },
  { icon: "🔧", text: "ユーザー課題を解決", href: "#section-ux" },
  { icon: "🛸", text: "使いやすいUIを提案", href: "#section-ui" },
];

// ============================================
// メインコンポーネント
// ============================================

export default function TopPageNew() {
  return (
    <Layout>
      <div className="min-h-screen bg-warm">
        {/* ================================================
            セクション1: Hero Section
        ================================================ */}
        <section className="pt-10 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="max-w-[1116px] mx-auto">
            {/* NEWバッジ */}
            <div className="mb-4 sm:mb-6">
              <NewBadge text="AIプロトタイピングコースがリリース！" />
            </div>

            {/* メインコンテンツ（モバイル: 1カラム、デスクトップ: 2カラム） */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-end mb-6 sm:mb-10">
              {/* 左: キャッチコピー */}
              <div className="lg:flex-1">
                <h1 className="text-[32px] sm:text-[40px] lg:text-[56px] font-bold leading-[1.32] text-text-primary font-noto-sans-jp">
                  はじめよう
                  <br />
                  キモチがうごく
                  <br />
                  ものづくり
                </h1>
              </div>

              {/* 右: 説明文 */}
              <div className="lg:flex-1">
                <p className="text-base sm:text-lg lg:text-[23px] leading-[1.6] text-text-primary">
                  ボノはユーザー価値から考えてデジタルプロダクトをつくりたい人向けのデザイントレーニングサービスです。
                </p>
              </div>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <CTAButtonPrimary href="https://www.bo-no.design/plan" external>
                メンバーになってはじめる
              </CTAButtonPrimary>
              <CTAButtonSecondary href="/roadmaps">
                ロードマップを見る
              </CTAButtonSecondary>
            </div>
          </div>
        </section>

        {/* ================================================
            セクション2: Roadmap Cards Section
        ================================================ */}
        <section className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-[1116px] mx-auto">
            {/* カード4枚を横並び */}
            <div className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6">
              {ROADMAP_CARDS_DATA.map((card) => (
                <RoadmapCardMini
                  key={card.slug}
                  slug={card.slug}
                  label={card.label}
                  title={card.title.replace(/\n/g, " ")}
                  gradientStyle={card.gradientStyle}
                />
              ))}
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
                <Link to="/roadmaps/uiux-career-change" className="flex-1 group">
                  <div className="bg-gradient-to-b from-[#1b1a2e] to-[#26202b] rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-2 sm:p-2.5 min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[180px] sm:h-[220px] lg:h-[280px] rounded-[24px] sm:rounded-[40px] lg:rounded-[52px] border border-white/10 shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] bg-gradient-to-b from-[#211f38] via-[#66465f] to-[#2e2734] flex items-center justify-center">
                      <span className="text-white/40 text-sm">サムネイル</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="inline-flex px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 border border-white rounded-full">
                        <span className="text-[10px] sm:text-[11px] font-bold text-white">ロードマップ</span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-[1.65] mb-2">UIUXデザイナー転職ロードマップ</h3>
                      <p className="text-sm sm:text-base text-white/80">ユーザーと目的から逆算して使いやすいUIデザインの構築方法を習得</p>
                    </div>
                  </div>
                </Link>

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
              title="ユーザー課題を解決する"
              description="UXデザインの考え方でユーザーの課題を発見し、解決策をデザインする方法を学ぶよ"
            />

            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="ロードマップ"
                title="UXデザインでユーザー中心の設計を身につけよう"
              />

              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* ロードマップカード */}
                <Link to="/roadmaps/ux-design" className="flex-1 group">
                  <div className="bg-gradient-to-b from-[#2f3f6d] via-[#66465f] to-[#f1bac1] rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-2 sm:p-2.5 min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[180px] sm:h-[220px] lg:h-[280px] rounded-[24px] sm:rounded-[40px] lg:rounded-[52px] border border-white/10 shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] flex items-center justify-center">
                      <span className="text-white/40 text-sm">サムネイル</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="inline-flex px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 border border-white rounded-full">
                        <span className="text-[10px] sm:text-[11px] font-bold text-white">ロードマップ</span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-[1.65] mb-2">UXデザインロードマップ</h3>
                      <p className="text-sm sm:text-base text-white/80">ユーザー理解から課題解決までのプロセスを習得</p>
                    </div>
                  </div>
                </Link>

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
          </div>
        </section>

        {/* section-ui */}
        <section id="section-ui" className="py-6 sm:py-8 px-4 sm:px-6 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-[1120px] mx-auto bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
            <GoalSectionHeader
              icon="🛸"
              title="使いやすいUIをデザインする"
              description="情報設計とUIパターンを理解して、使いやすいUIを提案できるようになろう"
            />

            <div className="px-4 sm:px-8 lg:px-14 py-10 sm:py-12 lg:py-16">
              <SectionHeading
                label="ロードマップ"
                title="情報設計でUIの使いやすさをデザインしよう"
              />

              <div className="flex flex-col lg:flex-row gap-4 mt-6">
                {/* ロードマップカード */}
                <Link to="/roadmaps/information-architecture" className="flex-1 group">
                  <div className="bg-gradient-to-b from-[#3d494e] to-[#696356] rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-2 sm:p-2.5 min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[180px] sm:h-[220px] lg:h-[280px] rounded-[24px] sm:rounded-[40px] lg:rounded-[52px] border border-white/10 shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] flex items-center justify-center">
                      <span className="text-white/40 text-sm">サムネイル</span>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="inline-flex px-2.5 sm:px-3 py-1 sm:py-1.5 mb-2 border border-white rounded-full">
                        <span className="text-[10px] sm:text-[11px] font-bold text-white">ロードマップ</span>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-[1.65] mb-2">情報設計ロードマップ</h3>
                      <p className="text-sm sm:text-base text-white/80">OOUIとナビゲーション設計の基本を習得</p>
                    </div>
                  </div>
                </Link>

                {/* レッスンカード */}
                <Link to="/lessons/ui-information-design" className="flex-1 group">
                  <div className="bg-surface rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] border-2 border-white shadow-sm min-h-[320px] sm:min-h-[360px] lg:min-h-[400px] overflow-hidden transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
                    <div className="h-[140px] sm:h-[170px] lg:h-[209px] bg-[#f5f5f4] rounded-[20px] sm:rounded-[28px] lg:rounded-[32px] flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl">🧩</span>
                    </div>
                    <div className="p-5 sm:p-6 lg:p-8">
                      <span className="text-[10px] sm:text-[11px] font-bold text-text-primary">レッスン</span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-[1.6] mt-1">ゼロからはじめるUI情報設計</h3>
                      <p className="text-sm sm:text-base text-text-primary/80 mt-2">使いやすいUIの構造とナビゲーションを学ぶ</p>
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
