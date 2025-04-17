import { ContentItem, ContentCategory, ContentType, ContentAccessLevel, ContentFilter } from '@/types/content';

// モックコンテンツデータ
const MOCK_CONTENTS: ContentItem[] = [
  {
    id: "1",
    title: "Figmaの基本操作マスター",
    description: "Figmaの基本的な使い方から応用テクニックまでを解説",
    type: "video" as ContentType,
    categories: ["figma", "ui-design"] as ContentCategory[],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "free" as ContentAccessLevel,
    videoUrl: "https://example.com/videos/figma-basics",
    videoDuration: 1800,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    published: true,
  },
  {
    id: "2",
    title: "UIデザイントレンド2025",
    description: "2025年のUIデザイントレンドと実装方法",
    type: "article" as ContentType,
    categories: ["ui-design"] as ContentCategory[],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard" as ContentAccessLevel,
    content: "2025年のUIデザイントレンドとしては、ニューモーフィズムの進化版やマイクロインタラクションの高度な活用、AI支援のパーソナライズドUIなどが注目されています。\n\nこの記事では、これらのトレンドについて詳しく解説し、実際の実装方法やユーザーエクスペリエンスへの影響について考察します。",
    freeContent: "2025年のUIデザイントレンドとしては、ニューモーフィズムの進化版やマイクロインタラクションの高度な活用などが注目されています。",
    createdAt: "2025-02-20T14:30:00Z",
    updatedAt: "2025-02-25T09:15:00Z",
    published: true,
  },
  {
    id: "3",
    title: "UXリサーチの手法と実践",
    description: "効果的なUXリサーチの方法とその活用法",
    type: "tutorial" as ContentType,
    categories: ["ux-design", "learning"] as ContentCategory[],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard" as ContentAccessLevel,
    content: "UXリサーチは製品開発において非常に重要なプロセスです。ユーザーインタビュー、ユーザビリティテスト、A/Bテスト、アイトラッキングなど様々な手法があります。\n\nこのチュートリアルでは、これらの手法を実際のプロジェクトでどのように活用すればよいか、また得られたデータをどのように分析し、デザインに反映させるかについて解説します。",
    freeContent: "UXリサーチは製品開発において非常に重要なプロセスです。ユーザーインタビュー、ユーザビリティテスト、A/Bテストなど様々な手法があります。",
    createdAt: "2025-03-05T11:45:00Z",
    updatedAt: "2025-03-10T16:20:00Z",
    published: true,
  },
  {
    id: "4",
    title: "デザインシステムの構築と運用",
    description: "効率的なデザインシステムの作り方と組織での活用方法",
    type: "course" as ContentType,
    categories: ["ui-design", "ux-design", "learning"] as ContentCategory[],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "growth" as ContentAccessLevel,
    lessonIds: ["4-1", "4-2", "4-3", "4-4"],
    createdAt: "2025-01-30T08:20:00Z",
    updatedAt: "2025-04-01T13:10:00Z",
    published: true,
  },
  {
    id: "5",
    title: "コミュニティ限定ワークショップ",
    description: "メンバー限定のインタラクティブワークショップ",
    type: "video" as ContentType,
    categories: ["member", "learning"] as ContentCategory[],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "community" as ContentAccessLevel,
    videoUrl: "https://example.com/videos/premium-workshop",
    freeVideoUrl: "https://example.com/videos/premium-workshop-preview",
    videoDuration: 5400,
    createdAt: "2025-04-10T15:00:00Z",
    updatedAt: "2025-04-10T15:00:00Z",
    published: true,
  }
];

/**
 * フィルター条件に基づいてコンテンツをフィルタリングする
 */
export const filterContents = (filter: {
  category?: string; 
  type?: string;
  searchQuery?: string;
}): ContentItem[] => {
  return MOCK_CONTENTS.filter(content => {
    // カテゴリでフィルタリング
    if (filter.category && !content.categories.includes(filter.category as ContentCategory)) {
      return false;
    }
    
    // タイプでフィルタリング
    if (filter.type && content.type !== filter.type) {
      return false;
    }
    
    // 検索クエリでフィルタリング
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
};

/**
 * IDによってコンテンツを取得する
 */
export const getContentById = (id: string): ContentItem | undefined => {
  return MOCK_CONTENTS.find(content => content.id === id);
};

// モックコンテンツデータをエクスポート（Edge Functionと同期するため）
export const MOCK_CONTENTS = MOCK_CONTENTS;
