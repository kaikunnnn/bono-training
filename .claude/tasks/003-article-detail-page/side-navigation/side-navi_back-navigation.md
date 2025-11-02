# バックナビゲーションコンポーネント 実装仕様書

## 概要

ユーザーが前のページまたは親ページに戻るための、矢印アイコンとテキストを組み合わせたナビゲーションコンポーネント。クリック可能な要素として機能し、ホバー状態での視覚的フィードバックを提供する。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<button class="back-navigation">
  <span class="back-navigation__icon">{/* 矢印アイコン SVG */}</span>
  <span class="back-navigation__text">トップへ</span>
</button>
```

### コンポーネント仕様

- **タイプ**: インタラクティブボタン
- **用途**: ページナビゲーション
- **テキスト**: 「トップへ」（可変可能）
- **レイアウト**: 水平配置（flex row）
- **アクセシビリティ**: `<button>` タグで実装、スクリーンリーダー対応

---

## 2. レイアウト・サイズ仕様

### 全体レイアウト

| プロパティ         | 値                          |
| ------------------ | --------------------------- |
| **ディスプレイ**   | flex                        |
| **フレックス方向** | row（横並び）               |
| **アイテム配置**   | center（垂直中央）          |
| **間隔（gap）**    | 4px                         |
| **サイジング**     | hug（コンテンツに合わせる） |

### 矢印アイコン（circle_block）

| プロパティ     | 値                            |
| -------------- | ----------------------------- |
| **幅**         | 16px                          |
| **高さ**       | 16px                          |
| **サイジング** | fixed（固定）                 |
| **背景色**     | #E4E4E4（ライトグレー）       |
| **形状**       | 円形（border-radius: 1000px） |

### テキスト

| プロパティ           | 値                    |
| -------------------- | --------------------- |
| **フォント**         | Noto Sans JP          |
| **フォントウェイト** | 400（通常）           |
| **フォントサイズ**   | 10px                  |
| **行高**             | 1.6em                 |
| **色**               | #6D6D6D（濃いグレー） |
| **テキスト配置**     | 左寄せ                |

---

## 3. ビジュアル仕様

### 矢印デザイン詳細

矢印は円形背景（16×16px、#E4E4E4）内に配置される。矢印は黒線で描画：

- 外側の円形ブロック：16×16px
- 内側の矢印線：
  - 上部分（斜め線）: 位置 (5,5) から (11,0) へ（太さ 0.857px）
  - 左下分（斜め線）: 位置 (0,0) から (0,6) へ
  - 下部分（横線）: 位置 (0,3) から (6,3) へ
  - 線の色：#000000（黒）
  - 線の太さ：0.857px

### 色パレット

| 要素     | 色コード | RGB 値             | 用途           |
| -------- | -------- | ------------------ | -------------- |
| 円形背景 | #E4E4E4  | rgb(228, 228, 228) | アイコン背景   |
| テキスト | #6D6D6D  | rgb(109, 109, 109) | テキストカラー |
| 矢印線   | #000000  | rgb(0, 0, 0)       | アイコン線     |

---

## 4. インタラクション仕様

### ボタン状態

#### デフォルト状態

- 背景：透明
- テキスト色：#6D6D6D
- 円形背景：#E4E4E4
- カーソル：pointer

#### ホバー状態

- **テキスト色の変更**: #4A4A4A に濃くなる（推奨）
- **円形背景の強調**: #D0D0D0 に濃くなる（推奨）
- **アニメーション**: 100-150ms のスムーズな遷移
- カーソル：pointer（継続）

#### アクティブ / クリック状態

- **スケール**: 95-98% に縮小（スプリングアニメーション推奨）
- 背景：さらに濃い灰色に
- アニメーション：50-100ms の快速応答

#### フォーカス状態（キーボード操作）

- **アウトライン**: 2px solid #0066CC（ブルー）
- **内側パディング**: 2px
- スクリーンリーダーにも対応

### クリックイベント

```javascript
// 例：React での実装
const handleBackClick = () => {
  window.history.back();
  // または: navigate(-1); // React Router
};
```

---

## 5. CSS 実装例

```css
/* バックナビゲーション コンテナ */
.back-navigation {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

/* ホバー状態 */
.back-navigation:hover {
  opacity: 0.8;
}

.back-navigation:hover .back-navigation__icon {
  background-color: #d0d0d0;
}

.back-navigation:hover .back-navigation__text {
  color: #4a4a4a;
}

/* アクティブ / クリック状態 */
.back-navigation:active {
  transform: scale(0.96);
}

/* フォーカス状態 */
.back-navigation:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* アイコン */
.back-navigation__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #e4e4e4;
  border-radius: 50%;
  transition: background-color 150ms ease-in-out;
}

/* テキスト */
.back-navigation__text {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6d6d6d;
  transition: color 150ms ease-in-out;
}
```

---

## 6. SVG アイコン実装

```svg
<svg
  viewBox="0 0 16 16"
  width="16"
  height="16"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- 矢印の上部分 -->
  <line
    x1="5"
    y1="5"
    x2="11"
    y2="0"
    stroke="#000000"
    stroke-width="0.857"
  />
  <!-- 矢印の左下分 -->
  <line
    x1="0"
    y1="0"
    x2="0"
    y2="6"
    stroke="#000000"
    stroke-width="0.857"
  />
  <!-- 矢印の下部分 -->
  <line
    x1="0"
    y1="3"
    x2="6"
    y2="3"
    stroke="#000000"
    stroke-width="0.857"
  />
</svg>
```

---

## 7. レスポンシブ対応

### モバイル対応

- **最小ターゲットサイズ**: 44×44px（ボタン周辺のクリック領域拡張推奨）
- **パディング追加**: 上下左右 8-12px
- **フォントサイズ**: 10px 維持（読みやすさ確認）

### タブレット以上

- ボタンサイズ: 通常表示（16×16 アイコン）
- テキスト: 10px 維持

---

## 8. アクセシビリティ

### ARIA 属性

```html
<button
  class="back-navigation"
  aria-label="トップへ戻る"
  onclick="history.back()"
>
  <span class="back-navigation__icon" aria-hidden="true"> {/* SVG */} </span>
  <span class="back-navigation__text">トップへ</span>
</button>
```

### 対応項目

- ✅ キーボードナビゲーション（Tab キーで選択可能）
- ✅ フォーカス表示（フォーカス状態で明確な枠線）
- ✅ スクリーンリーダー対応（aria-label）
- ✅ コントラスト比：4.5:1 以上（WCAG AA 準拠）

---

## 9. 使用例

### React 実装

```jsx
import React from "react";
import "./BackNavigation.css";

export const BackNavigation = ({ label = "トップへ", onClick }) => {
  return (
    <button
      className="back-navigation"
      aria-label={`${label}へ戻る`}
      onClick={onClick}
    >
      <span className="back-navigation__icon">
        <svg viewBox="0 0 16 16">
          <line
            x1="5"
            y1="5"
            x2="11"
            y2="0"
            stroke="#000000"
            strokeWidth="0.857"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#000000"
            strokeWidth="0.857"
          />
          <line
            x1="0"
            y1="3"
            x2="6"
            y2="3"
            stroke="#000000"
            strokeWidth="0.857"
          />
        </svg>
      </span>
      <span className="back-navigation__text">{label}</span>
    </button>
  );
};
```

### HTML 実装

```html
<button class="back-navigation" onclick="history.back()">
  <span class="back-navigation__icon">
    <svg viewBox="0 0 16 16">
      <line
        x1="5"
        y1="5"
        x2="11"
        y2="0"
        stroke="#000000"
        stroke-width="0.857"
      />
      <line x1="0" y1="0" x2="0" y2="6" stroke="#000000" stroke-width="0.857" />
      <line x1="0" y1="3" x2="6" y2="3" stroke="#000000" stroke-width="0.857" />
    </svg>
  </span>
  <span class="back-navigation__text">トップへ</span>
</button>
```

---

## 10. 注記・最適化ポイント

1. **矢印の太さ**: 0.857px は Figma の仕様。CSS では 1px または 0.5px に調整可能
2. **アイコン位置**: SVG の viewBox を調整して、矢印の中央配置を確認
3. **アニメーション**: ホバーとクリック時のトランジション時間を統一
4. **パフォーマンス**: SVG をインライン埋め込みせず、別ファイルとして読み込むことも検討
5. **色のコントラスト**: #6D6D6D は背景色によって見える・見えないが変わるため、背景色に応じて調整推奨

---

## チェックリスト

- [ ] SVG アイコンの矢印が正しく表示される
- [ ] ホバー状態での色変更が滑らかに遷移する
- [ ] クリック時のスケール変更が自然に見える
- [ ] キーボード フォーカス表示が明確
- [ ] モバイルでのクリック領域が十分（44×44px 以上）
- [ ] スクリーンリーダーで「トップへ戻る」と読み上げられる
- [ ] ライトモード・ダークモード両対応確認
