# ロードマップ機能

**ステータス**: 実装中
**ブランチ**: `feature/roadmap`

---

## 概要

学習ロードマップの一覧・詳細ページの実装。

## ページ構成

| ページ | パス | ステータス |
|--------|------|------------|
| ロードマップ一覧 | `/roadmaps` | 実装中 |
| ロードマップ詳細 | `/roadmaps/:slug` | 未実装 |

## コンポーネント仕様

### 一覧ページ (`/roadmaps`)

→ [一覧ページコンポーネント仕様](./components-list.md)

**実装済みコンポーネント**:
- ✅ **RoadmapCard** - ロードマップカード (`src/components/roadmap/RoadmapCard.tsx`)
  - プレビュー: `/dev/roadmap-card`
  - 6種類のグラデーションバリエーション

### 詳細ページ (`/roadmaps/:slug`)

→ [詳細ページコンポーネント仕様](./components-detail.md)

## Figmaデザイン

| ページ/コンポーネント | Figma URL | node-id | 共有日 |
|--------|-----------|---------|--------|
| RoadmapCard | [Figma](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=900-39673) | 900-39673 | 2025-03-16 |
| 一覧ページ全体 | - | - | - |
| 詳細ページ | - | - | - |

## 開発用ページ

| ページ | パス | 内容 |
|--------|------|------|
| RoadmapCardプレビュー | `/dev/roadmap-card` | カードコンポーネントのプレビュー・グラデーションバリエーション |

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-03-16 | RoadmapCardコンポーネント実装完了 |
| 2025-03-16 | ドキュメント構造作成 |
