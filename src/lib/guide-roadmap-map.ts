/**
 * 記事ページの BONO 紹介ブロック（#280）の出し分け表と文言。
 *
 * - /guide 記事 → どのロードマップを案内するか（基本は転職ロードマップ、合わない記事だけ例外で指定）
 * - ロードマップごとの呼び名・テーマ・説明1文（Sanity のタイトルは「|」区切りの見出し用で、そのまま使えないためコードで持つ）
 * - ロードマップの説明・ステップ数・サムネ・期間は Sanity の値を使う（数字をここに二重に持たない）
 *
 * 純粋な関数と定数だけ（Server / Client どちらからも import 可）。Sanity の取得は guide-promo-data.ts。
 */
import type { GradientPreset } from "@/styles/gradients";
import type { SanityRoadmapListItem } from "@/types/sanity-roadmap";
import { AVAILABLE_PLANS } from "@/lib/subscription-utils";

export const CAREER_ROADMAP_SLUG = "uiux-career-change";
const UX_ROADMAP_SLUG = "ux-design-basic";
const UI_VISUAL_ROADMAP_SLUG = "ui-visual";

/** 一覧にないガイドはこれ（転職ロードマップ） */
export const DEFAULT_GUIDE_ROADMAP_SLUG = CAREER_ROADMAP_SLUG;

/**
 * 転職ロードマップが合わないガイドだけ指定する。null は「紹介ブロックを出さない」。
 * キーは /guide/[slug] の slug。
 */
export const GUIDE_ROADMAP_OVERRIDES: Readonly<Record<string, string | null>> = {
  // UXスキル: ユーザー理解がUIデザインを変える — 初心者が身につけるべきUXスキルの全体像
  uxresearch_and_uidesign: UX_ROADMAP_SLUG,
  // PM提案: プロダクトデザイナーの提案がPMに通らないときの考え方
  "designer-proposal-after-mvp-marketing": UX_ROADMAP_SLUG,
  // 参考デザイン整理アプリ（Eagle）
  "design-reference-eagle": UI_VISUAL_ROADMAP_SLUG,
  // リニューアルのブログ
  "renewal-2026": null,
};

interface RoadmapPromoCopy {
  /** 冒頭カードの名前（例: 転職ロードマップ） */
  name: string;
  /** /guide 最後のブロックの見出し「{theme}、順番に学ぶなら」 */
  theme: string;
  /** 見出し下の説明1文 */
  lead: (stepCount: number) => string;
}

export const ROADMAP_PROMO_COPY: Readonly<Record<string, RoadmapPromoCopy>> = {
  [CAREER_ROADMAP_SLUG]: {
    name: "転職ロードマップ",
    theme: "転職に必要なことを",
    lead: (n) =>
      `転職ロードマップは、UIの基礎から情報設計・UXデザイン・ポートフォリオづくりまでを、${n}つのステップで順番に進める学びの道筋です。`,
  },
  [UX_ROADMAP_SLUG]: {
    name: "UXデザインのロードマップ",
    theme: "UXデザインを",
    lead: (n) =>
      `UXデザインのロードマップは、ユーザーを理解して課題を見つけ、解決策をUIにするまでを、${n}つのステップで順番に進める学びの道筋です。`,
  },
  [UI_VISUAL_ROADMAP_SLUG]: {
    name: "見た目のきほんロードマップ",
    theme: "見た目のきほんを",
    lead: (n) =>
      `見た目のきほんロードマップは、UIデザインを体験するところから、デザインの進め方と基礎要素を身につけて実際にデザインするまでを、${n}つのステップで順番に進める学びの道筋です。`,
  },
};

/** 紹介ブロックに渡すロードマップ（Sanity の値＋コードの文言） */
export interface PromoRoadmap {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  thumbnailUrl?: string;
  gradientPreset?: GradientPreset;
  estimatedDuration: string;
  stepCount: number;
  name: string;
  theme: string;
  lead: string;
}

/** 料金の1行（AVAILABLE_PLANS の一番安い月額から作る。価格をここに二重に持たない） */
export const PROMO_PRICE_LINE = `月${Math.min(
  ...AVAILABLE_PLANS.map((p) => p.pricePerMonth)
).toLocaleString("ja-JP")}円から`;

/** ガイドの slug → 案内するロードマップの slug（出さないなら null） */
export function getGuideRoadmapSlug(guideSlug: string): string | null {
  if (Object.prototype.hasOwnProperty.call(GUIDE_ROADMAP_OVERRIDES, guideSlug)) {
    return GUIDE_ROADMAP_OVERRIDES[guideSlug];
  }
  return DEFAULT_GUIDE_ROADMAP_SLUG;
}

/**
 * Sanity のロードマップ一覧から、案内に使うロードマップを解決する。
 * 見つからない・非公開・ステップ数0・文言未定義のときは null（ページは壊さず、ログを残す）。
 */
export function resolvePromoRoadmap(
  roadmapSlug: string,
  roadmaps: readonly SanityRoadmapListItem[]
): PromoRoadmap | null {
  const copy = ROADMAP_PROMO_COPY[roadmapSlug];
  if (!copy) {
    console.error("[guide-promo] no promo copy for roadmap", { roadmapSlug });
    return null;
  }
  const item = roadmaps.find((r) => r.slug?.current === roadmapSlug);
  if (!item || item.isPublished === false || !item.stepCount) {
    console.error("[guide-promo] roadmap not resolvable from Sanity", {
      roadmapSlug,
      found: !!item,
      isPublished: item?.isPublished,
      stepCount: item?.stepCount,
    });
    return null;
  }
  return {
    slug: roadmapSlug,
    title: item.title,
    shortTitle: item.shortTitle,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    gradientPreset: item.gradientPreset,
    estimatedDuration: item.estimatedDuration,
    stepCount: item.stepCount,
    name: copy.name,
    theme: copy.theme,
    lead: copy.lead(item.stepCount),
  };
}

/**
 * 紹介ブロックを出すかどうかとロードマップを決める。
 * 課金中（hasMemberAccess）なら常に null。roadmapSlug が null（出さない指定）でも null。
 */
export function resolvePromo({
  roadmapSlug,
  hasMemberAccess,
  roadmaps,
}: {
  roadmapSlug: string | null;
  hasMemberAccess: boolean;
  roadmaps: readonly SanityRoadmapListItem[];
}): PromoRoadmap | null {
  if (hasMemberAccess || !roadmapSlug) return null;
  return resolvePromoRoadmap(roadmapSlug, roadmaps);
}

/** /stories 最後のブロックの見出し。名前に敬称が付いていればそのまま使う */
export function storyPromoHeading(personName: string): string {
  const name = personName.trim();
  const who = /(さん|くん|ちゃん|様|氏)$/.test(name) ? name : `${name}さん`;
  return `${who}も、この順番で学びました`;
}

/** /guide 最後のブロックの見出し */
export function guidePromoHeading(roadmap: Pick<PromoRoadmap, "theme">): string {
  return `${roadmap.theme}、順番に学ぶなら`;
}

/** /guide 本文中ブロックの設定（記事ごと） */
export interface GuideInlineBlock {
  /** この段落（Sanity のブロック _key）のすぐ後ろに出す */
  afterKey: string;
  /** 見出しのタグ。直前の本文見出しより1段下にする（h2 の中なら h3、h3 の中なら h4） */
  headingAs: "h2" | "h3" | "h4";
  heading: string;
  text: string;
}

/**
 * /guide 本文中ブロック（#280）。本文が学ぶ順番・ロードマップの話をしている記事だけに出す。
 * 載っていない記事には出さない（文脈が合わない記事に機械的に差し込まない）。
 * 案内するロードマップは記事ごとの出し分け（GUIDE_ROADMAP_OVERRIDES）と同じ。
 */
export const GUIDE_INLINE_BLOCKS: Readonly<Record<string, GuideInlineBlock>> = {
  // 「※UIUXデザインスキルを身につける流れや詳細は「UIUXデザイナーになるロードマップ」が詳しい…」の後
  "rdm-howtobeadesigner": {
    afterKey: "bln7hirbv0ut",
    headingAs: "h4",
    heading: "身につける流れを、レッスンで順番に進めるなら",
    text: "転職ロードマップでは、デザインツールの習得からUIの見た目の基礎、課題解決のUIデザイン、ポートフォリオまでを、6つのステップのレッスンにしています。",
  },
  // h3「ロードマップの3つの基礎をとにかく通る」の段落の後
  "rdm-7-tips-for-learning-design": {
    afterKey: "r0s2mjotuqer",
    headingAs: "h4",
    heading: "基礎をどの順番で通るか",
    text: "今の転職ロードマップでは、デザインツールとUIの見た目の基礎から始めて、課題解決のUIデザイン、ポートフォリオへと、6つのステップで順番に進めます。",
  },
  // h3「作るもので目標を定めよう」の段落の後
  "rdm-goalsetting": {
    afterKey: "n0ue1tcbm0gs",
    headingAs: "h4",
    heading: "目標にする「作るもの」の例",
    text: "転職ロードマップは、6つのステップごとに作るアウトプットと目安の期間が決まっています。目標と締め切りを決めるときの材料にできます。",
  },
  // 「まずデザインツール（Figma）の使い方を覚え、その後…3つの基礎を…」の後
  "become-uiux-designer-beginner-guide": {
    afterKey: "cjeoon2wsj61",
    headingAs: "h3",
    heading: "この流れを、レッスンで順番に進めるなら",
    text: "転職ロードマップでは、Figmaの習得から、UIの見た目の基礎、課題解決のUIデザイン、ポートフォリオまでを、6つのステップのレッスンにしています。",
  },
  // h3「UI/UX基礎3つの基礎で…」の「ロードマップはこちら」の後
  "beginner-to-uiux-designer-examples": {
    afterKey: "6lsfbhey8sv7",
    headingAs: "h4",
    heading: "見た目の基礎から課題解決までを、順番に学ぶなら",
    text: "転職ロードマップでは、デザインツールの習得からUIの見た目の基礎、課題解決のUIデザイン、ポートフォリオまでを、6つのステップで順番に進めます。",
  },
  // h2「ポートフォリオの作成をゴールに、UI/UXデザインを学習する」の段落の後
  "portfolio-01": {
    afterKey: "560zmt5zb8zw",
    headingAs: "h3",
    heading: "ポートフォリオまでの道のり",
    text: "転職ロードマップは、デザインツールの習得から始めて、最後のステップ6でポートフォリオをまとめるところまでを、順番に進めるレッスンの道筋です。",
  },
  // 冒頭「この記事では…どういう順番で身につけていけばいいのか、その地図を渡します」「※…顧客課題解決をはじめる で実践できる」の後
  uxresearch_and_uidesign: {
    afterKey: "dc698f72f3fa",
    headingAs: "h2",
    heading: "この地図を、レッスンで歩くなら",
    text: "UXデザインのロードマップでは、ユーザーを理解して課題を見つけ、解決策をUIにするまでを、ステップごとのレッスンで順番に進めます。",
  },
};
