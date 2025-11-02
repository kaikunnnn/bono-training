# 全体統合設計仕様書 - Kaizen Onboarding 学習ガイド UI

## 概要

**Kaizen Onboarding** の学習ガイド表示画面全体の統合設計。左側サイドバーにレッスン一覧・クエスト管理・コンテンツ階層を表示。ユーザーの学習進捗を視覚的に管理し、現在取り組んでいるコンテンツをフォーカス状態で強調表示する。

---

## 1. ページ全体構成

### フレームワーク

```
┌────────────────────────────────────────────────────────┐
│                   アプリケーション全体                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────┬──────────────────────────┐  │
│  │                      │                          │  │
│  │   サイドバー         │    メインコンテンツエリア │  │
│  │   (320px)            │    (可変幅)              │  │
│  │                      │                          │  │
│  │  • ロゴ              │  • ページコンテンツ      │  │
│  │  • バックナビ        │  • 動画/課題など       │  │
│  │  • レッスン情報      │                          │  │
│  │  • クエスト一覧      │                          │  │
│  │                      │                          │  │
│  └──────────────────────┴──────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### レイアウト仕様

| 要素             | 値                          |
| ---------------- | --------------------------- |
| **全体幅**       | 320px（サイドバーのみ表示） |
| **サイドバー幅** | 320px                       |
| **ディスプレイ** | flex（column）              |
| **背景色**       | #FFFFFF（白）               |
| **境界線**       | 右側に 1px グレー           |

---

## 2. 階層構造と親子関係

### コンポーネント関係図

```
sidenavi（サイドバー全体）
├── AppSidebar（ロゴ・ナビゲーション SVG）
│   └── Kaizen Onboarding ブランディング
│
└── content（メインコンテンツ）
    ├── lesson_detail（レッスン情報カード）
    │   ├── back_navigation（バックボタン）
    │   │   ├── circle_block（アイコン）
    │   │   └── text（「トップへ」）
    │   │
    │   └── lesson_detail（カード本体）
    │       ├── icon_lesson（サムネイル画像）
    │       ├── detail（詳細情報）
    │       │   ├── lesson_title（タイトル）
    │       │   └── progress_box（プログレスバー）
    │       │       ├── ProgressBar（背景 + フィル）
    │       │       └── percent（パーセンテージ表記）
    │       │
    │       └── quest_list（クエスト一覧）
    │           ├── quest（クエスト 1 - Default）
    │           │   ├── quest_title（クエスト番号 + タイトル）
    │           │   │   ├── number_box（番号ボックス）
    │           │   │   └── quest_title__text（タイトル）
    │           │   │
    │           │   └── content_list（コンテンツアイテム）
    │           │       ├── item（コンテンツ 1 - Default）
    │           │       │   ├── check_box_off（チェックボックス）
    │           │       │   └── block（コンテンツ情報）
    │           │       │       ├── content_title（タイトル）
    │           │       │       └── numberofduration（時間情報）
    │           │       │
    │           │       └── item（コンテンツ 2 - Default）
    │           │           └── ...（同じ構造）
    │           │
    │           ├── separator line（区切り線）
    │           │
    │           └── quest（クエスト 2 - Focus）
    │               ├── quest_title（クエスト番号 + タイトル）
    │               │   └── ...（グラデーション表示）
    │               │
    │               └── content_list（コンテンツアイテム）
    │                   ├── item（コンテンツ 1 - Default）
    │                   │   └── ...
    │                   │
    │                   └── item（コンテンツ 2 - Focus）
    │                       └── ...（ハイライト背景）
    │
    └── 複数のquests（必要に応じて追加可能）
```

---

## 3. サイドバーレイアウト詳細

### 全体コンテナ（sidenavi）

| プロパティ         | 値                     |
| ------------------ | ---------------------- |
| **幅**             | 320px（固定）          |
| **高さ**           | content（動的）        |
| **ディスプレイ**   | flex（column）         |
| **パディング**     | 0px                    |
| **背景色**         | #FFFFFF（白）          |
| **ボーダー**       | 右側 1px #F0F0F0       |
| **オーバーフロー** | auto（スクロール可能） |

### ロゴエリア（AppSidebar）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **配置**         | center（中央）       |
| **ギャップ**     | 16px                 |
| **パディング**   | 16px 12px            |
| **幅**           | 100%（親に合わせる） |

### コンテンツエリア（content）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **配置**         | flex-end（右寄せ）   |
| **幅**           | 100%（親に合わせる） |
| **パディング**   | 0px                  |

### レッスン詳細セクション（lesson_detail）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **パディング**   | 12px 0px             |
| **ボーダー下**   | 1px #F0F0F0          |
| **ギャップ**     | 0px                  |
| **幅**           | 100%（親に合わせる） |

### ナビゲーションセクション（navigation）

| プロパティ       | 値                   |
| ---------------- | -------------------- |
| **ディスプレイ** | flex（column）       |
| **ギャップ**     | 10px                 |
| **パディング**   | 0px 12px             |
| **幅**           | 100%（親に合わせる） |

### バックナビゲーション（back_navigation）

| プロパティ       | 値              |
| ---------------- | --------------- |
| **ディスプレイ** | flex（row）     |
| **ギャップ**     | 4px             |
| **配置**         | center          |
| **幅**           | content（動的） |

---

## 4. 各コンポーネントの組み込まれた状態

### 4.1 バックナビゲーション（back_navigation）

**参照**: `back_navigation_specification.md`

**本全体での役割**:

- レッスンメインビューから戻るための操作
- サイドバーの上部に配置
- ユーザーのナビゲーション支援

**スタイル**:

- アイコン: 16×16px、背景 #E4E4E4
- テキスト: 10px、#6D6D6D
- トランジション: 150ms ease-in-out

**配置**:

```
サイドバー
├── ロゴ
└── コンテンツ
    └── レッスン詳細
        └── ナビゲーション
            └── back_navigation ← ここに配置
```

---

### 4.2 レッスン詳細カード（lesson_detail）

**参照**: `lesson_detail_specification.md`

**本全体での役割**:

- 現在取り組んでいるレッスンの情報表示
- プログレス可視化
- クイック情報確認

**構成**:

- サムネイル画像: 53.33 × 80px（右側丸い）
- タイトル: 13px Inter、太さ 500
- プログレスバー: 160px 幅、フィル色 #155DFC

**配置**: バックナビゲーションの下、クエストリストの上

**スタイル**:

- 背景: #F9FAFB
- パディング: 12px
- ボーダーラディウス: 0px
- ホバー時: 背景色 #F3F4F6

---

### 4.3 クエストブロック（quest_block）

**参照**: `quest_block_specification.md`

**本全体での役割**:

- 学習階層の中核コンポーネント
- クエスト単位で学習を管理
- 複数クエストをリスト化表示

**状態**:

- **Default**: 紫のダッシュボーダー 1px
- **Focus**: グラデーションボーダー（下側 2px）

**構成**:

1. クエストタイトル（quest_title）

   - 番号ボックス: 16×16px
   - タイトル: 12px Noto Sans JP Bold

2. コンテンツリスト（content_list）
   - 複数の content_item を含む

**配置**: quest_list の直下、複数配置可能

**ギャップ**: 各クエスト間に 4px

---

### 4.4 クエストタイトル（quest_title）

**参照**: `quest_title_specification.md`

**本全体での役割**:

- クエスト内の階層構造を示す
- クエスト番号とタイトルの一対一表示
- 親の状態に連動して表示

**構成**:

- 番号ボックス: 16×16px
- タイトルテキスト: 12px

**状態連動**:

- Default: グレー #787878
- Focus: 番号背景グラデーション、テキスト黒 #101828

---

### 4.5 コンテンツアイテム（content_item）

**参照**: `content_item_specification.md`

**本全体での役割**:

- 学習の最小単位
- チェック状態管理
- ユーザーが最も頻繁に操作するコンポーネント

**構成**:

- チェックボックス: 16×16px
- コンテンツタイトル: 12px
- 学習時間: 10px

**状態**:

- **Default**: 背景透明、ボーラディ 6px、テキスト薄い #677B87
- **Hover**: 背景 #F3F3F3、ボーラディ 12px、テキスト黒 #101828
- **Focus**: 背景 #F3F3F3、ボーラディ 12px、テキスト黒 #101828・太さ 500

**配置**: content_list の直下、複数配置（各クエスト内）

---

## 5. スタイリング統合ガイド

### 色彩体系

#### グローバル色

| 用途                         | 色コード      | RGB 値                            | 使用箇所                      |
| ---------------------------- | ------------- | --------------------------------- | ----------------------------- |
| 背景                         | #FFFFFF       | rgb(255, 255, 255)                | サイドバー全体、カード背景    |
| テキスト（濃い）             | #101828       | rgb(16, 24, 40)                   | タイトル（Focus 時）          |
| テキスト（通常）             | #6D6D6D       | rgb(109, 109, 109)                | バックナビ、説明文            |
| テキスト（薄い）             | #677B87       | rgb(103, 123, 135)                | コンテンツタイトル（Default） |
| グレー（淡い）               | #F9FAFB       | rgb(249, 250, 251)                | レッスンカード背景            |
| グレー（中）                 | #F3F3F3       | rgb(243, 243, 243)                | アイテムホバー・フォーカス    |
| グレー（濃い）               | #787878       | rgb(120, 120, 120)                | クエスト番号テキスト          |
| ボーダー                     | #F0F0F0       | rgb(240, 240, 240)                | 区切り線                      |
| チェックボックス未チェック   | #99A1AF       | rgb(153, 161, 175)                | 枠線                          |
| チェックボックスチェック     | #155DFC       | rgb(21, 93, 252)                  | 背景・フィル                  |
| アクセント（紫）             | #9747FF       | rgb(151, 71, 255)                 | クエストボーダー（Default）   |
| アクセント（グラデーション） | オレンジ → 紫 | rgb(254,166,103)→rgb(196,113,245) | クエストボーダー（Focus）     |

### フォント体系

| 用途             | フォント     | サイズ | ウェイト | 用例                              |
| ---------------- | ------------ | ------ | -------- | --------------------------------- |
| 数字・小さい表示 | Hind         | 10px   | 500      | クエスト番号                      |
| 数字・標準       | Noto Sans JP | 10px   | 400      | 時間情報                          |
| テキスト・標準   | Noto Sans JP | 12px   | 400      | コンテンツタイトル                |
| テキスト・強調   | Noto Sans JP | 12px   | 500      | コンテンツタイトル（Hover/Focus） |
| テキスト・見出し | Noto Sans JP | 12px   | 700      | クエストタイトル                  |
| 英文・標準       | Inter        | 13px   | 500      | レッスンタイトル                  |

### スペーシング体系

| 用途             | 値   |
| ---------------- | ---- |
| ギャップ（小）   | 4px  |
| ギャップ（中小） | 6px  |
| ギャップ（中）   | 8px  |
| ギャップ（中大） | 10px |
| ギャップ（大）   | 12px |
| ギャップ（特大） | 16px |
| パディング（小） | 12px |
| パディング（中） | 16px |

### ボーダーラディウス体系

| 用途                    | 値     |
| ----------------------- | ------ |
| 小さなコンポーネント    | 3px    |
| 標準                    | 5px    |
| アイテム（Default）     | 6px    |
| アイテム（Hover/Focus） | 12px   |
| 円形                    | 1000px |

---

## 6. CSS グローバルスタイル

```css
/* ========== グローバル設定 ========== */

:root {
  /* カラー */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f3f3;
  --color-bg-hover: #f3f4f6;
  --color-text-primary: #101828;
  --color-text-secondary: #6d6d6d;
  --color-text-tertiary: #677b87;
  --color-text-light: #787878;
  --color-border: #f0f0f0;
  --color-border-dark: #99a1af;
  --color-accent-blue: #155dfc;
  --color-accent-purple: #9747ff;
  --color-accent-orange: rgb(254, 166, 103);
  --color-accent-purple-dark: rgb(196, 113, 245);

  /* スペーシング */
  --spacing-xs: 4px;
  --spacing-sm: 6px;
  --spacing-md: 8px;
  --spacing-lg: 12px;
  --spacing-xl: 16px;

  /* ボーダーラディウス */
  --radius-small: 3px;
  --radius-base: 5px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --radius-full: 1000px;

  /* トランジション */
  --transition-fast: 100ms ease-out;
  --transition-normal: 150ms ease-in-out;
  --transition-slow: 200ms ease-in-out;

  /* フォント */
  --font-hind: Hind, sans-serif;
  --font-noto: "Noto Sans JP", sans-serif;
  --font-inter: Inter, sans-serif;
}

/* ========== 共通スタイル ========== */

body {
  font-family: var(--font-noto);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}

h1,
h2,
h3 {
  margin: 0;
  padding: 0;
}

/* ========== サイドバー ========== */

.sidenavi {
  width: 320px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.sidenavi__content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ========== セクション ========== */

.lesson-section {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--color-border);
}

.quest-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) 0;
}

/* ========== 区切り線 ========== */

.separator {
  width: 100%;
  height: 0.5px;
  background-color: var(--color-border);
  border: none;
  margin: var(--spacing-lg) 0;
}
```

---

## 7. HTML 統合実装例

```html
<!-- サイドバー全体 -->
<aside class="sidenavi" role="complementary">
  <!-- ロゴエリア -->
  <div class="sidenavi__logo">
    <svg class="app-sidebar" viewBox="0 0 64 15" width="64" height="15">
      <!-- Kaizen Onboarding ロゴ -->
    </svg>
  </div>

  <!-- メインコンテンツエリア -->
  <div class="sidenavi__content">
    <!-- レッスン詳細セクション -->
    <section class="lesson-section">
      <!-- ナビゲーション -->
      <div class="navigation">
        <!-- バックナビゲーションコンポーネント -->
        <button class="back-navigation" onclick="window.history.back()">
          <span class="back-navigation__icon">
            <svg viewBox="0 0 16 16">
              <!-- 矢印SVG -->
            </svg>
          </span>
          <span class="back-navigation__text">トップへ</span>
        </button>
      </div>

      <!-- レッスン情報カード -->
      <div class="lesson-detail">
        <div class="lesson-detail__wrap">
          <div class="lesson-detail__icon">
            <img
              src="lesson-thumbnail.jpg"
              alt="ToDoサービスをデザインしよう"
            />
          </div>
          <div class="lesson-detail__content">
            <h3 class="lesson-detail__title">ToDoサービスをデザインしよう</h3>
            <div class="lesson-detail__progress">
              <div class="progress-bar">
                <div class="progress-bar__background">
                  <div class="progress-bar__fill" style="width: 2%;"></div>
                </div>
              </div>
              <div class="progress-percent">
                <span class="progress-percent__number">2</span>
                <span class="progress-percent__unit">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- クエストリストセクション -->
    <section class="quest-section" role="list">
      <!-- クエスト 1 - Default状態 -->
      <div
        class="quest-block"
        data-state="default"
        role="region"
        aria-label="はじめに"
      >
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

        <div class="quest-content-list" role="list">
          <!-- コンテンツアイテム 1 -->
          <div class="content-item" data-state="default" role="listitem">
            <input type="checkbox" class="content-item__checkbox" />
            <div class="content-item__block">
              <h3 class="content-item__title">ゴールを把握しよう</h3>
              <div class="content-item__duration">
                <span class="content-item__duration-number">10</span>
                <span class="content-item__duration-unit">分</span>
              </div>
            </div>
          </div>

          <!-- コンテンツアイテム 2 -->
          <div class="content-item" data-state="default" role="listitem">
            <input type="checkbox" class="content-item__checkbox" />
            <div class="content-item__block">
              <h3 class="content-item__title">ゴールを把握しよう</h3>
              <div class="content-item__duration">
                <span class="content-item__duration-number">10</span>
                <span class="content-item__duration-unit">分</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 区切り線 -->
      <hr class="separator" />

      <!-- クエスト 2 - Focus状態 -->
      <div
        class="quest-block"
        data-state="focus"
        role="region"
        aria-label="はじめに（現在表示中）"
      >
        <div class="quest-header">
          <div class="quest-title">
            <div class="quest-title__wrap">
              <div class="quest-title__number-box">
                <span class="quest-title__number">2</span>
              </div>
              <h2 class="quest-title__text">はじめに</h2>
            </div>
          </div>
        </div>

        <div class="quest-content-list" role="list">
          <!-- コンテンツアイテム 1 -->
          <div class="content-item" data-state="default" role="listitem">
            <input type="checkbox" class="content-item__checkbox" />
            <div class="content-item__block">
              <h3 class="content-item__title">ゴールを把握しよう</h3>
              <div class="content-item__duration">
                <span class="content-item__duration-number">10</span>
                <span class="content-item__duration-unit">分</span>
              </div>
            </div>
          </div>

          <!-- コンテンツアイテム 2 - Focus状態 -->
          <div
            class="content-item"
            data-state="focus"
            role="listitem"
            aria-current="step"
          >
            <input type="checkbox" class="content-item__checkbox" />
            <div class="content-item__block">
              <h3 class="content-item__title">ゴールを把握しよう</h3>
              <div class="content-item__duration">
                <span class="content-item__duration-number">10</span>
                <span class="content-item__duration-unit">分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</aside>
```

---

## 8. React 統合実装例

```jsx
import React, { useState } from 'react';
import './AppSidebar.css';
import BackNavigation from './components/BackNavigation';
import LessonDetail from './components/LessonDetail';
import QuestBlock from './components/QuestBlock';

interface QuestData {
  id: string;
  number: number;
  title: string;
  items: Array<{
    id: string;
    title: string;
    duration: number;
    isCompleted: boolean;
  }>;
}

export const AppSidebar: React.FC = () => {
  const [currentFocusQuestId, setCurrentFocusQuestId] = useState<string>('quest-2');
  const [currentFocusItemId, setCurrentFocusItemId] = useState<string>('item-2');
  const [quests, setQuests] = useState<QuestData[]>([
    {
      id: 'quest-1',
      number: 1,
      title: 'はじめに',
      items: [
        { id: 'item-1-1', title: 'ゴールを把握しよう', duration: 10, isCompleted: false },
        { id: 'item-1-2', title: 'ゴールを把握しよう', duration: 10, isCompleted: false },
      ],
    },
    {
      id: 'quest-2',
      number: 2,
      title: 'はじめに',
      items: [
        { id: 'item-2-1', title: 'ゴールを把握しよう', duration: 10, isCompleted: false },
        { id: 'item-2-2', title: 'ゴールを把握しよう', duration: 10, isCompleted: false },
      ],
    },
  ]);

  const handleBackClick = () => {
    window.history.back();
  };

  const handleItemToggle = (questId: string, itemId: string) => {
    setQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId
          ? {
              ...quest,
              items: quest.items.map((item) =>
                item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
              ),
            }
          : quest
      )
    );
  };

  const handleItemClick = (questId: string, itemId: string) => {
    setCurrentFocusQuestId(questId);
    setCurrentFocusItemId(itemId);
  };

  return (
    <aside className="sidenavi" role="complementary">
      {/* ロゴ */}
      <div className="sidenavi__logo">
        <svg className="app-sidebar" viewBox="0 0 64 15" width="64" height="15">
          {/* ロゴ SVG */}
        </svg>
      </div>

      {/* コンテンツ */}
      <div className="sidenavi__content">

        {/* レッスン詳細セクション */}
        <section className="lesson-section">
          <div className="navigation">
            <BackNavigation onClick={handleBackClick} />
          </div>
          <LessonDetail
            title="ToDoサービスをデザインしよう"
            imageUrl="/images/lesson-todo.jpg"
            progressPercent={2}
          />
        </section>

        {/* クエストリスト */}
        <section className="quest-section" role="list">
          {quests.map((quest, index) => (
            <React.Fragment key={quest.id}>
              <QuestBlock
                id={quest.id}
                questNumber={quest.number}
                title={quest.title}
                items={quest.items.map((item) => ({
                  ...item,
                  isFocus: item.id === currentFocusItemId && quest.id === currentFocusQuestId,
                }))}
                isFocus={quest.id === currentFocusQuestId}
                onItemToggle={(itemId) => handleItemToggle(quest.id, itemId)}
                onItemClick={(itemId) => handleItemClick(quest.id, itemId)}
              />
              {index < quests.length - 1 && <hr className="separator" />}
            </React.Fragment>
          ))}
        </section>

      </div>
    </aside>
  );
};

export default AppSidebar;
```

---

## 9. 状態管理フロー

### ユーザー操作フロー

```
ユーザー操作
├── バックナビゲーションクリック
│   └── 前のページへ移動 (history.back())
│
├── レッスン情報表示
│   └── プログレスバー動的更新
│
├── クエストをクリック
│   └── 該当クエストを Focus 状態に
│
├── コンテンツアイテムをホバー
│   └── 背景色 #F3F3F3、ボーラディ 12px
│
├── コンテンツアイテムをクリック
│   └── 該当アイテムを Focus 状態に
│
└── チェックボックスをクリック
    └── isCompleted フラグ反転
```

### データフロー

```
AppSidebar
├── currentFocusQuestId（現在のクエスト ID）
├── currentFocusItemId（現在のアイテム ID）
├── quests（クエストデータ配列）
│   └── items（各クエストのアイテム）
│
└── ハンドラー
    ├── handleBackClick
    ├── handleItemToggle
    └── handleItemClick
```

---

## 10. スクロール・レスポンシブ対応

### スクロール動作

- **サイドバーは固定**: 内部コンテンツのみスクロール
- **スクロールバー**: ブラウザデフォルト
- **最大幅**: 320px（固定）

### モバイル対応

- **モバイル（320px）**: サイドバーがフルスクリーン表示
- **タブレット**: サイドバー固定、右側にメインコンテンツ
- **デスクトップ**: 変わらず

---

## 11. アクセシビリティ統合

### セマンティクス

- `<aside>` タグ：role="complementary"
- `<section>` タグ：適切に使用
- `<h2>`, `<h3>` タグ：見出し階層を維持

### ARIA 属性

```html
<!-- リスト構造 -->
<div role="list">
  <div role="listitem">...</div>
</div>

<!-- 現在位置表示 -->
<div role="region" aria-label="..." aria-current="step">...</div>
```

### キーボード操作

- Tab キー：すべてのインタラクティブ要素（ボタン、チェックボックス）に対応
- Enter キー：ボタン・クエスト・アイテムをアクティベート

---

## 12. パフォーマンス最適化

### 推奨事項

1. **仮想スクロール**: 多数のクエスト表示時（50+）
2. **遅延ロード**: レッスン画像の WebP/AVIF
3. **CSS-in-JS**: 状態に応じたダイナミックスタイル
4. **メモライズ**: React.memo でコンポーネント最適化

### バンドルサイズ

- **CSS サイズ**: ≤ 15KB（グローバル + コンポーネント）
- **JS サイズ**: ≤ 50KB（圧縮時）

---

## 13. ダークモード対応

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1a1a1a;
    --color-bg-secondary: #252525;
    --color-text-primary: #e8e8e8;
    --color-text-secondary: #b0b8c0;
    --color-border: #333333;
  }

  .sidenavi {
    background-color: var(--color-bg-primary);
    border-right: 1px solid var(--color-border);
  }
}
```

---

## 14. チェックリスト

- [ ] サイドバー幅が 320px で固定
- [ ] ロゴエリアの上部に表示
- [ ] バックナビゲーション：ロゴ下、レッスン上に配置
- [ ] レッスン詳細：バックナビ下に配置、プログレス表示
- [ ] クエストリスト：レッスン下に複数配置可能
- [ ] Default クエスト：紫のダッシュボーダー
- [ ] Focus クエスト：グラデーションボーダー下側 2px
- [ ] コンテンツアイテム Default：背景 transparent、ボーラディ 6px
- [ ] コンテンツアイテム Hover/Focus：背景 #F3F3F3、ボーラディ 12px
- [ ] チェックボックス：16×16px、ボーラディ 3px
- [ ] チェック済み：背景 #155DFC、ホワイトチェックマーク
- [ ] すべてのトランジション：150ms ease-in-out
- [ ] スクロール：サイドバー内のみ
- [ ] キーボード操作：Tab キー対応
- [ ] スクリーンリーダー：role 属性、aria-label、aria-current 対応
- [ ] ダークモード：CSS 変数で対応

---

## 15. 関連仕様書

1. **back_navigation_specification.md** - バックナビゲーションコンポーネント
2. **lesson_detail_specification.md** - レッスン詳細カード
3. **quest_block_specification.md** - クエストブロック（通常・Focus）
4. **quest_title_specification.md** - クエストタイトル詳細アイテム
5. **content_item_specification.md** - コンテンツアイテム（3 状態）

すべてのコンポーネントは本仕様書で統合されています。

---

## 16. 実装優先度

1. **第 1 段階**（高優先度）

   - サイドバーレイアウト
   - バックナビゲーション
   - レッスン詳細カード
   - クエストブロック（基本）

2. **第 2 段階**（中優先度）

   - コンテンツアイテム状態管理
   - ホバー・フォーカス遷移アニメーション
   - チェックボックス機能

3. **第 3 段階**（低優先度）
   - ダークモード対応
   - 仮想スクロール最適化
   - キーボード操作の細部調整
