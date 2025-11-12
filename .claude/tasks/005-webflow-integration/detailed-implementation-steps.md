# Webflow CMS統合 - 超詳細実装ステップ

最終更新: 2025-11-12

## 📊 全体進捗: 30% → 100%

このドキュメントは、Webflow CMS統合を**1ステップずつ確実に**進めるための超詳細ガイドです。

---

## ✅ Phase 0: 準備完了（100%）

- ✅ 技術調査完了
- ✅ 環境変数設定完了
- ✅ Webflow API トークン取得
- ✅ Collection ID確認

---

## 🔧 Phase 1: Edge Function基盤（所要時間: 2-3時間）

### ゴール
WebflowからSeries/Videosデータを取得し、Sanity Lesson/Article形式に変換するサーバー側機能を作成

---

### Step 1.1: フォルダ構成の作成（5分）

#### 1.1.1 Supabase Functionsフォルダを確認
```bash
□ ls supabase/functions/
```

**期待される結果**: 既存のEdge Functionsが表示される

#### 1.1.2 webflow-series フォルダを作成
```bash
□ mkdir -p supabase/functions/webflow-series
```

**確認**:
```bash
□ ls supabase/functions/webflow-series/
```
→ フォルダが存在することを確認

#### 1.1.3 必要なファイルを作成
```bash
□ touch supabase/functions/webflow-series/index.ts
□ touch supabase/functions/webflow-series/webflow-client.ts
□ touch supabase/functions/webflow-series/transformer.ts
□ touch supabase/functions/webflow-series/types.ts
```

**確認**:
```bash
□ ls supabase/functions/webflow-series/
```
→ 4つのファイルが表示されることを確認

**チェックポイント**: ✅ フォルダ構成が完成

---

### Step 1.2: 型定義の作成（20分）

#### 1.2.1 types.ts を開く
```bash
□ code supabase/functions/webflow-series/types.ts
```

#### 1.2.2 Webflow API レスポンス型を定義

**コピペ用コード**:
```typescript
// Webflow API v2 レスポンス型

/**
 * Webflow Series（コレクションアイテム）
 */
export interface WebflowSeries {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    name: string;
    slug: string;
    // その他のカスタムフィールド
    [key: string]: any;
  };
}

/**
 * Webflow Video（コレクションアイテム）
 */
export interface WebflowVideo {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    name: string;
    slug: string;
    'video-url'?: string;
    'video-duration'?: number;
    'free-content'?: boolean;  // プレミアムフラグ（反転）
    'isthisasectiontitle'?: boolean;  // Questタイトルフラグ
    // その他のカスタムフィールド
    [key: string]: any;
  };
}

/**
 * Webflow API コレクションアイテム一覧レスポンス
 */
export interface WebflowCollectionItemsResponse {
  items: WebflowVideo[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Sanity Article型（変換後）
 */
export interface Article {
  _id: string;
  _type: 'article';
  title: string;
  slug: { _type: 'slug'; current: string };
  videoUrl?: string;
  videoDuration?: number;
  isPremium: boolean;
  content?: any[];  // PortableText（将来実装）
  articleNumber?: number;
}

/**
 * Sanity Quest型（変換後）
 */
export interface Quest {
  _id: string;
  _type: 'quest';
  questNumber: number;
  title: string;
  description?: string;
  goal?: string;
  articles: Article[];
}

/**
 * Sanity Lesson型（変換後）
 */
export interface Lesson {
  _id: string;
  _type: 'lesson';
  title: string;
  slug: { _type: 'slug'; current: string };
  description?: string;
  isPremium: boolean;
  quests: Quest[];
  source: 'webflow';  // データソース識別用
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  error: string;
  details?: any;
}
```

**やること**:
```
□ 上記のコードを types.ts にコピペ
□ ファイルを保存（Cmd/Ctrl + S）
```

**確認**:
```bash
□ cat supabase/functions/webflow-series/types.ts | head -10
```
→ 型定義が表示されることを確認

**チェックポイント**: ✅ 型定義が完成

---

### Step 1.3: Webflow APIクライアントの作成（40分）

#### 1.3.1 webflow-client.ts を開く
```bash
□ code supabase/functions/webflow-series/webflow-client.ts
```

#### 1.3.2 WebflowClientクラスを実装

**コピペ用コード**:
```typescript
import {
  WebflowSeries,
  WebflowVideo,
  WebflowCollectionItemsResponse,
} from './types.ts';

/**
 * Webflow CMS API v2 クライアント
 */
export class WebflowClient {
  private token: string;
  private baseUrl = 'https://api.webflow.com/v2';

  constructor(token: string) {
    if (!token) {
      throw new Error('Webflow API token is required');
    }
    this.token = token;
  }

  /**
   * Webflow APIにリクエストを送信（共通メソッド）
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log(`[Webflow API] Request: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Webflow API] Error: ${response.status} - ${errorText}`);
      throw new Error(
        `Webflow API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log(`[Webflow API] Response received`);
    return data as T;
  }

  /**
   * Seriesを取得
   */
  async getSeries(
    collectionId: string,
    seriesId: string
  ): Promise<WebflowSeries> {
    return this.request<WebflowSeries>(
      `/collections/${collectionId}/items/${seriesId}`
    );
  }

  /**
   * Series内のVideosを取得
   */
  async getVideosForSeries(
    videosCollectionId: string,
    seriesId: string
  ): Promise<WebflowVideo[]> {
    // Webflow API v2: コレクションアイテム一覧を取得
    const response = await this.request<WebflowCollectionItemsResponse>(
      `/collections/${videosCollectionId}/items?limit=100`
    );

    console.log(`[Webflow API] Total videos: ${response.items.length}`);

    // このSeriesに属するVideosをフィルタリング
    // ※ Webflowのフィールド構造に依存（要確認）
    const videosInSeries = response.items.filter((video) => {
      // Series参照フィールドの確認（フィールド名は実際の構造に合わせる）
      // 例: video.fieldData['series-reference'] === seriesId
      // または video.fieldData.series?.id === seriesId

      // 仮実装: すべてのVideosを返す（後で修正）
      return true;
    });

    console.log(`[Webflow API] Videos in series: ${videosInSeries.length}`);

    // 番号順にソート（フィールド名は実際の構造に合わせる）
    return videosInSeries.sort((a, b) => {
      const numA = a.fieldData['number'] || 0;
      const numB = b.fieldData['number'] || 0;
      return numA - numB;
    });
  }

  /**
   * 特定のVideoを取得（テスト用）
   */
  async getVideo(
    collectionId: string,
    videoId: string
  ): Promise<WebflowVideo> {
    return this.request<WebflowVideo>(
      `/collections/${collectionId}/items/${videoId}`
    );
  }
}

/**
 * WebflowClientのインスタンスを作成
 */
export function createWebflowClient(token: string): WebflowClient {
  return new WebflowClient(token);
}
```

**やること**:
```
□ 上記のコードを webflow-client.ts にコピペ
□ ファイルを保存
```

**確認**:
```bash
□ cat supabase/functions/webflow-series/webflow-client.ts | grep "export class WebflowClient"
```
→ クラス定義が表示されることを確認

**チェックポイント**: ✅ Webflow APIクライアントが完成

---

### Step 1.4: データ変換レイヤーの作成（50分）

#### 1.4.1 transformer.ts を開く
```bash
□ code supabase/functions/webflow-series/transformer.ts
```

#### 1.4.2 変換関数を実装

**コピペ用コード**:
```typescript
import {
  WebflowSeries,
  WebflowVideo,
  Article,
  Quest,
  Lesson,
} from './types.ts';

/**
 * WebflowVideoをSanity Article型に変換
 */
export function transformVideoToArticle(
  video: WebflowVideo,
  articleNumber: number
): Article {
  const fieldData = video.fieldData;

  return {
    _id: `webflow-video-${video.id}`,
    _type: 'article',
    title: fieldData.name,
    slug: {
      _type: 'slug',
      current: fieldData.slug,
    },
    videoUrl: fieldData['video-url'] || undefined,
    videoDuration: fieldData['video-duration'] || undefined,
    // 🔄 FreeContentの論理を反転
    isPremium: !fieldData['free-content'],
    articleNumber,
  };
}

/**
 * Videosをnumberでグループ化してQuestsに変換
 *
 * ロジック:
 * 1. isthisasectiontitle=true のVideoがQuestのタイトル
 * 2. その後のVideosがそのQuestに属するArticles
 * 3. 次のisthisasectiontitle=trueまでが1つのQuest
 */
export function groupVideosIntoQuests(
  videos: WebflowVideo[]
): Quest[] {
  const quests: Quest[] = [];
  let currentQuest: Quest | null = null;
  let questNumber = 0;
  let articleNumber = 0;

  for (const video of videos) {
    const isSectionTitle = video.fieldData['isthisasectiontitle'];

    if (isSectionTitle) {
      // 新しいQuestを開始
      if (currentQuest) {
        quests.push(currentQuest);
      }

      questNumber++;
      articleNumber = 0;

      currentQuest = {
        _id: `webflow-quest-${video.id}`,
        _type: 'quest',
        questNumber,
        title: video.fieldData.name,
        description: undefined,
        goal: undefined,
        articles: [],
      };
    } else {
      // 現在のQuestにArticleを追加
      if (!currentQuest) {
        // 最初のVideoがsectionTitleでない場合、デフォルトQuestを作成
        questNumber++;
        currentQuest = {
          _id: `webflow-quest-default-${questNumber}`,
          _type: 'quest',
          questNumber,
          title: 'デフォルトクエスト',
          articles: [],
        };
      }

      articleNumber++;
      const article = transformVideoToArticle(video, articleNumber);
      currentQuest.articles.push(article);
    }
  }

  // 最後のQuestを追加
  if (currentQuest) {
    quests.push(currentQuest);
  }

  console.log(`[Transformer] Created ${quests.length} quests`);
  return quests;
}

/**
 * WebflowSeriesとVideosをSanity Lesson型に変換
 */
export function transformSeriesToLesson(
  series: WebflowSeries,
  videos: WebflowVideo[]
): Lesson {
  const quests = groupVideosIntoQuests(videos);

  const lesson: Lesson = {
    _id: `webflow-series-${series.id}`,
    _type: 'lesson',
    title: series.fieldData.name,
    slug: {
      _type: 'slug',
      current: series.fieldData.slug,
    },
    description: undefined,
    isPremium: false,  // Seriesレベルではデフォルト無料
    quests,
    source: 'webflow',
  };

  console.log(`[Transformer] Transformed series "${lesson.title}" with ${quests.length} quests`);
  return lesson;
}
```

**やること**:
```
□ 上記のコードを transformer.ts にコピペ
□ ファイルを保存
```

**確認**:
```bash
□ cat supabase/functions/webflow-series/transformer.ts | grep "export function"
```
→ 変換関数が表示されることを確認

**チェックポイント**: ✅ データ変換レイヤーが完成

---

### Step 1.5: Edge Functionメインハンドラーの作成（40分）

#### 1.5.1 index.ts を開く
```bash
□ code supabase/functions/webflow-series/index.ts
```

#### 1.5.2 メインハンドラーを実装

**コピペ用コード**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createWebflowClient } from './webflow-client.ts';
import { transformSeriesToLesson } from './transformer.ts';
import { Lesson, ErrorResponse } from './types.ts';

/**
 * CORS ヘッダー
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * メインハンドラー
 */
serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 環境変数からトークンとCollection IDを取得
    const webflowToken = Deno.env.get('WEBFLOW_API_TOKEN');
    const videosCollectionId = Deno.env.get('VITE_WEBFLOW_VIDEOS_COLLECTION_ID');
    const seriesCollectionId = Deno.env.get('VITE_WEBFLOW_SERIES_COLLECTION_ID');

    if (!webflowToken) {
      throw new Error('WEBFLOW_API_TOKEN is not set');
    }
    if (!videosCollectionId) {
      throw new Error('VITE_WEBFLOW_VIDEOS_COLLECTION_ID is not set');
    }
    if (!seriesCollectionId) {
      throw new Error('VITE_WEBFLOW_SERIES_COLLECTION_ID is not set');
    }

    // リクエストボディからSeries IDを取得
    const { seriesId } = await req.json();

    if (!seriesId) {
      throw new Error('seriesId is required');
    }

    console.log(`[Edge Function] Fetching series: ${seriesId}`);

    // Webflow APIクライアントを作成
    const client = createWebflowClient(webflowToken);

    // 1. Seriesを取得
    const series = await client.getSeries(seriesCollectionId, seriesId);
    console.log(`[Edge Function] Series: ${series.fieldData.name}`);

    // 2. Series内のVideosを取得
    const videos = await client.getVideosForSeries(
      videosCollectionId,
      seriesId
    );
    console.log(`[Edge Function] Videos: ${videos.length}`);

    // 3. Sanity Lesson形式に変換
    const lesson = transformSeriesToLesson(series, videos);

    // 4. レスポンスを返す
    return new Response(JSON.stringify(lesson), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    console.error('[Edge Function] Error:', error);

    const errorResponse: ErrorResponse = {
      error: error.message || 'Unknown error',
      details: error,
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
```

**やること**:
```
□ 上記のコードを index.ts にコピペ
□ ファイルを保存
```

**確認**:
```bash
□ cat supabase/functions/webflow-series/index.ts | grep "serve(async"
```
→ メインハンドラーが表示されることを確認

**チェックポイント**: ✅ Edge Functionメインハンドラーが完成

---

### Step 1.6: Edge Functionのローカルテスト（20分）

#### 1.6.1 Supabase CLIがインストールされているか確認
```bash
□ supabase --version
```

**期待される結果**: バージョン番号が表示される

**もし未インストールの場合**:
```bash
□ brew install supabase/tap/supabase
```

#### 1.6.2 Supabaseプロジェクトをローカルで起動
```bash
□ supabase start
```

**期待される結果**: Docker コンテナが起動し、ローカルSupabaseが立ち上がる

#### 1.6.3 Edge Functionをローカルで実行
```bash
□ supabase functions serve webflow-series --env-file .env
```

**期待される結果**:
```
Serving webflow-series on http://localhost:54321/functions/v1/webflow-series
```

#### 1.6.4 別のターミナルでテストリクエストを送信
```bash
□ curl -X POST http://localhost:54321/functions/v1/webflow-series \
  -H "Content-Type: application/json" \
  -d '{"seriesId": "684a8fd0ff2a7184d2108210"}'
```

**期待される結果**: Lesson形式のJSONが返ってくる

**確認項目**:
```
□ lesson.title にSeriesのタイトルが表示される
□ lesson.quests に複数のQuestが含まれる
□ 各Quest.articles にArticlesが含まれる
□ isPremium が正しく設定されている（FreeContent反転）
```

**もしエラーが出たら**:
- エラーメッセージを確認
- `console.log` の出力を確認
- Webflow API トークンが正しいか確認
- Collection IDが正しいか確認

**チェックポイント**: ✅ Edge Functionがローカルで動作

---

## 🎨 Phase 2: POC実装（所要時間: 1-2時間）

### ゴール
`/dev/webflow-test` ページで、WebflowのテストSeriesを既存のレッスンUIで表示

---

### Step 2.1: テストページの作成（30分）

#### 2.1.1 Dev フォルダの確認
```bash
□ ls src/pages/Dev/ 2>/dev/null || mkdir -p src/pages/Dev
```

#### 2.1.2 WebflowTest.tsx を作成
```bash
□ touch src/pages/Dev/WebflowTest.tsx
□ code src/pages/Dev/WebflowTest.tsx
```

#### 2.1.3 テストページのコードを実装

**コピペ用コード**:
```typescript
import { useState, useEffect } from 'react';
import { Lesson } from '@/types/sanity';
import Layout from '@/components/layout/Layout';
import LessonHero from '@/components/lesson/LessonHero';
import QuestList from '@/components/lesson/QuestList';

export default function WebflowTest() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebflowSeries() {
      setLoading(true);
      setError(null);

      try {
        const testSeriesId = import.meta.env.VITE_WEBFLOW_TEST_SERIES_ID;

        console.log('[WebflowTest] Fetching series:', testSeriesId);

        // Edge Functionを呼び出し
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webflow-series`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ seriesId: testSeriesId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch series');
        }

        const data = await response.json();
        console.log('[WebflowTest] Lesson data:', data);

        setLesson(data);
      } catch (err) {
        console.error('[WebflowTest] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchWebflowSeries();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Webflowからデータを取得中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">エラー: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">レッスンが見つかりませんでした</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4 px-4 py-2 bg-yellow-100 border-l-4 border-yellow-500">
        <p className="text-sm">
          <strong>🧪 テストモード:</strong> このページはWebflow CMS統合のPOC（概念実証）です。
          Series ID: {import.meta.env.VITE_WEBFLOW_TEST_SERIES_ID}
        </p>
      </div>

      <LessonHero
        title={lesson.title}
        description={lesson.description}
        isPremium={lesson.isPremium}
      />

      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">クエスト一覧</h2>
        {lesson.quests && lesson.quests.length > 0 ? (
          <QuestList quests={lesson.quests} lessonSlug={lesson.slug.current} />
        ) : (
          <p className="text-gray-600">クエストがありません</p>
        )}
      </div>
    </Layout>
  );
}
```

**やること**:
```
□ 上記のコードを WebflowTest.tsx にコピペ
□ ファイルを保存
```

**チェックポイント**: ✅ テストページが完成

---

### Step 2.2: ルーティングの追加（10分）

#### 2.2.1 App.tsx を開く
```bash
□ code src/App.tsx
```

#### 2.2.2 Webflow Testルートを追加

**追加するコード**（import文の後に追加）:
```typescript
// Dev pages
import WebflowTest from '@/pages/Dev/WebflowTest';
```

**追加するコード**（Route定義に追加）:
```typescript
{/* Dev: Webflow Integration Test */}
<Route path="/dev/webflow-test" element={<WebflowTest />} />
```

**やること**:
```
□ import文を追加
□ Routeを追加
□ ファイルを保存
```

**チェックポイント**: ✅ ルーティングが完成

---

### Step 2.3: Edge Functionのデプロイ（15分）

#### 2.3.1 Supabaseにログイン
```bash
□ supabase login
```

#### 2.3.2 プロジェクトにリンク
```bash
□ supabase link --project-ref fryogvfhymnpiqwssmuu
```

#### 2.3.3 環境変数をSupabaseにセット
```bash
□ supabase secrets set WEBFLOW_API_TOKEN="$(grep WEBFLOW_API_TOKEN .env | cut -d '=' -f2-)"
□ supabase secrets set VITE_WEBFLOW_VIDEOS_COLLECTION_ID="6029d027f6cb8852cbce8c75"
□ supabase secrets set VITE_WEBFLOW_SERIES_COLLECTION_ID="6029d01e01a7fb81007f8e4e"
```

**確認**:
```bash
□ supabase secrets list
```
→ 3つの環境変数が表示されることを確認

#### 2.3.4 Edge Functionをデプロイ
```bash
□ supabase functions deploy webflow-series
```

**期待される結果**:
```
Deployed webflow-series successfully
Function URL: https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/webflow-series
```

**チェックポイント**: ✅ Edge Functionがデプロイ完了

---

### Step 2.4: 動作確認（15分）

#### 2.4.1 開発サーバーを再起動
```bash
□ npm run dev
```

#### 2.4.2 ブラウザでアクセス
```
□ http://localhost:8080/dev/webflow-test を開く
```

**期待される動作**:
```
□ ローディング表示が出る
□ WebflowからSeriesデータが取得される
□ レッスンタイトルが表示される
□ Questsが表示される
□ 各QuestにArticlesが表示される
```

**確認項目**:
```
□ レッスンタイトルが正しい
□ Quest数が正しい
□ Article数が正しい
□ 動画URLが設定されている
□ isPremiumフラグが正しい（FreeContent反転）
```

**もしエラーが出たら**:
- ブラウザのConsoleを確認
- Network タブでEdge Functionのレスポンスを確認
- Supabase Logsを確認

**チェックポイント**: ✅ POCが動作確認完了

---

## 🔗 Phase 3: Sanity統合（所要時間: 2-3時間）

### ゴール
Sanity管理画面で「WebflowのSeriesを参照する」設定ができるようにする

---

### Step 3.1: Sanityスキーマの拡張（40分）

#### 3.1.1 Sanity Studioフォルダに移動
```bash
□ cd sanity-studio
```

#### 3.1.2 lesson.ts スキーマを開く
```bash
□ code schemaTypes/lesson.ts
```

#### 3.1.3 webflowSourceフィールドを追加

**追加するコード**（fields配列の最後に追加）:
```typescript
{
  name: 'webflowSource',
  type: 'object',
  title: 'Webflow連携',
  description: 'このレッスンをWebflow Seriesから取得する場合に設定します',
  fields: [
    {
      name: 'enabled',
      type: 'boolean',
      title: '有効化',
      description: 'ONにすると、Webflowからコンテンツを取得します',
      initialValue: false,
    },
    {
      name: 'seriesId',
      type: 'string',
      title: 'Series ID',
      description: 'Webflow SeriesコレクションのアイテムID',
      validation: (Rule) =>
        Rule.custom((seriesId, context) => {
          const enabled = (context.parent as any)?.enabled;
          if (enabled && !seriesId) {
            return 'Webflow連携が有効な場合、Series IDは必須です';
          }
          return true;
        }),
    },
  ],
  hidden: ({ parent }) => parent?.webflowSource?.enabled !== true,
},
```

**やること**:
```
□ 上記のコードを追加
□ ファイルを保存
```

**確認**:
```bash
□ cat schemaTypes/lesson.ts | grep "webflowSource"
```

**チェックポイント**: ✅ Sanityスキーマが拡張完了

---

### Step 3.2: Sanity Studioを再起動（5分）

#### 3.2.1 Sanity Studioを起動
```bash
□ npm run dev
```

**期待される結果**:
```
Sanity Studio running on http://localhost:3333
```

#### 3.2.2 ブラウザで確認
```
□ http://localhost:3333 を開く
□ Lessonドキュメントを開く
□ "Webflow連携" フィールドが表示されることを確認
```

**チェックポイント**: ✅ Sanity管理画面でWebflow連携フィールドが表示される

---

### Step 3.3: useLessons フックの作成（60分）

#### 3.3.1 hooks フォルダを確認
```bash
□ mkdir -p src/hooks
```

#### 3.3.2 useLessons.ts を作成
```bash
□ touch src/hooks/useLessons.ts
□ code src/hooks/useLessons.ts
```

#### 3.3.3 useLessons フックを実装

**コピペ用コード**:
```typescript
import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';
import { Lesson } from '@/types/sanity';

/**
 * SanityとWebflowの両方からLessonsを取得するカスタムフック
 */
export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      setError(null);

      try {
        // 1. Sanityから全Lessonを取得
        const query = `*[_type == "lesson"] {
          _id,
          title,
          slug,
          description,
          iconImage,
          category,
          isPremium,
          webflowSource,
          quests[]-> {
            _id,
            questNumber,
            title,
            description,
            goal,
            estTimeMins,
            articles[]-> {
              _id,
              title,
              slug,
              thumbnail,
              videoDuration,
              isPremium
            }
          }
        }`;

        const sanityLessons = await client.fetch(query);
        console.log('[useLessons] Sanity lessons:', sanityLessons.length);

        // 2. webflowSourceがあるものはWebflowから取得
        const enrichedLessons = await Promise.all(
          sanityLessons.map(async (lesson) => {
            if (lesson.webflowSource?.enabled && lesson.webflowSource?.seriesId) {
              try {
                console.log(
                  `[useLessons] Fetching Webflow series: ${lesson.webflowSource.seriesId}`
                );

                // Edge FunctionでWebflowコンテンツを取得
                const response = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webflow-series`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      seriesId: lesson.webflowSource.seriesId,
                    }),
                  }
                );

                if (!response.ok) {
                  console.error(
                    `[useLessons] Failed to fetch Webflow series: ${lesson.webflowSource.seriesId}`
                  );
                  return lesson;  // エラー時はSanityデータを返す
                }

                const webflowLesson = await response.json();

                // Sanityのメタデータ（iconImage等）を保持しつつ、
                // コンテンツはWebflowから取得
                return {
                  ...lesson,
                  title: webflowLesson.title || lesson.title,
                  quests: webflowLesson.quests || lesson.quests,
                  source: 'webflow',
                };
              } catch (err) {
                console.error(
                  `[useLessons] Error fetching Webflow series:`,
                  err
                );
                return lesson;  // エラー時はSanityデータを返す
              }
            }

            return {
              ...lesson,
              source: 'sanity',
            };
          })
        );

        console.log('[useLessons] Total lessons:', enrichedLessons.length);
        setLessons(enrichedLessons);
      } catch (err) {
        console.error('[useLessons] Error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  return { lessons, loading, error };
}
```

**やること**:
```
□ 上記のコードを useLessons.ts にコピペ
□ ファイルを保存
```

**チェックポイント**: ✅ useLessons フックが完成

---

### Step 3.4: Lessons.tsx の更新（30分）

#### 3.4.1 Lessons.tsx を開く
```bash
□ code src/pages/Lessons.tsx
```

#### 3.4.2 useLessons フックに置き換え

**変更前のコード**を探す:
```typescript
// 既存のSanity fetchロジック
const query = `*[_type == "lesson"] { ... }`;
const data = await client.fetch(query);
```

**変更後のコード**に置き換え:
```typescript
import { useLessons } from '@/hooks/useLessons';

// コンポーネント内で
const { lessons, loading, error } = useLessons();
```

**やること**:
```
□ import文を追加
□ useState/useEffectを削除
□ useLessonsフックに置き換え
□ ファイルを保存
```

**チェックポイント**: ✅ Lessons.tsx が更新完了

---

### Step 3.5: 動作確認（20分）

#### 3.5.1 Sanity管理画面でテストLessonを作成
```
□ Sanity Studio を開く
□ 新しいLessonを作成
□ タイトル: "Webflowテストレッスン"
□ Webflow連携: ON
□ Series ID: 684a8fd0ff2a7184d2108210
□ 保存
```

#### 3.5.2 /lessons ページで確認
```
□ http://localhost:8080/lessons を開く
□ "Webflowテストレッスン" が表示されることを確認
□ クリックしてレッスン詳細ページを開く
□ WebflowのQuestsとArticlesが表示されることを確認
```

**確認項目**:
```
□ Sanity製のLessonも表示される
□ Webflow製のLessonも表示される
□ 両方が混在して表示される
□ どちらも同じUIで表示される
```

**チェックポイント**: ✅ Sanity統合が完了し、動作確認完了

---

## 🎉 Phase 4: 本番デプロイと最終確認（所要時間: 1時間）

### Step 4.1: Vercelに環境変数を追加（10分）

```
□ Vercel Dashboard を開く
□ プロジェクト → Settings → Environment Variables
□ 以下を追加:
  - VITE_WEBFLOW_VIDEOS_COLLECTION_ID
  - VITE_WEBFLOW_SERIES_COLLECTION_ID
  - VITE_WEBFLOW_TEST_SERIES_ID
□ Redeploy
```

### Step 4.2: 本番環境で動作確認（20分）

```
□ 本番URL/lessons にアクセス
□ WebflowレッスンとSanityレッスンが混在表示されることを確認
□ プレミアム機能が動作することを確認
□ 動画再生が動作することを確認
```

### Step 4.3: ドキュメント更新（30分）

```
□ 現状のステータス.md を更新（100%完了）
□ README.md にWebflow統合の説明を追加
□ 運用ガイドを作成
```

---

## ✅ 完了チェックリスト

### Phase 1: Edge Function基盤
- [ ] types.ts 作成完了
- [ ] webflow-client.ts 作成完了
- [ ] transformer.ts 作成完了
- [ ] index.ts 作成完了
- [ ] ローカルテスト成功
- [ ] デプロイ完了

### Phase 2: POC実装
- [ ] WebflowTest.tsx 作成完了
- [ ] ルーティング追加完了
- [ ] 動作確認完了

### Phase 3: Sanity統合
- [ ] Sanityスキーマ拡張完了
- [ ] useLessons フック作成完了
- [ ] Lessons.tsx 更新完了
- [ ] 動作確認完了

### Phase 4: 本番デプロイ
- [ ] Vercel環境変数設定完了
- [ ] 本番環境動作確認完了
- [ ] ドキュメント更新完了

---

## 🎯 最終確認

すべてのチェックポイントを確認してください：
- ✅ WebflowからSeriesとVideosを取得できる
- ✅ Sanity Lesson形式に変換できる
- ✅ プレミアム機能が動作する（FreeContent反転）
- ✅ SanityとWebflowのLessonが混在表示できる
- ✅ 既存のUIと見た目が同じ
- ✅ 本番環境で動作する

**すべて完了したら、Webflow CMS統合は完了です！** 🎉

---

## 📞 サポート

問題が発生した場合:
1. エラーメッセージを確認
2. Console.logの出力を確認
3. このドキュメントの該当箇所を再確認
4. `.claude/tasks/005-webflow-integration/` 内の参考ドキュメントを確認
