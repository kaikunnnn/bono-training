# セキュリティ監査レポート

**作成日**: 2026-03-17
**最終更新**: 2026-03-17
**ステータス**: Phase 1 完了、Phase 2 進行中

---

## 総合評価

| カテゴリ | 評価 | コメント |
|---------|------|---------|
| **認証** | 🟡 中程度 | Supabase Auth基盤は良好 |
| **認可** | 🔴 不足 | RLS無効、フロントエンド検証のみ |
| **入力検証** | 🔴 不足 | バックエンド検証が最小限 |
| **データ保護** | 🟡 中程度 | 暗号化OK、アクセス制御に課題 |
| **サードパーティ** | 🟡 中程度 | Stripe署名検証OK |
| **OWASP対策** | 🟡 中程度 | RLS無効が主な課題 |

**総合セキュリティ評価**: **🟡 中程度（改善必須）**

---

## 改善計画

### Phase 1: Critical（緊急 - 1-2日）

| # | 問題 | 影響 | ステータス |
|---|------|------|-----------|
| 1.1 | RLS無効 | 他ユーザーのデータ閲覧・改ざん可能 | ✅ 完了（マイグレーション作成） |
| 1.2 | レース条件 | 同時クリックでPK重複エラー | ✅ 完了（upsertパターン適用） |

**作成したファイル**:
- `supabase/migrations/20260317_enable_rls_security.sql` - RLS有効化マイグレーション
- `src/services/progress.ts` - upsertパターンに修正

### Phase 2: High（高優先度 - 1週間）

| # | 問題 | 影響 | ステータス |
|---|------|------|-----------|
| 2.1 | バックエンド検証不足 | article_id/lesson_id存在確認なし | ⏳ 未着手 |
| 2.2 | Markdown HTMLサニタイゼーション | rehypeRawでXSSリスク | 📋 調査完了 |
| 2.3 | 入力検証なし | 型安全検証がない | ⏳ 未着手 |

**Phase 2.2 調査結果**:
XSSリスクのあるファイル:
1. `src/components/training/SimpleMarkdownRenderer.tsx` - `rehypeRaw`使用
2. `src/components/guide/GuideContent.tsx` - `rehypeRaw`使用
3. `src/components/blog/BlogContent.tsx` - `dangerouslySetInnerHTML`使用

**必要なパッケージ（未インストール）**:
- `rehype-sanitize` - react-markdownのサニタイゼーション
- `dompurify` + `@types/dompurify` - dangerouslySetInnerHTMLのサニタイゼーション

### Phase 3: Medium（中優先度 - 2週間）

| # | 問題 | 影響 | ステータス |
|---|------|------|-----------|
| 3.1 | CORS設定 | `*` で広すぎる | 📋 調査完了 |
| 3.2 | console.logにセンシティブ情報 | 本番ログ漏洩リスク | 📋 調査完了 |
| 3.3 | 外部キー制約なし | 孤児レコードの可能性 | ⏳ 未着手 |

**Phase 3.1 調査結果（CORS）**:
17箇所で`Access-Control-Allow-Origin: *`を使用。共通設定ファイル:
- `supabase/functions/_shared/cors.ts`

**修正方法**:
```typescript
const allowedOrigins = [
  'https://bono-training.vercel.app',
  'https://bono.design',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '',
].filter(Boolean);
```

**Phase 3.2 調査結果（センシティブログ）**:
本番コードで秘密鍵の一部をログ出力している箇所:
1. `supabase/functions/stripe-webhook/index.ts:85`
   - `SUPABASE_SERVICE_ROLE_KEY (first 20 chars)`
2. `supabase/functions/check-subscription/utils.ts:30-31`
   - `SUPABASE_ANON_KEY (first 20)`
   - `SUPABASE_SERVICE_ROLE_KEY (first 20)`

**対応**: デバッグログを削除または`NODE_ENV === 'development'`でガード

---

## 詳細: Phase 1

### 1.1 RLS無効（最重要）

**影響を受けるテーブル**:
- `article_progress` - RLS無効
- `lesson_progress` - RLS無効
- `user_progress` - RLS無効
- `article_bookmarks` - RLS無効

**リスク**:
1. 認証済みユーザーなら誰でも他ユーザーの進捗を SELECT 可能
2. 他ユーザーの進捗を UPDATE/DELETE 可能
3. 他ユーザーの user_id で INSERT 可能（なりすまし）

**対策SQL**:
```sql
-- 1. RLS を有効化
ALTER TABLE article_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;

-- 2. article_progress のポリシー
CREATE POLICY "Users can view own article progress"
  ON article_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article progress"
  ON article_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own article progress"
  ON article_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own article progress"
  ON article_progress FOR DELETE
  USING (auth.uid() = user_id);

-- 3. lesson_progress, user_progress, article_bookmarks にも同様に適用
```

### 1.2 レース条件

**問題のコード** (`src/services/progress.ts`):
```typescript
// 現在の実装 - SELECT → INSERT パターンでレース条件
const { data: existing } = await supabase
  .from('article_progress')
  .select('*')
  .eq('user_id', user.id)
  .eq('article_id', articleId)
  .single();

if (existing) {
  // UPDATE
} else {
  // INSERT ← ここでレース条件発生の可能性
}
```

**問題シナリオ**:
1. ユーザーが同じボタンを素早く2回クリック
2. リクエスト A: SELECT → existing なし
3. リクエスト B: SELECT → existing なし（A の INSERT がまだ）
4. リクエスト A: INSERT 成功
5. リクエスト B: INSERT → PK 重複エラー

**対策**: upsert パターンに変更
```typescript
const { error } = await supabase
  .from('article_progress')
  .upsert({
    user_id: user.id,
    article_id: articleId,
    lesson_id: lessonId,
    status: newStatus,
    completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,article_id'
  });
```

---

## 詳細: Phase 2

### 2.1 バックエンド検証不足

**現状**:
- `article_id`, `lesson_id` の存在確認をしていない
- Sanity CMSのデータは外部なのでFKは困難

**対策案**:
1. INSERT 前に Sanity から article/lesson 存在確認
2. 定期的なクリーンアップジョブで孤児レコード削除

### 2.2 Markdown HTMLサニタイゼーション

**問題のコード** (`src/components/training/SimpleMarkdownRenderer.tsx`):
```typescript
<ReactMarkdown
  rehypePlugins={[rehypeRaw]}  // ← HTML許可でXSSリスク
  className="prose"
>
  {content}
</ReactMarkdown>
```

**対策**: DOMPurifyでサニタイズ
```typescript
import DOMPurify from 'dompurify';
import rehypeSanitize from 'rehype-sanitize';

<ReactMarkdown
  rehypePlugins={[rehypeRaw, rehypeSanitize]}
  className="prose"
>
  {content}
</ReactMarkdown>
```

### 2.3 入力検証なし

**対策**: Zodスキーマ導入
```typescript
import { z } from 'zod';

const articleProgressSchema = z.object({
  articleId: z.string().min(1),
  lessonId: z.string().min(1),
  status: z.enum(['not_started', 'in_progress', 'completed']),
});
```

---

## 詳細: Phase 3

### 3.1 CORS設定

**現状** (`supabase/functions/_shared/cors.ts`):
```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // ← 広すぎる
  ...
};
```

**対策**: 特定ドメインに限定
```typescript
const allowedOrigins = [
  'https://bono-training.vercel.app',
  'https://bono-training.com',
];
```

### 3.2 センシティブ情報のログ

**問題**: `console.log` でセンシティブ情報を出力している可能性

**対策**:
1. 本番環境で `console.log` を無効化
2. ログレベル管理の導入
3. センシティブ情報のマスキング

---

## OWASP Top 10 チェック結果

| # | 脆弱性 | ステータス | 詳細 |
|---|--------|-----------|------|
| A01 | Broken Access Control | 🔴 高リスク | RLS無効 |
| A02 | Cryptographic Failures | ✅ 低リスク | HTTPS使用 |
| A03 | Injection | 🟡 中リスク | 入力検証脆弱 |
| A04 | Insecure Design | 🟡 中リスク | フロントエンド検証のみ |
| A05 | Security Misconfiguration | ⚠️ 注視 | CORS設定 |
| A06 | Outdated Components | ✅ 低リスク | 定期更新 |
| A07 | Auth Failures | 🟡 中リスク | Supabase Auth使用 |
| A08 | Data Integrity | ✅ 低リスク | npm lock file |
| A09 | Logging & Monitoring | 🟡 中リスク | console.log多用 |
| A10 | SSRF | ✅ 低リスク | 制限あり |

---

## 良好な実装（維持すべき点）

- ✅ **Supabase Auth**: 適切に実装
- ✅ **Stripe Webhook署名検証**: 実装済み
- ✅ **JWT認証**: 自動管理で安全
- ✅ **Parameterized Query**: SQLインジェクション対策済み
- ✅ **dangerouslySetInnerHTML未使用**: 基本的なXSS対策済み
- ✅ **環境変数分離**: VITE_プレフィックスで適切に管理

---

## 関連ファイル

**認証関連**:
- `src/contexts/AuthContext.tsx`
- `src/services/auth.ts`
- `src/integrations/supabase/client.ts`

**RLS・データベース**:
- `supabase/migrations/`

**Edge Functions**:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout/index.ts`

**データアクセス**:
- `src/services/progress.ts`
- `src/services/bookmarks.ts`

**ルート保護**:
- `src/components/auth/PrivateRoute.tsx`
- `src/components/subscription/ProtectedPremiumRoute.tsx`

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-17 | Phase 1 完了: RLSマイグレーション作成、レース条件修正 |
| 2026-03-17 | Phase 2-3 調査完了: XSSリスク箇所特定、CORS/ログ問題特定 |
| 2026-03-17 | 初版作成 - セキュリティ監査実施 |
