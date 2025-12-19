# マイページ「進行中」セクション

**ステータス**: ⏳ 確認待ち

---

## 画面イメージ

以下に「マイページのデザインを貼ります」

### コンポーネント

#### 進行中のレッスンアイテム

- 進行中のレッスン  
  ← `/features/progress/screens/component/progress_lesson_item/README.md` を開いてください

#### お気に入りの記事アイテム

- [お気に入り記事](/features/progress/screens/component/favorite_article_item/files_favorite_item/README_FAVORITE_ARTICLE.md)

#### 閲覧履歴の記事アイテム

- [閲覧履歴](/features/progress/screens/component/history_article_itme/files_articlehistoryitem/README_ARTICLE_CARDS_UNIFIED.md)

### マイページ全体

- [マイページ詳細](/features/progress/screens/mypage/README_MYPAGE.md)

---

## 仕様確認

### 表示条件

- [ ] 進行中レッスンがある場合のみ表示
- [ ] 最大 2 件表示
- [ ] `status != 'completed'` かつ `updated_at` 降順で上位 2 件

### レッスンオブジェクトの構成

**レッスンブロック（リンク → レッスン詳細ページ）**

- [ ] レッスンアイコン
- [ ] レッスンタイトル
- [ ] 進捗バー
- [ ] 進捗率（%表示）

**次の記事ブロック（リンク → 次の未完了記事）**

- [ ] "次へ 👉️" 固定表示
- [ ] 記事タイトル

### 「もっと見る」リンク

- [ ] 3 件以上ある場合に表示
- [ ] クリックで進行中画面へ遷移

---

## 確認事項・質問

<!-- 画面イメージを見て気になった点があれば記入 -->

---

## 確認履歴

| 日付 | 確認者 | 結果 |
| ---- | ------ | ---- |
| -    | -      | -    |
