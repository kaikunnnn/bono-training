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

### 文言変更

▼ UIUX転職キャリアチェンジしたい

- [ ]デザインスキルを獲得して転職を目指そう ⇨ UIUXデザイナー転職のコンテンツ
- [ ] お役立ちコンテンツ ⇨ 転職の参考になるコンテンツ

▼ ユーザー課題を解決するデザインをはじめよう

- [ ] デザインスキルを獲得して転職を目指そう⇨課題解決スキルを獲得しよう
- [ ] お役立ちコンテンツ⇨UXリサーチと要件定義を習得しよう

▼ 使いやすいUI体験を提案できるようになろう

- [ ]デザインスキルを獲得して転職を目指そう ⇨UIデザインの基本を体系的に習得しよう
- [ ]お役立ちコンテンツ ⇨UIデザインの原則・進め方を学ぼう

### デザイン調整

| タスク                            | 内容                                                                                                                         | 修正箇所                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| ヘッダーグラデーション            | Layout.tsxのグラデーション透明度を修正                                                                                       | `src/components/layout/Layout.tsx:67-75`                 |
| ドットボーダーオーバーフロー      | DottedDividerの`w-full`を削除                                                                                                | `src/components/common/DottedDivider.tsx:36`             |
| お役立ちコンテンツHeading         | section-careerの見出しアンダーライン削除                                                                                     | `src/pages/dev/TopPageNew.tsx:410`                       |
| UXロードマップ表示                | slugを`ux-design`→`ux-design-basic`に修正                                                                                    | `src/pages/dev/TopPageNew.tsx:160`                       |
| section-ux構造変更 (T1)           | ロードマップを横型に、お役立ちコンテンツ3列グリッド                                                                          | `src/pages/dev/TopPageNew.tsx:460-555`                   |
| セクションコンテナ全幅化 (T3)     | グレー背景を全幅に、内側でmax-w制御                                                                                          | section-career/ux/ui全て                                 |
| UIビジュアルロードマップ表示 (T2) | slugを`ui-visual-design`→`ui-visual`に修正                                                                                   | `src/pages/dev/TopPageNew.tsx:162`                       |
| section-uiの見出し (T2)           | お役立ちコンテンツのアンダーライン削除                                                                                       | `src/pages/dev/TopPageNew.tsx:627`                       |
| GoalSectionHeader下線 (T4)        | 全幅ボーダー追加 + 垂直中央配置調整                                                                                          | `src/components/top/GoalSectionHeader.tsx:1-62`          |
| 顧客の課題解決カードリンク        | トップアイキャッチのslug修正（ux-design→ux-design-basic）                                                                    | `src/components/top/TrainingCard.tsx:176`                |
| お役立ちコンテンツ統一            | /lessonsと同じLessonCardコンポーネント使用                                                                                   | `src/pages/dev/TopPageNew.tsx:153-186, 525-541, 647-663` |
| サイドナビ追加                    | ロードマップの上に「トップページ」追加                                                                                       | `src/components/layout/Sidebar/index.tsx:56-63`          |
| ルーティング最適化                | 非ログイン時は/top、ログイン時はマイページ                                                                                   | `src/pages/Index.tsx:22`                                 |
| トップページアイコン変更          | サイドナビのアイコンをHome2に変更                                                                                            | `src/components/layout/Sidebar/index.tsx:11,59`          |
| アイキャッチアニメーション復元    | ページ表示時のアニメーション実装（NEWバッジ→キャッチコピー→CTA：スケール+フェードイン、カード：右からスライド+ポップアップ） | `src/pages/dev/TopPageNew.tsx:12,27-41,314-353,403-414`  |

**T1の確認項目**:

- [x] 横UIコンポーネントパターン = RoadmapCardV2の`orientation="horizontal"`を使用
- [x] お役立ちコンテンツを3列グリッドに変更（`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`）
- [x] レスポンシブ対応（モバイル: 1列、タブレット: 2列、デスクトップ: 3列）
- [x] お役立ちコンテンツのHeadingにアンダーラインなし（`showUnderline={false}`）
- [x] ロードマップは1つのみ表示（UXデザイン基礎ロードマップ）

**T3の実装詳細**:

```tsx
// 変更前: GoalSectionHeaderがmax-w制約の内側にある
<section className="py-6 sm:py-8 px-4 sm:px-6">
  <div className="bg-[rgba(70,87,83,0.04)] ...">
    <div className="max-w-[1120px] mx-auto">      {/* ← mx-autoで左右マージン発生 */}
      <GoalSectionHeader ... />                    {/* ← 制約内なので全幅にならない */}
      <div>コンテンツ</div>
    </div>
  </div>
</section>

// 変更後: GoalSectionHeaderをmax-w制約の外に出す
<section className="py-6 sm:py-8">
  <div className="bg-[rgba(70,87,83,0.04)] ...">  {/* 全幅背景 */}
    <GoalSectionHeader ... />                      {/* ← 全幅 */}
    <div className="max-w-[1120px] mx-auto">      {/* ← コンテンツのみ制約 */}
      <div>コンテンツ</div>
    </div>
  </div>
</section>
```

**T2の確認項目**:

- [x] `uiVisualRoadmap`のslugを修正（`ui-visual-design` → `ui-visual`）
- [x] section-uiの「お役立ちコンテンツ」にアンダーラインなし（`showUnderline={false}`）
- [x] 情報設計ロードマップ + UIビジュアルロードマップの2つを表示
- [x] お役立ちコンテンツは3列グリッド（既存実装維持）

**T3の確認項目**:

- [x] sectionタグから水平パディング削除（`px-4 sm:px-6` を削除）
- [x] GoalSectionHeaderを `max-w-[1120px] mx-auto` の外側に配置
- [x] ロードマップ・お役立ちコンテンツは `max-w-[1120px] mx-auto` の内側に配置
- [x] 3箇所全て（section-career, ux, ui）で適用
- [x] GoalSectionHeader内のDottedDividerが全幅表示される

**T4の確認項目**:

- [x] ルートdivから水平パディングを削除（全幅ボーダーのため）
- [x] コンテンツエリアに水平パディング適用（内側制御）
- [x] DottedDividerで全幅ボーダー追加（グレー背景コンテナの端まで）
- [x] 垂直パディング増加（`py-8 sm:py-12 lg:py-14`）でテキストを視覚的に中央配置
- [x] 3箇所全てのGoalSectionHeader使用箇所で動作確認

**お役立ちコンテンツの確認項目**:

- [x] `/lessons`ページと同じLessonCardコンポーネントを使用
- [x] useLessonsフックでSanityからデータ取得
- [x] section-ux: 3つのレッスン（情報設計、顧客体験、ユーザーインタビュー）
- [x] section-ui: 3つのレッスン（UIビジュアル基礎、デザインサイクル、UIビジュアル基礎）
- [x] LessonCardのonClickでナビゲーション実装
- [x] 3列グリッドレイアウト（`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`）

**T4の実装詳細**:

```tsx
// 変更前: ルートdivに全てのパディング
<div className="px-4 sm:px-8 lg:px-14 py-6 sm:py-10 lg:py-12">
  {/* コンテンツ */}
</div>

// 変更後: ルートdivは全幅、内側でパディング制御
<div className="flex flex-col">
  <div className="px-4 sm:px-8 lg:px-14 py-8 sm:py-12 lg:py-14">
    {/* コンテンツ */}
  </div>
  <DottedDivider />  {/* 全幅ボーダー */}
</div>
```

**お役立ちコンテンツの実装詳細**:

```tsx
// 1. useLessonsフックでデータ取得（SanityLesson[]を返す）
const { data: sanityLessons } = useLessons();

// 2. 各セクション用にタイトル部分一致でフィルタリング（Lessons.tsxと同じロジック）
const uxSectionLessons = useMemo(() => {
  if (!sanityLessons) return [];

  const titlePatterns = [
    "ゼロからはじめるUI情報設計",
    "顧客体験デザイン",
    "ユーザーインタビュー",
  ];
  return sanityLessons
    .filter((l) => titlePatterns.some((pattern) => l.title.includes(pattern)))
    .slice(0, 3)
    .map(convertSanityLessonToLesson); // SanityLesson → Lesson型変換
}, [sanityLessons]);

// 3. LessonCardコンポーネントで表示
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
  {uxSectionLessons.map((lesson) => (
    <LessonCard
      key={lesson.slug}
      lesson={lesson}
      onClick={() => navigate(`/lessons/${lesson.slug}`)}
    />
  ))}
</div>;
```

**重要**: slugではなく**タイトルの部分一致**で検索しています。これは`/lessons`ページと同じロジックです。

---

## 🔄 作業中タスク

なし

---

## 📋 未着手タスク

### 🎉 全タスク完了！

以前のT4説明（参考用）:

**要求内容**:

- アンダーボーダーをグレー背景コンテナの端まで伸ばす（パディング外側まで）
- テキストブロックをHeading領域の垂直方向中央に配置

**実装方法**:

- ルートdivから水平パディングを削除
- 内側のコンテンツdivに水平パディング適用
- DottedDividerを追加して全幅ボーダーを実現
- 垂直パディングを増加（`py-6→py-8`, `sm:py-10→sm:py-12`, `lg:py-12→lg:py-14`）

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
const uiVisualRoadmap = getRoadmapBySlug("ui-visual"); // ✅
```

---

## 📝 進捗履歴

| 日付       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-04-06 | ヘッダーグラデーション修正完了                                               |
| 2026-04-06 | ドットボーダーオーバーフロー修正完了                                         |
| 2026-04-06 | section-careerの見出しアンダーライン削除完了                                 |
| 2026-04-06 | section-uxのロードマップ表示修正完了（slug修正）                             |
| 2026-04-06 | タスクドキュメント整理（確認項目明確化）                                     |
| 2026-04-06 | T1: section-ux構造変更完了（横型ロードマップ）                               |
| 2026-04-06 | T3: セクションコンテナ全幅化完了                                             |
| 2026-04-06 | T2: UIビジュアルロードマップ表示修正完了                                     |
| 2026-04-06 | T4: GoalSectionHeader全幅ボーダー + 垂直中央配置完了                         |
| 2026-04-06 | 顧客の課題解決カードのリンク修正完了（トップアイキャッチ）                   |
| 2026-04-06 | お役立ちコンテンツをLessonCardコンポーネント化完了                           |
| 2026-04-06 | サイドナビに「トップページ」追加 + ルーティング最適化完了                    |
| 2026-04-06 | トップページアイコンをHome2に変更完了                                        |
| 2026-04-06 | アイキャッチアニメーション復元完了（NEWバッジ→キャッチコピー→CTA→カード4枚） |
| 2026-04-06 | トレーニングカードを右からスライド+ポップアップアニメーションに変更          |
| 2026-04-06 | トレーニングカード位置調整（デスクトップ: 616px→540px）                      |
| 2026-04-06 | CTAボタン文言修正（「ロードマップをを見る」→「ロードマップへ」）             |
| 2026-04-06 | CTASecondaryボタンのホバーエフェクト改善（背景反転+文字色変化）              |

---

## 🔗 関連ドキュメント

- [ロードマップリリースタスク](../roadmap/RELEASE-TASKS.md)
- [デザインシステムREADME](../../../design-system/README.md)
- [PROJECT-RULES](../../../PROJECT-RULES.md)
- [TopPageNew実装](./IMPLEMENTATION-PLAN.md)
