# 見出しスタイル仕様

**作成日**: 2025-12-11
**ステータス**: スタイル待ち

---

## 現在の実装

**ファイル**: `src/components/article/RichTextSection.tsx`

### H2 (見出し 2)

```typescript
// 現在のスタイル
<h2
  className="text-[20px] font-bold leading-8 text-[#101828] mt-12 mb-6 first:mt-0"
  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.3515625%" }}
>
```

| プロパティ       | 現在の値         | VitePress      | 希望する値 |
| ---------------- | ---------------- | -------------- | ---------- |
| フォントサイズ   | 20px             | 24px           |            |
| フォントウェイト | 700 (bold)       | 600 (semibold) |            |
| 行高             | 32px (leading-8) | 32px           |            |
| テキスト色       | #101828          | -              |            |
| 上マージン       | 48px (mt-12)     | 48px           |            |
| 下マージン       | 24px (mb-6)      | 16px           |            |
| letter-spacing   | 0.35%            | -0.02em        |            |
| フォント         | Inter            | Inter          |            |

---

### H3 (見出し 3)

```typescript
// 現在のスタイル
<h3
  className="text-base font-semibold leading-7 text-[#101828] mt-8 mb-4"
  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-2.8076171875%" }}
>
```

| プロパティ       | 現在の値         | VitePress      | 希望する値 |
| ---------------- | ---------------- | -------------- | ---------- |
| フォントサイズ   | 16px (text-base) | 20px           |            |
| フォントウェイト | 600 (semibold)   | 600 (semibold) |            |
| 行高             | 28px (leading-7) | 28px           |            |
| テキスト色       | #101828          | -              |            |
| 上マージン       | 32px (mt-8)      | 32px           |            |
| 下マージン       | 16px (mb-4)      | 0              |            |
| letter-spacing   | -2.8%            | -0.02em        |            |
| フォント         | Inter            | Inter          |            |

---

### H4 (見出し 4)

```typescript
// 現在のスタイル
<h4
  className="text-[15px] font-semibold leading-6 text-[#101828] mt-6 mb-3"
  style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-2.8076171875%" }}
>
```

| プロパティ       | 現在の値         | VitePress      | 希望する値 |
| ---------------- | ---------------- | -------------- | ---------- |
| フォントサイズ   | 15px             | 18px           |            |
| フォントウェイト | 600 (semibold)   | 600 (semibold) |            |
| 行高             | 24px (leading-6) | 24px           |            |
| テキスト色       | #101828          | -              |            |
| 上マージン       | 24px (mt-6)      | 24px           |            |
| 下マージン       | 12px (mb-3)      | 0              |            |
| letter-spacing   | -2.8%            | -0.02em        |            |
| フォント         | Inter            | Inter          |            |

---

## 比較サマリー

| 要素 | 現在            | VitePress       | 差分     |
| ---- | --------------- | --------------- | -------- |
| H2   | 20px / bold     | 24px / semibold | **-4px** |
| H3   | 16px / semibold | 20px / semibold | **-4px** |
| H4   | 15px / semibold | 18px / semibold | **-3px** |

---

## スタイル指定欄

**以下に希望するスタイルを自由に記入してください：**

### H2

```
例:
- サイズを24pxに上げたい
- 下に区切り線を追加したい
- 色を変えたい
```

あなたの希望:

---

### H3

あなたの希望:

---

### H4

あなたの希望:

---

## 参考デザイン

希望するデザインがあれば、URL や画像を貼り付けてください：

- 参考 URL:
- 参考画像:
- メモ:
