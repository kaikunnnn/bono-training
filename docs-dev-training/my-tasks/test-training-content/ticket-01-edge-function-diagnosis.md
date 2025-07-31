# 🚨 [緊急度：高] Edge Function診断・修正

## 問題の詳細

### 現象
- 「ECサイト商品カタログをデザインしよう」がUI上で表示されない
- Edge Function `get-training-list` のログが確認できない状況
- Storage に存在するコンテンツが正しく取得・返却されていない可能性

### 影響範囲
- `/training` ページでのトレーニング一覧表示
- ユーザーがトレーニングコンテンツにアクセスできない

## 調査手順

### 1. Edge Function実行状況確認
```bash
# Supabase Analyticsでのログ確認
- get-training-list のエラーログ
- レスポンス内容の検証
- Storage アクセス権限の確認
```

### 2. Storage接続テスト
```javascript
// テスト用の確認コード
const { data: files, error } = await supabase.storage
  .from('training-content')
  .list('', { limit: 100 });
```

### 3. フロントマターパーサー動作確認
- 各 `index.md` のパース結果を検証
- YAML構文エラーの有無を確認

## 解決策の実装内容

### A. Edge Function強化
```typescript
// supabase/functions/get-training-list/index.ts
// 詳細ログ出力の追加
function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${new Date().toISOString()} ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

// エラーハンドリング強化
function createDetailedErrorResponse(error: any, context: string) {
  console.error(`[ERROR] ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  // ... 詳細エラーレスポンス
}
```

### B. Storage権限確認
```sql
-- RLS Policy確認
SELECT * FROM storage.policies 
WHERE bucket_id = 'training-content';
```

### C. フロントマターパーサー改善
```typescript
// より堅牢なYAMLパーサーの実装
function parseRobustFrontmatter(content: string) {
  // エラーハンドリング強化
  // デフォルト値設定
  // ログ出力改善
}
```

## テスト方法

### 1. 単体テスト
```bash
# Edge Function直接呼び出し
curl -X POST "https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-list" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

### 2. 統合テスト
- `/training` ページでの表示確認
- 各トレーニングカードの表示内容検証
- コンソールエラーの有無確認

### 3. データ整合性テスト
```javascript
// フロントエンドでの確認
import { getTrainings } from '@/services/training';
const trainings = await getTrainings();
console.log('取得されたトレーニング数:', trainings.length);
console.log('ec-product-catalog存在確認:', 
  trainings.some(t => t.slug === 'ec-product-catalog'));
```

## 完了基準

- [ ] Edge Function が Storage から正常にデータを取得できる
- [ ] 4つすべてのトレーニングがレスポンスに含まれる
- [ ] `ec-product-catalog` が正しく解析・返却される
- [ ] エラーログが適切に出力され、問題特定が可能になる
- [ ] フロントエンドで「ECサイト商品カタログをデザインしよう」が表示される

## 関連ファイル

### 直接修正対象
- `supabase/functions/get-training-list/index.ts`

### 検証対象
- `content/training/ec-product-catalog/index.md`
- `content/training/info-odai-book-rental/index.md`
- `content/training/todo-app/index.md`
- `content/training/ux-basics/index.md`

### フロントエンド側
- `src/services/training/training-list.ts`
- `src/hooks/useTrainingCache.ts`
- `src/pages/Training/index.tsx`

## 技術的詳細

### 問題の仮説
1. **Storage権限問題**: サービスロールキーでのアクセス権限不足
2. **フロントマターパースエラー**: 特定のYAML構文がパーサーでエラーになっている
3. **非同期処理問題**: ファイル読み込みの並行処理でのレースコンディション
4. **レスポンス構造不整合**: フロントエンドが期待する形式と異なるレスポンス

### デバッグポイント
- Storage `.list()` の戻り値
- 各 `index.md` の `.download()` 結果
- `parseFrontmatter()` の出力内容
- 最終的な `trainings` 配列の内容

### パフォーマンス考慮事項
- ファイル読み込みの並行処理最適化
- キャッシュ戦略の検討
- レスポンスサイズの最適化

## 優先度・緊急度
**緊急度：高** - ユーザーがトレーニングコンテンツにアクセスできない状況のため