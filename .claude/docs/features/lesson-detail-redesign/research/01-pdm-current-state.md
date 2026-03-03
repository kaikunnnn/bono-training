# レッスン詳細ページ UX分析レポート

**作成日**: 2026-03-02
**作成者**: PdM（Claude）
**対象ファイル**: `src/pages/LessonDetail.tsx` および関連コンポーネント

---

## 1. 現在の情報構造

### 1.1 ページ構成（上から下への表示順序）

```
[LessonDetail.tsx]
  |
  +-- Layout (共通レイアウト)
  |     |
  |     +-- LessonHeaderLayout
  |           |
  |           +-- LessonHeader (戻る + シェアボタン)
  |           |
  |           +-- [横並びレイアウト（モバイル: 縦並び）]
  |           |     |
  |           |     +-- LessonSidebar (アイコン画像 - 3Dホバー付き)
  |           |     |
  |           |     +-- LessonTitleArea
  |           |           |
  |           |           +-- CategoryTag
  |           |           +-- タイトル (h1)
  |           |           +-- LessonProgressBar
  |           |           +-- 説明文 (3行clamp)
  |           |           +-- 「概要・目的ですべてみる」リンク
  |           |           +-- 「スタートする」CTAボタン
  |           |
  |           +-- LessonTabs
  |                 |
  |                 +-- [コンテンツタブ] QuestList
  |                 |     |
  |                 |     +-- SectionQuest (クエストごと)
  |                 |           |
  |                 |           +-- QuestHeader (番号 + 完了状態)
  |                 |           +-- QuestCard
  |                 |                 |
  |                 |                 +-- QuestCardHeader (タイトル + ゴール)
  |                 |                 +-- ArticleItem (記事リスト)
  |                 |
  |                 +-- [概要・目的タブ] OverviewTab
  |                       |
  |                       +-- レッスンの目的（箇条書き）
  |                       +-- 概要（リッチテキスト）
```

### 1.2 主要コンポーネントと役割

| コンポーネント | ファイルパス | 役割 |
|---------------|-------------|------|
| `LessonHeaderLayout` | `src/components/lesson/header/LessonHeaderLayout.tsx` | 統合レイアウト（ヘッダー + サイドバー + メイン） |
| `LessonHeader` | `src/components/lesson/header/LessonHeader.tsx` | 戻るボタン + シェアボタン |
| `LessonSidebar` | `src/components/lesson/header/LessonSidebar.tsx` | アイコン画像（3Dホバーエフェクト付き） |
| `LessonTitleArea` | `src/components/lesson/header/LessonTitleArea.tsx` | カテゴリ + タイトル + 進捗 + 説明 + CTA |
| `LessonTabs` | `src/components/lesson/LessonTabs.tsx` | コンテンツ / 概要・目的 タブ切替 |
| `QuestList` | `src/components/lesson/QuestList.tsx` | クエスト一覧の表示 |
| `SectionQuest` | `src/components/lesson/quest/SectionQuest.tsx` | 個別クエストブロック |
| `QuestCard` | `src/components/lesson/quest/QuestCard.tsx` | クエストカード（ヘッダー + 記事リスト） |
| `ArticleItem` | `src/components/lesson/quest/ArticleItem.tsx` | 個別記事アイテム |
| `OverviewTab` | `src/components/lesson/OverviewTab.tsx` | 概要・目的タブのコンテンツ |

---

## 2. ユーザージャーニー分析

### 2.1 現在のフロー

```
[レッスン一覧] → [レッスン詳細ページ] → [記事ページ] → [次の記事] → ... → [レッスン完了?]
                      |
                      +-- 入口設計 ❌ なし
                      +-- 学習中のガイド ❌ 弱い
                      +-- 出口設計 ❌ なし
```

### 2.2 入口の問題点

**現状**: ユーザーがレッスン詳細に来たとき、何も「迎え入れる」要素がない

| 問題 | 現状 | 理想 |
|------|------|------|
| Welcome動画がない | 静的な説明文のみ | レッスンの魅力を伝える30秒〜1分の動画 |
| 全体地図がない | クエストがリストで並ぶだけ | 学習の全体像を視覚的に把握できるマップ |
| 期待値設定がない | 「概要・目的」タブに隠れている | ファーストビューで「何が得られるか」を明示 |

**コード参照**:
```tsx
// src/components/lesson/header/LessonTitleArea.tsx:60-76
{lesson.description && (
  <div className="flex flex-col gap-[3px] items-start w-full">
    <div className="w-full h-fit max-h-[88px] overflow-hidden">
      <p className="font-noto-sans-jp text-[16px] text-[#4b5563] leading-[1.6] line-clamp-3">
        {lesson.description}
      </p>
    </div>
    {onViewAllDetails && (
      <button
        className="font-noto-sans-jp font-medium text-[14px] text-[#1e0ff0] leading-[1.6] hover:underline"
        onClick={onViewAllDetails}
      >
        概要・目的ですべてみる  {/* ← 重要な情報がサブ扱い */}
      </button>
    )}
  </div>
)}
```

### 2.3 学習中のガイドの問題点

**現状**: 進捗は表示されるが、「次に何をすべきか」の誘導が弱い

| 問題 | 現状 | 理想 |
|------|------|------|
| 「スタートする」ボタンの挙動 | 常に最初の記事に飛ぶ | 進捗に応じて「続きから」または「次のクエストへ」 |
| 現在地の強調がない | 進捗バーのみ | 「今ここにいる」「次はここ」の視覚的表示 |
| モチベーション維持要素なし | なし | 「あと3記事で完了！」などのメッセージ |

**コード参照**:
```tsx
// src/pages/LessonDetail.tsx:174-179
const handleStart = () => {
  if (lesson?.quests?.[0]?.articles?.[0]) {
    const firstArticle = lesson.quests[0].articles[0];
    navigate(`/articles/${firstArticle.slug.current}`);  // ← 常に最初の記事
  }
};
```

### 2.4 出口の問題点

**現状**: レッスン詳細ページには「出口」が存在しない

| 問題 | 現状 | 理想 |
|------|------|------|
| レッスン完了後の導線なし | なし | 「次のおすすめレッスン」への誘導 |
| 達成感の演出なし | なし（記事ページにはある） | 完了バッジ、お祝いメッセージ |
| 振り返り機能なし | なし | 学んだことの要約、復習ポイント |

**注**: 記事詳細ページ（`ArticleDetail.tsx`）には完了時のセレブレーション機能がある:
```tsx
// src/pages/ArticleDetail.tsx:441-457
<QuestCompletionModal
  isOpen={showQuestModal}
  onClose={closeQuestModal}
  questTitle={questModalTitle}
/>
{lessonModalData && (
  <CelebrationModal
    isOpen={showLessonModal}
    onClose={closeLessonModal}
    mainTitle={lessonModalData.mainTitle}
    ...
  />
)}
```

しかし、レッスン詳細ページに戻ってきたときには何も表示されない。

---

## 3. 強み（活かすべき点）

### 3.1 ビジュアル・インタラクション

| 強み | 詳細 | コード参照 |
|------|------|-----------|
| 3Dホバーエフェクト | レッスンアイコンが立体的に動く | `LessonSidebar.tsx:57-75` |
| クエスト構造 | 学習を「クエスト」として表現するゲーミフィケーション | `SectionQuest.tsx` |
| 進捗の可視化 | プログレスバー + 各クエストの完了状態 | `LessonProgressBar`, `QuestHeader` |
| シェア機能 | SNSシェアが簡単 | `LessonHeader.tsx:61-73` |

### 3.2 データ構造

| 強み | 詳細 | コード参照 |
|------|------|-----------|
| 豊富なメタデータ | 目的、ゴール、所要時間など | Sanityスキーマ |
| 記事タイプ分類 | explain, intro, practice, challenge, demo | `ArticleItem.tsx:26` |
| 完了状態の永続化 | Supabaseで進捗管理 | `services/progress.ts` |

### 3.3 コンポーネント設計

| 強み | 詳細 |
|------|------|
| 関心の分離 | ヘッダー、サイドバー、コンテンツが独立 |
| 再利用性 | QuestCard、ArticleItemなど汎用的 |
| レスポンシブ | モバイル/デスクトップ両対応 |

---

## 4. 弱み（改善すべき点）

### 4.1 構造的問題

| 弱み | 影響 | 改善案 |
|------|------|--------|
| 情報が静的 | ユーザーの状態に関わらず同じ表示 | パーソナライズされた表示 |
| タブが隠れている | 重要な「概要・目的」が目立たない | ファーストビューで見せる |
| CTAが1つだけ | 「スタートする」のみ | 進捗に応じた複数CTA |

### 4.2 ナビゲーション問題

| 弱み | 影響 | 改善案 |
|------|------|--------|
| 「続きから」がない | 再訪時に最初から始まる印象 | 最後に見た記事から再開 |
| 完了後の導線なし | レッスン完了後に迷子になる | 次のレッスン推薦 |
| 全体像が見えない | 学習の見通しが立たない | ロードマップビュー |

### 4.3 エンゲージメント問題

| 弱み | 影響 | 改善案 |
|------|------|--------|
| 入口でワクワク感がない | 離脱率が高くなる可能性 | Welcome動画/アニメーション |
| 達成感の演出が足りない | モチベーション維持が難しい | マイルストーン達成時の演出 |
| 学習の目的が伝わりにくい | 何のために学ぶかわからない | 「これを学ぶと何ができるか」を明示 |

---

## 5. 感情曲線分析

```
感情の高さ
    ^
    |
高  |    *        (タイトル・説明を読む)
    |   / \
    |  /   \                                          * (完了？)
    | /     \                                        /
    |/       \      *--------*--------*--------*----
中  |         \    / (記事を見る) (同じ調子が続く)
    |          \  /
    |           \/
    |            * (スタートをクリック)
低  |
    +-------------------------------------------------> 時間
         入口      学習開始      学習中      出口
```

### 5.1 ワクワクするポイント

1. **最初のタイトル・説明を読むとき** - 新しいことを学べる期待感
2. **3Dホバーエフェクト** - 遊び心があって楽しい（ただし一時的）
3. **クエスト完了時**（記事ページで）- 達成感

### 5.2 離脱リスクの高いポイント

1. **「スタートする」をクリック後** - 突然記事ページに飛ばされる感覚
2. **学習中盤** - 同じUIが続き、飽きやすい
3. **レッスン完了後** - 何をすればいいかわからない

### 5.3 改善すべき感情のギャップ

| フェーズ | 現在の感情 | 理想の感情 | ギャップの原因 |
|----------|------------|------------|----------------|
| 入口 | 「何から始めればいい？」 | 「面白そう！やってみたい！」 | Welcome動画・期待値設定の欠如 |
| 学習開始 | 「いきなり記事？」 | 「準備OK、さあ始めよう」 | 学習の全体像説明がない |
| 学習中盤 | 「まだ終わらない...」 | 「もう少しで次のクエストだ！」 | 進捗の励ましがない |
| 出口 | 「終わった...で？」 | 「達成した！次も頑張ろう！」 | 完了後の導線がない |

---

## 6. 改善提案サマリー

### 6.1 入口設計（Priority: High）

- [ ] **Welcome動画スロット**: レッスン冒頭に30秒〜1分の紹介動画
- [ ] **学習マップ**: クエストの全体像を視覚的に表示
- [ ] **期待値設定**: 「このレッスンで得られること」をファーストビューに

### 6.2 学習中ガイド（Priority: High）

- [ ] **スマートCTA**: 進捗に応じて「続きから」「次のクエストへ」
- [ ] **現在地表示**: 「クエスト2/4 - 記事3/5」のような表示
- [ ] **励ましメッセージ**: 「あと2記事で次のクエスト！」

### 6.3 出口設計（Priority: Medium）

- [ ] **完了状態の表示**: レッスン詳細ページでも完了を祝う
- [ ] **次のレッスン推薦**: 「このレッスンが終わったら次はこれ」
- [ ] **振り返りセクション**: 学んだことの要約

### 6.4 全体的なUX改善（Priority: Medium）

- [ ] **パーソナライズ**: ユーザーの進捗状態に応じた表示
- [ ] **アニメーション**: 状態変化時のマイクロインタラクション
- [ ] **一貫性**: 記事ページとレッスンページの体験を統一

---

## 7. 参照ファイル一覧

| ファイルパス | 内容 |
|-------------|------|
| `/Users/kaitakumi/Documents/bono-training/src/pages/LessonDetail.tsx` | メインページ |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/header/LessonHeaderLayout.tsx` | レイアウト |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/header/LessonHeader.tsx` | ヘッダー |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/header/LessonSidebar.tsx` | サイドバー |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/header/LessonTitleArea.tsx` | タイトルエリア |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/LessonTabs.tsx` | タブ |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/QuestList.tsx` | クエストリスト |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/quest/SectionQuest.tsx` | クエストセクション |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/quest/QuestCard.tsx` | クエストカード |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/quest/QuestCardHeader.tsx` | カードヘッダー |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/quest/ArticleItem.tsx` | 記事アイテム |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/quest/QuestHeader.tsx` | クエストヘッダー |
| `/Users/kaitakumi/Documents/bono-training/src/components/lesson/OverviewTab.tsx` | 概要タブ |
| `/Users/kaitakumi/Documents/bono-training/src/pages/ArticleDetail.tsx` | 記事詳細ページ（参考） |

---

## 8. 次のステップ

1. **ユーザーインタビュー**: 実際のユーザーが感じている問題点を確認
2. **競合分析**: 他の学習サービスのレッスン詳細ページを調査
3. **プロトタイプ作成**: 改善案のワイヤーフレーム・モックアップ
4. **A/Bテスト計画**: 改善効果を測定するための指標設定
