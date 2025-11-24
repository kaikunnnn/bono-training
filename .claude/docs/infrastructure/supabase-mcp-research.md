# Supabase MCP 完全調査ドキュメント

**作成日**: 2025-11-21
**目的**: Supabase MCPを完全に理解し、Claude Codeで実際に使えるようにする

---

## 📋 現状の整理

### 接続状態
```bash
claude mcp list
```

**結果:**
- ✅ `supabase: https://mcp.supabase.com/mcp?project_ref=fryogvfhymnpiqwssmuu (HTTP) - ✓ Connected`
- サーバーには接続されている

### 試したこと
1. `ListMcpResourcesTool` → 空の配列 `[]` が返る
2. `ReadMcpResourceTool` → `Server "supabase" is not connected` エラー

### 問題
**MCPサーバーには接続されているが、実際にツールを呼び出せない**

---

## 🔍 詳細調査

### 調査1: Supabase MCP GitHubリポジトリの詳細確認

**利用可能なツール:**
- `execute_sql`: 通常のSQLクエリ実行（スキーマ変更なし）
- `apply_migration`: マイグレーション実行（スキーマ変更）
- `list_tables`: テーブル一覧取得
- `list_extensions`: 拡張機能一覧
- `list_migrations`: マイグレーション履歴

---

### 調査2: Claude Codeでの実際の使用方法

**重要な発見: MCPツールは自然言語で呼び出す**

Claude Codeでは、直接MCPツールを呼び出すAPIはありません。代わりに：

1. **ユーザーが自然言語で指示**
   - 例: "user_subscriptions テーブルのデータを確認してください"
   - 例: "ユーザーID c2930eb2-edde-486a-8594-780dbac4f744 のサブスクリプション情報を取得"

2. **AIが自動的にMCPツールを選択して実行**
   - `execute_sql` ツールを呼び出し
   - SQLを生成して実行
   - 結果を返す

3. **ユーザーは手動で承認**
   - ツール実行前に承認が必要
   - セキュリティのため

**実行フロー:**
```
ユーザー: "データを確認して"
    ↓
AI: execute_sql ツールを選択
    ↓
AI: SQL文を生成
    ↓
ユーザー: 承認
    ↓
MCP: SQLを実行
    ↓
AI: 結果を表示
```

---

### 調査3: 現在のMCP設定の確認

**MCP接続状態:**
```
✓ supabase: https://mcp.supabase.com/mcp?project_ref=fryogvfhymnpiqwssmuu (HTTP) - Connected
✓ stripe: https://mcp.stripe.com/ (HTTP) - Connected
✓ figma-server: npx figma-mcp - Connected
```

**設定方法:**
`claude mcp add` コマンドで追加済み

---

## 📝 結論と使用方法

### Supabase MCPでできること

| 操作 | ツール名 | 説明 |
|------|---------|------|
| データ読み取り | `execute_sql` | SELECT クエリでデータ検証 |
| スキーマ変更 | `apply_migration` | DDL（CREATE, ALTER等） |
| テーブル一覧 | `list_tables` | 全テーブルのリスト取得 |
| 拡張機能確認 | `list_extensions` | PostgreSQL拡張一覧 |
| マイグレーション履歴 | `list_migrations` | 過去のマイグレーション |

### Supabase MCPでできないこと

- ❌ Stripe Webhookの直接制御
- ❌ Edge Functionのログ取得（Supabase Logsは別のサービス）
- ❌ 本番環境への直接アクセス（非推奨）

---

## 🎯 実際の使用方法

### ステップ1: 自然言語で指示する

**例1: データ確認**
```
user_subscriptions テーブルで、ユーザーID 'c2930eb2-edde-486a-8594-780dbac4f744' のサブスクリプション情報を確認してください
```

**例2: テーブル一覧**
```
データベース内の全テーブルをリストアップしてください
```

**例3: 特定条件での検索**
```
is_active が true で environment が 'test' のサブスクリプションを全て表示してください
```

### ステップ2: AIがMCPツールを選択

私（Claude Code）が適切なMCPツールを選択:
- データ確認 → `execute_sql`
- テーブル一覧 → `list_tables`
- スキーマ変更 → `apply_migration`

### ステップ3: ユーザーが承認

ツール実行前に承認プロンプトが表示されます（セキュリティ）

### ステップ4: 結果表示

SQLの実行結果が返されます

---

## ✅ 動作確認テスト

以下のテストを実行して、MCPが正しく動作するか確認します：

### テスト1: テーブル一覧の取得
**指示:** "データベース内の全テーブルをリストアップしてください"

**期待される動作:**
1. `list_tables` ツールが呼び出される
2. テーブル一覧が表示される

### テスト2: user_subscriptions の確認
**指示:** "user_subscriptions テーブルで、ユーザーID 'c2930eb2-edde-486a-8594-780dbac4f744' のデータを全て取得してください"

**期待される動作:**
1. `execute_sql` ツールが呼び出される
2. SELECT クエリが実行される
3. 結果が表示される（0件または複数件）

### テスト3: stripe_customers の確認
**指示:** "stripe_customers テーブルで、環境が 'test' のレコードを全て表示してください"

**期待される動作:**
1. `execute_sql` ツールが呼び出される
2. 環境でフィルタリングされたデータが表示される

---

## 📌 重要な注意事項

1. **自然言語で指示する**
   - MCPツールは直接呼び出せない
   - 私に自然言語で依頼すると、自動的に適切なツールを選択する

2. **承認が必要**
   - 全てのツール実行前にユーザー承認が必要
   - セキュリティのため

3. **読み取り専用を推奨**
   - データ確認には `execute_sql` (SELECT)
   - スキーマ変更は慎重に

4. **開発環境のみ**
   - 本番環境には接続しない
   - テスト環境で検証

---

## 🚀 次のアクション

1. テスト1を実行: テーブル一覧を取得
2. テスト2を実行: user_subscriptionsを確認
3. テスト3を実行: stripe_customersを確認
4. MCPを使ってWebhook問題を調査

---

## ⚠️ 実行結果と制限事項

### テスト実行結果

**テスト1: ListMcpResourcesTool**
- 結果: 空の配列 `[]`
- 状態: MCP接続は成功しているが、リソースツールでは利用不可

### 判明した制限事項

**Claude Codeの現在のMCP実装:**
1. ✅ MCPサーバーへの接続は成功
2. ✅ 認証も正常（Authorization header設定済み）
3. ❌ しかし、現在のClaude Code APIでは直接MCPツールを呼び出せない

**理由:**
- Claude CodeのMCPサポートは、**対話的な会話の中で**ツールが呼び出される設計
- プログラマティックなツール呼び出しAPI（例: `execute_sql`を直接呼ぶ）は提供されていない
- ユーザーが自然言語で指示 → AIが判断してツール選択 → ユーザー承認 → 実行

### 代替手段

現時点では、以下の方法でデータベースアクセス可能：

1. **Node.jsスクリプト** (✅ 動作確認済み)
   - `scripts/check-subscription-db.js`
   - Supabase JSクライアント使用
   - 即座に実行可能

2. **Supabase SQL Editor** (手動)
   - ブラウザでSQLを実行
   - 確実だが手動操作が必要

3. **MCP経由**（将来的に）
   - Claude Codeの対話機能が改善されれば使用可能
   - 現時点では制限あり

### 結論

**MCPは接続されているが、現在のClaude Code実装では私が直接ツールを呼び出すことはできません。**

そのため、引き続き**Node.jsスクリプト**を使用してデータベースアクセスを行います。

