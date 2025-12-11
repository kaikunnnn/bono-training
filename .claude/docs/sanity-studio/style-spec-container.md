# カスタムコンテナスタイル仕様

**作成日**: 2025-12-11
**ステータス**: スタイル待ち

---

## 概要

Notion風のカスタムコンテナ（Callout）を実装

---

## 必要な種類

| 種類 | 用途 | アイコン案 |
|------|------|-----------|
| **info** | 補足情報 | ℹ️ / 💡 |
| **tip** | ポイント・コツ | 💡 / ✨ |
| **warning** | 注意点 | ⚠️ |
| **danger** | 危険・禁止 | 🚫 / ❌ |
| **note** | メモ | 📝 |

**必要な種類を選んでください（複数可）:**

- [ ] info
- [ ] tip
- [ ] warning
- [ ] danger
- [ ] note
- [ ] その他: ____________

---

## Notionのコールアウトスタイル（参考）

```
┌─────────────────────────────────────┐
│ 💡  ここが重要なポイントです        │
│     補足テキストがここに入ります    │
└─────────────────────────────────────┘
```

### Notionの特徴
- 左端にアイコン
- 背景色が薄い（種類ごとに異なる）
- 角丸
- パディングがゆったり

---

## スタイル指定欄

### 共通スタイル

| プロパティ | 希望する値 |
|-----------|-----------|
| 角丸 (border-radius) | |
| パディング (padding) | |
| マージン (margin) | |
| ボーダー | あり / なし |
| フォントサイズ | |
| 行高 (line-height) | |

---

### info (補足情報)

| プロパティ | 希望する値 |
|-----------|-----------|
| 背景色 | |
| ボーダー色 | |
| アイコン | |
| アイコン色 | |
| テキスト色 | |

---

### tip (ポイント)

| プロパティ | 希望する値 |
|-----------|-----------|
| 背景色 | |
| ボーダー色 | |
| アイコン | |
| アイコン色 | |
| テキスト色 | |

---

### warning (注意)

| プロパティ | 希望する値 |
|-----------|-----------|
| 背景色 | |
| ボーダー色 | |
| アイコン | |
| アイコン色 | |
| テキスト色 | |

---

### danger (危険)

| プロパティ | 希望する値 |
|-----------|-----------|
| 背景色 | |
| ボーダー色 | |
| アイコン | |
| アイコン色 | |
| テキスト色 | |

---

## 自由記述欄

**希望するスタイルを自由に記入してください：**




---

## 参考デザイン

希望するデザインがあれば、URLや画像を貼り付けてください：

- 参考URL:
- 参考画像:
- メモ:

---

## VitePressのスタイル（参考）

```css
/* VitePress custom containers */
.custom-block {
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 16px 16px 8px;
  margin: 16px 0;
}

.custom-block.info {
  background-color: var(--vp-custom-block-info-bg);
  border-color: var(--vp-custom-block-info-border);
}

.custom-block.tip {
  background-color: var(--vp-custom-block-tip-bg);
  border-color: var(--vp-custom-block-tip-border);
}

.custom-block.warning {
  background-color: var(--vp-custom-block-warning-bg);
  border-color: var(--vp-custom-block-warning-border);
}

.custom-block.danger {
  background-color: var(--vp-custom-block-danger-bg);
  border-color: var(--vp-custom-block-danger-border);
}
```
