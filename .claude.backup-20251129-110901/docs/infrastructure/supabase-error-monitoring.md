# Supabase エラーログ監視の効率化

## 🎯 問題点

Supabase Dashboard でエラーログを確認するのが面倒

## ✅ 解決策

### 1. クイックチェックスクリプト（最も簡単）

```bash
./scripts/quick-check-errors.sh
```

**機能:**

- 主要な Edge Functions のログ URL を一覧表示
- macOS の場合、ブラウザで自動的に開く

### 2. エラーログ監視スクリプト

```bash
# 1回だけチェック
./scripts/monitor-supabase-errors.sh create-checkout

# 継続的に監視（30秒ごとにチェック）
./scripts/monitor-supabase-errors.sh create-checkout --watch
```

**機能:**

- 指定した関数のエラーログを監視
- 監視モードで継続的にチェック

---

## 🔧 より高度な解決策（将来的に実装可能）

### オプション 1: エラーログを Slack/Discord に通知

Supabase の Webhook 機能を使って、エラーが発生したら自動的に通知

### オプション 2: エラーログを自動収集してファイルに保存

定期的にログを取得して、エラーのみをファイルに保存

### オプション 3: エラーダッシュボードの作成

エラーログを集約して、見やすいダッシュボードで表示

---

## 📋 現在利用可能な方法

### 方法 1: ブラウザのブックマーク

以下の URL をブックマークに追加：

```
https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
```

### 方法 2: クイックチェックスクリプト

```bash
./scripts/quick-check-errors.sh
```

### 方法 3: 監視スクリプト

```bash
./scripts/monitor-supabase-errors.sh --watch
```

---

## 🚀 推奨ワークフロー

1. **日常的な確認**: クイックチェックスクリプトを使用
2. **問題が発生した時**: 監視スクリプトで継続的に監視
3. **詳細な確認**: Supabase Dashboard で直接確認

---

## 💡 今後の改善案

- Supabase CLI の API が使えるようになったら、自動的にエラーログを取得
- エラーログを自動的に Slack/Discord に通知
- エラーログを自動的にファイルに保存して、履歴を管理


