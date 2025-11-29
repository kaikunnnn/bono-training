# Webflow CMS統合 - POC実装計画

## ユーザー回答のまとめ

### Webflow構造
- **Series** コレクション = Lesson相当
- **Videos** コレクション = Article相当
- **Quest構造**: Videosの `isthisasectiontitle?` フィールドがtrueのものがQuestタイトル、番号で並べてグループ化

### 要件
- ✅ 選択: 特定のSeriesを指定（理想は全Series対応）
- ✅ 統合: 既存のSanity構造に統合が理想（MVPでも可）
- ✅ コンテンツ: HTMLをそのまま表示（PortableText変換は後回し）
- ✅ 動画: Vimeo中心、一部YouTube
- ✅ パフォーマンス: 2-3秒目標
- ✅ 更新頻度: 週数回

### サンプルデータ
- Videos Collection ID: `6029d027f6cb8852cbce8c75`
- Sample Video slug: `slug-three-structures-11`
- Sample Video ID: `684f8307d2a12ade32efe83c`

## POC実装方針

### スコープ: 「1つのSeriesを表示（Quest構造を再構築）」

**理由**:
- 最小限で実現可能性を証明
- Quest構造の再構築ロジックを検証
- パフォーマンスを測定
- 既存のSanity構造との互換性を確認

### アーキテクチャ

```
Frontend (/dev/webflow-test)
    ↓
Supabase Edge Function (/webflow-series)
    ↓
Webflow CMS API
    ↓
Quest Grouping Transformer
    ↓
Normalized Lesson/Quest/Article JSON
```

## 実装ステップ

### Phase 1: Edge Function基盤（2-3時間）

#### 1.1 Supabase Edge Function作成
```
supabase/functions/webflow-series/
  ├── index.ts              # メインハンドラー
  ├── webflow-client.ts     # Webflow APIクライアント
  ├── transformer.ts        # Quest構造変換
  ├── types.ts              # 型定義
  └── cache.ts              # キャッシュロジック
```

#### 1.2 Webflow APIクライアント
```typescript
// webflow-client.ts
export class WebflowClient {
  private token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  // Seriesを取得
  async getSeries(seriesId: string) {
    // GET /collections/{seriesCollectionId}/items/{seriesId}
  }
  
  // Series内のVideosを取得
  async getVideosForSeries(seriesId: string) {
    // GET /collections/{videosCollectionId}/items
    // Filter by series reference
    // Order by numbering field
  }
}
```

#### 1.3 Quest Grouping Transformer
```typescript
// transformer.ts
interface WebflowVideo {
  id: string;
  slug: string;
  name: string;
  'isthisasectiontitle?': boolean;
  // ... other fields
}

export function groupVideosIntoQuests(videos: WebflowVideo[]) {
  const quests = [];
  let currentQuest = null;
  
  for (const video of videos) {
    if (video['isthisasectiontitle?']) {
      // 新しいQuestを開始
      if (currentQuest) quests.push(currentQuest);
      currentQuest = {
        questNumber: quests.length + 1,
        title: video.name,
        articles: []
      };
    } else if (currentQuest) {
      // 現在のQuestに記事を追加
      currentQuest.articles.push({
        _id: `webflow-${video.id}`,
        title: video.name,
        slug: video.slug,
        videoUrl: video['video-url'],
        // ... transform other fields
      });
    }
  }
  
  if (currentQuest) quests.push(currentQuest);
  return quests;
}
```

#### 1.4 キャッシュ実装
```typescript
// cache.ts
// Supabase Storage or in-memory cache
// TTL: 5分（週数回更新なので短めでOK）
```

### Phase 2: テストページ作成（1-2時間）

#### 2.1 /dev/webflow-test ページ
```typescript
// src/pages/Dev/WebflowTest.tsx
export default function WebflowTest() {
  const [seriesId, setSeriesId] = useState('');
  const { data, isLoading, error } = useWebflowSeries(seriesId);
  
  return (
    <div>
      <input 
        value={seriesId} 
        onChange={(e) => setSeriesId(e.target.value)}
        placeholder="Series ID or Slug"
      />
      
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      
      {data && (
        <div>
          <h1>{data.lesson.title}</h1>
          {data.quests.map(quest => (
            <div key={quest.questNumber}>
              <h2>Quest {quest.questNumber}: {quest.title}</h2>
              <ul>
                {quest.articles.map(article => (
                  <li key={article._id}>
                    {article.title}
                    {article.videoUrl && (
                      <a href={article.videoUrl}>Watch</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 2.2 React Hook
```typescript
// src/hooks/useWebflowSeries.ts
export function useWebflowSeries(seriesIdOrSlug: string) {
  return useQuery({
    queryKey: ['webflow-series', seriesIdOrSlug],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/webflow-series?id=${seriesIdOrSlug}`,
        {
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      );
      return response.json();
    },
    enabled: !!seriesIdOrSlug,
    staleTime: 5 * 60 * 1000, // 5分
  });
}
```

### Phase 3: 統合準備（後回し）
- Sanity型拡張
- ハイブリッドローダー
- 既存ページへの統合

## 必要な追加情報

### 🔴 重要: Webflowフィールド名の確認

スクリーンショットから確認が必要な項目:

1. **Videosコレクションのフィールド**
   - [ ] Series参照フィールド名（VideosがどのSeriesに属するか）
   - [ ] 並び順フィールド名（番号付けに使用）
   - [ ] 動画URLフィールド名（`video-url`?）
   - [ ] 動画時間フィールド名
   - [ ] リッチテキストフィールド名

2. **Seriesコレクション情報**
   - [ ] Series Collection ID
   - [ ] タイトルフィールド名
   - [ ] スラッグフィールド名

3. **Quest構造の詳細**
   - [ ] `isthisasectiontitle?` = true のビデオは記事として表示する？それともタイトルのみ？
   - [ ] 並び順は何で決まる？（番号フィールド？作成日？）

## データフロー例

### Input: Webflow API Response
```json
{
  "items": [
    {
      "id": "video1",
      "name": "Quest 1: Introduction",
      "isthisasectiontitle?": true,
      "order": 1
    },
    {
      "id": "video2",
      "name": "Lesson 1-1",
      "isthisasectiontitle?": false,
      "video-url": "https://vimeo.com/...",
      "order": 2
    },
    {
      "id": "video3",
      "name": "Lesson 1-2",
      "isthisasectiontitle?": false,
      "video-url": "https://vimeo.com/...",
      "order": 3
    }
  ]
}
```

### Output: Normalized Structure
```json
{
  "lesson": {
    "title": "Series Title",
    "slug": "series-slug",
    "source": "webflow"
  },
  "quests": [
    {
      "questNumber": 1,
      "title": "Quest 1: Introduction",
      "articles": [
        {
          "_id": "webflow-video2",
          "title": "Lesson 1-1",
          "slug": "lesson-1-1",
          "videoUrl": "https://vimeo.com/...",
          "source": "webflow"
        },
        {
          "_id": "webflow-video3",
          "title": "Lesson 1-2",
          "slug": "lesson-1-2",
          "videoUrl": "https://vimeo.com/...",
          "source": "webflow"
        }
      ]
    }
  ]
}
```

## パフォーマンス目標

- **初回ロード**: 2-3秒以内
- **キャッシュヒット**: 500ms以内
- **戦略**:
  - Edge Functionでキャッシュ（5分TTL）
  - React Queryでクライアント側キャッシュ
  - 必要に応じてSupabase Storageで永続化

## エラーハンドリング

- Webflow API エラー
- レート制限
- Series/Video が見つからない
- 不正なQuest構造（isthisasectiontitle?がない場合）

## 次のステップ

1. ✅ POC計画作成（完了）
2. ⏳ ユーザーにフィールド名を確認
3. ⏳ Edge Function実装
4. ⏳ テストページ実装
5. ⏳ サンプルデータでテスト
6. ⏳ ユーザー確認
7. ⏳ 本格統合の検討

## 成功基準

- [ ] 1つのSeriesを取得できる
- [ ] Quest構造を正しく再構築できる
- [ ] 既存のSanity型と互換性がある
- [ ] 2-3秒以内にロードできる
- [ ] エラーハンドリングが適切
