# Sanity Lesson に必要な項目リスト

## レッスン一覧ページで表示する項目

→〜の先に書くのは Webflow のデータです

1. **title** - レッスンタイトル → `Name`
2. **slug** - URL 用スラッグ → `Slug`
3. **coverImage** - カバー画像（サムネイル） → `Ogp_thumbanail`
4. **category** - カテゴリ（情報設計/UI/UX） → `CategoryMd-DesignFlow`
5. **description** - 説明文 → `LightDescriptions`
6. **isPremium** - 有料フラグ（🔒 表示用） → `該当なし`→ レッスンは必要ないです

---

## レッスン詳細ページで表示する項目（将来実装）

7. **iconImage** - アイコン画像 → `Thumbnail`
8. **purposes** - レッスンの目的（箇条書き） → `該当なし`
9. **overview** - 概要（リッチテキスト） → `ExplainWhyThisSeries - Description`
10. **contentHeading** - コンテンツ見出し → `該当なし` → これデフォルトの値が欲しいです。何も入力してないときに表示されるもの
11. **quests** - クエスト一覧（Webflow から自動取得） → `該当なし`　 → これシリーズに紐づいている動画を WebflowID を使うときに自動で出してほしいなので管理画面では入力必要性が WebflowID のときはないようにしてほしい

---

## 管理用の項目

12. **webflowSource** - Webflow Series ID（例: 684a8fd0ff2a7184d2108210）

---

## 最低限必要な項目（一覧ページ表示用）

- title ✅
- slug ✅
- coverImage ⬜
- category ⬜
- description ⬜

この 5 つがあれば、レッスン一覧ページが完成します。
