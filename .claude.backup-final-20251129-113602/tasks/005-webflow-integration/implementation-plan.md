# Webflow CMS統合 - 実装計画

## 実装フェーズ

### Phase 0: 準備・調査 (1-2時間)
**目的**: 必要情報の収集と環境セットアップ

#### タスク
- [x] 現在のSanity構造を分析
- [x] 技術的実現可能性を調査
- [ ] ユーザーから必要情報を取得
  - Webflow API トークン
  - コレクション情報
  - フィールド構造
  - 選択メカニズムの要件
- [ ] Webflow API トークンをSupabase Secretsに保存
- [ ] 環境変数設定

### Phase 1: Edge Function基盤 (2-3時間)
**目的**: Webflow APIを呼び出すサーバー側プロキシを作成

#### 1.1 Edge Function作成
```
supabase/functions/webflow-proxy/
  ├── index.ts              # メインハンドラー
  ├── webflow-client.ts     # Webflow APIクライアント
  ├── transformers.ts       # データ変換レイヤー
  └── types.ts              # 型定義
```

**機能**:
- Webflow CMS APIへの認証付きリクエスト
- エラーハンドリング
- レート制限対応
- CORS設定

#### 1.2 Webflow APIクライアント
```typescript
// webflow-client.ts
export class WebflowClient {
  async getCollection(collectionId: string)
  async getItem(collectionId: string, itemId: string)
  async getItemBySlug(collectionId: string, slug: string)
  async listItems(collectionId: string, filters?: any)
}
```

#### 1.3 データ変換レイヤー
```typescript
// transformers.ts
export function transformWebflowArticle(webflowItem: any): Article
export function transformWebflowQuest(webflowItem: any): Quest
export function convertHtmlToPortableText(html: string): PortableTextBlock[]
```

### Phase 2: POC実装 (2-3時間)
**目的**: 1つのWebflow記事を表示する最小限の実装

#### 2.1 テストページ作成
```
src/pages/Dev/WebflowTest.tsx
```

**機能**:
- Edge Functionを呼び出し
- 1つのWebflow記事を取得
- 既存のArticleコンポーネントで表示
- エラー表示

#### 2.2 React Hook作成
```typescript
// src/hooks/useWebflowArticle.ts
export function useWebflowArticle(collectionId: string, itemId: string) {
  // React Query でEdge Functionを呼び出し
}
```

#### 2.3 ルーティング追加
```typescript
// src/App.tsx
<Route path="/dev/webflow-test" element={<DevRoute><WebflowTest /></DevRoute>} />
```

### Phase 3: Sanity統合 (3-4時間)
**目的**: SanityドキュメントからWebflowコンテンツを参照

#### 3.1 Sanity型拡張
```typescript
// src/types/sanity.ts
export interface Article {
  // 既存フィールド...
  
  // Webflow統合用（オプショナル）
  webflowSource?: {
    collectionId: string;
    itemId: string;
    slug: string;
  };
}
```

#### 3.2 ハイブリッドローダー作成
```typescript
// src/lib/hybridContentLoader.ts
export async function loadArticle(articleId: string): Promise<Article> {
  const sanityArticle = await getSanityArticle(articleId);
  
  if (sanityArticle.webflowSource) {
    // Webflowから取得
    return await fetchWebflowArticle(sanityArticle.webflowSource);
  }
  
  // 通常のSanity記事
  return sanityArticle;
}
```

#### 3.3 Quest統合
```typescript
// Quest内の記事リストでWebflow/Sanity混在を処理
export async function loadQuestWithArticles(questId: string): Promise<Quest> {
  const quest = await getSanityQuest(questId);
  
  // 各記事をWebflow/Sanityから取得
  const articles = await Promise.all(
    quest.articles.map(ref => loadArticle(ref._id))
  );
  
  return { ...quest, articles };
}
```

### Phase 4: 選択メカニズム (2-3時間)
**目的**: 「指定したコンテンツのみ」を表示する仕組み

#### オプションA: Sanityで管理（推奨）
```typescript
// Sanity Studio で Webflow item を選択できるカスタムインプット
// または単純にitemIdを手動入力
```

#### オプションB: Webflowフィールド
```typescript
// Webflow側に publish_to_app フィールドを追加
// Edge Functionでフィルタリング
```

### Phase 5: キャッシュ・最適化 (2-3時間)
**目的**: パフォーマンス改善

#### 5.1 Edge Functionキャッシュ
```typescript
// Supabase Storage または Redis でキャッシュ
// TTL: 5-10分
```

#### 5.2 クライアント側キャッシュ
```typescript
// React Query のキャッシュ設定
staleTime: 5 * 60 * 1000, // 5分
cacheTime: 10 * 60 * 1000, // 10分
```

### Phase 6: エラーハンドリング・UI (1-2時間)
**目的**: 本番環境対応

#### 6.1 エラー状態
- Webflow API エラー
- レート制限
- ネットワークエラー
- コンテンツが見つからない

#### 6.2 ローディング状態
- スケルトンUI
- プログレスインジケーター

#### 6.3 フォールバック
- Webflow取得失敗時のSanityフォールバック

### Phase 7: テスト・ドキュメント (1-2時間)
**目的**: 品質保証

#### 7.1 テスト
- Edge Function単体テスト
- 変換レイヤーのテスト
- 統合テスト

#### 7.2 ドキュメント
- セットアップガイド
- Webflow コレクション設定方法
- トラブルシューティング

## 技術スタック

### 新規追加
- **Webflow CMS API**: コンテンツ取得
- **Supabase Edge Function**: APIプロキシ
- **html-to-portable-text** (optional): HTML変換

### 既存利用
- React Query: データフェッチング
- Sanity Client: 既存CMS
- TypeScript: 型安全性

## ファイル構成

```
bono-training/
├── supabase/
│   └── functions/
│       └── webflow-proxy/
│           ├── index.ts
│           ├── webflow-client.ts
│           ├── transformers.ts
│           └── types.ts
│
├── src/
│   ├── lib/
│   │   ├── hybridContentLoader.ts    # 新規
│   │   └── webflowClient.ts          # 新規（フロント用）
│   │
│   ├── hooks/
│   │   └── useWebflowArticle.ts      # 新規
│   │
│   ├── types/
│   │   ├── sanity.ts                 # 拡張
│   │   └── webflow.ts                # 新規
│   │
│   └── pages/
│       └── Dev/
│           └── WebflowTest.tsx       # 新規
│
└── .claude/tasks/005-webflow-integration/
    ├── feasibility-analysis.md       # 完了
    ├── implementation-plan.md        # このファイル
    └── user-questions.md             # 次に作成
```

## 見積もり時間

| Phase | 内容 | 時間 |
|-------|------|------|
| Phase 0 | 準備・調査 | 1-2h |
| Phase 1 | Edge Function基盤 | 2-3h |
| Phase 2 | POC実装 | 2-3h |
| Phase 3 | Sanity統合 | 3-4h |
| Phase 4 | 選択メカニズム | 2-3h |
| Phase 5 | キャッシュ・最適化 | 2-3h |
| Phase 6 | エラーハンドリング | 1-2h |
| Phase 7 | テスト・ドキュメント | 1-2h |
| **合計** | | **14-22h** |

## 段階的リリース戦略

### ステップ1: POC（Phase 0-2）
- 1つのWebflow記事を `/dev/webflow-test` で表示
- 技術的実現可能性を確認
- **ユーザー確認ポイント**: 動作確認、コンテンツ表示確認

### ステップ2: 統合（Phase 3-4）
- Sanity Questに統合
- 選択メカニズム実装
- **ユーザー確認ポイント**: 実際のLesson/Questでの動作確認

### ステップ3: 本番化（Phase 5-7）
- パフォーマンス最適化
- エラーハンドリング
- 本番環境デプロイ

## 次のアクション

1. ✅ 実装計画作成（完了）
2. ⏳ ユーザーへの質問リスト作成
3. ⏳ ユーザーからの回答待ち
4. ⏳ Phase 1実装開始

## 注意事項

### セキュリティ
- ⚠️ Webflow API トークンは絶対にクライアント側に露出させない
- ✅ Supabase Edge Functionで認証・プロキシ
- ✅ Supabase Secrets で管理

### パフォーマンス
- ⚠️ Webflow API レート制限に注意
- ✅ キャッシュ実装必須
- ✅ 並列リクエストの制限

### データ整合性
- ⚠️ Webflow slug変更時の対応
- ✅ itemId を主キーとして使用
- ✅ エラー時のフォールバック
