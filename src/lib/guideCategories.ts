import { GuideCategoryInfo } from "@/types/guide";

/**
 * ガイドカテゴリの定義
 */
export const GUIDE_CATEGORIES: GuideCategoryInfo[] = [
  {
    id: "career",
    label: "キャリア",
    description: "転職やキャリアパスに関するガイド",
    icon: "briefcase",
  },
  {
    id: "learning",
    label: "学習方法",
    description: "効果的な学習方法とスキルアップのコツ",
    icon: "book-open",
  },
  {
    id: "industry",
    label: "業界動向",
    description: "デザイン業界のトレンドと未来",
    icon: "trending-up",
  },
  {
    id: "tools",
    label: "ツール・技術",
    description: "デザインツールの使い方と選び方",
    icon: "wrench",
  },
];

/**
 * カテゴリIDからカテゴリ情報を取得
 */
export function getCategoryInfo(categoryId: string): GuideCategoryInfo | undefined {
  return GUIDE_CATEGORIES.find((cat) => cat.id === categoryId);
}
