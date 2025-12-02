# Edge Function ログ確認ガイド

**最終更新**: 2025-11-21

## 🎯 目的

Supabase Edge Functionのログを**自動的に**取得して確認できるようにし、ダッシュボードを開く手間を削減する。

---

## 📋 使い方

### 1. 全てのログを確認（最も簡単）

```bash
npm run logs
```

以下の関数のログを自動取得します:
- `create-checkout`
- `stripe-webhook-test`
- `create-customer-portal`
- `check-subscription`

**出力例:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Function: create-checkout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2025-11-21 11:30:15 [CREATE-CHECKOUT] リクエスト受信 {"useTestPrice":true}
2025-11-21 11:30:15 [CREATE-CHECKOUT] Stripe環境: test
2025-11-21 11:30:16 [CREATE-CHECKOUT] Checkoutセッション作成完了
```

---

### 2. 特定の関数のログを確認

#### Checkout関数のログ
```bash
npm run logs:checkout
```

#### Webhook関数のログ
```bash
npm run logs:webhook
```

#### 任意の関数のログ
```bash
./scripts/check-edge-function-logs.sh [関数名] [件数]

# 例: create-checkoutの最新100件
./scripts/check-edge-function-logs.sh create-checkout 100
```

---

### 3. リアルタイムでログを監視（テスト中に便利）

```bash
npm run logs:watch
```

または特定の関数を監視:
```bash
./scripts/watch-edge-function-logs.sh stripe-webhook-test
```

**いつ使う？**
- 決済テストの実行中
- Webhookの動作確認中
- エラーがリアルタイムで見たい時

**終了方法:** `Ctrl+C`

---

## 🔍 テスト時の推奨ワークフロー

### テスト実行前

```bash
# ターミナルを2つ開く

# ターミナル1: 開発サーバー
npm run dev

# ターミナル2: ログ監視
npm run logs:watch
```

### テスト実行中

1. ブラウザで決済操作を実行
2. ターミナル2でリアルタイムにログを確認
3. エラーが出たら即座に内容を確認できる

### テスト完了後

```bash
# 全てのログをまとめて確認
npm run logs
```

---

## ✅ メリット

1. **ダッシュボードを開く必要なし**
   - ターミナルで全て完結

2. **正確性が向上**
   - ログが自動で取得されるので、見落としがない

3. **手間が激減**
   - コマンド1つで全関数のログを確認

4. **リアルタイム監視**
   - テスト中にエラーを即座に発見

---

## 📝 補足

### ログが取得できない場合

Supabase CLIにログインしているか確認:
```bash
npx supabase login
```

### より詳細なログが必要な場合

件数を増やす:
```bash
./scripts/check-edge-function-logs.sh create-checkout 200
```

---

**これでダッシュボードを開く指示は不要になります！**
