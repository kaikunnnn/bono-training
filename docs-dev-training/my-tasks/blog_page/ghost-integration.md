# Ghost CMS Integration Documentation

## 概要
このドキュメントでは、Ghost CMSをローカル環境で構築し、既存のReactブログシステムと統合する手順を説明します。

## 目標
- ✅ **完全無料**でGhost CMSを使用
- ✅ ローカル環境で記事の作成・編集が可能
- ✅ 既存のUIデザインを維持したまま移行
- ✅ mockPostsからGhost APIへの完全移行

---

## 1. 環境構築

### 1.1 必要な前提条件
- Docker Desktop がインストールされていること
- Node.js 18+ がインストールされていること
- 現在のReactアプリが正常に動作していること

### 1.2 Docker Compose設定
プロジェクトルートに `docker-compose.yml` を作成：

```yaml
version: '3.8'

services:
  ghost:
    image: ghost:5-alpine
    restart: unless-stopped
    ports:
      - "2368:2368"
    environment:
      # 開発環境設定
      NODE_ENV: development
      # Ghost URL設定
      url: http://localhost:2368
      # データベース設定（SQLite使用）
      database__client: sqlite3
      database__filename: ghost-local.db
      database__debug: false
    volumes:
      # データ永続化
      - ./ghost-data:/var/lib/ghost/content
    networks:
      - ghost-network

networks:
  ghost-network:
    driver: bridge
```

### 1.3 Ghost起動コマンド
```bash
# Ghostコンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f ghost

# 停止する場合
docker-compose down
```

### 1.4 Ghost管理画面へのアクセス
1. ブラウザで `http://localhost:2368/ghost` にアクセス
2. 初回アクセス時に管理者アカウントを作成
3. サイト名、説明などの基本設定を行う

---

## 2. Ghost Content API Key取得

### 2.1 Content API Keyの生成
1. Ghost管理画面にログイン
2. Settings → Integrations に移動
3. 「+ Add custom integration」をクリック
4. 名前を入力（例：「React Blog Integration」）
5. 生成された「Content API Key」をコピー

### 2.2 環境変数の設定
プロジェクトルートに `.env.local` を作成：

```env
# Ghost API設定
VITE_GHOST_URL=http://localhost:2368
VITE_GHOST_KEY=YOUR_CONTENT_API_KEY_HERE
VITE_GHOST_VERSION=v5.0

# データソース切り替え（ghost | mock）
VITE_BLOG_DATA_SOURCE=ghost
```

---

## 3. 実装ファイル構成

### 3.1 ディレクトリ構造
```
src/
├── lib/
│   └── ghost.ts           # Ghost APIクライアント初期化
├── services/
│   └── ghostService.ts    # Ghost APIデータ取得
├── utils/blog/
│   └── blogUtils.ts       # 既存（Ghost対応に拡張）
├── types/
│   └── ghost.ts           # Ghost API型定義
└── config/
    └── blog.config.ts     # ブログ設定管理
```

### 3.2 必要なnpmパッケージ
```bash
npm install @tryghost/content-api
```

---

## 4. 実装詳細

### 4.1 Ghost APIクライアント（src/lib/ghost.ts）
```typescript
import GhostContentAPI from '@tryghost/content-api';

// Ghost APIクライアントの初期化
export const ghostApi = new GhostContentAPI({
  url: import.meta.env.VITE_GHOST_URL,
  key: import.meta.env.VITE_GHOST_KEY,
  version: import.meta.env.VITE_GHOST_VERSION || 'v5.0'
});
```

### 4.2 型定義（src/types/ghost.ts）
```typescript
// Ghost APIのレスポンス型
export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  created_at: string;
  reading_time: number;
  tags: GhostTag[];
  primary_tag: GhostTag | null;
  authors: GhostAuthor[];
  primary_author: GhostAuthor;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
}
```

### 4.3 データ変換アダプター（src/services/ghostService.ts）
```typescript
import { ghostApi } from '@/lib/ghost';
import { BlogPost } from '@/types/blog';
import { GhostPost } from '@/types/ghost';

// GhostPostをBlogPostに変換
export const convertGhostToBlogPost = (ghostPost: GhostPost): BlogPost => {
  return {
    id: ghostPost.id,
    slug: ghostPost.slug,
    title: ghostPost.title,
    description: ghostPost.excerpt || '',
    content: ghostPost.html || '',
    author: ghostPost.primary_author?.name || 'Unknown',
    publishedAt: ghostPost.published_at,
    category: ghostPost.primary_tag?.slug || 'uncategorized',
    tags: ghostPost.tags?.map(tag => tag.name) || [],
    thumbnail: ghostPost.feature_image || '/blog/images/default.jpg',
    featured: ghostPost.featured || false,
    readingTime: ghostPost.reading_time || 5,
    // 追加フィールド
    imageUrl: ghostPost.feature_image,
    excerpt: ghostPost.excerpt || '',
    categorySlug: ghostPost.primary_tag?.slug || 'uncategorized',
    readTime: ghostPost.reading_time || 5,
  };
};

// Ghost APIから記事を取得
export const fetchGhostPosts = async (options?: {
  page?: number;
  limit?: number;
  filter?: string;
}) => {
  const posts = await ghostApi.posts.browse({
    page: options?.page || 1,
    limit: options?.limit || 9,
    include: ['tags', 'authors'],
    filter: options?.filter,
  });

  return {
    posts: posts.map(convertGhostToBlogPost),
    pagination: posts.meta.pagination,
  };
};

// スラッグで単一記事を取得
export const fetchGhostPostBySlug = async (slug: string) => {
  const post = await ghostApi.posts.read(
    { slug },
    { include: ['tags', 'authors'] }
  );
  return convertGhostToBlogPost(post);
};
```

### 4.4 blogUtils.tsの拡張
```typescript
// src/utils/blog/blogUtils.ts
import { BlogPost, BlogPostsResponse } from '@/types/blog';
import { mockPosts } from '@/data/blog/mockPosts';
import { fetchGhostPosts, fetchGhostPostBySlug } from '@/services/ghostService';

const isGhostEnabled = import.meta.env.VITE_BLOG_DATA_SOURCE === 'ghost';

export const getBlogPosts = async (params?: {
  page?: number;
  category?: string;
  limit?: number;
}): Promise<BlogPostsResponse> => {
  if (isGhostEnabled) {
    try {
      // Ghostから取得
      const filter = params?.category ? `primary_tag:${params.category}` : undefined;
      const result = await fetchGhostPosts({
        page: params?.page,
        limit: params?.limit,
        filter,
      });
      return result;
    } catch (error) {
      console.error('Ghost API Error:', error);
      // フォールバック: mockDataを返す
    }
  }

  // mockPostsを使用（既存のロジック）
  // ... 既存のコード
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  if (isGhostEnabled) {
    try {
      return await fetchGhostPostBySlug(slug);
    } catch (error) {
      console.error('Ghost API Error:', error);
    }
  }

  // mockPostsから取得（既存のロジック）
  return mockPosts.find(post => post.slug === slug) || null;
};
```

---

## 5. カテゴリ管理（MVP版）

### 5.1 Ghost側の設定
1. Ghostのタグをカテゴリとして使用
2. 以下のタグを作成：
   - `tech` (技術)
   - `design` (デザイン)
   - `business` (ビジネス)
   - `lifestyle` (ライフスタイル)

### 5.2 カテゴリマッピング
```typescript
// src/data/blog/categories.ts
export const categories = [
  { id: '1', name: '技術', slug: 'tech', color: 'bg-blue-500' },
  { id: '2', name: 'デザイン', slug: 'design', color: 'bg-purple-500' },
  { id: '3', name: 'ビジネス', slug: 'business', color: 'bg-green-500' },
  { id: '4', name: 'ライフスタイル', slug: 'lifestyle', color: 'bg-pink-500' },
];
```

---

## 6. コンポーネントの更新

### 6.1 非同期データ取得への対応
既存のコンポーネントを非同期対応に更新：

```typescript
// src/pages/blog/index.tsx
useEffect(() => {
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getBlogPosts({
        page: currentPage,
        category: selectedCategory || undefined,
        limit: 9
      });
      setBlogData(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadPosts();
}, [currentPage, selectedCategory]);
```

---

## 7. テスト手順

### 7.1 動作確認チェックリスト
- [ ] Docker Composeでghostコンテナが起動
- [ ] http://localhost:2368/ghost で管理画面にアクセス可能
- [ ] Content API Keyを取得し、.env.localに設定
- [ ] Ghost管理画面でテスト記事を作成
- [ ] Reactアプリで記事一覧が表示される
- [ ] 記事詳細ページが表示される
- [ ] カテゴリフィルターが動作する
- [ ] ページネーションが動作する

### 7.2 トラブルシューティング

**Q: Ghost APIに接続できない**
- Docker コンテナが起動しているか確認
- Content API Keyが正しいか確認
- CORSエラーの場合はGhost設定を確認

**Q: 記事が表示されない**
- Ghost管理画面で記事が「Published」になっているか確認
- 環境変数 VITE_BLOG_DATA_SOURCE が "ghost" になっているか確認

**Q: 画像が表示されない**
- Ghost管理画面で画像をアップロードし直す
- 画像URLが正しくマッピングされているか確認

---

## 8. 今後の拡張予定

### Phase 2（将来的な機能追加）
- [ ] Ghost Admin APIを使った記事投稿機能
- [ ] プレビュー機能
- [ ] 下書き記事の管理
- [ ] メンバーシップ機能の統合
- [ ] コメント機能の追加

### Phase 3（本番環境）
- [ ] Ghost本番環境のセットアップ
- [ ] CDN設定
- [ ] バックアップ戦略
- [ ] パフォーマンス最適化

---

## 9. 参考リンク

- [Ghost公式ドキュメント](https://ghost.org/docs/)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [Ghost Docker Image](https://hub.docker.com/_/ghost/)
- [@tryghost/content-api](https://www.npmjs.com/package/@tryghost/content-api)

---

## 変更履歴
- 2024-01-15: 初版作成
- 完全無料のローカル環境構築
- mockPostsからの移行対応
- MVP版カテゴリ管理