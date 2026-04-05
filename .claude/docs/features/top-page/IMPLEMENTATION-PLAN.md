# トップページ（LP）実装計画

**作成日**: 2026-03-19
**ステータス**: Phase 3 完了（ページ統合完了）
**Figma**: https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/PRD%F0%9F%8F%A0_topUI_newBONO2026?node-id=35-16121

---

## 概要

---

## 概要

ログイン前のランディングページ（LP）のデスクトップ版実装計画。
レスポンシブ対応前提で、モバイル版は後続で対応。

---

## ページ構造

```
[グローバルナビ（既存）] + [メインコンテンツ]

メインコンテンツ:
├── 1. HeroSection（ヒーローエリア）
├── 2. RoadmapCards（ロードマップカード×3）
├── 3. PartnerBanner（キャリアパートナーシップ）
├── 4. GoalNavSection（目的別ナビゲーション）
├── 5. GoalSection ×3（ゴール別セクション）
│   ├── SectionHeading（統一ヘディング）
│   └── [中身: 自由配置]
└── 6. AnnouncementSection（新着情報）
```

---

## コンポーネント一覧

### 既存コンポーネント（再利用）

| コンポーネント | ファイル                                   | 状態            |
| -------------- | ------------------------------------------ | --------------- |
| RoadmapCardV2  | `src/components/roadmap/RoadmapCardV2.tsx` | ✅ そのまま使用 |
| DottedDivider  | `src/components/common/DottedDivider.tsx`  | ✅ そのまま使用 |

### 拡張が必要なコンポーネント

| コンポーネント | ファイル                                   | 変更内容                              |
| -------------- | ------------------------------------------ | ------------------------------------- |
| SectionHeading | `src/components/common/SectionHeading.tsx` | `label`, `description` プロパティ追加 |

### 新規作成コンポーネント

| コンポーネント   | 優先度 | Figma Node | 説明                                           | 状態          |
| ---------------- | ------ | ---------- | ---------------------------------------------- | ------------- |
| TopHeroSection   | P1     | 35:16315   | LP用ヒーロー（NEWバッジ、キャッチコピー、CTA） | ✅ 完了       |
| ContentCard      | P1     | 47:13994   | ガイド・読みもの用汎用カード                   | ✅ 完了       |
| GoalNavSection   | P2     | 47:17453   | 目的選択ナビゲーション（ピルボタン×3）         | ✅ 完了       |
| GoalSection      | P2     | 47:14027   | ゴール別セクションの枠組み                     | ✅ 完了       |
| PartnerBanner    | P3     | 35:16839   | パートナーシップバナー                         | ✅ 完了       |
| AnnouncementList | P3     | 35:16818   | 新着情報リンクリスト                           | ❌ スコープ外 |

---

## デザイン方針

### 統一ルール

1. **角丸**: ロードマップカードと共通（`rounded-[64px]` をベースに）
2. **色・フォント**: 既存デザインシステムトークンを使用
3. **バリアント**: 不要。一つのデザインで固め、後から調整

### セクション構造

```tsx
// セクションの基本構造
<GoalSection>
  <SectionHeading
    label="コンテンツ"
    title="UIUX転職・キャリアチェンジを目指そう"
    description="ユーザーに受け入れられるUI体験のための..."
  />
  {/* 中身は自由に配置 */}
  <div className="grid ...">
    <RoadmapCardV2 ... />
    <ContentCard ... />
  </div>
</GoalSection>
```

---

## データソース

| コンテンツ      | データソース           | 備考             |
| --------------- | ---------------------- | ---------------- |
| ロードマップ    | ロードマップ情報データ | 別途データ化予定 |
| ガイド記事      | 直接URL入力            | ハードコード     |
| レッスンコース  | Sanity                 | 既存の仕組み     |
| ゴール3カテゴリ | 固定                   | ハードコード     |

---

## 実装順序

### Phase 1: 基盤コンポーネント

- [x] SectionHeading 拡張（label, description追加）
- [x] ContentCard 新規作成
- [x] DottedDivider 新規作成

### Phase 2: セクション構築

- [x] TopHeroSection 新規作成
- [x] GoalSection 新規作成
- [x] GoalNavSection（GoalNavPill含む）新規作成
- [x] RoadmapCardV2 レスポンシブ対応

### Phase 3: ページ統合

- [x] トップページ（`/top`）作成
- [x] 各セクション配置
- [x] レスポンシブ対応
- [x] Layout ヒーロー背景グラデーション対応

### Phase 4: 仕上げ

- [x] PartnerBanner
- [ ] AnnouncementList（スコープ外）
- [ ] スタイル微調整（必要に応じて）

---

## コンポーネント詳細

各コンポーネントの詳細仕様は、Figmaデータ共有時に以下のファイルに記録:

```
.claude/docs/features/top-page/
├── IMPLEMENTATION-PLAN.md  ← このファイル
└── components/
    ├── hero-section.md
    ├── content-card.md
    ├── goal-section.md
    └── ...
```

---

## 更新履歴

| 日付       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 2026-03-19 | Phase 3完了: TopHeroSection, GoalSection, GoalNavSection, PartnerBanner実装、/top ルート作成 |
| 2026-03-19 | 初版作成                                                                                     |
