# Google Analytics 設定状況

**最終更新**: 2026-04-08

---

## 測定ID

`G-MH9NGKFBCM`

## 実装箇所

- `index.html` (19-25行目): GAスクリプトタグ
- `src/lib/analytics.ts`: 全トラッキング関数の定義
- `src/App.tsx` (127行目): ページビュートラッキング

## 実装済みイベント一覧

### 基本イベント

| イベント名 | 発火箇所 | パラメータ | 用途 |
|-----------|---------|-----------|------|
| `page_view` | App.tsx（自動） | path, title | ページ閲覧数 |
| `video_play` | 動画プレーヤー | article_id, article_title | 動画再生開始 |
| `video_complete` | 動画プレーヤー | article_id, article_title | 動画視聴完了 |
| `article_complete` | 記事完了ボタン | article_id, article_title | 記事完了率 |

### サブスクリプションファネル（Phase 1）

| イベント名 | 発火箇所 | パラメータ | 用途 |
|-----------|---------|-----------|------|
| `view_plans` | Subscription.tsx（ページ表示） | referrer | プランページ流入 |
| `select_plan` | PlanCard.tsx（カードクリック） | plan_type, price, duration | プラン選択傾向 |
| `begin_checkout` | Subscription.tsx（購入ボタン） | currency, value, items[] | チェックアウト開始（GA4 Eコマース） |
| `purchase` | SubscriptionSuccess.tsx | transaction_id, currency, value, items[] | 購入完了（GA4 Eコマース） |
| `subscription_start` | SubscriptionSuccess.tsx | plan_name, plan_price | 後方互換 |
| `plan_change` | SubscriptionUpdated.tsx | from_plan, to_plan, to_duration | プラン変更追跡 |

### コンテンツエンゲージメント（Phase 2）

| イベント名 | 発火箇所 | パラメータ | 用途 |
|-----------|---------|-----------|------|
| `lesson_view` | LessonDetail.tsx | lesson_id, title, category, is_premium | レッスン閲覧 |
| `search` | Search.tsx | search_term, results_count | 検索行動 |
| `content_bookmarked` | bookmarks.ts | content_id, content_type | ブックマーク追加 |
| `roadmap_view` | RoadmapDetail.tsx | roadmap_id, roadmap_title | ロードマップ閲覧 |

### ユーザー属性（Phase 3）

| 項目 | 発火箇所 | 内容 |
|------|---------|------|
| `user_id` | AuthContext.tsx | ログインユーザーIDをGA4に設定 |
| `subscription_status` | useSubscription.ts | ユーザープロパティ（free/standard/feedback） |
| `plan_interval` | useSubscription.ts | ユーザープロパティ（1m/3m/none） |
| `login` | AuthContext.tsx | 明示的ログイン時のみ（セッション復元では発火しない） |
| `sign_up` | AuthContext.tsx | メール確認完了時 |

## 未実装（analytics.ts に関数は定義済み）

以下は `analytics.ts` に関数が用意されているが、まだコンポーネントに埋め込まれていないもの：

| 関数名 | 用途 | 埋め込み先候補 |
|--------|------|--------------|
| `trackLessonComplete` | レッスン全完了 | 進捗管理の完了判定箇所 |

## 技術的な注意事項

1. **開発環境**: `localhost` / `127.0.0.1` ではGA送信無効（コンソールログのみ）
2. **重複防止**: `purchase` イベントは `sessionStorage` で重複送信を防止
3. **セッション復元**: `login` イベントはページリロード時には発火しない（`isInitialLoad` フラグ）
4. **ユーザープロパティ**: `gtag('config')` で正しく設定（`gtag('event')` ではない）
