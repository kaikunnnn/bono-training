# HeadingSection コンポーネント リデザイン

**作成日**: 2025-12-11
**対象ファイル**: `src/components/article/HeadingSection.tsx`

---

## 現在 vs デザイン仕様

### 全体構造

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| 垂直gap | 12px (space-y-3) | **15px** (gap-[15px]) |
| シェアボタン | あり | **なし（削除）** |

---

### Meta Info（クエスト/ステップ表示）

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| フォント | Inter | **Noto Sans JP** |
| サイズ | 12px | 12px（同じ） |
| 行高 | - | **16px** |
| 色 | #747474 | #747474（同じ） |
| 区切り色 | #C0C0C0 | silver (#C0C0C0)（同じ） |
| 表示形式 | `クエスト1` | `クエスト` + `1`（分離） |

---

### タイトル (h1)

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| フォント | Noto Sans JP | Noto Sans JP（同じ） |
| サイズ | 28px | 28px（同じ） |
| ウェイト | Bold | Bold（同じ） |
| 行高 | 32px | 32px（同じ） |
| 色 | #102028 | #102028（同じ） |

**→ タイトルは変更不要**

---

### 完了ボタン

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| 背景色 | #F3F5F5（グレー） | **#FFFFFF（白）** |
| ボーダー | なし | **1px solid #E4E4E4** |
| シャドウ | なし | **0px 1px 12px rgba(0,0,0,0.05)** |
| テキスト色 | #34373D | **#000000（黒）** |
| フォント | Inter | **Hiragino Sans W4** |
| ウェイト | Bold | **Regular (W4)** |
| サイズ | 14px | 14px（同じ） |
| 行高 | 20px | 20px（同じ） |
| パディング | px-3 py-2 | **px-[12px] py-[8px]** |
| アイコン | Check (18px) | **Check アイコン維持** |

---

### お気に入りボタン

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| 背景色 | 透明 | **#E9EBEB** |
| テキスト色 | #6A7282 | **#5A616F** |
| フォント | Inter | **Hiragino Sans W6** |
| ウェイト | Regular | **SemiBold (W6)** |
| アイコン | Star (18px) | **Star アイコン維持** |

---

### 次へボタン

| 項目 | 現在 | デザイン仕様 |
|------|------|-------------|
| テキスト | 「次の動画」 | **「次へ」** |
| 背景色 | #F3F5F5 | #F3F5F5（同じ） |
| テキスト色 | #6A7282 | #6A7282（同じ） |
| フォント | Inter | **Hiragino Sans W6** |
| ウェイト | Regular | **SemiBold (W6)** |
| アイコン | ChevronRight (16px) | ChevronRight (16px)（同じ） |
| アイコン位置 | 右 | 右（同じ） |

---

## 実装タスク

### Task 1: 全体構造の修正
- [ ] 垂直gapを15pxに変更
- [ ] シェアボタンを削除

### Task 2: Meta Info の修正
- [ ] フォントをNoto Sans JPに変更
- [ ] 行高を16pxに設定
- [ ] 表示形式を「クエスト」+「番号」に分離

### Task 3: 完了ボタンの修正
- [ ] 背景を白に変更
- [ ] ボーダーを追加 (1px solid #E4E4E4)
- [ ] シャドウを追加
- [ ] テキスト色を黒に変更
- [ ] フォントウェイトをRegularに変更

### Task 4: お気に入りボタンの修正
- [ ] 背景色を#E9EBEBに変更
- [ ] テキスト色を#5A616Fに変更
- [ ] フォントウェイトをSemiBoldに変更

### Task 5: 次へボタンの修正
- [ ] テキストを「次へ」に変更
- [ ] フォントウェイトをSemiBoldに変更

### Task 6: ホバー/アクティブ状態の追加
- [ ] 完了ボタン: hover背景 #FAFAFA, active背景 #F5F5F5
- [ ] お気に入りボタン: hover背景 #DFE1E1, active背景 #D5D7D7
- [ ] 次へボタン: hover背景 #E9EBEB, active背景 #DFE1E1

---

## フォント注意事項

**Hiragino Sans** はmacOS標準フォント。CSS指定:
```css
font-family: 'Hiragino Sans', -apple-system, sans-serif;
```

Tailwindで使う場合はカスタムクラスか`style`属性で指定。

---

## 参考コード（デザイン仕様）

```jsx
// 完了ボタン
<button
  className="bg-white border border-[#E4E4E4] rounded-full px-3 py-2 shadow-[0px_1px_12px_0px_rgba(0,0,0,0.05)]"
  style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif" }}
>
  <Check className="w-4 h-4" />
  <span className="text-sm text-black">完了にする</span>
</button>

// お気に入りボタン
<button
  className="bg-[#E9EBEB] rounded-full px-3 py-2"
  style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif", fontWeight: 600 }}
>
  <Star className="w-4 h-4" />
  <span className="text-sm text-[#5A616F] font-semibold">お気に入り</span>
</button>

// 次へボタン
<button
  className="bg-[#F3F5F5] rounded-full px-3 py-2"
  style={{ fontFamily: "'Hiragino Sans', -apple-system, sans-serif", fontWeight: 600 }}
>
  <span className="text-sm text-[#6A7282] font-semibold">次へ</span>
  <ChevronRight className="w-4 h-4" />
</button>
```
