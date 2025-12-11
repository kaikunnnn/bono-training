# リストスタイル仕様

**作成日**: 2025-12-11
**ステータス**: スタイル待ち

---

## 現在の実装

**ファイル**: `src/components/article/RichTextSection.tsx`

### 箇条書きリスト (Bullet List)

```typescript
// 現在のスタイル
<ul className="list-disc mb-4 space-y-2" style={{ paddingLeft: "21.5px" }}>
  <li className="text-base leading-[26px] text-[#364153]"
      style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}>
    {children}
  </li>
</ul>
```

| プロパティ | 現在の値 | 希望する値（記入してください） |
|-----------|---------|------------------------------|
| マーカースタイル | `list-disc` (●) | |
| マーカー色 | デフォルト（テキスト色と同じ） | |
| 左パディング | 21.5px | |
| 上下マージン | mb: 16px | |
| アイテム間隔 | space-y: 8px | |
| フォントサイズ | 16px (text-base) | |
| 行高 | 26px | |
| テキスト色 | #364153 | |
| フォント | Inter | |

---

### 番号付きリスト (Numbered List)

```typescript
// 現在のスタイル
<ol className="list-decimal mb-4 space-y-2" style={{ paddingLeft: "21.5px" }}>
  <li className="text-base leading-[26px] text-[#364153]"
      style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}>
    {children}
  </li>
</ol>
```

| プロパティ | 現在の値 | 希望する値（記入してください） |
|-----------|---------|------------------------------|
| マーカースタイル | `list-decimal` (1. 2. 3.) | |
| マーカー色 | デフォルト（テキスト色と同じ） | |
| 左パディング | 21.5px | |
| 上下マージン | mb: 16px | |
| アイテム間隔 | space-y: 8px | |
| フォントサイズ | 16px (text-base) | |
| 行高 | 26px | |
| テキスト色 | #364153 | |
| フォント | Inter | |

---

## VitePressのスタイル（参考）

```css
/* VitePress vp-doc.css より */
.vp-doc ul, .vp-doc ol {
  padding-left: 1.25rem;  /* 20px */
  margin: 16px 0;
}

.vp-doc li {
  line-height: 28px;
}

.vp-doc li + li {
  margin-top: 8px;
}
```

---

## スタイル指定欄

**以下に希望するスタイルを自由に記入してください：**

### 箇条書きリスト

```
例:
- マーカーを小さい丸(•)にしたい
- マーカー色を #666666 にしたい
- 左の余白をもう少し広くしたい（30px）
- ネストしたリストのスタイルも指定
```

あなたの希望:




---

### 番号付きリスト

```
例:
- 番号を太字にしたい
- 番号の後に「)」をつけたい（1) 2) 3)）
- 番号色をブランドカラーにしたい
```

あなたの希望:




---

## 参考デザイン

希望するデザインがあれば、URLや画像を貼り付けてください：

- 参考URL:
- 参考画像:
- メモ:
