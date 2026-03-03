# 15分フィードバック応募ページ - タスク管理

**最終更新**: 2026-03-03
**ブランチ**: `feature/feedback-page-improvement`

---

## 🔥 残りタスク

- [x] SlackWebhookを新しいチャンネルに紐付け
- [x] 絵文字をFluentEmojiに変更
- [ ] 文章内容を修正
- [ ] http://localhost:3001/feedback-apply/submit の時にこのページの読み込みが異様に遅かった。vercel dev　だから？でも本番もこんな感じになるなら気になるから速度を早めたい
- [x] 関連するレッスンの選択
  - [x] 何も検索にヒットしなかった⇨機能してない
  - [x] 原因: `.env.local` で `VITE_SANITY_DATASET="development"` だったため、レッスンデータがなかった
  - [x] 修正: `VITE_SANITY_DATASET="production"` に変更
  - [x] 「学んだBONOコンテンツ」フィールドを削除（レッスン選択と重複していたため統合）

---

## ✅ 完了タスク

| タスク                                | 完了日     |
| ------------------------------------- | ---------- |
| アイコン・サムネイル画像の適用        | 2026-03-03 |
| デスクトップレイアウト統一（40%:60%） | 2026-03-03 |
| 初期実装（応募フォーム + Slack通知）  | 2025-02-23 |

---

## 📝 Slack通知フォーマット（現在）

```
**【🔸15分フィードバック新規応募がきたよ】**

👩‍💻Slackアカウント名:
[入力値]

🗺️学んだBONOコンテンツ:
[選択したレッスン名]

🔗アウトプットURL:
[リンク]

---

応募日時: 2026/03/03 12:00:00

```

---

## 📁 関連

- 説明ページ: `src/pages/feedback-apply/index.tsx`
- 応募フォーム: `src/pages/feedback-apply/submit.tsx`
- Figma: `7OtaRLVF2yIlAqddrB11lY`
