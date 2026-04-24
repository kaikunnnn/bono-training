import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CategoryNav from "@/components/common/CategoryNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuides } from "@/hooks/useGuides";
import { GUIDE_CATEGORIES, getCategoryInfo } from "@/lib/guideCategories";
import type { Guide } from "@/types/guide";

const CATEGORY_NAV_ITEMS = [
  { label: "すべて", href: "/dev/guide-patterns" },
  ...GUIDE_CATEGORIES.map((cat) => ({
    label: cat.label,
    href: `/dev/guide-patterns?category=${cat.id}`,
  })),
];

/* ────────────────────────────────────────
   パターン1: 横並びリスト型（Figma 60:962）
   コンテンツ幅960px / サムネイル左262×146 + テキスト右
   ──────────────────────────────────────── */
const Pattern1Card = ({ guide }: { guide: Guide }) => {
  const categoryInfo = getCategoryInfo(guide.category);
  return (
    <Link to={`/library/${guide.slug}`} className="group flex gap-6 items-center">
      <div className="w-[262px] h-[146px] rounded-[17px] overflow-hidden bg-[#e8e8e8] shrink-0">
        {guide.thumbnailUrl ? (
          <img
            src={guide.thumbnailUrl}
            alt={guide.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/30 uppercase">
              Guide Article
            </span>
            <p className="text-[12px] font-bold text-foreground/50 text-center px-4 line-clamp-2 leading-snug">
              {guide.title}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-[#6b7280] leading-5">
            {categoryInfo?.label ?? guide.category}
          </span>
          <h3 className="text-[18px] font-bold leading-[25.2px] text-[#1a1a1a] line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
            {guide.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex items-center justify-center border border-border">
            <span className="text-[8px] font-bold text-foreground/50">
              {guide.author.charAt(0)}
            </span>
          </div>
          <span className="text-[13px] font-medium text-[#151619] leading-5">
            {guide.author}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ────────────────────────────────────────
   パターン2: 縦積みカード型（Figma 41:368）
   サムネイル上 aspect 340:206 + 説明文あり
   ──────────────────────────────────────── */
const Pattern2Card = ({ guide }: { guide: Guide }) => {
  const categoryInfo = getCategoryInfo(guide.category);
  return (
    <Link to={`/library/${guide.slug}`} className="group flex flex-col gap-5">
      <div className="w-full aspect-[340/206] rounded-3xl overflow-hidden bg-[#e8e8e8]">
        {guide.thumbnailUrl ? (
          <img
            src={guide.thumbnailUrl}
            alt={guide.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e6e6ef] via-[#ede9f5] to-[#faf2ed]">
            <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/30 uppercase">
              Guide Article
            </span>
            <p className="text-[13px] font-bold text-foreground/50 text-center px-6 line-clamp-2 leading-snug">
              {guide.title}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-[#6b7280] leading-5">
            {categoryInfo?.label ?? guide.category}
          </span>
          <h3 className="text-[18px] font-bold leading-[25.2px] text-[#1a1a1a] line-clamp-2 group-hover:opacity-70 transition-opacity duration-200">
            {guide.title}
          </h3>
        </div>
        <p className="text-[14px] leading-[22.4px] text-[#666] line-clamp-2">
          {guide.description}
        </p>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-white overflow-hidden flex items-center justify-center border border-border">
            <span className="text-[8px] font-bold text-foreground/50">
              {guide.author.charAt(0)}
            </span>
          </div>
          <span className="text-[13px] font-medium text-[#151619] leading-5">
            {guide.author}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ────────────────────────────────────────
   メインページ
   /guideのレイアウトを再現 + パターン切替
   ──────────────────────────────────────── */
const GuidePatterns = () => {
  const { data: guides, isLoading } = useGuides();
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  const DUMMY_GUIDES: Guide[] = [
    { _id: "d1", title: "解像度が低い分野を詳しくなりたい時の進め方", description: "UI/UXデザインの定義、Webデザインとの違い、仕事内容の具体例、市場動向です。UI/UXデザイナーとして働くために必要なスキルは大きく3つに分類されます。", slug: "d1", category: "career", tags: [], author: "カイクン", publishedAt: "2026-04-20T00:00:00Z", isPremium: false },
    { _id: "d2", title: "UIデザイナーとして転職するためのポートフォリオの作り方", description: "採用担当者が見ているポイントを押さえた、実践的なポートフォリオ構成のガイドです。", slug: "d2", category: "career", tags: [], author: "カイクン", publishedAt: "2026-04-18T00:00:00Z", isPremium: false },
    { _id: "d3", title: "デザインの独学で挫折しないための3つの習慣", description: "独学でデザインを学ぶ際に陥りがちな罠と、継続するためのコツを紹介します。", slug: "d3", category: "learning", tags: [], author: "カイクン", publishedAt: "2026-04-15T00:00:00Z", isPremium: false },
    { _id: "d4", title: "Figmaを使いこなすための実践テクニック集", description: "Auto Layout、コンポーネント、バリアントなど、実務で差がつくFigmaの使い方を解説。", slug: "d4", category: "tools", tags: [], author: "カイクン", publishedAt: "2026-04-12T00:00:00Z", isPremium: false },
    { _id: "d5", title: "UXデザインプロセスの全体像を理解する", description: "リサーチからプロトタイピングまで、UXデザインの各フェーズで何をすべきかを整理します。", slug: "d5", category: "learning", tags: [], author: "カイクン", publishedAt: "2026-04-10T00:00:00Z", isPremium: false },
    { _id: "d6", title: "AI時代にデザイナーが身につけるべきスキル", description: "生成AIの台頭でデザイナーの役割はどう変わるのか、今から準備すべきことを考えます。", slug: "d6", category: "industry", tags: [], author: "カイクン", publishedAt: "2026-04-08T00:00:00Z", isPremium: false },
    { _id: "d7", title: "SaaSプロダクトのUI設計で大事な考え方", description: "BtoBのSaaSプロダクトにおけるUIの複雑性をどう扱うか、実例をもとに解説します。", slug: "d7", category: "industry", tags: [], author: "カイクン", publishedAt: "2026-04-05T00:00:00Z", isPremium: false },
    { _id: "d8", title: "未経験からUIUXデザイナーになるロードマップ", description: "何から始めればいいかわからない人向けに、段階的な学習計画を提案します。", slug: "d8", category: "career", tags: [], author: "カイクン", publishedAt: "2026-04-03T00:00:00Z", isPremium: false },
    { _id: "d9", title: "デザインレビューを効果的に行うためのフレームワーク", description: "チームでのデザインレビューをより建設的にするための仕組みと心構えを紹介します。", slug: "d9", category: "learning", tags: [], author: "カイクン", publishedAt: "2026-04-01T00:00:00Z", isPremium: false },
    { _id: "d10", title: "情報設計の基本：ユーザーが迷わないUIの作り方", description: "IA（情報アーキテクチャ）の基本原則から、実際のナビゲーション設計への応用まで。", slug: "d10", category: "tools", tags: [], author: "カイクン", publishedAt: "2026-03-28T00:00:00Z", isPremium: false },
    { _id: "d11", title: "Webデザイナーからプロダクトデザイナーへの転身術", description: "Web制作とプロダクトデザインの違いを理解し、スムーズにキャリアチェンジするための方法。", slug: "d11", category: "career", tags: [], author: "カイクン", publishedAt: "2026-03-25T00:00:00Z", isPremium: false },
    { _id: "d12", title: "デザインシステム構築の始め方ガイド", description: "小さなチームでも始められるデザインシステムの構築手順とトークン設計の考え方。", slug: "d12", category: "tools", tags: [], author: "カイクン", publishedAt: "2026-03-22T00:00:00Z", isPremium: false },
  ];

  // Sanity実データ + ダミーで12件に補完
  const displayGuides: Guide[] = React.useMemo(() => {
    const real = guides ?? [];
    if (real.length >= 12) return real;
    const needed = 12 - real.length;
    return [...real, ...DUMMY_GUIDES.slice(0, needed)];
  }, [guides]);

  return (
    <Layout>
      {/* ヒーロー（/guideと同じ） */}
      <section className="px-6 pt-16 pb-10 max-w-[960px] mx-auto">
        <h1 className="text-4xl font-bold font-rounded-mplus mb-4">ガイド</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
          デザインスキルを身につける上でのヒントになる記事置き場です💡何か書いて欲しい内容があれば質問で教えてください🙆
        </p>
      </section>

      {/* パターン切り替え（右上固定） */}
      <div className="fixed top-20 right-4 z-50 bg-white/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1 flex gap-1">
        <button
          onClick={() => setActiveTab(1)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 1
              ? "bg-foreground text-white"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          P1: リスト型
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 2
              ? "bg-foreground text-white"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          P2: カード型
        </button>
      </div>

      {/* カテゴリナビ（/guideと同じ） */}
      <div className="px-6 max-w-[960px] mx-auto mt-6">
        <CategoryNav items={CATEGORY_NAV_ITEMS} searchParamKey="category" />
      </div>

      {/* 記事一覧 */}
      <section className="px-6 py-10 max-w-[960px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-video rounded-3xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : activeTab === 1 ? (
          /* パターン1: 横並びリスト */
          <div className="flex flex-col gap-5">
            {displayGuides.map((guide) => (
              <Pattern1Card key={guide._id} guide={guide} />
            ))}
          </div>
        ) : (
          /* パターン2: 縦積みカード（グリッド） */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayGuides.map((guide) => (
              <Pattern2Card key={guide._id} guide={guide} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default GuidePatterns;
