---
name: report
description: GA4+Stripeデータから売上・継続の週次レポートを生成
argument-hint: [週次 | 月次 | YYYY-MM-DD YYYY-MM-DD]
allowed-tools: Read, Grep, Bash, mcp__google-analytics__getActiveUsers, mcp__google-analytics__getPageViews, mcp__google-analytics__getEvents, mcp__google-analytics__getUserBehavior, mcp__google-analytics__runReport, mcp__stripe__list_subscriptions, mcp__stripe__search_stripe_resources, mcp__stripe__fetch_stripe_resources, mcp__stripe__list_payment_intents
---

# GA4 週次レポート

## 概要

GA4 MCPとStripe MCPからデータを取得し、**売上レポート**と**継続レポート**を生成する。

## 呼び出し方

- `/report` → 直近7日のレポート（デフォルト）
- `/report 月次` → 直近30日のレポート
- `/report 2026-03-01 2026-03-31` → 任意期間のレポート

---

## 実行前に必ず読むファイル

```
.claude/docs/analytics/REPORT-SPEC.md  ← レポート仕様（形式・KPI・閾値）
.claude/docs/analytics/GA-STATUS.md    ← 実装済みイベント一覧
```

---

## ワークフロー

### Phase 1: 期間の決定

引数を解析して対象期間と比較期間を算出する。

```
引数なし / "週次" →
  対象: today - 7日 〜 today
  比較: today - 14日 〜 today - 7日

"月次" →
  対象: today - 30日 〜 today
  比較: today - 60日 〜 today - 30日

"YYYY-MM-DD YYYY-MM-DD" →
  対象: 指定期間
  比較: 同じ長さの直前期間
```

### Phase 2: データ取得（並行実行）

以下のGA4 APIコールを**可能な限り並行で**実行する。

#### 売上レポート用（対象期間 + 比較期間の2回ずつ）

1. **流入サマリー**: `runReport`
   - dimensions: `[{name: "date"}]`
   - metrics: `[{name: "activeUsers"}, {name: "newUsers"}, {name: "sessions"}]`

2. **流入元別**: `runReport`
   - dimensions: `[{name: "sessionSource"}, {name: "sessionMedium"}]`
   - metrics: `[{name: "activeUsers"}, {name: "newUsers"}, {name: "sessions"}]`

3. **ランディングページ**: `runReport`
   - dimensions: `[{name: "landingPagePlusQueryString"}]`
   - metrics: `[{name: "activeUsers"}, {name: "screenPageViews"}]`

4. **課金ファネル**: `getEvents` × 4回
   - eventName: `view_plans`, `select_plan`, `begin_checkout`, `purchase`

#### 継続レポート用

5. **コンテンツイベント**: `getEvents`（全イベント取得して集計）

6. **人気コンテンツ**: `runReport`
   - dimensions: `[{name: "pagePath"}]`
   - metrics: `[{name: "screenPageViews"}, {name: "activeUsers"}]`

7. **動画視聴**: `getEvents`
   - eventName: `video_play` と `video_complete`

8. **利用パターン**: `getUserBehavior`

#### Stripe補足（可能な場合のみ）

9. **アクティブサブスク数**: `list_subscriptions` (status=active)
10. **解約数**: `search_stripe_resources` (subscriptions:status:"canceled")

**注意**: Stripe MCPがテストモードの場合（本番データ取得不可）、スキップしてその旨を記載する。

### Phase 3: レポート生成

REPORT-SPEC.md の形式に従い、2つのレポートをMarkdownで出力する。

#### レポートA: 売上レポート

```markdown
# 売上レポート（YYYY/MM/DD 〜 YYYY/MM/DD）

## A1. 流入サマリー
[日別テーブル]
合計: ユーザー XX人（前期比 +XX% ↑）

## A2. 流入元別
[ソース別テーブル]
所見: YouTube経由が最多、指名検索は前週比+XX%

## A3. ランディングページ TOP10
[ページ別テーブル]
所見: /lessons/xxx が最多の入口

## A4. 課金ファネル
view_plans (XX) → select_plan (XX / XX%) → begin_checkout (XX / XX%) → purchase (XX / XX%)
全体CVR: XX%
所見: select_plan→begin_checkout の離脱が大きい

## A5. 課金前の行動
[view_plans発生時のページ分析]
所見: ロードマップページからの流入が課金につながりやすい

## A6. 前期比較サマリー
| 指標 | 今期 | 前期 | 変化 |
|------|------|------|------|
```

#### レポートB: 継続レポート

```markdown
# 継続レポート（YYYY/MM/DD 〜 YYYY/MM/DD）

## B1. アクティブユーザー概況
全体: XX人 / コンテンツ閲覧者: XX人 (XX%)

## B2. 人気コンテンツ TOP10
[ランキングテーブル]
所見: UIデザイン系が上位独占

## B3. 動画視聴
再生: XX回 / 完了: XX回 / 完了率: XX%

## B4. 利用パターン
平均セッション時間: XXm / ページ/セッション: XX

## B5. 非アクティブ兆候
ログイン: XX / コンテンツ閲覧: XX / 非アクティブ率: XX%

## B6. 前期比較サマリー
| 指標 | 今期 | 前期 | 変化 |
|------|------|------|------|
```

### Phase 4: アクションアイテム

データから読み取れる示唆を**3つ以内**で提案:

```markdown
## アクションアイテム
1. [データに基づく具体的な提案]
2. [データに基づく具体的な提案]
3. [データに基づく具体的な提案]
```

**提案の方針**:
- 売上: 「このコンテンツ/チャネルを強化すべき」「ファネルのここを改善すべき」
- 継続: 「この人気コンテンツをオンボーディングに組み込むべき」「非アクティブ率が高い→通知/メール施策」

---

## 重要ルール

1. **データが取れなかった場合**: エラーで止めず「取得不可」と明記して次に進む
2. **前期比の表示**: 増加は ↑、減少は ↓、5%以内は →（横ばい）
3. **所見は1行**: 各セクションに1行だけ、数値から読み取れることを書く
4. **推測しない**: データにないことは書かない。「〜の可能性がある」程度に留める
5. **Stripe テストモード**: 本番データが取れない場合は「Stripe: テストモードのためスキップ」と記載
