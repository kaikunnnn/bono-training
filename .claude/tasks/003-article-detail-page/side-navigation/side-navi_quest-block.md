# クエストブロック（通常・Focus） 実装仕様書

## 概要

クエストを管理・表示するコンポーネント。クエストのタイトル番号、タイトルテキスト、複数のコンテンツアイテムを縦積みで配置。**Default（通常）** と **Focus（フォーカス）** の 2 つの状態を持つ。Focus は現在表示中のコンテンツを含むクエストを強調表示する。

---

## 1. コンポーネント構造

### HTML / JSX 構造

```jsx
<div class="quest-block" data-state="default">
  {/* クエストヘッダー */}
  <div class="quest-header">
    <div class="quest-title">
      <div class="quest-title__wrap">
        <div class="quest-title__number-box">
          <span class="quest-title__number">1</span>
        </div>
        <h2 class="quest-title__text">はじめに</h2>
      </div>
    </div>
  </div>

  {/* コンテンツリスト */}
  <div class="quest-content-list">
    <div class="quest-item">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>
    {/* 複数の item が続く */}
  </div>
</div>
```

### コンポーネント仕様

- **タイプ**: コンテナブロック
- **用途**: クエスト管理・表示
- **状態**: Default（通常）、Focus（フォーカス時）
- **サブコンポーネント**: quest_title、item（コンテンツアイテム）
- **インタラクティブ**: チェックボックス、ホバー対応

---

## 2. レイアウト・サイズ仕様

### クエストブロック全体

| プロパティ             | 値（Default）              | 値（Focus）                |
| ---------------------- | -------------------------- | -------------------------- |
| **幅**                 | 352px（固定）              | 352px（固定）              |
| **高さ**               | content（動的）            | content（動的）            |
| **ボーダーラディウス** | 5px                        | 5px                        |
| **ボーダー**           | 1px ダッシュ #9747FF（紫） | 2px グラデーション（下側） |
| **ボーダー種**         | dashed                     | solid（下側のみ）          |
| **背景色**             | #FFFFFF（白）              | #FFFFFF（白）              |

### ボーダー詳細

#### Default 状態

- **ボーダー色**: #9747FF（紫）
- **ボーダースタイル**: dashed（10px on、5px off）
- **ボーダー幅**: 1px
- **用途**: 通常のクエスト表示

#### Focus 状態

- **ボーダー色**: グラデーション（上から下へ）
  - Start: rgba(254, 166, 103, 1)（オレンジ）
  - End: rgba(196, 113, 245, 1)（紫）
- **ボーダースタイル**: solid
- **ボーダー位置**: 下側のみ（border-bottom: 2px）
- **用途**: 現在表示中のコンテンツを含むクエスト

### クエストヘッダー（quest_title インスタンス）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **パディング**   | 12px 16px            |
| **ギャップ**     | 10px                 |
| **幅**           | 100%（親に合わせる） |
| **背景色**       | #FFFFFF（白）        |

### クエストタイトルラップ（wrap）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（row）          |
| **配置**         | center（垂直中央）   |
| **ギャップ**     | 12px                 |
| **幅**           | 100%（親に合わせる） |

### クエスト番号ボックス（number_box）

| プロパティ             | 値（Default）            | 値（Focus）    |
| ---------------------- | ------------------------ | -------------- |
| **幅**                 | 16px（固定）             | 16px（固定）   |
| **高さ**               | 16px（固定）             | 16px（固定）   |
| **ボーダー**           | 1.25px #787878（グレー） | なし           |
| **背景色**             | #FFFFFF（白）            | グラデーション |
| **ボーダーラディウス** | 5px                      | 5px            |

### クエスト番号テキスト（quest_number）

| プロパティ           | 値（Default）     | 値（Focus）   |
| -------------------- | ----------------- | ------------- |
| **フォント**         | Hind              | Hind          |
| **フォントウェイト** | 500               | 500           |
| **フォントサイズ**   | 10px              | 10px          |
| **行高**             | 1em               | 1em           |
| **配置**             | center            | center        |
| **色**               | #787878（グレー） | #FFFFFF（白） |
| **テキスト**         | 1                 | 1             |

### クエストタイトルテキスト（quest_title）

| プロパティ           | 値（Default）     | 値（Focus）   |
| -------------------- | ----------------- | ------------- |
| **フォント**         | Noto Sans JP      | Noto Sans JP  |
| **フォントウェイト** | 700（Bold）       | 700（Bold）   |
| **フォントサイズ**   | 12px              | 12px          |
| **行高**             | 1em               | 1em           |
| **色**               | #787878（グレー） | #101828（黒） |
| **テキスト**         | はじめに          | はじめに      |

### コンテンツリスト（content_list）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **幅**           | 100%（親に合わせる） |
| **高さ**         | content（動的）      |

---

## 3. ビジュアル仕様

### 色パレット

| 要素             | 色コード       | RGB 値             | 用途               | 状態    |
| ---------------- | -------------- | ------------------ | ------------------ | ------- |
| ボーダー         | #9747FF        | rgb(147, 71, 255)  | 枠線               | Default |
| 番号ボックス背景 | グラデーション | オレンジ → 紫      | グラデーション背景 | Focus   |
| タイトルテキスト | #787878        | rgb(120, 120, 120) | クエストタイトル   | Default |
| タイトルテキスト | #101828        | rgb(16, 24, 40)    | クエストタイトル   | Focus   |
| 番号ボックス背景 | #FFFFFF        | rgb(255, 255, 255) | 番号背景           | Default |
| 番号ボックス枠線 | #787878        | rgb(120, 120, 120) | 番号枠線           | Default |
| 番号テキスト     | #FFFFFF        | rgb(255, 255, 255) | 番号テキスト       | Focus   |

### グラデーション詳細

#### Focus 状態のボーダーグラデーション

```css
background: linear-gradient(
  180deg,
  rgba(254, 166, 103, 1) 0%,
  rgba(196, 113, 245, 1) 100%
);
```

- **方向**: 180deg（上から下へ）
- **スタート色**: rgba(254, 166, 103, 1)（オレンジ #FEA667）
- **エンド色**: rgba(196, 113, 245, 1)（紫 #C471F5）

#### Focus 状態の番号ボックスグラデーション

```css
background: linear-gradient(
  180deg,
  rgba(254, 166, 103, 1) 0%,
  rgba(196, 113, 245, 1) 100%
);
```

- 同じグラデーション

---

## 4. インタラクション仕様

### Default 状態

- **ホバー**: 背景色が #F9FAFB に変更（わずかな強調）
- **アニメーション**: 150ms ease-in-out
- **カーソル**: default（非インタラクティブ）

### Focus 状態

- **背景色**: #FFFFFF（維持）
- **ボーダー**: グラデーション + 下側 2px
- **視覚的強調**: グラデーションボーダーで現在位置を明示
- **アニメーション**: ボーダー適用時 200ms ease-in-out

### クエストアイテムのインタラクション

- **チェックボックスホバー**: 背景色 #E8E8E8（わずかな暗化）
- **クリック**: チェック状態が切り替わる
- **フォーカス**: 2px solid #0066CC アウトライン

---

## 5. CSS 実装例

```css
/* クエストブロック コンテナ */
.quest-block {
  display: flex;
  flex-direction: column;
  width: 352px;
  background-color: #ffffff;
  border: 1px dashed #9747ff;
  border-radius: 5px;
  padding: 0 6px;
  transition: all 150ms ease-in-out;
}

/* Default状態 */
.quest-block[data-state="default"] {
  border: 1px dashed #9747ff;
}

.quest-block[data-state="default"]:hover {
  background-color: #f9fafb;
}

/* Focus状態 */
.quest-block[data-state="focus"] {
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(
      180deg,
      rgba(254, 166, 103, 1) 0%,
      rgba(196, 113, 245, 1) 100%
    ) 1;
  border-top: 1px dashed #9747ff;
  border-left: 1px dashed #9747ff;
  border-right: 1px dashed #9747ff;
}

/* クエストヘッダー */
.quest-header {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  gap: 10px;
  background-color: #ffffff;
}

/* クエストタイトルコンテナ */
.quest-title {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: 10px;
  padding: 0;
  background-color: #ffffff;
}

/* クエストタイトルラップ */
.quest-title__wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: auto;
}

/* 番号ボックス */
.quest-title__number-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1.25px solid #787878;
  background-color: #ffffff;
  flex-shrink: 0;
  transition: all 150ms ease-in-out;
}

.quest-block[data-state="focus"] .quest-title__number-box {
  border: none;
  background: linear-gradient(
    180deg,
    rgba(254, 166, 103, 1) 0%,
    rgba(196, 113, 245, 1) 100%
  );
}

/* 番号テキスト */
.quest-title__number {
  font-family: Hind, sans-serif;
  font-size: 10px;
  font-weight: 500;
  line-height: 1em;
  text-align: center;
  color: #787878;
}

.quest-block[data-state="focus"] .quest-title__number {
  color: #ffffff;
}

/* クエストタイトルテキスト */
.quest-title__text {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1em;
  color: #787878;
  margin: 0;
  padding: 0;
  flex: 1;
  transition: color 150ms ease-in-out;
}

.quest-block[data-state="focus"] .quest-title__text {
  color: #101828;
}

/* コンテンツリスト */
.quest-content-list {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  width: 100%;
  height: auto;
}

/* クエストアイテム */
.quest-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 6px;
  transition: all 150ms ease-in-out;
}

.quest-item:hover {
  background-color: #f9fafb;
}

.quest-item.is-focus {
  background-color: #f3f3f3;
  border-radius: 12px;
}

/* チェックボックス */
.quest-item__checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  border: 1.25px solid #99a1af;
  border-radius: 3px;
  background-color: #ffffff;
  appearance: none;
  -webkit-appearance: none;
  transition: all 150ms ease-in-out;
}

.quest-item__checkbox:hover {
  background-color: #e8e8e8;
}

.quest-item__checkbox:checked {
  background-color: #155dfc;
  border-color: #155dfc;
}

.quest-item__checkbox:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* コンテンツ */
.quest-item__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  gap: 12px;
}

/* アイテムタイトル */
.quest-item__title {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.667em;
  letter-spacing: -1.25%;
  color: #677b87;
  margin: 0;
  padding: 0;
  flex: 1;
  text-align: left;
  transition: color 150ms ease-in-out;
}

.quest-item.is-focus .quest-item__title {
  font-weight: 500;
  color: #101828;
}

/* 時間情報 */
.quest-item__duration {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  flex-shrink: 0;
}

.quest-item__duration-number {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
}

.quest-item__duration-unit {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6em;
  color: #6a7282;
  margin-left: 0px;
}
```

---

## 6. React 実装例

```jsx
import React, { useState } from 'react';
import './QuestBlock.css';

interface QuestItem {
  id: string;
  title: string;
  duration: number; // 分単位
  isCompleted: boolean;
  isFocus?: boolean;
}

interface QuestBlockProps {
  id: string;
  questNumber: number;
  title: string;
  items: QuestItem[];
  isFocus: boolean;
  onItemToggle: (questId: string, itemId: string) => void;
}

export const QuestBlock: React.FC<QuestBlockProps> = ({
  id,
  questNumber,
  title,
  items,
  isFocus,
  onItemToggle,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
    onItemToggle(id, itemId);
  };

  return (
    <div
      className="quest-block"
      data-state={isFocus ? 'focus' : 'default'}
      role="region"
      aria-label={`${title} - ${items.length}個のコンテンツ`}
    >
      {/* クエストヘッダー */}
      <div className="quest-header">
        <div className="quest-title">
          <div className="quest-title__wrap">
            <div className="quest-title__number-box">
              <span className="quest-title__number">
                {questNumber}
              </span>
            </div>
            <h2 className="quest-title__text">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* コンテンツリスト */}
      <div className="quest-content-list">
        {items.map((item) => (
          <div
            key={item.id}
            className={`quest-item ${item.isFocus ? 'is-focus' : ''}`}
            role="listitem"
          >
            <input
              type="checkbox"
              className="quest-item__checkbox"
              checked={checkedItems[item.id] || false}
              onChange={() => handleCheckboxChange(item.id)}
              aria-label={item.title}
            />
            <div className="quest-item__content">
              <h3 className="quest-item__title">
                {item.title}
              </h3>
              <div className="quest-item__duration">
                <span className="quest-item__duration-number">
                  {item.duration}
                </span>
                <span className="quest-item__duration-unit">分</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBlock;
```

---

## 7. HTML 実装例

```html
<!-- Default状態 -->
<div
  class="quest-block"
  data-state="default"
  role="region"
  aria-label="はじめに - 2個のコンテンツ"
>
  <!-- クエストヘッダー -->
  <div class="quest-header">
    <div class="quest-title">
      <div class="quest-title__wrap">
        <div class="quest-title__number-box">
          <span class="quest-title__number">1</span>
        </div>
        <h2 class="quest-title__text">はじめに</h2>
      </div>
    </div>
  </div>

  <!-- コンテンツリスト -->
  <div class="quest-content-list" role="list">
    <!-- アイテム1 -->
    <div class="quest-item" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>

    <!-- アイテム2 -->
    <div class="quest-item is-focus" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう（現在表示中）"
        checked
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Focus状態 -->
<div
  class="quest-block"
  data-state="focus"
  role="region"
  aria-label="はじめに - 2個のコンテンツ - 現在表示中"
>
  <!-- クエストヘッダー -->
  <div class="quest-header">
    <div class="quest-title">
      <div class="quest-title__wrap">
        <div class="quest-title__number-box">
          <span class="quest-title__number">1</span>
        </div>
        <h2 class="quest-title__text">はじめに</h2>
      </div>
    </div>
  </div>

  <!-- コンテンツリスト -->
  <div class="quest-content-list" role="list">
    <!-- アイテム1 -->
    <div class="quest-item" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>

    <!-- アイテム2（フォーカス） -->
    <div class="quest-item is-focus" role="listitem">
      <input
        type="checkbox"
        class="quest-item__checkbox"
        aria-label="ゴールを把握しよう（現在表示中）"
      />
      <div class="quest-item__content">
        <h3 class="quest-item__title">ゴールを把握しよう</h3>
        <div class="quest-item__duration">
          <span class="quest-item__duration-number">10</span>
          <span class="quest-item__duration-unit">分</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 8. 状態管理ガイダンス

### クエスト状態

```typescript
interface QuestState {
  isFocus: boolean; // クエスト全体がフォーカス状態か
  items: QuestItemState[]; // 各アイテムの状態
}

interface QuestItemState {
  id: string;
  isFocus: boolean; // アイテムが現在表示中か
  isCompleted: boolean; // チェックボックスの状態
}
```

### 状態切り替えロジック

```javascript
// クエストがフォーカスになるとき
const setQuestFocus = (questId: string) => {
  quests.forEach((quest) => {
    if (quest.id === questId) {
      quest.isFocus = true;
      // ボーダーがグラデーション表示に変わる
    } else {
      quest.isFocus = false;
      // ボーダーがダッシュ紫に戻る
    }
  });
};

// アイテムがフォーカスになるとき
const setItemFocus = (questId: string, itemId: string) => {
  const quest = quests.find((q) => q.id === questId);
  quest.items.forEach((item) => {
    if (item.id === itemId) {
      item.isFocus = true;
      // 背景色 #F3F3F3、ボーダーラディウス 12px
    } else {
      item.isFocus = false;
      // 背景色 transparent、ボーダーラディウス 6px
    }
  });
};
```

---

## 9. レスポンシブ対応

### モバイル（320px - 480px）

- **コンテナ幅**: 100%（最大 352px）
- **パディング**: 12px 16px（維持）
- **アイテムパディング**: 16px（維持）
- **フォントサイズ**: 12px（維持）

### タブレット（481px - 1024px）

- **複数クエスト表示**: 1 列から 2 列へ変更可能
- **ギャップ**: 24px

### デスクトップ（1025px 以上）

- **複数クエスト表示**: 2 列固定
- **ギャップ**: 32px

---

## 10. アクセシビリティ

### ARIA 属性

```html
<div
  class="quest-block"
  role="region"
  aria-label="はじめに - 2個のコンテンツ"
  aria-current="page"
  (Focus時)
>
  <div class="quest-content-list" role="list">
    <div class="quest-item" role="listitem">
      <!-- -->
    </div>
  </div>
</div>
```

### 対応項目

- ✅ キーボードナビゲーション（Tab キーで選択可能）
- ✅ フォーカス表示（明確な枠線）
- ✅ スクリーンリーダー対応（role="region"、aria-label）
- ✅ コントラスト比：4.5:1 以上（WCAG AA 準拠）
- ✅ チェックボックスのラベル付け

---

## 11. 使用例

### 複数クエスト表示

```jsx
<div class="quests-container">
  {quests.map((quest) => (
    <QuestBlock
      key={quest.id}
      id={quest.id}
      questNumber={quest.number}
      title={quest.title}
      items={quest.items}
      isFocus={quest.id === currentFocusQuestId}
      onItemToggle={handleItemToggle}
    />
  ))}
</div>

<style>
  .quests-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
</style>
```

---

## 12. 注記・最適化ポイント

1. **ボーダーグラデーション**: CSS の `border-image` で実装可能。SVG フィルターも検討
2. **アニメーション**: ボーダー色変更時は 200ms のトランジション推奨
3. **ダッシュボーダー**: `border-style: dashed` で 10px on、5px off
4. **グラデーション方向**: 180deg（上から下へ）を厳密に保つ
5. **パフォーマンス**: 多数のクエスト表示時は仮想スクロール検討

---

## チェックリスト

- [ ] Default 状態でボーダーが紫のダッシュ線（1px）で表示される
- [ ] Focus 状態でボーダー下側がグラデーション（2px）で表示される
- [ ] 番号ボックスの背景が Default でグレー、Focus でグラデーション
- [ ] タイトルカラーが Default でグレー、Focus で黒に変更
- [ ] アイテムホバー時に背景色が変更される
- [ ] フォーカス状態のアイテムが背景 #F3F3F3、ボーダーラディウス 12px
- [ ] チェックボックスが正常に機能する
- [ ] キーボード フォーカス表示が明確
- [ ] スクリーンリーダーで正しく読み上げられる
- [ ] モバイルでタップ領域が十分（44×44px 以上）
