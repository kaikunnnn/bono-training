# テーブルスタイル仕様

**作成日**: 2025-12-11
**ステータス**: スタイル待ち

---

## 概要

VitePress風のテーブルを実装

---

## VitePressのテーブルスタイル（参考）

```css
/* VitePress vp-doc.css より */
.vp-doc table {
  display: block;
  border-collapse: collapse;
  margin: 20px 0;
  overflow-x: auto;
}

.vp-doc tr {
  background-color: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  transition: background-color 0.5s;
}

.vp-doc tr:nth-child(2n) {
  background-color: var(--vp-c-bg-soft);
}

.vp-doc th, .vp-doc td {
  border: 1px solid var(--vp-c-divider);
  padding: 8px 16px;
}

.vp-doc th {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
}

.vp-doc td {
  font-size: 14px;
}
```

---

## スタイル指定欄

### テーブル全体

| プロパティ | VitePress | 希望する値 |
|-----------|-----------|-----------|
| 上下マージン | 20px | |
| ボーダー | collapse | |
| 横スクロール | あり | |

### ヘッダー行 (th)

| プロパティ | VitePress | 希望する値 |
|-----------|-----------|-----------|
| 背景色 | 薄いグレー | |
| テキスト色 | グレー | |
| フォントサイズ | 14px | |
| フォントウェイト | 600 (semibold) | |
| パディング | 8px 16px | |
| ボーダー | 1px solid | |

### データ行 (td)

| プロパティ | VitePress | 希望する値 |
|-----------|-----------|-----------|
| 背景色 | 白 | |
| 偶数行背景色 | 薄いグレー | |
| テキスト色 | デフォルト | |
| フォントサイズ | 14px | |
| パディング | 8px 16px | |
| ボーダー | 1px solid | |

---

## 自由記述欄

**希望するスタイルを自由に記入してください：**




---

## 参考デザイン

希望するデザインがあれば、URLや画像を貼り付けてください：

- 参考URL:
- 参考画像:
- メモ:
