# トップページリリースタスク

**作成日**: 2026-04-06
**最終更新**: 2026-04-06
**ステータス**: デザイン調整中
**目標**: トップページ(/top)の本番リリース

---

## 🎯 リリース目標

トップページを新デザインで本番環境にリリースし、ユーザーの第一印象を改善する。

---

## ✅ 完了済みタスク（2026-04-06）

### デザイン調整

| タスク                       | 内容                                      | 修正箇所                                     |
| ---------------------------- | ----------------------------------------- | -------------------------------------------- |
| ヘッダーグラデーション       | Layout.tsxのグラデーション透明度を修正    | `src/components/layout/Layout.tsx:67-75`     |
| ドットボーダーオーバーフロー | DottedDividerの`w-full`を削除             | `src/components/common/DottedDivider.tsx:36` |
| お役立ちコンテンツHeading    | section-careerの見出しアンダーライン削除  | `src/pages/dev/TopPageNew.tsx:410`           |
| UXロードマップ表示           | slugを`ux-design`→`ux-design-basic`に修正 | `src/pages/dev/TopPageNew.tsx:160`           |

---

## 🔄 作業中タスク

### T1: セクション構造の変更（section-ux）

**タスク**: "ユーザー課題を解決するデザインをはじめよう" セクションの内容を変更

**現状**:

- ロードマップが2列で表示されている
- レッスンカードが1枚だけ表示されている

**期待する動作**:

- **ロードマップエリア**: UXロードマップのみ1つ表示（横UIコンポーネントパターン）
- **お役立ちコンテンツエリア**: 該当するレッスンを3列グリッドで表示（/lessonsと同じスタイル）

**確認項目**:

- [ ] 横UIコンポーネントパターン = RoadmapCardV2の`orientation="horizontal"`を使用
- [ ] お役立ちコンテンツは/lessonsページのContentCardと同じスタイルで表示
- [ ] レスポンシブ対応（モバイル: 1列、タブレット: 2列、デスクトップ: 3列）

**影響ファイル**:

- `src/pages/dev/TopPageNew.tsx:457-562` (section-ux セクション)
- 参考: `src/pages/Lessons.tsx` (ContentCardの使用例)

**技術的注意点**:

- RoadmapCardV2は`orientation="horizontal"`をサポートしているか確認
- ContentCardコンポーネントが利用可能か確認
- レッスンデータをどこから取得するか（Sanity or 静的データ）

---

### T2: UIセクションの表示問題（section-ui）

**タスク**: "使いやすいUI体験を提案できるようになろう" セクションの修正

**現状の問題**:

1. ロードマップの2つ目（UIビジュアル）が表示されない
2. お役立ちコンテンツが/lessonsのスタイルではない

**期待する動作**:

1. **ロードマップエリア**: 情報設計ロードマップ + UIビジュアルロードマップの2つを表示
2. **お役立ちコンテンツエリア**: /lessonsのContentCardスタイルで表示

**確認項目**:

- [ ] `uiVisualRoadmap`が正しく取得されているか（console.log確認）
- [ ] slug `"ui-visual-design"` がSanityに存在するか
- [ ] サムネイル画像が設定されているか
- [ ] お役立ちコンテンツを3列グリッドに変更

**影響ファイル**:

- `src/pages/dev/TopPageNew.tsx:564-679` (section-ui セクション)

**デバッグ手順**:

1. ブラウザのコンソールで `roadmaps` を確認
2. `uiVisualRoadmap` の値をログ出力
3. Sanity Studioで該当ロードマップを確認

---

## 📋 未着手タスク（要確認）

### T3: セクションコンテナの最大幅調整

**タスク**: デスクトップで左右に余裕がある時、セクションコンテナが`max-w-[1120px]`を超えて広がるようにする

**現状**:

```tsx
<div className="max-w-[1120px] mx-auto bg-[rgba(70,87,83,0.04)] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
```

**確認が必要な点**:

- [ ] 「max以上に広がる」= `max-w`を削除して全幅にする？⇨コンテンツがある幅は今の設定がいいです。ただ、グレー背景のグループに囲まれていますが、これは全幅で見てみたいです。
- [ ] それとも、`max-w`を大きくする（例: `max-w-[1400px]`）？ ⇨これは場合によっては検討です。
- [ ] 背景色の角丸コンテナは全幅にして、内側で`max-w`制御？⇨これです

**ユーザーに質問すべき内容**:

> デスクトップ表示時、グレー背景のコンテナをどのように広げたいですか？
>
> 1. 画面幅いっぱいまで広げる（max-wを削除）
> 2. 最大幅を1120px→1400pxなど大きくする
> 3. コンテナは全幅、内側のコンテンツで幅を制御

**影響範囲**:

- section-career (line 349)
- section-ux (line 459)
- section-ui (line 566)

---

### T4: GoalSectionHeaderの下線表示

**タスク**: Headingブロックの下線をセクション全幅に広げる

**現状の問題**:

```tsx
<GoalSectionHeader
  icon="✨"
  title="UIUX転職 キャリアチェンジしたい"
  description="..."
/>
```

- `GoalSectionHeader`内のボーダー（`<div className="w-full h-px bg-gray-300 opacity-35 mt-2 sm:mt-4" />`）が、`px-4 sm:px-8 lg:px-22`のパディング内に収まっている
- セクション全幅（グレー背景コンテナの左右端まで）に広げたい

**確認項目**:

- [ ] GoalSectionHeaderコンポーネントを確認
- [ ] 下線をコンポーネント外に出す？
- [ ] それとも、パディングをリセット？

**影響ファイル**:

- `src/components/top/GoalSectionHeader.tsx` (コンポーネント本体)
- `src/pages/dev/TopPageNew.tsx` (3箇所のGoalSectionHeader使用)

**実装ヒント**:

- オプション1: GoalSectionHeaderから下線を削除し、外側で`<DottedDivider />`を配置
- オプション2: GoalSectionHeaderに`showDivider`プロップを追加し、親要素で制御

---

## 📝 確認待ちリスト

以下のタスクは、ユーザーの意図を確認してから実装します：

| #   | タスク                     | 確認事項                                                   |
| --- | -------------------------- | ---------------------------------------------------------- |
| T3  | セクションコンテナの最大幅 | どのように広げるか（全幅 or max-w拡大 or 内側制御）        |
| T4  | Headingブロック下線        | セクション全幅にする方法（コンポーネント変更 or 構造変更） |

---

## 🔧 開発確認用

| 画面                   | パス                         | 用途                           |
| ---------------------- | ---------------------------- | ------------------------------ |
| トップページプレビュー | `/dev/top-page-new` → `/top` | 新デザイン確認（本番適用済み） |
| TrainingCardプレビュー | `/dev/training-card`         | カード単体確認                 |

**確認コマンド**:

```bash
# 開発サーバー起動
npm run dev

# /top にアクセスして確認
open http://localhost:5173/top
```

---

## 📁 関連ファイル

### メインページ

- `src/pages/dev/TopPageNew.tsx` - 新トップページ実装（本番: `/top`）
- `src/pages/Home.tsx` - 旧トップページ（リプレイス対象）

### セクションコンポーネント

- `src/components/top/GoalSectionHeader.tsx` - ゴールセクションヘッダー
- `src/components/top/TrainingCard.tsx` - トレーニングカード
- `src/components/top/eyecatch/` - 各種アイキャッチ

### 共通コンポーネント

- `src/components/common/SectionHeading.tsx` - セクション見出し
- `src/components/common/DottedDivider.tsx` - ドット区切り線
- `src/components/roadmap/RoadmapCardV2.tsx` - ロードマップカード

### データ

- `src/components/top/TrainingCard.tsx:140-226` - TRAINING_CARDS_DATA
- `src/hooks/useRoadmaps.ts` - Sanityからロードマップ取得

---

## 💡 実装時の注意事項

### セクション構造の変更時

1. **ロードマップ表示の切り替え**:
   - 縦型: `orientation="vertical"` (現在の実装)
   - 横型: `orientation="horizontal"` (T1で必要)

2. **お役立ちコンテンツの実装**:
   - `/lessons`ページの実装を参考にする
   - `ContentCard`コンポーネントを使用
   - グリッドレイアウト: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

3. **レスポンシブ確認**:
   - モバイル（< 640px）
   - タブレット（640px - 1279px）
   - デスクトップ（≥ 1280px）

### データ取得の確認

各ロードマップのslugが正しいか確認：

```tsx
const careerRoadmap = getRoadmapBySlug("uiux-career-change"); // ✅
const uxRoadmap = getRoadmapBySlug("ux-design-basic"); // ✅
const uiRoadmap = getRoadmapBySlug("information-architecture"); // ✅
const uiVisualRoadmap = getRoadmapBySlug("ui-visual-design"); // ❓要確認
```

---

## 📝 進捗履歴

| 日付       | 内容                                             |
| ---------- | ------------------------------------------------ |
| 2026-04-06 | ヘッダーグラデーション修正完了                   |
| 2026-04-06 | ドットボーダーオーバーフロー修正完了             |
| 2026-04-06 | section-careerの見出しアンダーライン削除完了     |
| 2026-04-06 | section-uxのロードマップ表示修正完了（slug修正） |
| 2026-04-06 | タスクドキュメント整理（確認項目明確化）         |

---

## 🔗 関連ドキュメント

- [ロードマップリリースタスク](../roadmap/RELEASE-TASKS.md)
- [デザインシステムREADME](../../../design-system/README.md)
- [PROJECT-RULES](../../../PROJECT-RULES.md)
- [TopPageNew実装](./IMPLEMENTATION-PLAN.md)
