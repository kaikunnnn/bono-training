# ロードマップ機能

**ステータス**: 実装中
**ブランチ**: `feature/roadmap`

---

## 概要

学習ロードマップの一覧・詳細ページの実装。

## データ構造

### Sanityスキーマ

**ファイル**: `sanity-studio/schemaTypes/roadmap.ts`

```
Roadmap
├── 基本情報
│   ├── title              // タイトル
│   ├── slug               // URL識別子
│   ├── description        // 説明文（SEO・カード用、50〜160文字）
│   ├── tagline            // キャッチコピー（詳細ヒーロー用、1行）
│   ├── thumbnail          // サムネイル・アイキャッチ画像
│   ├── gradientPreset     // グラデーション（プリセット管理）
│   └── estimatedDuration  // 目安期間（数字のみ、表示時に「ヶ月」付加）
│
├── ヒーロー情報
│   ├── howToNavigate[]           // 歩き方（配列、空なら非表示）
│   ├── changingLandscape         // ロードマップで変わる景色
│   │   ├── description           // セクション説明文
│   │   └── items[]               // 項目（配列）
│   └── interestingPerspectives   // デザインが面白くなる視点
│       ├── description           // セクション説明文
│       └── items[]               // 項目（配列）
│
├── カリキュラム
│   └── steps[]            // ステップ（配列）
│       ├── title          // ステップタイトル
│       ├── goals[]        // ゴール（箇条書き配列）
│       └── sections[]     // セクション（配列）
│           ├── title          // セクションタイトル
│           ├── description    // セクション説明
│           └── contents[]     // レッスン or ロードマップ参照（配列）
│
└── 設定
    ├── order              // 表示順序
    └── isPublished        // 公開状態
```

### Sanity Studio タブ構成

| タブ | 内容 |
|------|------|
| 基本情報 | タイトル、説明、キャッチコピー、画像、グラデーション、期間 |
| ヒーロー | 歩き方、変わる景色、面白くなる視点 |
| カリキュラム | ステップ > セクション > レッスン |
| 設定 | 表示順序、公開状態 |

### フロントエンド固定値

| 項目 | 値 | 備考 |
|------|-----|------|
| 料金表示 | スタンダードプラン月額 | 3ヶ月÷1ヶ月の最低月額 |
| セクションタイトル | 「ロードマップで変わる景色」等 | 全ロードマップ共通 |
| カテゴリー | ハードコード | 一覧ページの分類 |

### データ関係

```
Roadmap (ロードマップ)
└── steps[].sections[].contents[] → Lesson または Roadmap への参照

Lesson (レッスン) ← 既存スキーマ
└── quests[] → Quest への参照配列
```

**ポイント**:
- 1つのレッスンは複数ロードマップに所属可能
- ステップ・セクションはロードマップ固有（埋め込み）
- レッスンは独立した既存ドキュメントを参照
- **特大ロードマップ対応**: セクション内にロードマップ自体を配置可能（転職コース等）

### GROQクエリ例

```groq
// 全ロードマップ取得（一覧用）
*[_type == "roadmap" && isPublished == true] | order(order asc) {
  title,
  slug,
  description,
  "thumbnailUrl": thumbnail.asset->url,
  gradientPreset,
  estimatedDuration,
  "stepCount": count(steps)
}

// ロードマップ詳細取得
*[_type == "roadmap" && slug.current == $slug][0] {
  title,
  slug,
  description,
  tagline,
  "thumbnailUrl": thumbnail.asset->url,
  gradientPreset,
  estimatedDuration,
  howToNavigate,
  changingLandscape,
  interestingPerspectives,
  steps[] {
    title,
    goals,
    sections[] {
      title,
      description,
      contents[]-> {
        _id,
        _type,
        title,
        slug,
        description,
        "thumbnailUrl": thumbnail.asset->url
      }
    }
  }
}

// レッスンが所属するロードマップを取得
*[_type == "roadmap" && references($lessonId)] {
  title,
  slug,
  gradientPreset
}
```

---

## ページ構成

| ページ | パス | ステータス |
|--------|------|------------|
| ロードマップ一覧 | `/roadmaps` | 実装中 |
| ロードマップ詳細 | `/roadmaps/:slug` | 未実装 |

## コンポーネント仕様

### 一覧ページ (`/roadmaps`)

→ [一覧ページコンポーネント仕様](./components-list.md)

**実装済みコンポーネント**:
- ✅ **RoadmapCard** - ロードマップカード（旧） (`src/components/roadmap/RoadmapCard.tsx`)
  - プレビュー: `/dev/roadmap-card`
- ✅ **RoadmapCardV2** - ロードマップカード（新） (`src/components/roadmap/RoadmapCardV2.tsx`)
  - プレビュー: `/dev/roadmap-card-v2`
  - Figma準拠デザイン
  - バリアント: `gradient` / `white`
  - 方向: `vertical` / `horizontal`

### 詳細ページ (`/roadmaps/:slug`)

→ [詳細ページコンポーネント仕様](./components-detail.md)

**Figma参照**: `PRD🏠_Roadmap_2026` node-id `1-5362`

**構成要素**:
- ヒーローセクション（タイトル、キャッチ、ステップ数、料金、CTA）
- 歩き方セクション（空なら非表示）
- ロードマップで変わる景色セクション
- デザインが面白くなる視点セクション
- カリキュラムセクション（ステップ > セクション > レッスン）
- クリアブロック
- 関連ロードマップ

---

## Figmaデザイン

| ページ/コンポーネント | Figma URL | node-id | 共有日 |
|--------|-----------|---------|--------|
| ロードマップ詳細 | [Figma](https://www.figma.com/design/yv6snygemYYsgqwcWIyirf/PRD🏠_Roadmap_2026?node-id=1-5362) | 1-5362 | 2025-03-19 |
| RoadmapCardV2 | [Figma](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=69-16224) | 69-16224 | 2025-03-19 |
| RoadmapCard（旧） | [Figma](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=900-39673) | 900-39673 | 2025-03-16 |

---

## 開発用ページ

| ページ | パス | 内容 |
|--------|------|------|
| RoadmapCardV2プレビュー | `/dev/roadmap-card-v2` | 新デザインカードのプレビュー（推奨） |
| RoadmapCardプレビュー | `/dev/roadmap-card` | 旧カードコンポーネントのプレビュー |

---

## グラデーションプリセット

| プリセット | 用途 | 色味 |
|-----------|------|------|
| `galaxy` | 転職ロードマップ | 紫系 |
| `infoarch` | 情報設計 | グレー/茶系 |
| `sunset` | UXデザイン | オレンジ/ピンク系 |
| `ocean` | Figma基礎 | ブルー系 |
| `teal` | UIビジュアル | ティール系 |
| `rose` | その他 | ローズ系 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-03-19 | 特大ロードマップ対応（contents[]でLesson/Roadmap両方参照可能に） |
| 2025-03-19 | Sanityスキーマ最終版（price削除、changingLandscape/interestingPerspectives追加） |
| 2025-03-19 | Sanity Roadmapスキーマ拡張（ステップ構造追加） |
| 2025-03-19 | Sanity Roadmapスキーマ作成 |
| 2025-03-19 | RoadmapCardV2コンポーネント実装（Figma準拠・4パターン対応） |
| 2025-03-16 | RoadmapCardコンポーネント実装完了 |
| 2025-03-16 | ドキュメント構造作成 |
