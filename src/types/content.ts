
export type ContentType = 'video' | 'article' | 'tutorial' | 'course';
export type ContentCategory = 'figma' | 'ui-design' | 'ux-design' | 'learning' | 'member';
export type ContentAccessLevel = 'free' | 'standard' | 'growth' | 'community';

/**
 * コンテンツのメタデータを定義するインターフェース
 */
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  categories: ContentCategory[];
  thumbnailUrl?: string;
  accessLevel: ContentAccessLevel;
  // 動画コンテンツの場合
  videoUrl?: string;
  freeVideoUrl?: string; // 無料プレビュー動画URL
  videoDuration?: number; // 秒単位
  // 記事コンテンツの場合
  content?: string;
  freeContent?: string; // 無料プレビューコンテンツ
  // コースコンテンツの場合
  lessonIds?: string[];
  // 共通メタデータ
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

/**
 * コンテンツのフィルタリングオプション
 */
export interface ContentFilter {
  category?: ContentCategory;
  type?: ContentType;
  searchQuery?: string;
  accessLevel?: ContentAccessLevel;
}
