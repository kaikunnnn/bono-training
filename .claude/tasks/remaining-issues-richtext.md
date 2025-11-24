# 残っている問題: リッチテキスト表示

**作成日**: 2025-11-14
**対象**: 記事詳細画面のリッチテキスト表示
**ステータス**: 問題収集中

# 大切

何回もこっちは指摘しているのに治ってない箇所ばかりです
一気に実装するなわかった？
1 つずつ進めろ？わかった？
全部一気にやるな？1 つずつステップにしてやれ、不安なら質問して内容を具体化しろ、聞かなくても質問して具体化しろ

# 📋 治っていない項目

以下に治っていない項目を記載してください：

### 1.

## レッスンのデータ

- 説明が Webflow からインポートされてない
- Webflow は ExplainWhyThisSeries-Description のデータです

---

📍 確認：どの description フィールドの話か

Sanity には 2 つの「Lesson」に関する description があるの
で、どちらの話か確認させてください：

A. Lesson スキーマの「説明」フィールド

- 場所: Sanity Studio > レッスン詳細 > 「説明」
- スキーマファイル:
  sanity-studio/schemaTypes/lesson.ts の 26 行目〜52 行目
- フィールド名: description
- 現在の型: array（Portable Text 形式）

B. レッスン詳細ページの「概要」フィールド

- 場所: Sanity Studio > レッスン詳細 > 「概要」
- スキーマファイル:
  sanity-studio/schemaTypes/lesson.ts の 125 行目〜
- フィールド名: overview
- 現在の型: array（Portable Text 形式）

---

質問：空になっているのはどちらですか？

1. 「説明」(description) が空ですか？
2. 「概要」(overview) が空ですか？
3. 両方とも空ですか？

回答： 1. 「説明」(description) が空ですか？

そして、Webflow の ExplainWhyThisSeries-Description は
、Sanity のどちらに入るべきですか？

回答 1. 「説明」(description) が空ですか？

「説明」(description) は”通常のテキストデータ”でいいです。リッチテキスト”ではない”です

レッスンの「概要」(overview)は正常です

【追加情報をここに記入してください】

- Sanity Studio で空になっているのは：

  - [○] 「説明」フィールド
  - [❌️] 「概要」フィールド
  - [❌️] 両方

- Webflow の ExplainWhyThisSeries-Description
  は、Sanity のどちらに入るべきですか：
  - [○] 「説明」に入るべき
  - [❌️] 「概要」に入るべき

### 2.

## 記事データ

- サムネイルが取得できてないです。
- Webflow は videothumbnail というものでデータが入っています
- ずっと取得できてません確認しながら丁寧に進めてください。わかった？

## /lesson ページ

- クエストの中の記事にサムネイルが表示されてない

### 3.YouTube 動画 URL

- 記事の動画リンク二 YouTube リンクが入っているときに埋め込み動画のブロックごと何も表示されません
- YouTube のリンクのときは YouTube の埋め込み、Vimeo のときは Vimeo のものを出してほしいんですよ
- これも何回も言ってるのに治ってないよちゃんとやれ
