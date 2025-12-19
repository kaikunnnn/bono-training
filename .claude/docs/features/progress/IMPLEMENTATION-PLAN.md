# 進捗機能 実装計画

**作成日**: 2025-12-17
**最終更新**: 2025-12-17
**ステータス**: 計画確定（レビュー済み）

---

## 概要

既存マイページを改修し、タブナビゲーションと「進行中」セクションを実装する。

**スコープ:**
- 既存マイページにタブナビゲーション追加
- 「進行中」セクション（最大2件、2列グリッド）
- LessonProgressCard → ProgressLesson コンポーネントへ置換
- 100%完了時の「レッスンを完了する」ボタン

---

## 現状確認 ✅ 完了

### 既存実装

| 項目 | 状況 | 詳細 |
|------|------|------|
| `article_progress` テーブル | ✅ 使用中 | 記事完了記録に使用 |
| `lesson_progress` テーブル | ⚠️ 存在するが未使用 | status列あり（活用予定）|
| `lesson_progress` RLS | 🔴 **無効** | セキュリティ修正必須 |
| `src/pages/MyPage.tsx` | ✅ 存在 | 改修対象 |
| `src/components/ui/lesson-progress-card.tsx` | ✅ 存在 | **削除予定** |
| ProgressLessonコンポーネント | ❌ 未実装 | デザイン仕様あり |

### DBスキーマ（確認済み）

```sql
-- lesson_progress（存在するが未使用 → 活用する）
lesson_progress:
  - user_id
  - lesson_id
  - status (not_started / in_progress / completed) ← 100%完了時に使用
  - started_at
  - completed_at
  - created_at
  - updated_at

-- article_progress（使用中）
article_progress:
  - user_id
  - article_id
  - lesson_id
  - status
  - completed_at
```

### デザイン資料

| ファイル | 内容 |
|----------|------|
| `screens/mypage/MYPAGE_LAYOUT_INSTRUCTION.md` | マイページレイアウト詳細仕様 |
| `screens/mypage/README_MYPAGE.md` | マイページ概要 |
| `screens/component/progress_lesson_item/README.md` | ProgressLessonコンポーネント仕様 |
| `screens/component/progress_lesson_item/ProgressLessonTailwind.tsx` | Tailwind版コード例 |

---

## 新マイページ構成

### タブナビゲーション

```
[すべて] [進捗] [お気に入り] [閲覧履歴]
```

| タブ | 表示内容 |
|------|----------|
| すべて | 全セクション表示 |
| 進捗 | 進行中セクションのみ |
| お気に入り | お気に入りセクションのみ |
| 閲覧履歴 | 閲覧履歴セクションのみ |

### セクション構成

1. **進行中セクション**
   - 見出し「進行中」+ 「すべてみる」リンク
   - ProgressLessonカード × 2（2列グリッド）
   - 「すべてみる」→「進捗」タブへ切替

2. **お気に入りセクション**（別フェーズで実装）
   - FavoriteArticleCard × 4（縦並び）

3. **閲覧履歴セクション**（別フェーズで実装）
   - ArticleCard × 2（縦並び）

---

## 実装ステップ

### Phase 0: DB準備（セキュリティ修正）🔴 必須

**0.1 lesson_progress テーブルのRLS有効化**

```sql
-- RLS有効化
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- SELECTポリシー
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

-- INSERTポリシー
CREATE POLICY "Users can insert own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATEポリシー
CREATE POLICY "Users can update own lesson progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

---

### Phase 1: コンポーネント準備

**1.1 ProgressLessonコンポーネント作成**

```
場所: src/components/progress/ProgressLesson.tsx
仕様: screens/component/progress_lesson_item/README.md
```

Props（デザイン仕様に合わせて修正）:
| Prop | 型 | 説明 |
|------|------|------|
| `icon` | string | アイコン（テキスト/絵文字/画像URL） |
| `iconBgColor` | string | アイコン背景色 |
| `title` | string | レッスンタイトル |
| `lessonSlug` | string | レッスンページへのリンク用 |
| `progress` | number | 進捗率 (0-100) |
| `nextArticleTitle` | string | 次の記事タイトル（「次へ 👉️」表示用） |
| `nextArticleSlug` | string | 次の記事へのリンク用 |
| `showCompleteButton` | boolean | 100%時の完了ボタン表示 |
| `onComplete` | () => void | 完了ボタンクリック時 |

**1.2 LessonProgressCard削除**

```
削除: src/components/ui/lesson-progress-card.tsx
```

---

### Phase 2: マイページ改修

**2.1 タブナビゲーション追加**

```tsx
// src/pages/MyPage.tsx
const [activeTab, setActiveTab] = useState<'all' | 'progress' | 'favorite' | 'history'>('all');
```

**2.2 進行中セクション実装**

```tsx
// 表示条件
{(activeTab === 'all' || activeTab === 'progress') && (
  <ProgressSection lessons={inProgressLessons.slice(0, 2)} />
)}

// 進行中レッスンが0件の場合はセクション非表示
```

**2.3 2列グリッドレイアウト**

```css
.progress-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 768px) {
  .progress-grid {
    grid-template-columns: 1fr;
  }
}
```

**2.4 レイアウト数値**

| 項目 | デスクトップ | スマホ |
|------|-------------|--------|
| 最大幅 | 1200px | 100% |
| 外側パディング | 40px | 20px |
| コンテンツパディング | 32px | 20px |
| タブ間ギャップ | 32px | 16px |
| セクション間マージン | 56px | 40px |
| カード横ギャップ | 24px | - |
| カード縦ギャップ | 16px | 16px |

---

### Phase 3: バックエンド連携

**3.0 「次の記事」取得用クエリ追加**

```typescript
// src/services/lessons.ts に追加
// レッスンの構造（クエスト→記事の順番付き）を取得

export async function getLessonStructure(lessonId: string) {
  const query = `*[_type == "lesson" && _id == $lessonId][0] {
    _id,
    title,
    slug,
    iconImage,
    "quests": *[_type == "quest" && references(^._id)] | order(questNumber asc) {
      _id,
      questNumber,
      title,
      "articles": *[_type == "article" && references(^._id)] | order(articleNumber asc) {
        _id,
        title,
        slug,
        articleNumber
      }
    }
  }`;
  return client.fetch(query, { lessonId });
}
```

**3.1 進行中レッスン取得ロジック修正**

```typescript
// 現在: article_progress から計算
// 変更: lesson_progress.status も考慮

// 進行中の条件:
// - 1件以上の記事を完了している（percentage > 0）
// - lesson_progress.status !== 'completed'
// - updated_at 降順で上位2件
```

**3.2 「次の記事」計算**

```typescript
// src/lib/progress/calculateNextArticle.ts

// マイページ表示時に計算（2件のみ）
// 1. getLessonStructure() でレッスン内の全記事順序を取得
// 2. article_progressで完了済みを特定
// 3. 未完了で最も順番が若い記事を返す

export function calculateNextArticle(
  lessonStructure: LessonStructure,
  completedArticleIds: string[]
): { title: string; slug: string } | null {
  for (const quest of lessonStructure.quests) {
    for (const article of quest.articles) {
      if (!completedArticleIds.includes(article._id)) {
        return { title: article.title, slug: article.slug.current };
      }
    }
  }
  return null; // 全記事完了
}
```

**3.3 記事完了時のlesson_progress更新**

```typescript
// progress.ts の toggleArticleCompletion() に追加

// 記事完了時に lesson_progress.updated_at も更新
// これにより「最近取り組んだ順」でソート可能に
```

**3.4 100%完了時の処理**

```typescript
// 進捗率が100%になったら:
// 1. ProgressLessonカード内に「レッスンを完了する」ボタンを表示
// 2. クリックで lesson_progress.status = 'completed' に更新
// 3. 進行中リストから除外される
```

---

### Phase 4: テスト・調整

- [ ] タブ切替が正しく動作する
- [ ] 進行中レッスンが最大2件表示される
- [ ] 進行中レッスンが0件の場合、セクションが非表示になる
- [ ] 2列グリッドが正しく表示される
- [ ] スマホで1列になる
- [ ] 「すべてみる」でタブが切り替わる
- [ ] 「次へ 👉️ [記事タイトル]」が正しく表示される
- [ ] 次の記事リンクが正しく動作する
- [ ] 100%完了時にボタンが表示される
- [ ] 完了ボタンで進行中から消える
- [ ] RLSが有効で他ユーザーのデータにアクセスできない

---

### Phase 5: マイページ体験の仕上げ 🆕 ← 現在ここ

**目的:** マイページ全体の体験を磨き上げる

**📋 仕様書:** `screens/mypage/MYPAGE-STYLE-SPECIFICATION.md`

---

#### Step 5.0: 仕様策定（ユーザー主導）

**タスク:** 仕様書に以下を定義する

- [ ] 全体カラーパレット
- [ ] スペーシング・角丸
- [ ] タブナビゲーションのスタイル
- [ ] Empty State（空状態）の内容とスタイル
  - [ ] 進行中セクション
  - [ ] お気に入りセクション
  - [ ] 閲覧履歴セクション
- [ ] 各セクションのカードスタイル
- [ ] 完了ボタンのスタイル（`/dev/progress-components` で調整）
- [ ] レスポンシブ対応の詳細
- [ ] アニメーション・トランジション

---

#### Step 5.1: Empty State 実装

| セクション | 空状態時の表示 |
|-----------|---------------|
| 進行中 | （仕様書で定義） |
| お気に入り | （仕様書で定義） |
| 閲覧履歴 | （仕様書で定義） |

```tsx
// 空状態コンポーネント例
<EmptyState
  icon="📚"
  message="レッスンを始めましょう"
  linkText="レッスン一覧を見る"
  linkUrl="/lessons"
/>
```

---

#### Step 5.2: 要素がある時の体験

- [ ] カードホバー時のフィードバック（影の変化）
- [ ] カードクリック時のフィードバック
- [ ] 「すべてみる」ホバーエフェクト
- [ ] ローディング状態のスケルトン表示
- [ ] タブ切替時のスムーズなトランジション

---

#### Step 5.3: レスポンシブ対応

| 項目 | デスクトップ | スマホ（768px以下） |
|------|-------------|-------------------|
| 外側パディング | 40px | 20px |
| コンテンツパディング | 32px | 20px |
| タブ間ギャップ | 32px | 16px（横スクロール） |
| 進行中グリッド | 2列 | 1列 |
| セクション間 | 56px | 40px |

---

#### Step 5.4: スタイル調整

- [ ] 完了したレッスンセクションのスタイル
- [ ] タブ切替時のアニメーション
- [ ] セクション見出しの統一
- [ ] 全体の余白・間隔の微調整

---

#### Step 5.5: アクセシビリティ

- [ ] キーボードナビゲーション対応
- [ ] フォーカスインジケーター
- [ ] スクリーンリーダー対応（aria-label等）

---

## ファイル構成

```
src/
├── components/
│   └── progress/
│       ├── ProgressLesson.tsx          ← 新規
│       ├── ProgressLesson.module.css   ← 新規
│       └── ProgressSection.tsx         ← 新規（セクション）
├── pages/
│   └── MyPage.tsx                      ← 修正（タブ追加）
│   └── MyPage.module.css               ← 修正（レイアウト）
├── services/
│   ├── lessons.ts                      ← 修正（getLessonStructure追加）
│   └── progress.ts                     ← 修正（lesson_progress更新追加）
└── lib/
    └── progress/
        └── calculateNextArticle.ts     ← 新規
```

### 削除ファイル

```
src/components/ui/lesson-progress-card.tsx  ← 削除
```

---

## 依存関係

```
Phase 0 (DB) → Phase 1 (コンポーネント) → Phase 2 (マイページ) → Phase 3 (バックエンド) → Phase 4 (テスト)
```

---

## 注意事項

### セキュリティ（Phase 0 必須）

- 🔴 **lesson_progress テーブルのRLSが無効**
- 実装開始前に必ずRLS有効化とポリシー作成を行う
- これを忘れると他ユーザーのデータが見える重大なセキュリティホール

### lesson_progress テーブルの活用

- 既存テーブルを活用（新規作成不要）
- `status` 列で「手動完了」を管理
- 100%達成 + ボタンクリック = `completed`

### 既存データとの互換性

- 既存の `article_progress` データはそのまま使用
- `lesson_progress` への移行は不要（status管理のみ追加）

### パフォーマンス

- 「次の記事」計算は表示時の2件のみ
- Sanityへの問い合わせを最小限に

---

## エッジケース対応

| ケース | 対応 |
|--------|------|
| 進行中レッスンが0件 | セクション自体を非表示 |
| 全記事完了後に記事が追加 | status維持、percentage再計算 |
| レッスンにクエストがない | エラーハンドリング（空配列を返す） |
| 記事を未完了に戻した場合 | percentage再計算、statusはそのまま |
| Webflowソースのレッスン | 同じロジックで動作（対応済み） |

---

## ユーザーストーリー

### Phase 2 完了時（UI実装後）

- [ ] ユーザーとして、マイページでタブを切り替えて「進捗」「お気に入り」「閲覧履歴」を絞り込める
- [ ] ユーザーとして、進行中のレッスンが最大2件、見やすい2列レイアウトで表示される
- [ ] ユーザーとして、スマホでも1列で見やすく表示される
- [ ] ユーザーとして、「すべてみる」をクリックして進行中レッスンの全一覧を見れる

### Phase 3 完了時（バックエンド連携後）

- [ ] ユーザーとして、各レッスンカードに「次に読むべき記事」が表示され、すぐに続きから始められる
- [ ] ユーザーとして、レッスンを100%完了したら「レッスンを完了する」ボタンが表示される
- [ ] ユーザーとして、完了ボタンを押すとそのレッスンが進行中リストから消え、達成感を得られる
- [ ] ユーザーとして、最近取り組んだレッスンが上位に表示され、続きを見つけやすい

### Phase 4 完了時（テスト後）

- [ ] ユーザーとして、全ての機能が安定して動作し、ストレスなく学習を続けられる

---

## 次のアクション

1. [x] **Phase 0: DB準備（RLS有効化）** ✅ 完了
2. [x] Phase 1: ProgressLessonコンポーネント実装 ✅ 完了
3. [ ] Phase 1: LessonProgressCard削除（後で実施）
4. [x] Phase 2: マイページ改修（タブナビ追加） ✅ 完了
5. [x] **Phase 3: バックエンド連携** ✅ 完了
   - [x] 100%完了ボタン実装
   - [x] lesson_progress.status更新処理
   - [x] markLessonAsCompleted 関数追加
   - [x] MyPage ハンドラー統合
6. [ ] Phase 4: テスト
7. [ ] **Phase 5: マイページ体験の仕上げ** ← 現在ここ
   - [ ] **Step 5.0: 仕様策定** ← 仕様書に記入中
   - [ ] Step 5.1: Empty State 実装
   - [ ] Step 5.2: 要素がある時の体験
   - [ ] Step 5.3: レスポンシブ対応
   - [ ] Step 5.4: スタイル調整
   - [ ] Step 5.5: アクセシビリティ

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-18 | Phase 5 に Step 5.0「仕様策定」追加、仕様書 `MYPAGE-STYLE-SPECIFICATION.md` 作成 |
| 2025-12-18 | Phase 3 完了（markLessonAsCompleted、MyPage ハンドラー統合） |
| 2025-12-18 | Phase 5「マイページ体験の仕上げ」追加（空状態・レスポンシブ・スタイル調整） |
| 2025-12-18 | Phase 0-2 完了、Phase 3 進行中に更新 |
| 2025-12-17 | 多角的レビュー後、Phase 0追加、Props修正、エッジケース追加 |
| 2025-12-17 | デザイン確認後、計画を大幅更新（タブ追加、レイアウト仕様反映） |
| 2025-12-17 | 初版作成 |
