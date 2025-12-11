# 潜在的な問題と対策

**作成日**: 2025-12-06
**ステータス**: Phase 4 完了

---

## 発見した問題サマリー

| 重大度 | 問題数 | 主な問題 |
|--------|--------|---------|
| 🔴 高 | 2 | RLS 無効、レース条件 |
| 🟡 中 | 4 | 外部キー欠如、型不整合、キャッシュなし |
| 🟢 低 | 3 | 2システム並存、監査履歴なし |

---

## セキュリティ

### 認証・認可

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| 未認証ユーザーの進捗登録 | ✅ 問題なし | サービス層で `getUser()` チェックあり | - |
| 他ユーザーの進捗操作 | 🔴 **重大** | RLS 無効のため、他ユーザーの進捗を操作可能 | RLS 有効化 |
| RLSポリシーの設定 | 🔴 **重大** | 全3テーブルで RLS が無効 | 下記 SQL 適用 |

### RLS 問題の詳細

**現状**:
```sql
-- 全てのテーブルで rowsecurity = false
user_progress     | false
article_progress  | false
lesson_progress   | false
```

**リスク**:
1. 認証済みユーザーなら誰でも他ユーザーの進捗を SELECT 可能
2. 他ユーザーの進捗を UPDATE/DELETE 可能
3. 他ユーザーの user_id で INSERT 可能（なりすまし）

**対策 SQL**:
```sql
-- 1. RLS を有効化
ALTER TABLE article_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

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

-- 3. lesson_progress, user_progress にも同様に適用
```

---

## データ整合性

### 重複・一貫性

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| 同一記事の重複完了 | ✅ 問題なし | PK が `(user_id, article_id)` で UNIQUE | - |
| 存在しない article_id での完了 | 🟡 **中** | 外部キー制約なし | FK 追加または validation |
| 存在しない lesson_id での完了 | 🟡 **中** | 外部キー制約なし | FK 追加または validation |
| UNIQUE制約 | ✅ 問題なし | PK で担保 | - |

### 外部キー問題の詳細

**現状**:
- `article_progress.article_id` (text) → 外部キーなし
- `article_progress.lesson_id` (text) → 外部キーなし
- `lesson_progress.lesson_id` (text) → 外部キーなし

**リスク**:
1. 存在しない article/lesson の進捗レコードが作成可能
2. article/lesson 削除時に孤児レコードが残る
3. データクリーンアップが困難

**対策案**:
```sql
-- 方法1: 外部キー追加（Sanity IDを参照するテーブルが必要）
-- → Sanity のデータは外部なので FK 設定は困難

-- 方法2: アプリケーション層でバリデーション
-- → INSERT 前に Sanity から article/lesson 存在確認

-- 方法3: 定期的なクリーンアップジョブ
-- → 孤児レコードを削除するバッチ処理
```

### 競合状態（Race Condition）

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| 同時リクエスト時の挙動 | 🔴 **高** | SELECT → INSERT パターンでレース条件 | upsert 使用 |
| トランザクション処理 | 🟡 **中** | トランザクション未使用 | - |

**レース条件の詳細**:

```typescript
// 現在の実装（progress.ts）
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

## パフォーマンス

### クエリ効率

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| N+1問題 | ✅ 問題なし | バッチ取得を使用 | - |
| インデックスの適切性 | ✅ 問題なし | 適切なインデックスあり | - |
| 大量データ時のパフォーマンス | 🟢 低 | 現時点では問題なし | 将来的に pagination |

**インデックス状況** (良好):
```sql
article_progress:
- article_progress_pkey (user_id, article_id)
- idx_article_progress_user (user_id)
- idx_article_progress_lesson (user_id, lesson_id)
- idx_article_progress_status (user_id, status)
- idx_article_progress_updated (user_id, updated_at DESC)
```

### フロントエンド

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| 不要な再レンダリング | 🟡 **中** | トリガーで全件再取得 | 部分更新 |
| メモ化の適切性 | ✅ 問題なし | useMemo 使用 | - |
| キャッシュなし | 🟡 **中** | 毎回 DB クエリ | React Query |

---

## エラーハンドリング

### 通信エラー

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| ネットワークエラー時のUI | ✅ 問題なし | toast でエラー表示 | - |
| タイムアウト処理 | 🟢 低 | 明示的なタイムアウトなし | timeout 設定 |
| リトライ機能 | 🟢 低 | リトライなし | 自動リトライ |

### サーバーエラー

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| 500エラー時の挙動 | ✅ 問題なし | try-catch でキャッチ | - |
| エラーメッセージの表示 | ✅ 問題なし | toast.error 表示 | - |

---

## UX（ユーザー体験）

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| ローディング表示 | ✅ 問題なし | isLoading でボタン disabled | - |
| 完了後のフィードバック | ✅ 問題なし | toast.success 表示 | - |
| 完了の取り消し機能 | ✅ 問題なし | トグルで実装済み | - |
| オフライン時の挙動 | 🟢 低 | 未対応 | Service Worker |
| 悲観的更新 | 🟡 **中** | UX が遅い | 楽観的更新 |

---

## 設計上の問題

### 2システム並存

| チェック項目 | 状態 | 問題の詳細 | 対策案 |
|-------------|------|-----------|--------|
| Training vs Article 進捗 | 🟢 低 | 実装パターンが異なる | 統一化 |
| 認証チェック方法の不一致 | 🟢 低 | props vs getUser() | 統一化 |
| status 型の不一致 | 🟢 低 | text vs enum | enum に統一 |

---

## 発見した問題（優先度順）

### 重大度: 🔴 高

1. **RLS 無効** - 他ユーザーのデータ閲覧・改ざん可能
   - 影響: セキュリティ侵害
   - 対策: RLS 有効化 + ポリシー設定
   - 工数: 1時間

2. **レース条件** - SELECT → INSERT パターンで重複エラーの可能性
   - 影響: ユーザー体験の悪化（エラー発生）
   - 対策: upsert パターンに変更
   - 工数: 30分

### 重大度: 🟡 中

1. **外部キー制約なし** - 孤児レコードの可能性
   - 影響: データ整合性
   - 対策: クリーンアップジョブ or バリデーション
   - 工数: 2時間

2. **キャッシュなし** - 毎回 DB クエリ実行
   - 影響: パフォーマンス
   - 対策: React Query 導入
   - 工数: 4時間

3. **悲観的更新のみ** - UX が遅い
   - 影響: ユーザー体験
   - 対策: 楽観的更新導入
   - 工数: 2時間

4. **トリガーで全件再取得** - ネットワーク効率
   - 影響: パフォーマンス
   - 対策: 部分更新の実装
   - 工数: 3時間

### 重大度: 🟢 低

1. **2システム並存** - コード重複、メンテナンス性
2. **監査履歴不完全** - user_progress に created_at なし
3. **オフライン未対応** - オフラインで操作不可

---

## 推奨アクション

| 優先度 | 問題 | 対策 | 工数見積 |
|--------|------|------|---------|
| 1 | RLS 無効 | RLS 有効化 + ポリシー設定 | 1h |
| 2 | レース条件 | upsert パターンに変更 | 30min |
| 3 | 悲観的更新 | 楽観的更新導入 | 2h |
| 4 | キャッシュなし | React Query 導入 | 4h |
| 5 | 外部キー欠如 | クリーンアップジョブ | 2h |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-06 | Phase 4 調査完了 - 全問題の分析完了 |
| 2025-12-06 | テンプレート作成 |
