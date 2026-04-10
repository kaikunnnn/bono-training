# 週次レポート仕様書

**最終更新**: 2026-04-09
**スキル**: `/report`

---

## 概要

2つのレポートを生成し、ユーザーのニーズと課題を可視化する。

| レポート | 目的 | 主な問い |
|---------|------|---------|
| **A: 売上レポート** | 新規獲得を増やす | どこから来て、何を見て、課金するか？ |
| **B: 継続レポート** | 解約を減らす | 何を使っていて、何が継続に効いているか？ |

---

## 期間の計算

| 引数 | 対象期間 | 比較期間 |
|------|---------|---------|
| なし（デフォルト） | 直近7日 | その前の7日 |
| `月次` | 直近30日 | その前の30日 |
| `YYYY-MM-DD YYYY-MM-DD` | 指定期間 | 同じ長さの直前期間 |

---

## レポートA: 売上レポート

### A1. 流入サマリー

**GA4 API**: `runReport`
- dimensions: `[{name: "date"}]`
- metrics: `[{name: "activeUsers"}, {name: "newUsers"}, {name: "sessions"}]`

**出力形式**:
```
| 日付 | アクティブ | 新規 | セッション |
|------|----------|------|-----------|
| 4/7  | 31       | 5    | 61        |
```

**前期比**: 合計値を前期間と比較し、増減%を表示

### A2. 流入元別

**GA4 API**: `runReport`
- dimensions: `[{name: "sessionSource"}, {name: "sessionMedium"}]`
- metrics: `[{name: "activeUsers"}, {name: "newUsers"}, {name: "sessions"}]`

**出力形式**:
```
| ソース | 媒体 | ユーザー | 新規 | セッション |
|--------|------|---------|------|-----------|
| google | organic | 15 | 3  | 20 |
| youtube.com | referral | 8 | 5 | 10 |
| (direct) | (none) | 30 | 25 | 43 |
```

**注目ポイント**: YouTube/note/指名検索（google organic）/directの比率

### A3. ランディングページ TOP10

**GA4 API**: `runReport`
- dimensions: `[{name: "landingPagePlusQueryString"}]`
- metrics: `[{name: "activeUsers"}, {name: "screenPageViews"}]`

**出力形式**: ユーザー数順でTOP10を表示

**分析の視点**:
- 無料レッスン・記事が入口になっているか
- ロードマップページの集客力
- LP(/sales, /pricing)の直接流入数

### A4. 課金ファネル

**GA4 API**: `getEvents` を4回呼び出し
- `view_plans`: プラン閲覧
- `select_plan`: プラン選択
- `begin_checkout`: チェックアウト開始
- `purchase`: 購入完了

**出力形式**:
```
view_plans (120) → select_plan (45 / 37.5%) → begin_checkout (30 / 66.7%) → purchase (25 / 83.3%)
全体CVR: 20.8%
```

**目標値**:
| ステップ | 目標転換率 | 危険ライン |
|---------|----------|-----------|
| view_plans → select_plan | 30%+ | < 20% |
| select_plan → begin_checkout | 50%+ | < 30% |
| begin_checkout → purchase | 70%+ | < 50% |

### A5. プラン閲覧前の行動（課金動機の推定）

**GA4 API**: `runReport`
- dimensions: `[{name: "pagePath"}]`
- metrics: `[{name: "eventCount"}]`
- dimensionFilter: eventName = "view_plans" の前ページ分析

**注意**: GA4 MCPでは直前ページの直接取得が難しい場合、`view_plans` イベントの `referrer` パラメータを活用するか、`pagePath` × `view_plans` の相関を見る。

**代替アプローチ**: 同一期間の `view_plans` 発生日のランディングページと照合

### A6. 前期比較

全セクションの主要指標を前期間と比較:
```
新規ユーザー: 45 → 52 (+15.6% ↑)
view_plans: 120 → 98 (-18.3% ↓)
purchase: 25 → 25 (±0%)
```

---

## レポートB: 継続レポート

### B1. アクティブユーザー概況

**GA4 API**: `runReport`
- dimensions: `[{name: "date"}]`
- metrics: `[{name: "activeUsers"}]`

+ 別クエリで `video_play`, `article_complete`, `lesson_view` のユニークユーザー数を取得

**出力形式**:
```
全体アクティブ: 150人
コンテンツ閲覧者: 85人 (56.7%)
  - 動画再生: 60人
  - 記事完了: 35人
  - レッスン閲覧: 50人
```

**注目**: コンテンツ閲覧率が低い = ログインしても使っていない = 解約リスク

### B2. 人気コンテンツ TOP10

**GA4 API**: `runReport`
- dimensions: `[{name: "pagePath"}]`
- metrics: `[{name: "eventCount"}]`
- dimensionFilter: eventName が `video_play` or `article_complete` or `lesson_view`

**出力形式**:
```
| # | ページ | 種別 | イベント数 |
|---|--------|------|----------|
| 1 | /lessons/ui-design-flow-lv1 | lesson_view | 45 |
| 2 | /articles/onemonthux-01 | article_complete | 32 |
```

**分析の視点**: よく使われている = 継続に効いている可能性が高い

### B3. 動画視聴分析

**GA4 API**: `getEvents`
- `video_play`: 再生開始数
- `video_complete`: 完了数

**出力形式**:
```
動画再生: 150回
動画完了: 85回
完了率: 56.7%
```

### B4. 利用パターン

**GA4 API**: `getUserBehavior`

**出力指標**:
- 平均セッション時間
- セッションあたりページ数
- エンゲージメント率

### B5. 非アクティブ兆候

**GA4 API**: `getEvents`
- `login` イベント数 vs `video_play` + `article_complete` + `lesson_view` 数

**出力形式**:
```
ログイン数: 200
コンテンツ閲覧イベント: 120
コンテンツ閲覧率: 60%
非アクティブ推定: 40% ← ログインしたが何も見ていない
```

**危険ライン**: 非アクティブ率 > 50% → オンボーディング改善が急務

### B6. 前期比較

レポートAと同様、主要指標の前期比を表示。

---

## Stripe補足データ（取得可能な場合）

Stripe MCPがテストモードの場合はスキップし、その旨を記載する。

| 指標 | 取得方法 |
|------|---------|
| 解約数（期間内） | `search_stripe_resources` subscriptions:status:"canceled" |
| アクティブサブスク数 | `list_subscriptions` status=active |
| 期間内の新規課金 | `list_payment_intents` created > 期間開始 |

---

## 出力フォーマット

レポートはMarkdownテーブルで出力。各セクションに:
1. データテーブル
2. 前期比（↑↓で視覚化）
3. 1行の所見（数値から読み取れること）

最後に「アクションアイテム」セクションで、データから示唆される次のアクションを3つ以内で提案。
