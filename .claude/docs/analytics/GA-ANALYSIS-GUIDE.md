# GA4 データ分析ガイド

**最終更新**: 2026-04-08

---

## このドキュメントの目的

GA4で取得できるデータから、**継続率と売上の改善**に必要な分析を行うためのガイド。

---

## 1. 取得できる指標と分析方法

### A. 売上ファネル分析

**目的**: サブスク転換率の改善

```
view_plans → select_plan → begin_checkout → purchase
```

| 指標 | 計算方法 | 目標値の目安 |
|------|---------|------------|
| プランページ到達率 | view_plans / 全ユーザー | - |
| プラン選択率 | select_plan / view_plans | 30%+ |
| チェックアウト開始率 | begin_checkout / select_plan | 50%+ |
| 購入完了率 | purchase / begin_checkout | 70%+ |
| ファネル全体CVR | purchase / view_plans | 5-10% |

**GA4での見方**:
1. レポート → Monetization → Ecommerce purchases（`purchase`イベントで自動生成）
2. 探索 → ファネルレポートで上記4ステップを設定

**改善アクション例**:
- select_plan → begin_checkout が低い → プランの説明・価格表示を改善
- begin_checkout → purchase が低い → Stripeチェックアウトの離脱を調査
- view_plans 自体が少ない → CTAの配置・文言を改善

### B. プラン選択傾向

**目的**: 価格戦略の判断

| 分析項目 | 使うイベント | パラメータ |
|---------|------------|-----------|
| 人気プラン | select_plan | plan_type |
| 期間の傾向 | select_plan | duration（1 vs 3） |
| 実際の購入 | purchase | items[].item_id |

**GA4での見方**:
- レポート → Engagement → Events → `select_plan` のパラメータ別ブレイクダウン

### C. 売上レポート

**目的**: 月次売上・ARPU把握

- `purchase` イベントのGA4推奨フォーマットにより、**Monetizationレポートが自動生成**
- 通貨: JPY、value: 合計金額

**GA4での見方**:
- レポート → Monetization → Overview
  - 総売上、購入回数、ユーザーあたり売上が自動表示

---

### D. コンテンツエンゲージメント分析

**目的**: 継続率の改善

| 指標 | 使うイベント | 意味 |
|------|------------|------|
| 人気レッスン | lesson_view | よく見られるレッスン |
| カテゴリ傾向 | lesson_view (category) | 人気のカテゴリ |
| 動画視聴完了率 | video_complete / video_play | コンテンツの質の指標 |
| 記事完了率 | article_complete / lesson_view | 学習の深さ |
| ブックマーク率 | content_bookmarked | コンテンツの保存価値 |
| 検索キーワード | search (search_term) | ユーザーのニーズ |
| ロードマップ人気 | roadmap_view | どのロードマップが見られているか |

**GA4での見方**:
1. レポート → Engagement → Events で各イベントの発火数を確認
2. 探索 → 自由形式レポートで `lesson_view` の `category` 別集計

**改善アクション例**:
- video_complete率が低い → 動画の長さ・質を見直し
- search で結果0件のキーワード → コンテンツの不足を把握
- ブックマーク数が多いレッスン → サブスクの訴求ポイントに活用

---

### E. ユーザーセグメント分析

**目的**: 無料 vs 有料ユーザーの行動差を把握

| ユーザープロパティ | 値 | 用途 |
|------------------|---|------|
| subscription_status | free / standard / feedback | プラン別セグメント |
| plan_interval | 1m / 3m / none | 期間別セグメント |

**GA4での見方**:
1. 管理 → オーディエンス → 新しいオーディエンスを作成
   - 条件: `subscription_status` = `free` → 「無料ユーザー」
   - 条件: `subscription_status` = `standard` or `feedback` → 「有料ユーザー」
2. レポートにオーディエンスセグメントを適用して比較

**分析例**:
- 有料ユーザーが週に何回コンテンツを見ているか → 継続率との相関
- 無料→有料に転換したユーザーが見ていたコンテンツ → 転換ポイント

---

## 2. GA4管理画面での設定手順

### コンバージョン設定（必須）

デプロイ後、GA4管理画面で以下をONにする：

1. **管理** → **イベント** を開く
2. 以下のイベントの「コンバージョンとしてマーク」をON：
   - `purchase` ← 最重要
   - `sign_up`
   - `begin_checkout`

### オーディエンス作成（推奨）

1. **管理** → **オーディエンス** → **新しいオーディエンス**
2. 作成推奨：
   - 「無料ユーザー」: subscription_status = free
   - 「有料ユーザー」: subscription_status ∈ {standard, feedback}
   - 「3ヶ月プランユーザー」: plan_interval = 3m

---

## 3. 定期確認すべきレポート

### 週次チェック

| 確認項目 | GA4の場所 | 注目ポイント |
|---------|----------|------------|
| サブスクファネルCVR | 探索 → ファネル | 前週比で低下していないか |
| 人気コンテンツ | Engagement → Events → lesson_view | 新コンテンツの反応 |
| 検索キーワード | Events → search → search_term | 0件のキーワード |

### 月次チェック

| 確認項目 | GA4の場所 | 注目ポイント |
|---------|----------|------------|
| 売上推移 | Monetization → Overview | MRR成長率 |
| プラン別売上 | Monetization → Ecommerce | standard vs feedback比率 |
| ユーザーリテンション | Retention → Overview | 週次アクティブ率 |
| コンテンツ消費量 | Events → article_complete | 有料ユーザーの消費量 |

---

## 4. Stripe MCPとの併用

GA4では取れないデータはStripe MCPで補完：

| データ | GA4 | Stripe MCP |
|--------|-----|------------|
| 新規購入数 | `purchase` イベント | ○ |
| 月次売上 (MRR) | Monetizationレポート | ○（より正確） |
| 解約数 | ✕（Stripeポータル経由のため） | ○ |
| 解約率 (Churn) | ✕ | ○ |
| LTV | ✕ | ○ |

**Claude Codeへの依頼例**:
- 「Stripe MCPで今月の解約数と解約率を教えて」
- 「Stripe MCPで直近3ヶ月のMRR推移を出して」

---

## 5. 将来の拡張候補

| 項目 | 優先度 | 内容 |
|------|--------|------|
| GA4 MCP接続 | 中 | Claude CodeからGA4データを直接取得・レポート化 |
| Looker Studioダッシュボード | 中 | GA4自動連携の常時表示ダッシュボード |
| `lesson_complete` 埋め込み | 低 | レッスン全記事完了時のイベント（関数は定義済み） |
| トレーニング完了追跡 | 低 | training_task_complete イベント |
| 質問投稿追跡 | 低 | question_submitted イベント |
