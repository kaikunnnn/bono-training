# Webflow CMS統合 - 技術的実現可能性分析

## 概要

現在のSanity CMSベースのLesson/Quest/Article構造に、Webflow CMSのコンテンツを統合する実現可能性を調査します。

## 現在のアーキテクチャ

### Sanity CMS構造
```
Lesson (レッスン)
  ├── Quest 1 (クエスト)
  │   ├── Article 1 (記事/動画)
  │   ├── Article 2
  │   └── Article N
  ├── Quest 2
  └── Quest N
```

### データモデル
- **Lesson**: タイトル、説明、アイコン、カテゴリ、isPremiumフラグ
- **Quest**: questNumber、タイトル、説明、目標、推定時間、記事リスト
- **Article**: タイトル、slug、動画URL、動画時間、コンテンツ(PortableText)、isPremiumフラグ

### 現在の実装
- `src/lib/sanity.ts`: Sanity クライアントとGROQクエリ
- `src/types/sanity.ts`: 型定義
- `src/pages/LessonDetail.tsx`: レッスン詳細ページ
- `src/pages/ArticleDetail.tsx`: 記事詳細ページ

## Webflow CMS統合の3つのアプローチ

### アプローチ1: 一方向同期 (Webflow → Sanity)
**概要**: Webflowのコンテンツを定期的にSanityにコピー

**メリット**:
- シンプルなレンダリング（既存のSanityクエリをそのまま使用）
- 一貫した検索・権限管理
- オフライン対応可能

**デメリット**:
- データ重複
- 同期の複雑さ（Webhook設定、差分検出）
- リアルタイム性の欠如

**実装の複雑度**: 高

### アプローチ2: ランタイム集約 (両APIから取得してマージ)
**概要**: リクエスト時に両方のAPIから取得し、サーバー側でマージ

**メリット**:
- データ重複なし
- プロトタイプが速い
- 常に最新データ

**デメリット**:
- レイテンシー増加
- 外部API依存（可用性リスク）
- レート制限対応が必要

**実装の複雑度**: 中

### アプローチ3: ハイブリッド（Sanityをオーケストレーター）★推奨
**概要**: SanityにWebflow参照（collectionId + itemId）を保存し、必要時に取得

**メリット**:
- 「選択されたコンテンツのみ」を自然に実現
- データ重複最小
- 明確な選択制御
- 既存のSanity構造を維持

**デメリット**:
- サーバー側の変換レイヤーが必要
- Webflow APIコールのレイテンシー

**実装の複雑度**: 中

## 推奨アプローチ: ハイブリッド方式

### データモデル拡張案

#### Sanity側の拡張
```typescript
// 既存のArticle型に追加
interface Article {
  // ... 既存フィールド
  
  // Webflow統合用フィールド（オプショナル）
  webflowSource?: {
    collectionId: string;
    itemId: string;
    slug: string;  // バックアップ用
  };
}
```

### アーキテクチャ図
```
Frontend (React)
    ↓
Supabase Edge Function (プロキシ)
    ↓
    ├─→ Sanity CMS (構造・参照)
    └─→ Webflow CMS API (コンテンツ)
         ↓
    変換レイヤー (WebflowArticle → Article)
         ↓
    統合されたレスポンス
```

## Webflow CMS API について

### 認証
- OAuth または Personal Access Token (PAT)
- **重要**: トークンはサーバー側のみで使用（Edge Function）

### エンドポイント
- `GET /collections` - コレクション一覧
- `GET /collections/{collectionId}/items` - アイテム一覧
- `GET /collections/{collectionId}/items/{itemId}` - 特定アイテム取得

### 制限事項
- レート制限あり
- リッチテキストはHTML形式（PortableTextではない）
- Draft vs Published の状態管理

### コンテンツ形式の違い
| 項目 | Sanity | Webflow |
|------|--------|---------|
| リッチテキスト | PortableText (JSON) | HTML |
| 画像 | Asset参照 | URL |
| 参照 | Reference型 | ID文字列 |

## POC（概念実証）実装計画

### Phase 1: 最小限のテスト
1. **Edge Function作成**: `/api/webflow/article`
   - 入力: `collectionId`, `itemId` または `slug`
   - 処理: Webflow APIから取得 → 変換
   - 出力: Article型のJSON

2. **変換レイヤー**: `WebflowArticle → Article`
   ```typescript
   function transformWebflowToArticle(webflowItem: any): Article {
     return {
       _id: `webflow-${webflowItem.id}`,
       _type: 'article',
       title: webflowItem.name,
       slug: { _type: 'slug', current: webflowItem.slug },
       videoUrl: webflowItem['video-url'],
       videoDuration: webflowItem['video-duration'],
       content: convertHtmlToPortableText(webflowItem['rich-text']),
       isPremium: webflowItem['is-premium'],
       // ...
     };
   }
   ```

3. **テストページ**: `/dev/webflow-test`
   - 1つのWebflow記事を表示
   - HTMLレンダリングのテスト

### Phase 2: Quest統合
1. Sanity Questドキュメントに `webflowArticleRefs` 配列を追加
2. Edge Functionで複数記事を解決
3. 既存のQuestCardコンポーネントで表示

### Phase 3: 選択メカニズム
以下のいずれかを実装:
- **オプションA**: Webflowに `publish_to_app` ブール値フィールド
- **オプションB**: SanityにWebflow item IDの許可リスト
- **オプションC**: Sanity Quest/Lessonドキュメントで明示的に参照

## 技術的実現可能性: ✅ 可能

### 結論
**Webflow CMSとSanity CMSの統合は技術的に実現可能です。**

推奨アプローチ（ハイブリッド方式）により:
- ✅ 「指定したコンテンツのみ」表示可能
- ✅ WebflowとSanityのデータを紐付け可能
- ✅ 既存のSanity構造を維持
- ✅ 段階的な実装が可能

### 必要な情報（ユーザーへの質問）

#### 1. Webflowプロジェクト情報
- [ ] WebflowサイトURL
- [ ] Webflow API トークン（読み取り権限）
- [ ] コレクション名/ID（Lesson, Quest, Article相当）

#### 2. コンテンツ構造
- [ ] Webflowのフィールド名（title, slug, video-url など）
- [ ] Webflowに「公開フラグ」のようなフィールドはあるか？

#### 3. 選択メカニズム
- [ ] どのように「指定したコンテンツ」を選びたいか？
  - タグ/カテゴリで絞り込み
  - 手動で選択（Sanityで管理）
  - Webflow側のフラグ

#### 4. 紐付け方法
- [ ] 既存のSanity Lesson/Questに追加したいか？
- [ ] 新しいLesson/Questを作りたいか？
- [ ] 混在させたいか（一部Sanity、一部Webflow）？

#### 5. コンテンツ形式
- [ ] Webflowのリッチテキスト（HTML）をそのまま表示してOK？
- [ ] PortableTextに変換が必要？

## 次のステップ

1. ✅ 技術的実現可能性を確認（完了）
2. ⏳ ユーザーから必要情報を取得
3. ⏳ POC実装計画の詳細化
4. ⏳ Edge Function作成
5. ⏳ 変換レイヤー実装
6. ⏳ テストページで動作確認
7. ⏳ 本番統合

## リスクと対策

### リスク1: Webflow APIレート制限
**対策**: Edge Functionでキャッシュ実装（Redis or Supabase Storage）

### リスク2: HTML vs PortableText
**対策**: 
- 短期: HTMLをそのままレンダリング
- 長期: HTML→PortableText変換ライブラリ検討

### リスク3: Webflowコンテンツ更新の反映
**対策**: 
- 手動: 管理画面でキャッシュクリア
- 自動: Webflow Webhook → Edge Function → キャッシュ更新

### リスク4: パフォーマンス
**対策**: 
- 初期ロード時のみWebflow API呼び出し
- 結果をクライアント側でキャッシュ
- 必要に応じてSanityに同期

## 参考資料

- [Webflow CMS API Documentation](https://developers.webflow.com/reference/cms)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Sanity Reference Fields](https://www.sanity.io/docs/reference-type)
