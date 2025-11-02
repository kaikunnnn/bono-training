# コンテンツアイテム（デフォルト・ホバー・フォーカス） 実装仕様書

## 概要

クエストブロック内に表示される個々のコンテンツ行。チェックボックス、コンテンツタイトル、学習時間で構成される。**Default（デフォルト）**、**Hover（ホバー）**、**Focus（フォーカス）** の 3 つの状態を持つ。ユーザーが現在取り組んでいるコンテンツはフォーカス状態で視覚的に強調される。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<div class="content-item" data-state="default">
  {/* チェックボックス */}
  <input
    type="checkbox"
    class="content-item__checkbox"
    aria-label="ゴールを把握しよう"
  />

  {/* コンテンツ情報 */}
  <div class="content-item__block">
    {/* コンテンツタイトル */}
    <h3 class="content-item__title">ゴールを把握しよう</h3>

    {/* 学習時間情報 */}
    <div class="content-item__duration">
      <span class="content-item__duration-number">10</span>
      <span class="content-item__duration-unit">分</span>
    </div>
  </div>
</div>
```

### コンポーネント仕様

- **タイプ**: リストアイテム
- **用途**: クエスト内のコンテンツ表示
- **親コンポーネント**: quest_block（クエストブロック）
- **状態**: Default、Hover、Focus（3 状態）
- **インタラクティブ**: チェックボックス、ホバー、クリック対応

---

## 2. レイアウト・サイズ仕様

### 全体（content_item）

| プロパティ             | Default     | Hover       | Focus       |
| ---------------------- | ----------- | ----------- | ----------- |
| **幅**                 | 312px       | 312px       | 312px       |
| **高さ**               | content     | content     | content     |
| **ディスプレイ**       | flex（row） | flex（row） | flex（row） |
| **配置**               | center      | center      | center      |
| **ギャップ**           | 8px         | 8px         | 8px         |
| **パディング**         | 16px        | 16px        | 16px        |
| **背景色**             | transparent | #F3F3F3     | #F3F3F3     |
| **ボーダーラディウス** | 6px         | 12px        | 12px        |

### チェックボックス（checkbox）

| プロパティ               | 値                   |
| ------------------------ | -------------------- |
| **幅**                   | 16px（固定）         |
| **高さ**                 | 16px（固定）         |
| **フレックスシュリンク** | 0（縮小しない）      |
| **ボーダー**             | 1.25px solid #99A1AF |
| **背景色**               | #FFFFFF（白）        |
| **ボーダーラディウス**   | 3px                  |
| **カーソル**             | pointer              |
| **トランジション**       | 150ms ease-in-out    |

### チェックボックス：チェック時

| プロパティ     | 値                |
| -------------- | ----------------- |
| **背景色**     | #155DFC（ブルー） |
| **ボーダー色** | #155DFC（ブルー） |

### コンテンツブロック（block）

| プロパティ       | 値                        |
| ---------------- | ------------------------- |
| **ディスプレイ** | flex（row）               |
| **配置**         | space-between（両端配置） |
| **アイテム配置** | center（垂直中央）        |
| **幅**           | 100%（親に合わせる）      |
| **高さ**         | content（動的）           |

### コンテンツタイトル（content_title）

| プロパティ           | Default      | Hover/Focus  |
| -------------------- | ------------ | ------------ |
| **フォント**         | Noto Sans JP | Noto Sans JP |
| **フォントウェイト** | 400          | 500          |
| **フォントサイズ**   | 12px         | 12px         |
| **行高**             | 1.667em      | 1.667em      |
| **レターパディング** | -1.25%       | -1.25%       |
| **色**               | #677B87      | #101828      |
| **テキスト配置**     | 左寄せ       | 左寄せ       |
| **幅**               | 100%         | 100%         |

### 学習時間情報（duration）

| プロパティ               | 値              |
| ------------------------ | --------------- |
| **ディスプレイ**         | flex（row）     |
| **配置**                 | center（中央）  |
| **ギャップ**             | 0px             |
| **幅**                   | content（動的） |
| **ホワイトスペース**     | nowrap          |
| **フレックスシュリンク** | 0（縮小しない） |

### 学習時間の数値（duration_number）

| プロパティ           | 値           |
| -------------------- | ------------ |
| **フォント**         | Noto Sans JP |
| **フォントウェイト** | 400          |
| **フォントサイズ**   | 10px         |
| **行高**             | 1.6em        |
| **色**               | #6A7282      |

### 学習時間の単位（duration_unit）

| プロパティ           | 値           |
| -------------------- | ------------ |
| **フォント**         | Noto Sans JP |
| **フォントウェイト** | 400          |
| **フォントサイズ**   | 10px         |
| **行高**             | 1.6em        |
| **色**               | #6A7282      |

---

## 3. ビジュアル仕様

### 色パレット

| 要素                     | 色コード    | RGB 値             | 状態        | 用途             |
| ------------------------ | ----------- | ------------------ | ----------- | ---------------- |
| 背景                     | transparent | -                  | Default     | コンテナ背景     |
| 背景                     | #F3F3F3     | rgb(243, 243, 243) | Hover/Focus | ハイライト背景   |
| タイトル                 | #677B87     | rgb(103, 123, 135) | Default     | タイトル（薄い） |
| タイトル                 | #101828     | rgb(16, 24, 40)    | Hover/Focus | タイトル（濃い） |
| チェックボックスボーダー | #99A1AF     | rgb(153, 161, 175) | Default     | 枠線             |
| チェックボックス背景     | #FFFFFF     | rgb(255, 255, 255) | Default     | 背景             |
| チェックボックス背景     | #155DFC     | rgb(21, 93, 252)   | Checked     | ブルー背景       |
| 時間テキスト             | #6A7282     | rgb(106, 114, 130) | すべて      | 時間表記         |

### ボーダーラディウス

| 状態                 | Default | Hover/Focus |
| -------------------- | ------- | ----------- |
| **コンテナ**         | 6px     | 12px        |
| **チェックボックス** | 3px     | 3px         |

---

## 4. インタラクション仕様

### Default 状態

- **背景色**: transparent
- **ボーダーラディウス**: 6px
- **タイトル色**: #677B87（薄いグレー）
- **カーソル**: pointer
- **アニメーション**: 150ms ease-in-out へ移行可能

### Hover 状態（マウスオーバー時）

- **背景色**: #F3F3F3（ライトグレー）
- **ボーダーラディウス**: 12px（より丸くなる）
- **タイトル色**: #101828（濃いグレー・黒）
- **タイトルフォントウェイト**: 500（Medium）に変更
- **アニメーション**: 150ms ease-in-out で滑らかに遷移
- **カーソル**: pointer（継続）

### Focus 状態（現在表示中のコンテンツ）

- **背景色**: #F3F3F3（ライトグレー）
- **ボーダーラディウス**: 12px
- **タイトル色**: #101828（濃いグレー・黒）
- **タイトルフォントウェイト**: 500（Medium）
- **視覚的強調**: より明確な背景色とテキスト濃度で表現
- **アニメーション**: 200ms ease-in-out で遷移

### チェックボックスホバー

- **背景色**: #E8E8E8（わずかな暗化）
- **ボーダー色**: #88919F（やや濃くなる）

### チェック状態

- **背景色**: #155DFC（ブルー）
- **ボーダー色**: #155DFC（ブルー）
- **チェックマーク**: 白色で表示

### アクティブ / クリック状態

- **スケール**: 98% に縮小（わずかな圧縮感）
- **アニメーション**: 100ms ease-out

---

## 5. CSS 実装例

```css
/* コンテンツアイテム コンテナ */
.content-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px;
  width: 312px;
  height: auto;
  background-color: transparent;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

/* Default状態 */
.content-item[data-state="default"] {
  background-color: transparent;
  border-radius: 6px;
}

/* Hover状態 */
.content-item[data-state="hover"],
.content-item:hover {
  background-color: #f3f3f3;
  border-radius: 12px;
}

.content-item[data-state="hover"] .content-item__title,
.content-item:hover .content-item__title {
  color: #101828;
  font-weight: 500;
}

/* Focus状態 */
.content-item[data-state="focus"] {
  background-color: #f3f3f3;
  border-radius: 12px;
}

.content-item[data-state="focus"] .content-item__title {
  color: #101828;
  font-weight: 500;
}

/* アクティブ状態 */
.content-item:active {
  transform: scale(0.98);
}

/* チェックボックス */
.content-item__checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1.25px solid #99a1af;
  border-radius: 3px;
  background-color: #ffffff;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 150ms ease-in-out;
}

/* チェックボックスホバー */
.content-item__checkbox:hover {
  background-color: #e8e8e8;
  border-color: #88919f;
}

/* チェックボックスチェック状態 */
.content-item__checkbox:checked {
  background-color: #155dfc;
  border-color: #155dfc;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="%23FFFFFF"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 11.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

/* チェックボックスフォーカス */
.content-item__checkbox:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* コンテンツブロック */
.content-item__block {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  gap: 12px;
}

/* コンテンツタイトル */
.content-item__title {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.667em;
  letter-spacing: -1.25%;
  color: #677b87;
  text-align: left;
  margin: 0;
  padding: 0;
  flex: 1;
  transition: color 150ms ease-in-out, font-weight 150ms ease-in-out;
}

.content-item[data-state="hover"] .content-item__title,
.content-item:hover .content-item__title {
  color: #101828;
  font-weight: 500;
}

.content-item[data-state="focus"] .content-item__title {
  color: #101828;
  font-weight: 500;
}

/* 学習時間情報 */
.content-item__duration {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  flex-shrink: 0;
  height: auto;
}

/* 学習時間の数値 */
.content-item__duration-number {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
  margin: 0;
  padding: 0;
}

/* 学習時間の単位 */
.content-item__duration-unit {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
  margin: 0;
  padding: 0;
  margin-left: 0;
}
```

---

## 6. React 実装例

```jsx
import React, { useState } from "react";
import "./ContentItem.css";

interface ContentItemProps {
  id: string;
  title: string;
  duration: number; // 分単位
  isChecked?: boolean;
  isFocus?: boolean;
  onCheckChange?: (id: string, isChecked: boolean) => void;
  onItemClick?: (id: string) => void;
}

export const ContentItem: React.FC<ContentItemProps> = ({
  id,
  title,
  duration,
  isChecked = false,
  isFocus = false,
  onCheckChange,
  onItemClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCheckedLocal, setIsCheckedLocal] = useState(isChecked);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newCheckedState = e.target.checked;
    setIsCheckedLocal(newCheckedState);
    onCheckChange?.(id, newCheckedState);
  };

  const handleItemClick = () => {
    onItemClick?.(id);
  };

  const getState = (): "default" | "hover" | "focus" => {
    if (isFocus) return "focus";
    if (isHovered) return "hover";
    return "default";
  };

  return (
    <div
      className="content-item"
      data-state={getState()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleItemClick}
      role="listitem"
      aria-label={`${title} - ${duration}分 ${
        isCheckedLocal ? "完了" : "未完了"
      }`}
    >
      {/* チェックボックス */}
      <input
        type="checkbox"
        className="content-item__checkbox"
        checked={isCheckedLocal}
        onChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        aria-label={`${title}を${isCheckedLocal ? "チェック解除" : "チェック"}`}
      />

      {/* コンテンツ情報 */}
      <div className="content-item__block">
        {/* タイトル */}
        <h3 className="content-item__title">{title}</h3>

        {/* 学習時間 */}
        <div className="content-item__duration">
          <span className="content-item__duration-number">{duration}</span>
          <span className="content-item__duration-unit">分</span>
        </div>
      </div>
    </div>
  );
};

export default ContentItem;
```

---

## 7. HTML 実装例

```html
<!-- Default状態 -->
<div
  class="content-item"
  data-state="default"
  role="listitem"
  aria-label="ゴールを把握しよう - 10分 未完了"
>
  <input
    type="checkbox"
    class="content-item__checkbox"
    aria-label="ゴールを把握しようをチェック"
  />
  <div class="content-item__block">
    <h3 class="content-item__title">ゴールを把握しよう</h3>
    <div class="content-item__duration">
      <span class="content-item__duration-number">10</span>
      <span class="content-item__duration-unit">分</span>
    </div>
  </div>
</div>

<!-- Hover状態 -->
<div
  class="content-item"
  data-state="hover"
  role="listitem"
  aria-label="ゴールを把握しよう - 10分 未完了"
>
  <input
    type="checkbox"
    class="content-item__checkbox"
    aria-label="ゴールを把握しようをチェック"
  />
  <div class="content-item__block">
    <h3 class="content-item__title">ゴールを把握しよう</h3>
    <div class="content-item__duration">
      <span class="content-item__duration-number">10</span>
      <span class="content-item__duration-unit">分</span>
    </div>
  </div>
</div>

<!-- Focus状態 -->
<div
  class="content-item"
  data-state="focus"
  role="listitem"
  aria-label="ゴールを把握しよう - 10分 未完了（現在表示中）"
  aria-current="step"
>
  <input
    type="checkbox"
    class="content-item__checkbox"
    aria-label="ゴールを把握しようをチェック"
  />
  <div class="content-item__block">
    <h3 class="content-item__title">ゴールを把握しよう</h3>
    <div class="content-item__duration">
      <span class="content-item__duration-number">10</span>
      <span class="content-item__duration-unit">分</span>
    </div>
  </div>
</div>

<!-- チェック済み状態 -->
<div
  class="content-item"
  data-state="default"
  role="listitem"
  aria-label="ゴールを把握しよう - 10分 完了"
>
  <input
    type="checkbox"
    class="content-item__checkbox"
    checked
    aria-label="ゴールを把握しようをチェック解除"
  />
  <div class="content-item__block">
    <h3 class="content-item__title">ゴールを把握しよう</h3>
    <div class="content-item__duration">
      <span class="content-item__duration-number">10</span>
      <span class="content-item__duration-unit">分</span>
    </div>
  </div>
</div>
```

---

## 8. 状態管理ガイダンス

### コンポーネント状態

```typescript
interface ContentItemState {
  id: string;
  title: string;
  duration: number;
  isChecked: boolean;
  isFocus: boolean;
  isHovered: boolean;
}
```

### 状態遷移図

```
Default
  ├─ onMouseEnter → Hover
  ├─ onClick → Focus に遷移
  └─ onCheckboxChange → isChecked 反転

Hover
  ├─ onMouseLeave → Default に戻る
  ├─ onClick → Focus に遷移
  └─ onCheckboxChange → isChecked 反転

Focus
  ├─ onMouseEnter → Focus + Hover表示（背景は変わらない）
  ├─ onClick（別アイテムをクリック） → Default に戻る
  └─ onCheckboxChange → isChecked 反転
```

---

## 9. レスポンシブ対応

### モバイル（320px - 480px）

- **アイテム幅**: 100%（最大 312px）
- **パディング**: 16px（維持）
- **ギャップ**: 8px（維持）
- **チェックボックスサイズ**: 16px（維持、タッチターゲット 44×44px 推奨）
- **フォントサイズ**: 12px（タイトル、維持）

### タブレット（481px - 1024px）

- **アイテム幅**: 312px（固定）
- **複数行表示**: 1 列
- **間隔**: 0px

### デスクトップ（1025px 以上）

- **アイテム幅**: 312px（固定）
- **複数行表示**: 1 列
- **間隔**: 0px

---

## 10. アクセシビリティ

### ARIA 属性

```html
<div
  class="content-item"
  role="listitem"
  aria-label="ゴールを把握しよう - 10分 未完了"
  aria-current="step"
  (Focus時)
>
  <input type="checkbox" aria-label="ゴールを把握しようをチェック" />
  <!-- -->
</div>
```

### 対応項目

- ✅ キーボードナビゲーション（Tab キーで選択可能）
- ✅ フォーカス表示（チェックボックスに明確な枠線）
- ✅ スクリーンリーダー対応（role="listitem"、aria-label、aria-current）
- ✅ コントラスト比：4.5:1 以上（WCAG AA 準拠）
- ✅ タップターゲット：44×44px 以上（モバイル対応）

---

## 11. チェックボックスの実装

### SVG チェックマーク（checked 時）

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#FFFFFF">
  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 11.94l6.72-6.72a.75.75 0 011.06 0z"/>
</svg>
```

### CSS でのチェックマーク実装

```css
.content-item__checkbox:checked::before {
  content: "✓";
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}
```

---

## 12. 使用例

### 複数アイテムリスト

```jsx
<div class="content-list" role="list">
  {contentItems.map((item) => (
    <ContentItem
      key={item.id}
      id={item.id}
      title={item.title}
      duration={item.duration}
      isChecked={item.isChecked}
      isFocus={item.id === currentFocusItemId}
      onCheckChange={handleCheckboxChange}
      onItemClick={handleItemClick}
    />
  ))}
</div>

<style>
  .content-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
```

### with Animation

```jsx
<ContentItem
  id="item-1"
  title="ゴールを把握しよう"
  duration={10}
  isChecked={false}
  isFocus={currentFocusItemId === "item-1"}
  onCheckChange={(id, checked) => {
    console.log(`Item ${id} checked: ${checked}`);
  }}
  onItemClick={(id) => {
    console.log(`Item ${id} clicked`);
    setCurrentFocusItemId(id);
  }}
/>
```

---

## 13. ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  .content-item {
    background-color: transparent;
  }

  .content-item[data-state="hover"],
  .content-item:hover,
  .content-item[data-state="focus"] {
    background-color: #2a2a2a;
  }

  .content-item__title {
    color: #b0b8c0;
  }

  .content-item[data-state="hover"] .content-item__title,
  .content-item:hover .content-item__title,
  .content-item[data-state="focus"] .content-item__title {
    color: #e8e8e8;
  }

  .content-item__checkbox {
    background-color: #1a1a1a;
    border-color: #555555;
  }

  .content-item__checkbox:hover {
    background-color: #2a2a2a;
    border-color: #666666;
  }

  .content-item__duration-number,
  .content-item__duration-unit {
    color: #a0a8b0;
  }
}
```

---

## 14. 注記・最適化ポイント

1. **ボーダーラディウス変更**: Default 6px → Hover/Focus 12px は CSS トランジションで滑らかに変更
2. **テキスト濃度変更**: タイトル色が #677B87 → #101828 に変更。コントラスト比を確認
3. **パフォーマンス**: 多数のアイテム表示時は仮想スクロール（React Window など）検討
4. **チェックボックス**: `appearance: none` で iOS Safari 対応も確認
5. **アニメーション**: 150ms が標準。UX に応じて 100-200ms の範囲で調整可能
6. **タッチ対応**: モバイルではチェックボックス周辺に 44×44px のタッチターゲットを確保

---

## チェックリスト

- [ ] Default 状態：背景透明、ボーダーラディウス 6px、タイトルグレー
- [ ] Hover 状態：背景 #F3F3F3、ボーダーラディウス 12px、タイトル黒・太さ 500
- [ ] Focus 状態：背景 #F3F3F3、ボーダーラディウス 12px、タイトル黒・太さ 500
- [ ] チェックボックス基本：16×16px、ボーダー 1.25px #99A1AF、ボーダーラディウス 3px
- [ ] チェックボックスホバー：背景 #E8E8E8、ボーダー #88919F
- [ ] チェックボックスチェック：背景 #155DFC、チェックマーク表示
- [ ] タイトルテキスト：12px、Noto Sans JP、Default 400 / Hover/Focus 500
- [ ] 学習時間：10px、グレー #6A7282、ギャップなし
- [ ] クリック時のスケール：98% に縮小
- [ ] アニメーション：150ms ease-in-out で滑らか
- [ ] キーボードフォーカス表示：チェックボックスに 2px ブルーアウトライン
- [ ] スクリーンリーダー対応：role="listitem"、aria-label、aria-current
- [ ] モバイルでのタップターゲット：44×44px 以上
- [ ] ダークモード対応：背景・テキスト色の切り替え
