# トップページ再デザイン

**最終更新**: 2026-03-24
**Figma**: https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD🏠_topUI_newBONO2026?node-id=178-28863

---

## 概要

新しいトップページデザインの実装計画。`/dev` でプレビュー版を作成後、`/top` に反映する。

---

## デザイン構造

### 全体レイアウト（1440px幅）

```
┌─────────────────────────────────────────────────────┐
│ [Sidebar 200px] │      [Main Content 1240px]        │
│                 │                                    │
│  Logo           │  ┌────────────────────────────┐   │
│  マイページ      │  │     Hero Section           │   │
│  ロードマップ    │  │  NEW! + キャッチコピー      │   │
│  レッスン        │  │  + 説明 + CTAボタン2つ     │   │
│  トレーニング    │  └────────────────────────────┘   │
│                 │                                    │
│  その他          │  ┌────────────────────────────┐   │
│  設定           │  │   Roadmap Cards (4枚)       │   │
│  ログアウト      │  │   横スクロール表示          │   │
│                 │  └────────────────────────────┘   │
│                 │                                    │
│  意見箱          │  ┌────────────────────────────┐   │
│                 │  │   Goal Selection (3つ)      │   │
│                 │  │   「なりたい自分」への...   │   │
│                 │  └────────────────────────────┘   │
│                 │                                    │
│                 │  ┌────────────────────────────┐   │
│                 │  │   section-career           │   │
│                 │  │   section-ユーザー課題     │   │
│                 │  │   section-使いやすいUI     │   │
│                 │  └────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## セクション詳細

### 1. Hero Section (node: 178:28869)

**構成要素:**
- NEW! バッジ（白背景、黒ボーダー、角丸）
  - 「NEW!」オレンジ色 #F95A16
  - 「AIプロトタイピングコースがリリース！」
- メインキャッチコピー（左側）
  - 「はじめよう」「キモチがうごく」「ものづくり」
  - フォント: Noto Sans JP Bold, 56px, line-height 1.32
- サブ説明文（右側）
  - 「ボノはユーザー価値から考えてデジタルプロダクトをつくりたい人向けのデザイントレーニングサービスです。」
  - フォント: 23px, #0f172a
- CTAボタン2つ
  - 「メンバーになってはじめる」: 濃緑 #102720, 白文字, 角丸14px, shadow
  - 「ロードマップをを見る」: 白背景, 黒ボーダー, 角丸14px

**スタイル:**
```css
/* NEW! バッジ */
.hero-badge {
  background: white;
  border: 1px solid #0f172a;
  border-radius: 50px;
  padding: 7px 16px;
}

/* メインキャッチ */
.hero-title {
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 700;
  font-size: 56px;
  line-height: 1.32;
  color: #0f172a;
}

/* CTAボタン - Primary */
.cta-primary {
  background: #102720;
  color: white;
  border-radius: 14px;
  padding: 18px 24px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

/* CTAボタン - Secondary */
.cta-secondary {
  background: transparent;
  border: 1px solid #0f172a;
  border-radius: 14px;
  padding: 18px 25px;
}
```

---

### 2. Roadmap Cards Section (node: 178:29643)

**構成要素:**
- 4枚のロードマップカードを横並び
- カード内容:
  1. UIUXデザイナーに転職する
  2. 目的に沿った 使いやすいUI提案
  3. ユーザー課題を 解決する
  4. UIデザインを はじめる

**カードスタイル (node: 198:34924):**
```css
.roadmap-card {
  background: white;
  border: 4px solid white;
  border-radius: 40px;
  box-shadow: 0px 1px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  width: 263px;
}

.roadmap-card-label {
  font-size: 11px;
  font-weight: 700;
  color: #77850e; /* オリーブグリーン */
}

.roadmap-card-title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.52;
  color: black;
}

.roadmap-card-eyecatch {
  height: 223px;
  border-radius: 8px;
  /* グラデーション背景 */
  background: linear-gradient(
    180deg,
    #110D49 11%,
    #773F6B 69%,
    #F5D7C7 95%
  );
}
```

---

### 3. Goal Selection Section (node: 178:28883)

**構成要素:**
- セクション見出し
  - 「「なりたい自分」へのロードマップで、」
  - 「デザインの楽しさをアップデートしよう」
  - フォント: Rounded Mplus 1c ExtraBold, 24px
- 説明文
  - 「今の自分にぴったりのスキルを選んで、トレーニングをスタート！」
  - フォント: 20px, rgba(41, 53, 37, 0.8)
- 3つのゴールボタン（pill型）
  1. UIUXデザイナーに転職
  2. ユーザー課題を解決
  3. 使いやすいUIを提案

**ボタンスタイル:**
```css
.goal-button {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 50px;
  height: 117px;
  padding: 4px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.goal-button-icon {
  width: 32px;
  height: 32px;
}

.goal-button-text {
  font-size: 16px;
  font-weight: 500;
  color: #0f172a;
}
```

**セクション外枠:**
```css
.goal-section {
  padding: 72px 64px;
  border-radius: 64px;
  /* ベージュ系背景は親から継承 */
}
```

---

### 4. Content Sections

3つの大きなコンテンツセクションがある:

#### 4.1 section-career (node: 195:30262)
- 見出し: 「UIUX転職」「キャリアチェンジしたい」
- アイコン付き
- サブセクション:
  - ロードマップ: 「デザインスキルを獲得して転職を目指そう」
  - 読みもの: 「お役立ちコンテンツ」

#### 4.2 section-ユーザー課題を解決 (node: 205:4930)
- 見出し: UXデザイン関連
- サブセクション:
  - ロードマップカード
  - レッスンカード

#### 4.3 section-使いやすいUIのデザイン (node: 205:5082)
- 見出し: UIデザイン関連
- サブセクション:
  - ロードマップカード
  - レッスンカード

**セクション共通スタイル:**
```css
.content-section {
  background: rgba(70, 87, 83, 0.04);
  border-radius: 40px;
  padding: 64px 88px;
}

.section-heading {
  font-family: 'Rounded Mplus 1c', sans-serif;
  font-weight: 800;
  font-size: 32px;
  text-align: center;
  color: #293525;
}

.section-description {
  font-size: 20px;
  color: rgba(41, 53, 37, 0.8);
  text-align: center;
}
```

---

## コンポーネント一覧

### 新規作成が必要

| コンポーネント | パス | 説明 |
|--------------|------|------|
| TopHeroSection | `src/components/top/TopHeroSection.tsx` | ヒーローセクション |
| RoadmapCardMini | `src/components/top/RoadmapCardMini.tsx` | ロードマップカード（トップ用） |
| GoalSelectionSection | `src/components/top/GoalSelectionSection.tsx` | ゴール選択セクション |
| GoalButton | `src/components/top/GoalButton.tsx` | ゴール選択ボタン |
| ContentSection | `src/components/top/ContentSection.tsx` | コンテンツセクション wrapper |

### 既存コンポーネント（再利用）

| コンポーネント | 用途 |
|--------------|------|
| SectionHeading | サブセクション見出し |
| LessonCard | レッスンカード表示 |
| RoadmapCard | 既存ロードマップカード（要確認） |

---

## 実装チェックリスト

### Phase 1: 基盤準備
- [ ] コンポーネントディレクトリ作成 (`src/components/top/`)
- [ ] 共通スタイル/トークン確認

### Phase 2: Hero セクション
- [ ] TopHeroSection コンポーネント作成
- [ ] NEW! バッジ実装
- [ ] キャッチコピー表示
- [ ] CTAボタン2つ実装
- [ ] レスポンシブ対応

### Phase 3: Roadmap Cards セクション
- [ ] RoadmapCardMini コンポーネント作成
- [ ] 4枚のカード表示
- [ ] 横スクロール/グリッド表示
- [ ] アイキャッチ画像表示

### Phase 4: Goal Selection セクション
- [ ] GoalSelectionSection コンポーネント作成
- [ ] GoalButton コンポーネント作成
- [ ] 3つのゴールボタン表示
- [ ] アイコン表示

### Phase 5: Content Sections
- [ ] ContentSection wrapper 作成
- [ ] section-career 実装
- [ ] section-ユーザー課題 実装
- [ ] section-使いやすいUI 実装
- [ ] 各セクションのカード表示

### Phase 6: 統合・確認
- [ ] /dev/top-new プレビューページ作成
- [ ] 全セクション結合
- [ ] レスポンシブ確認
- [ ] /top への反映

---

## カラートークン

| 用途 | 色コード | Tailwind |
|------|----------|----------|
| テキスト/黒 | #0f172a | text-slate-900 |
| テキスト/グレー | rgba(41, 53, 37, 0.8) | - |
| アクセント/オレンジ | #F95A16 | - |
| ボタン/濃緑 | #102720 | - |
| ラベル/オリーブ | #77850e | - |
| 背景/ベージュ | #f5efe7 (推定) | - |
| セクション背景 | rgba(70, 87, 83, 0.04) | - |

---

## 既存実装との差分

### Hero Section
| 項目 | 既存（TopHeroSection.tsx） | 新デザイン |
|-----|--------------------------|----------|
| レイアウト | 中央揃え | 2カラム（左:コピー、右:説明） |
| キャッチコピー | 「ワクワクするものつくるために体系的にスキルフルになろう」 | 「はじめよう キモチがうごく ものづくり」 |
| フォントサイズ | 24-48px | 56px |
| ロードマップカード | 3枚、扇形配置、Hero内 | なし（別セクションへ移動） |

### Roadmap Cards Section
| 項目 | 既存 | 新デザイン |
|-----|------|----------|
| 位置 | Hero内（扇形配置） | Hero下の独立セクション |
| カード数 | 3枚 | 4枚 |
| カードスタイル | 大きめ、グラデーション背景 | ミニサイズ、白カード+ラベル |
| 配置 | 扇形（回転） | 横並び |

### Goal Selection Section
| 項目 | 既存（GoalNavSection） | 新デザイン |
|-----|----------------------|----------|
| スタイル | 存在しない | 3つのpill型ボタン |
| 機能 | - | ページ内アンカーリンク |

### Content Sections
| 項目 | 既存（GoalSection） | 新デザイン |
|-----|-------------------|----------|
| 構造 | 概ね同じ | 同じ |
| 角丸 | 24-40px | 40px |
| 背景色 | bg-muted | rgba(70,87,83,0.04) |

---

## 実装状況

### 完了
- [x] ドキュメント作成
- [x] /dev/top-new プレビューページ作成
- [x] Hero Section（2カラムレイアウト）
- [x] Roadmap Cards Section（4枚横並び）
- [x] Goal Selection Section（3つのpillボタン）
- [x] Content Sections（3セクション、プレースホルダー）
- [x] /top への反映
- [x] レスポンシブ対応（モバイル・タブレット・デスクトップ）

### 次のステップ
- [ ] 実データ（Sanity）との連携（オプション）
- [ ] サムネイル画像の設定
- [ ] アニメーション追加（オプション）

---

## 参考リンク

- Figma デザイン: node-id=178-28863
- 既存パターン: `/dev/top-patterns`
- **新デザインプレビュー**: `/dev/top-new`
- デザインシステム: `.claude/design-system/README.md`
