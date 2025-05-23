# サイトマップ（第 1 案）

## 0. 共通レイアウト

- **Header**: ロゴ／グローバルナビ（Courses, Series, Use-cases, Blog, About）／サインイン
- **Footer**: サイトマップ簡略版・SNS リンク・利用規約・プライバシーポリシー

---

## 1. マーケティング層

### / Home

- Hero（サービス価値訴求＋主要 CTA）
- ★ Use-cases サマリー（5 件）
- ★ 人気 Courses（4 枚カード）
- ★ 人気 Series（6 枚カード）
- Testimonials（ユーザーの声 3 枚）
- コンバージョン導線：`無料登録` / `有料プランを見る`

### /use-cases ユースケース一覧

- カテゴリカード（5 種）
  1. 情報設計で根拠あるデザインをしたい
  2. デザイン未経験から UI/UX デザイナーに
  3. 顧客理解と課題解決で現場貢献
  4. UI デザインを体系的に学びたい
  5. Figma を学びたい

### /use-cases/[slug] ユースケース詳細

- ペルソナ課題 → 解決ストーリー
- 推奨 Course
- ロードマップ（Series → Content）
- 主要 KPI: **無料 ↗ 有料転換率**

### /about About

- サービスのミッション・運営者紹介・沿革
- Fastnote / 開発ストーリーへの外部リンク

### /voices Testimonials

- フィルタ付きユーザー事例カード
- KPI: **社会的証明閲覧 → 有料転換率**

---

## 2. 学習カタログ層

### /courses Courses 一覧

- タブ: All / UI / UX / Figma / IA
- ソート: 人気順 / 新着順 / 難易度
- KPI: **Course 詳細遷移率**

### /courses/[course-slug] Course 詳細

- コース概要・習得スキル・TL;DR 動画
- LessonSeries ステップ表示 (1 → n)
- “今すぐ学習開始” CTA（無料 or 課金）
- ロック UI: 登録前は最初の Series だけ開放

### /series LessonSeries 一覧

- カテゴリ別カード表示（UI / UX / Figma …）
- KPI: **Series 詳細遷移率**

### /series/[series-slug] LessonSeries 詳細

- Series 概要・サムネイル
- **Content 一覧**（Step 1…n）← ここで全コンテンツをリスト
- 課金 CTA（Series 単体課金 or Course 加入）
- KPI: **Content 詳細遷移率**

### /series/[series-slug]/[content-slug] Content 詳細（最小単位）

- メタ情報: タイトル／公開日／著者／カテゴリ
- **VideoPlayer**
  - 無料ユーザー: `preview_url` 再生（最初の 30 秒 等）
  - 有料ユーザー: フル動画再生
- **記事本文**
  - 前半ブロック: 全員閲覧可
  - 後半ブロック: 有料ユーザーのみ
- カリキュラムパンくず  
  `Course > Series > Content`
- KPI: **途中ロック → 課金率**

### ※シリーズが決まらない単発が多発しそうなら

あらかじめ“General”や“Tips”Series を用意し、URL は /series/tips/slug にしておくと後の再移動が不要。

---

## 3. 決済・アカウント層

### /pricing プラン比較

- Free vs Pro 機能表
- 課金 CTA（Stripe Checkout）

### /account ダッシュボード

- 契約プラン・視聴履歴・課題提出状況

### /checkout/success, /fail 課金完了・失敗ページ

---

## 4. 補助ページ

- /blog, /blog/[slug]（SEO 用記事）
- /terms, /privacy
- /404

---

# ページごとのアクセス制御

| URL パターン          |                                           ゲスト                                           |                                          無料会員                                          | 有料会員 |
| --------------------- | :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: | :------: |
| `/`, `/use-cases/*`   |                                             ◯                                              |                                             ◯                                              |    ◯     |
| `/courses`, `/series` |                                             ◯                                              |                                             ◯                                              |    ◯     |
| `/courses/[slug]`     |                                             ◯                                              |                                             ◯                                              |    ◯     |
| `/series/[slug]`      | △ (無料アカウント：コンテンツ一覧で有料のものがあれば有料タグを表示。有料の人は表示しない) | △ (無料アカウント：コンテンツ一覧で有料のものがあれば有料タグを表示。有料の人は表示しない) |    ◯     |
| `/content/[slug]`     |                                        △ (preview)                                         |                                        △ (preview)                                         |    ◯     |
| `/pricing`            |                                             ◯                                              |                                             ◯                                              |    ◯     |
| `/account`            |                                             ×                                              |                                             ◯                                              |    ◯     |

> **△** = ロック UI 表示（動画 preview & GateBanner）

---

<!-- # ページ全体像のアイデア

## コンテンツ資産

### 現在あるページ

- トップ、
  - ユースケース別コンテンツ訴求（サマリー的）
  - 人気コース一覧
  - 人気のシリーズ一覧
  - ユースケース
    - 情報設計で根拠あるデザインをしたい人へ
      - お勧めコース
      - 身につけるためのロードマップ
      - お勧めコンテンツ
    - デザイン未経験から UIUX デザイナーになりたい人へ
    - 顧客理解と課題解決で現場に貢献したい人へ
    - UI デザインから体系的に学びたい人へ
    - Figma を学びたい人へ
- コース一覧ページ
  - FIgma コース
  - UI ビジュアルコース
  - UX デザインコース
  - 情報設計コース
- レッスンシリーズ一覧ページ
  - UI
  - UX
  - Figma
    コース一覧、コース詳細、レッスンシリーズ詳細、単体コンテンツ、ブログ、LP など
- コンテンツ一覧ページ
  - コンテンツのリスト
    - コンテンツ詳細ページ
- アバウト（サービスや運営者についてコンセプト）
- ユーザーの声

### 学習コンテンツの関係性

- **Course コース**: 複数 LessonSeries を順番に学び、最終的に ◯◯ スキルを取得
- **LessonSeries レッスン**: テーマ別に Content を束ねた学習単位
- **Content コンテンツ**: 記事 + メイン動画。最小サイズ

### 詳細ページの構造

#### コンテンツ詳細ページ（/content/

- 記事のようなページ
  - タイトル
  - 公開日
  - カテゴリ
  - 著者
  - 動画
    - 無料と有料で出し分ける
  - 記事文章
    - 無料と有料で出し分ける

#### コース詳細ページ

#### レッスン詳細ページ

- レッスンタイトル
- レッスンサムネイル（本のような画像）
- レッスンの概要欄
- 課金導線
- レッスンで得られるものリストと紹介
- レッスン一覧
  - ステップ 1
    - コンテンツ
    - コンテンツ
    - コンテンツ
  - ステップ 2
    - コンテンツ
    - ....

## 3. ユーザーフロー

- コースを選択
  - コース内側のレッスンを選択
    - レッスン内のコンテンツを洗濯して動画を視聴する
- トップ：学習するものを探したいユーザー
  - ユースケースで当てはまるものを選択
    - ユースケース詳細ページないの説明を閲覧
    - 必要なコンテンツを選択
      - 視聴
      - もしくは課金する

## 4. アクセス制御・プラン分け

有料 / 無料 / ゲスト で見せたい・隠したいページや要素

コンテンツ途中ロックの条件（例：動画 30% でロック）

## 5. SEO・マーケ要件

##### キーワードターゲット（あれば）

- UI デザイン 勉強
- UI デザイン 身につけ方

##### 外部流入チャネル：

- YouTube

## 6. 技術・デザイン制約

フレームワーク /

1. フロントエンド ✅
   - Vite + React + TypeScript 環境で実装完了
2. サーバーサイド: ✅
   - Supabase Edge Functions で実装完了

## 7. 分析・計測

追いたい指標：

- 課金ボタンを押したレッスン、コース
- 課金フローの完了率
-

使用ツール：GA4
``` -->

```

```
