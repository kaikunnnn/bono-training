# テスト中のエラーログ確認ワークフロー

## 🎯 問題点

テスト中に決済エラーが発生した時、Supabase や Stripe のダッシュボードに飛んでログを確認するのが面倒

## ✅ 解決策: エディタ内でログを確認

### 方法 1: 自動ログファイル生成（推奨）

```bash
# すべての関数のログファイルを作成
./scripts/auto-check-errors.sh

# 特定の関数のログファイルを作成
./scripts/auto-check-errors.sh create-checkout
```

**機能:**

- `.claude/logs/` ディレクトリにログファイルを作成
- エディタで開いて、エラーログを貼り付けるだけ
- ログをエディタ内で確認・管理できる

### 方法 2: TypeScript スクリプト

```bash
# すべての関数のログファイルを作成
tsx scripts/fetch-supabase-logs.ts

# 特定の関数のログファイルを作成
tsx scripts/fetch-supabase-logs.ts create-checkout
```

---

## 📋 ワークフロー

### ステップ 1: エラーログファイルを作成

```bash
./scripts/auto-check-errors.sh create-checkout
```

### ステップ 2: エディタでログファイルを開く

`.claude/logs/create-checkout-logs.md` が作成されるので、エディタで開く

### ステップ 3: Supabase Dashboard でエラーログを確認

ファイル内の URL をクリックして、Supabase Dashboard を開く

### ステップ 4: エラーログをコピーして貼り付け

エラーログをコピーして、ログファイルに貼り付ける

### ステップ 5: エディタ内でエラーログを分析

エディタ内でエラーログを確認し、原因を特定

---

## 🔧 より高度な解決策（将来的に実装可能）

### オプション 1: エラーログを自動取得

Supabase CLI の API が使えるようになったら、自動的にログを取得してファイルに保存

### オプション 2: エラーログを自動通知

エラーが発生したら、自動的にエディタ内で通知

### オプション 3: エラーログを自動分析

エラーログを自動的に分析して、原因を特定

---

## 📝 ログファイルの構造

```
.claude/logs/
├── create-checkout-logs.md
├── stripe-webhook-test-logs.md
├── check-subscription-logs.md
└── stripe-webhook-logs.md
```

各ファイルには以下が含まれます：

- Supabase Dashboard の URL
- エラーログを貼り付ける場所
- 確認すべきポイントのチェックリスト

---

## 💡 使い方のコツ

1. **テスト開始前にログファイルを作成**

   ```bash
   ./scripts/auto-check-errors.sh
   ```

2. **エラーが発生したら、すぐにログファイルを開く**

   - エディタで `.claude/logs/` を開く
   - 該当する関数のログファイルを開く

3. **エラーログをコピーして貼り付け**

   - Supabase Dashboard でエラーログをコピー
   - ログファイルに貼り付け

4. **エディタ内でエラーログを分析**
   - エラーメッセージを確認
   - 原因を特定
   - 修正方法を検討

---

## 🚀 今後の改善案

- エラーログを自動取得してファイルに保存
- エラーログを自動的に分析して、原因を特定
- エラーログを自動的に通知


