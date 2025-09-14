# /blog にサービスのブログページを作成する

## 概要
0. サマリー
	•	目的：サービスのブログページに該当するものを、/blog 以下に記事一覧・詳細・カテゴリを実装する
	•	範囲：UI、データモデル、SEO、計測、運用フロー、テスト、リリース手順
	•	非範囲：コメント機能、会員限定記事の課金ゲート（将来拡張の可能性はあるがスルーでOK）


1. 画面構成 / ルーティング
	•	一覧 = ブログページのトップ：/blog
	•	カテゴリ一覧：/blog/category/[category]
	•	詳細：/blog/[slug]
	•	RSS：/blog/rss.xml（任意）

- ナビゲーション仕様
	•	/blog専用のヘッダーナビゲーションを作成して使用します
	•	パンくず（例）：Home › Blog › Category › Post Title

2. 一覧ページの実装（/blog）
	•	APIやCMSから記事リストを取得して一覧表示する
        → コンポーネントとして 「記事カード」のコンポーネントを作成して使用する。
	•	カード形式でタイトル・サムネ・日付・カテゴリ・ディクリプション・著者を表示。
	•	20件ごとにページネーション 
    •	RSS


3. 詳細ページの実装（/blog/[slug]）
	•	slug をルーティングに使い、記事データを取得してレンダリング。
	•	タイトル・投稿日・サムネイル・本文・次の記事リンクを配置。
	•	既存の「見出し」「本文」スタイルを流用して読みやすさを担保。

4. SEO対応
	•	meta title, description, og:image を動的に設定。
	•	パンくずリストや構造化データ（JSON-LD）を追加するとより効果的。


5. Analytics対応
    •	GA4イベント：blog_list_view / blog_view / category_view / category_filter_change / category_card_click
	•	Search Console/Sitemap運用


