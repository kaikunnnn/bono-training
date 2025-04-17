
import { ContentAccessLevel, ContentCategory, ContentItem, ContentType } from "@/types/content";

// テスト用のサンプルコンテンツデータ
export const MOCK_CONTENTS: ContentItem[] = [
  {
    id: "video-001",
    title: "Figma入門: 基本的な使い方",
    description: "Figmaの基本的な機能と使い方を解説します。初心者向けの内容です。",
    type: "video",
    categories: ["figma", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "free",
    videoUrl: "https://example.com/videos/figma-basics",
    videoDuration: 600, // 10分
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z",
    published: true
  },
  {
    id: "video-002",
    title: "UIデザインの基本原則",
    description: "UIデザインを行う上で知っておくべき基本原則を解説します。",
    type: "video",
    categories: ["ui-design", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard",
    videoUrl: "https://example.com/videos/ui-design-principles",
    videoDuration: 1200, // 20分
    createdAt: "2023-02-10T00:00:00Z",
    updatedAt: "2023-02-10T00:00:00Z",
    published: true
  },
  {
    id: "article-001",
    title: "効果的なデザインシステムの構築方法",
    description: "デザインシステムを効果的に構築するための方法論を解説します。",
    type: "article",
    categories: ["ui-design", "member"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "growth",
    content: "デザインシステムは一貫性のあるUIを構築するための...",
    createdAt: "2023-03-05T00:00:00Z",
    updatedAt: "2023-04-10T00:00:00Z",
    published: true
  },
  {
    id: "tutorial-001",
    title: "Figmaでのコンポーネント設計",
    description: "Figmaを使ったコンポーネント設計の実践的なチュートリアルです。",
    type: "tutorial",
    categories: ["figma", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "standard",
    content: "Figmaのコンポーネント機能を活用することで...",
    createdAt: "2023-04-20T00:00:00Z",
    updatedAt: "2023-04-20T00:00:00Z",
    published: true
  },
  {
    id: "course-001",
    title: "UIデザイン入門コース",
    description: "UIデザインの基礎から応用までを学べる総合コースです。",
    type: "course",
    categories: ["ui-design", "learning"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "growth",
    lessonIds: ["video-001", "video-002", "tutorial-001"],
    createdAt: "2023-05-01T00:00:00Z",
    updatedAt: "2023-05-15T00:00:00Z",
    published: true
  },
  {
    id: "video-003",
    title: "UXリサーチの方法論",
    description: "効果的なUXリサーチを行うための方法論を解説します。",
    type: "video",
    categories: ["ux-design", "member"],
    thumbnailUrl: "/placeholder.svg",
    accessLevel: "community",
    videoUrl: "https://example.com/videos/ux-research-methods",
    videoDuration: 1800, // 30分
    createdAt: "2023-06-10T00:00:00Z",
    updatedAt: "2023-06-10T00:00:00Z",
    published: true
  }
];

/**
 * ID指定でコンテンツを取得する
 */
export const getContentById = (id: string): ContentItem | undefined => {
  return MOCK_CONTENTS.find(content => content.id === id);
};

/**
 * フィルター条件に基づいてコンテンツをフィルタリングする
 */
export const filterContents = (filter: {
  category?: string; 
  type?: string;
  searchQuery?: string;
  accessLevel?: string;
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
    
    // アクセスレベルでフィルタリング
    if (filter.accessLevel) {
      const accessLevels: ContentAccessLevel[] = ['free', 'standard', 'growth', 'community'];
      const contentIndex = accessLevels.indexOf(content.accessLevel);
      const filterIndex = accessLevels.indexOf(filter.accessLevel as ContentAccessLevel);
      
      // 指定されたアクセスレベル以下のものだけを表示
      if (contentIndex > filterIndex) {
        return false;
      }
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
