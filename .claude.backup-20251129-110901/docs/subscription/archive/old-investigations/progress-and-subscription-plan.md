# 進捗管理・ブックマーク・サブスクリプション連携 実装計画

## 1. 現状分析

### 既存の実装

#### コンテンツシステム

- **Sanity ベース**: `lesson` → `quest` → `article` (メインの学習コンテンツ)
- **Supabase ベース**: `training` → `task` (古いシステム、進捗管理あり)

#### 認証・決済

- Supabase Auth による認証機能 ✅
- Stripe 決済連携 ✅
- `user_subscriptions` テーブルでプラン管理 ✅
- `SubscriptionContext` でプラン状態の参照 ✅

#### 未実装の機能

- Sanity コンテンツ（lesson/article）の進捗管理 ❌
- ブックマーク/お気に入り機能 ❌
- マイページ/ダッシュボード ❌
- サブスクリプションベースのコンテンツアクセス制御（部分的）

---

## 2. 実装する機能の全体像

### 2.1 進捗管理

- **レッスン進捗**: レッスン単位での進捗（未開始/進行中/完了）
- **記事進捗**: 記事単位での進捗 + 動画視聴位置の保存
- **進捗の自動計算**: クエスト内の記事が全て完了 → レッスンが完了

### 2.2 ブックマーク機能

- 記事をお気に入り登録
- マイページからブックマーク一覧を確認
- ブックマークした記事への素早いアクセス

### 2.3 マイページ/ダッシュボード

- 現在進行中のレッスン一覧（進捗率付き）
- ロードマップ表示（カテゴリ別レッスン）
- **ブックマークした記事一覧**（フェーズ2のデータ）
- **最近学習した記事**（フェーズ3のarticle_progressデータ）
- 学習統計（完了レッスン数、完了記事数など）
- サブスクリプション状態の表示

### 2.4 サブスクリプション連携

- **プラン別コンテンツアクセス制御**
  - フリープラン: `isPremium: false` の記事のみ
  - 有料プラン: 全ての記事にアクセス可能
- **プレミアムコンテンツのロック表示**
  - フリーユーザーには「有料プラン限定」バッジ表示
  - クリック時にプラン登録ページへ誘導
- **進捗データの保持**
  - プラン解約後も進捗データは保持
  - 再登録時に進捗を引き継ぎ

---

## 3. サブスクリプション連携の詳細

### 3.1 既存のプラン構造

現在の `user_subscriptions` テーブル:

```typescript
{
  user_id: string;
  plan_type: string; // 'free' | 'community' | 'standard' | 'growth'
  is_active: boolean;
  stripe_subscription_id: string | null;
}
```

### 3.2 プラン別アクセス権限

| プラン    | 無料記事 | 有料記事 | 備考                     |
| --------- | -------- | -------- | ------------------------ |
| Free      | ✅       | ❌       | 無料コンテンツのみ       |
| Community | ✅       | ✅       | コミュニティメンバー向け |
| Standard  | ✅       | ✅       | 標準プラン               |
| Growth    | ✅       | ✅       | 最上位プラン             |

### 3.3 記事アクセス制御のロジック

```typescript
// 記事にアクセス可能かチェック
function canAccessArticle(
  article: Article,
  subscription: SubscriptionState
): boolean {
  // プレミアム記事でない場合は誰でもアクセス可能
  if (!article.isPremium) return true;

  // プレミアム記事の場合は有料プラン必須
  return subscription.isSubscribed && subscription.planType !== "free";
}
```

### 3.4 レッスンページでの表示制御

- **レッスン一覧**: 全レッスンを表示（有料記事を含むレッスンには「プレミアム」バッジ）
- **レッスン詳細**:
  - 無料記事: すべてのユーザーが視聴可能
  - 有料記事: フリープランには「🔒 有料プラン限定」と表示
- **記事詳細**:
  - アクセス権限がない場合: プレビュー画面 + プラン登録への誘導

---

## 4. データベース設計

### 4.1 新規テーブル

#### `lesson_progress` (レッスン進捗)

```sql
CREATE TABLE lesson_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,  -- Sanity lesson._id
  status TEXT NOT NULL DEFAULT 'not_started',
    -- 'not_started' | 'in_progress' | 'completed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(user_id, status);
```

#### `article_progress` (記事進捗)

```sql
CREATE TABLE article_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,  -- Sanity article._id
  lesson_id TEXT NOT NULL,   -- 所属するレッスン
  quest_id TEXT,             -- 所属するクエスト（オプション）
  status TEXT NOT NULL DEFAULT 'not_started',
    -- 'not_started' | 'in_progress' | 'completed'
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX idx_article_progress_user ON article_progress(user_id);
CREATE INDEX idx_article_progress_lesson ON article_progress(user_id, lesson_id);
CREATE INDEX idx_article_progress_status ON article_progress(user_id, status);
CREATE INDEX idx_article_progress_updated ON article_progress(user_id, updated_at DESC);
```

#### `article_bookmarks` (記事ブックマーク)

```sql
CREATE TABLE article_bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,  -- Sanity article._id
  lesson_id TEXT NOT NULL,   -- 所属するレッスン
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

CREATE INDEX idx_article_bookmarks_user ON article_bookmarks(user_id, created_at DESC);
```

### 4.2 既存テーブルとの関係

```
auth.users (Supabase Auth)
  ↓
user_subscriptions (サブスクリプション状態)
  ↓ (アクセス権限の判定)
lesson_progress ← Sanity lesson
  ↓
article_progress ← Sanity article (isPremium チェック)
  ↓
article_bookmarks
```

---

## 5. 実装フェーズ（サブスクリプション考慮）

### フェーズ 1: データベース・基盤整備 🏗️

**目的**: データ保存の基盤を作る

**ユーザー体験**:
このフェーズはバックエンドのみの作業のため、ユーザーからは見えません。しかし、これが完了することで次のフェーズから「どの記事を学習したか」「どのレッスンを完了したか」「どの記事をブックマークしたか」というデータを確実に保存できるようになります。

1. Supabase マイグレーション作成

   - `lesson_progress`, `article_progress`, `article_bookmarks` テーブル
   - インデックス作成
   - RLS (Row Level Security) ポリシー設定

2. TypeScript 型定義の更新
   - `src/integrations/supabase/types.ts` を更新
   - 進捗・ブックマークの型定義を追加

**成果物**:

- マイグレーションファイル
- 型定義ファイル

**所要時間**: 0.5 日

---

### フェーズ 2: ブックマーク機能 ⭐

**目的**: 最もシンプルで独立した機能から実装

**ユーザー体験**:
「後でもう一度見たい記事」「重要な記事」を保存できるようになります。

**使い方の例**:
1. ユーザーが記事を読んでいて「これは重要だな」と思ったら、ヘッダーの⭐アイコンをクリック
2. 「ブックマークに追加しました」というトースト通知が表示される
3. 後日、マイページの「ブックマーク」セクションからすぐにその記事に戻れる
4. もう一度⭐をクリックすればブックマークを解除できる

**注意**: 有料記事のブックマークは有料プラン限定です。フリープランのユーザーが有料記事をブックマークしようとすると、「この記事をブックマークするにはプランへの登録が必要です」と表示されます。

1. サービス層の実装

   - `src/services/bookmarks.ts` 作成
   - `toggleBookmark()`, `getBookmarks()`, `isBookmarked()`

2. UI 実装

   - ArticleDetail ページにブックマークボタン追加
   - アイコンの状態管理（ブックマーク済み/未）
   - トースト通知

3. 権限チェック
   - **重要**: 有料記事のブックマークはサブスクリプション必須
   - フリープランが有料記事をブックマークしようとしたら警告

**成果物**:

- `src/services/bookmarks.ts`
- ArticleDetail ページの更新
- ブックマークボタンコンポーネント

**所要時間**: 1 日

---

### フェーズ 3: 記事進捗管理 📹

**目的**: 記事レベルでの進捗を管理、レッスン完了への反映

**ユーザー体験**:
学習の進捗を記録できるようになり、「どの記事を完了したか」「どこまで学習したか」が一目でわかるようになります。

**使い方の例**:
1. ユーザーが初めて記事を開くと「視聴開始」ボタンが表示される
2. クリックすると記事が「視聴中」状態になり、ヘッダーに「視聴中」バッジが表示される
3. 動画を見終わったら「完了する」ボタンをクリック
4. 「この記事を完了しました！」というトースト通知が表示される
5. ヘッダーのバッジが「完了 ✓」に変わり、ボタンが「完了済み」（グレーアウト）になる
6. レッスン詳細ページに戻ると、完了した記事に✓マークがついている
7. レッスン内の全記事を完了すると、自動的にレッスン全体も「完了」になる

**プレミアム記事の場合**:
- フリープランのユーザーが有料記事を開くと、最初の30秒だけ視聴できる
- 「続きを見るにはプランへの登録が必要です」という案内と「プランを見る」ボタンが表示される
- 有料プランに登録すると、すぐに全編を視聴でき、進捗も保存される

1. サービス層の実装

   - `src/services/article-progress.ts` 作成
   - `updateArticleProgress()`: 進捗状態の更新
   - `markArticleAsCompleted()`: 記事を完了にする
   - `getArticleProgress()`: 進捗の取得
   - `getRecentArticles()`: 最近学習した記事を取得

2. ArticleDetail ページの更新

   - 「完了」ボタンの追加（動画下部）
   - 「視聴開始」ボタン（初回アクセス時に in_progress にする）
   - 進捗状態のバッジ表示

3. サブスクリプション連携

   - **記事へのアクセス制御**:
     - `article.isPremium && !canAccess` → プレビュー画面表示
     - プレビュー画面: 最初の 30 秒のみ視聴可能
     - 「続きを見るにはプラン登録」CTA 表示
   - **進捗の保存**: 有料記事の進捗は有料プランのみ保存

4. レッスン進捗への自動反映
   - 記事完了時に `calculateLessonProgress()` を実行
   - レッスンの全記事が完了したら自動で `lesson_progress.status = 'completed'`

5. UI フィードバック
   - 進捗状態のバッジ表示（未視聴/視聴中/完了）
   - 完了時のトースト通知「この記事を完了しました！」

**成果物**:

- `src/services/article-progress.ts`
- ArticleDetail ページの進捗管理機能
- プレミアム記事のアクセス制御
- プレビュー画面コンポーネント

**所要時間**: 2 日

---

### フェーズ 4: レッスン進捗管理 📚

**目的**: レッスン単位での進捗を自動計算・管理

**ユーザー体験**:
レッスン全体の進捗状況が視覚的にわかるようになり、「あとどれくらいで完了するか」が一目で把握できます。

**使い方の例**:

**レッスン一覧ページ（Lessons）**:
1. ユーザーがレッスン一覧を見ると、各レッスンカードに進捗バーが表示される
2. 例：「████████░░ 80%」のように、どれだけ進んだかが視覚的にわかる
3. 進行中のレッスンには「続きから」ボタンが表示され、クリックすると次に学習すべき記事に飛べる
4. フィルタで「未開始」「進行中」「完了」を切り替えられる
5. 完了したレッスンには「完了 ✓」バッジが表示される

**レッスン詳細ページ（LessonDetail）**:
1. ページ上部に「Progress: ████████░░░░ 65%」のように進捗バーが表示される
2. 各クエスト内の記事に進捗アイコンが表示される：
   - ✓ 完了した記事
   - ◐ 視聴中の記事
   - ○ 未視聴の記事
   - 🔒 アクセスできない有料記事（フリープランのみ）
3. 初めてレッスンを開いたとき「レッスンを開始」ボタンが表示され、クリックすると最初の記事に飛ぶ
4. 記事を完了するたびに進捗バーがリアルタイムで更新される
5. 全記事を完了すると、自動的にレッスンが「完了」状態になり、お祝いメッセージが表示される

**プレミアムレッスンの場合**:
- フリープランのユーザーは無料記事のみの進捗が表示される
- 有料記事には🔒アイコンがつき、クリックすると「プランへの登録」を促される
- 有料プランに登録すると、すぐに全記事の進捗が反映される

1. サービス層の実装

   - `src/services/lesson-progress.ts` 作成
   - `calculateLessonProgress()`: レッスンの進捗率を計算
   - `updateLessonStatus()`: レッスン状態の更新
   - `getLessonProgress()`: 進捗の取得

2. 進捗の自動計算ロジック

   ```typescript
   // レッスン進捗の計算
   function calculateLessonProgress(
     lesson: Lesson,
     articleProgresses: ArticleProgress[]
   ): number {
     const totalArticles = lesson.quests.flatMap((q) => q.articles).length;
     const completedArticles = articleProgresses.filter(
       (p) => p.status === "completed"
     ).length;
     return (completedArticles / totalArticles) * 100;
   }

   // 自動完了判定
   if (progress === 100 && lessonProgress.status !== "completed") {
     await updateLessonStatus(lessonId, "completed");
   }
   ```

3. LessonDetail ページの更新

   - 進捗バーの表示（0-100%）
   - 各クエスト・記事の進捗状態アイコン
   - 「レッスンを開始」ボタン（初回のみ）

4. Lessons ページの更新

   - 各レッスンカードに進捗バーを追加
   - 「続きから」ボタンの表示
   - フィルタ機能（未開始/進行中/完了）

5. サブスクリプション連携
   - **進捗率の計算**: アクセス可能な記事のみを対象にする
   - **プレミアムレッスンの表示**:
     - フリープラン: 無料記事のみカウント
     - 有料プラン: 全記事をカウント
   - **ロック表示**: アクセスできない記事には 🔒 アイコン

**成果物**:

- `src/services/lesson-progress.ts`
- LessonDetail ページの進捗表示
- Lessons ページの進捗バー追加

**所要時間**: 2 日

---

### フェーズ 5: マイページ/ダッシュボード 🏠

**目的**: ユーザーの学習状況を一覧表示

**ユーザー体験**:
自分の学習状況をひと目で把握できる「学習の本拠地」が完成します。今までバラバラだった情報が一箇所に集約され、次に何を学ぶべきかが明確になります。

**使い方の例**:

1. **ログイン後のホーム**:
   - サイドバーの「マイページ」をクリックすると、パーソナライズされたダッシュボードが表示される
   - 「こんにちは、〇〇さん！」という挨拶と現在のプラン（スタンダード、コミュニティなど）が表示される

2. **学習統計（一目でわかる達成状況）**:
   - 4つのカードで学習の成果が見える：
     - 「完了したレッスン: 5個」
     - 「学習時間: 3時間」
     - 「連続学習: 7日」
     - 「視聴した記事: 45個」
   - 数字が増えていくことでモチベーションが上がる

3. **現在進行中のレッスン**:
   - 今学習しているレッスンが進捗バー付きで表示される
   - 例：「デザイン基礎 ████████████░░░░ 75%」
   - 「続きから学習する →」ボタンをクリックすると、次の未完了記事に直接飛べる
   - 学習を再開するのがスムーズ

4. **ロードマップ（全体像の把握）**:
   - カテゴリ別にレッスンが整理されている
   - 例：「カテゴリ: デザイン基礎」「✓✓◐○○ 5レッスン中3完了」
   - どのカテゴリをどれだけ進めたかが一目でわかる
   - 次に学ぶべきレッスンを発見しやすい

5. **ブックマークした記事**:
   - 保存した重要な記事がリスト表示される
   - サムネイル、タイトル、所属レッスン、動画時間が見える
   - 「あの記事をもう一度見たい」というときにすぐアクセスできる

6. **最近学習した記事**:
   - 直近で視聴した記事が新しい順に表示される
   - 「2時間前」「昨日」などのタイムスタンプ付き
   - 復習したい記事に素早く戻れる

**プレミアム機能の案内**:
- フリープランのユーザーには「5個のプレミアムレッスンがあなたを待っています」という案内が表示される
- 「プランをアップグレード」ボタンから、簡単にプラン登録ページに移動できる
- 有料プランのユーザーには、全コンテンツへのフルアクセスが視覚的に示される

**体験の価値**:
- 散らばっていた学習情報が一箇所に集まる
- 次に何をすべきかが明確になり、学習を続けやすくなる
- 自分の成長を数字で確認でき、モチベーションが維持される
- お気に入りの記事や最近見た記事にすぐアクセスでき、復習が簡単

1. データ集約サービスの実装

   - `src/services/dashboard.ts` 作成
   - `getDashboardData()`: 全データを取得・集約
   - `getRecentArticles()`: 最近学習した記事
   - `getLearningStats()`: 学習統計の計算

2. MyPage コンポーネント作成

   - `src/pages/MyPage.tsx`
   - セクション構成:
     ```
     - ヘッダー: ユーザー名・サブスクリプション状態
     - 学習統計カード（完了レッスン数、総学習時間など）
     - 現在進行中のレッスン（進捗バー付き）
     - ロードマップ（カテゴリ別レッスン）
     - ブックマークした記事
     - 最近学習した記事
     ```

3. 各セクションのコンポーネント分割

   - `src/components/dashboard/StatsCards.tsx`
   - `src/components/dashboard/ActiveLessons.tsx`
   - `src/components/dashboard/Roadmap.tsx`
   - `src/components/dashboard/BookmarkedArticles.tsx`
   - `src/components/dashboard/RecentArticles.tsx`

4. サブスクリプション連携

   - **プランステータスカード**:
     - 現在のプラン表示
     - プランのアップグレード/ダウングレード誘導
   - **アクセス制限の表示**:
     - 「○ 個のプレミアムレッスンがあなたを待っています」
     - アップグレード CTA
   - **進捗データのフィルタリング**:
     - アクセス可能なコンテンツのみを進捗に含める

5. ルーティング設定
   - `/my` または `/dashboard` にマイページを配置
   - サイドバーナビゲーションに追加

**成果物**:

- `src/pages/MyPage.tsx`
- ダッシュボードコンポーネント群
- データ集約サービス

**所要時間**: 3 日

---

### フェーズ 6: サブスクリプション連携の強化 💳

**目的**: プラン別のアクセス制御を完全に実装

**ユーザー体験**:
有料コンテンツと無料コンテンツが明確に区別され、フリープランのユーザーは「プランに登録するとこんな内容が学べる」ということが具体的にわかるようになります。一方、有料プランのユーザーは全コンテンツへのフルアクセスを実感できます。

**フリープランのユーザー体験**:

1. **レッスン一覧ページ**:
   - 一部のレッスンカードに「🔒 プレミアム」バッジがついている
   - バッジをホバーすると「このレッスンには有料記事が含まれています」と表示される
   - 無料記事だけのレッスンと、有料記事を含むレッスンが一目でわかる

2. **レッスン詳細ページ**:
   - 無料記事は普通に表示され、クリックして視聴できる
   - 有料記事には🔒アイコンと「プレミアム限定」ラベルがついている
   - クリックすると、プレビュー画面が表示される

3. **記事詳細ページ（有料記事）**:
   - 最初の30秒だけ視聴できる
   - 30秒が経過すると動画が一時停止する
   - 画面に「この続きを見るにはプレミアムプランが必要です」というメッセージが表示される
   - 「プランを見る」ボタンをクリックすると、プラン選択ページに移動
   - プランの価値を具体的に感じてもらえる

4. **マイページ**:
   - 「5個のプレミアムレッスンがあなたを待っています」という案内カード
   - 「アップグレードして全コンテンツにアクセス」ボタン
   - 無料で学習できる内容と、プランに登録すると学べる内容が明確に区別される

**有料プランのユーザー体験**:
1. すべてのレッスンと記事に制限なくアクセスできる
2. 🔒アイコンは表示されない
3. 「プレミアム」バッジは表示されるが、デザイン的に「このコンテンツはあなた専用」という特別感を演出
4. マイページには「スタンダードプラン」などのバッジが誇らしげに表示される

**体験の価値**:
- フリープランのユーザー: 無料コンテンツだけでも価値を感じつつ、有料プランへの興味が湧く
- 有料プランのユーザー: 全コンテンツへのフルアクセスを実感し、プランの価値を継続的に感じる
- プラン登録への誘導が押し付けがましくなく、自然に行われる

1. コンテンツアクセス制御の実装

   - `src/utils/subscription-guard.ts` 作成
   - `canAccessArticle()`: 記事アクセス権限の判定
   - `canAccessLesson()`: レッスンアクセス権限の判定
   - `getPremiumArticleCount()`: プレミアム記事数の取得

2. プレミアムコンテンツ UI の実装

   - `src/components/premium/PremiumBadge.tsx`: 「プレミアム」バッジ
   - `src/components/premium/LockedArticleCard.tsx`: ロックされた記事カード
   - `src/components/premium/UpgradeCTA.tsx`: アップグレード誘導

3. 既存ページへの統合

   - **Lessons ページ**: プレミアムバッジの追加
   - **LessonDetail ページ**: ロックされた記事の表示
   - **ArticleDetail ページ**: アクセス制限画面

4. プレビュー機能の実装（オプション）
   - 有料記事の最初の 30 秒のみ視聴可能
   - 「続きを見るにはプラン登録」の表示
   - Vimeo の埋め込みパラメータで再生時間を制限

**成果物**:

- サブスクリプションガード関数
- プレミアム UI コンポーネント
- 既存ページへのアクセス制御統合

**所要時間**: 2 日

---

### フェーズ 7: 最適化・テスト・ドキュメント 🔧

**目的**: パフォーマンス最適化と品質保証

**ユーザー体験**:
すべての機能がスムーズに動作し、ストレスなく学習できる環境が整います。エラーが起きても適切なメッセージが表示され、ユーザーが困らないようになります。

**改善される体験**:

1. **パフォーマンス向上**:
   - ページの読み込みが速くなる
   - 進捗バーの更新が瞬時に反映される
   - マイページの表示がスムーズになる
   - データ取得時の待ち時間が減る

2. **エラー時の対応**:
   - ネットワークが切れても「オフラインです。接続を確認してください」と優しく通知
   - 進捗保存に失敗しても自動でリトライし、成功したら通知
   - サブスクリプションが期限切れになったら「プランの更新が必要です」と案内
   - エラーメッセージがわかりやすく、次のアクションが明確

3. **ローディング状態の改善**:
   - データ読み込み中はスケルトンスクリーンが表示され、ガタつきがない
   - ボタンをクリックしたら「処理中...」と表示され、二重クリックを防ぐ
   - 長い処理（レッスン完了など）では進捗インジケーターが表示される

4. **通知の統一**:
   - すべての成功通知が同じスタイルで表示される（「✓ 完了しました」）
   - エラー通知も統一されたスタイル（「⚠ エラーが発生しました」）
   - 通知は自動で消え、邪魔にならない

**体験の価値**:
- ストレスなく学習に集中できる
- 何か問題が起きても、すぐに解決方法がわかる
- システムが「ちゃんと動いている」という安心感がある
- 細かい部分まで磨かれた、プロフェッショナルな体験

1. パフォーマンス最適化

   - 進捗データのキャッシング（React Query）
   - バッチ処理での進捗更新
   - 不要な再レンダリングの削減

2. エラーハンドリング

   - ネットワークエラー時の処理
   - サブスクリプション期限切れの通知
   - 進捗保存失敗時のリトライ

3. ユーザーフィードバック

   - ローディング状態の改善
   - トースト通知の統一
   - エラーメッセージの改善

4. ドキュメント作成
   - 開発者向けドキュメント（API 仕様）
   - ユーザー向けヘルプ（進捗管理の使い方）

**所要時間**: 1.5 日

---

## 6. 各機能の詳細仕様

### 6.1 ブックマーク機能

#### API 設計

```typescript
// src/services/bookmarks.ts

/**
 * 記事をブックマーク/解除する
 * @param articleId 記事ID
 * @param lessonId レッスンID
 * @returns 成功/失敗
 */
export async function toggleBookmark(
  articleId: string,
  lessonId: string
): Promise<{ success: boolean; isBookmarked: boolean }> {
  // 1. 認証チェック
  // 2. サブスクリプションチェック（有料記事の場合）
  // 3. ブックマークの存在確認
  // 4. 追加/削除の実行
}

/**
 * ユーザーのブックマーク一覧を取得
 */
export async function getBookmarks(): Promise<Bookmark[]> {
  // 1. Supabaseから取得
  // 2. Sanityから記事詳細を取得
  // 3. 結合して返す
}

/**
 * 記事がブックマーク済みかチェック
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  // DBから確認
}
```

#### UI 仕様

**ArticleDetail ページ**:

- ヘッダー右上にブックマークアイコン
- ブックマーク済み: ⭐ (黄色)
- 未ブックマーク: ☆ (グレー)
- クリック時: トグル + トースト表示

**MyPage のブックマークセクション**:

```
📚 ブックマーク
┌─────────────────────────────────────┐
│ [サムネイル] タイトル             → │
│ レッスン名 | 5分                    │
├─────────────────────────────────────┤
│ [サムネイル] タイトル             → │
│ レッスン名 | 10分                   │
└─────────────────────────────────────┘
```

---

### 6.2 記事進捗管理

#### API 設計

```typescript
// src/services/article-progress.ts

/**
 * 記事の進捗を更新
 */
export async function updateArticleProgress(
  articleId: string,
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
  questId?: string
): Promise<{ success: boolean }> {
  // 1. 認証チェック
  // 2. サブスクリプションチェック（有料記事の場合）
  // 3. DBに保存
  // 4. status='completed'の場合、レッスン進捗の再計算をトリガー
}

/**
 * 記事を完了にする（完了ボタン用）
 */
export async function markArticleAsCompleted(
  articleId: string,
  lessonId: string,
  questId?: string
): Promise<{ success: boolean }> {
  // updateArticleProgress()を'completed'で呼び出す
  return updateArticleProgress(articleId, lessonId, "completed", questId);
}

/**
 * 記事の進捗を取得
 */
export async function getArticleProgress(
  articleId: string
): Promise<ArticleProgress | null> {
  // DBから取得
}

/**
 * 最近学習した記事を取得（マイページ用）
 */
export async function getRecentArticles(limit: number = 5): Promise<Article[]> {
  // article_progressからupdated_atで並び替えて取得
  // Sanityから記事詳細を取得して結合
}
```

#### UI 仕様

**ArticleDetail ページ**:

- 動画プレーヤー下に「完了」ボタン
  - 初回アクセス: 「視聴開始」→ status='in_progress'
  - 視聴中: 「完了する」→ status='completed'
  - 完了済み: 「完了済み ✓」（グレーアウト）
- ヘッダーに進捗バッジ: `未視聴` | `視聴中` | `完了 ✓`
- 完了時にトースト通知: 「この記事を完了しました！」

**記事完了の流れ**:

```typescript
// ArticleDetailページ内

const handleComplete = async () => {
  // 記事を完了にする
  const result = await markArticleAsCompleted(articleId, lessonId, questId);

  if (result.success) {
    // トースト表示
    toast.success("この記事を完了しました！");

    // レッスン進捗が自動的に再計算される
    // 全記事完了の場合、レッスンも完了になる
  }
};
```

---

### 6.3 レッスン進捗管理

#### API 設計

```typescript
// src/services/lesson-progress.ts

/**
 * レッスンの進捗を計算
 */
export async function calculateLessonProgress(
  lessonId: string,
  userId: string
): Promise<{
  totalArticles: number;
  completedArticles: number;
  progressPercentage: number;
  accessibleArticles: number; // サブスクリプション考慮
}> {
  // 1. Sanityからレッスン・記事を取得
  // 2. article_progressから完了状態を取得
  // 3. サブスクリプション状態を考慮
  // 4. 進捗率を計算
}

/**
 * レッスンステータスを更新
 */
export async function updateLessonStatus(
  lessonId: string,
  status: "not_started" | "in_progress" | "completed"
): Promise<void> {
  // DBに保存
}
```

#### UI 仕様

**LessonDetail ページ**:

```
Progress: ████████░░░░ 65%

Quest 1: はじめに
  ✓ Article 1 (完了)
  ◐ Article 2 (視聴中 50%)
  ○ Article 3 (未視聴)
  🔒 Article 4 (プレミアム限定) ← フリープランのみ表示

Quest 2: 実践編
  ...
```

**Lessons ページ**:

```
┌───────────────────────────────┐
│ [アイコン] レッスンタイトル 🔒│  ← プレミアムバッジ
│ ████████░░ 80%               │  ← 進捗バー
│ カテゴリ | 10記事            │
└───────────────────────────────┘
```

---

### 6.4 マイページ/ダッシュボード

#### データ取得

```typescript
// src/services/dashboard.ts

export async function getDashboardData(): Promise<DashboardData> {
  return {
    stats: {
      completedLessons: number,
      totalLearningTime: number, // 秒
      currentStreak: number, // 連続学習日数
      totalArticles: number,
    },
    activeLessons: Lesson[], // 進行中のレッスン
    bookmarkedArticles: Article[],
    recentArticles: Article[], // 最近学習した記事
    roadmap: RoadmapData, // カテゴリ別レッスン
    subscription: SubscriptionState,
  };
}
```

#### UI 構成

```
┌─────────────────────────────────────────┐
│ こんにちは、〇〇さん！                 │
│ [プランバッジ: スタンダード]           │
└─────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ 完了     │ 学習時間 │ 連続学習 │ 総記事数 │
│ 5レッスン│ 3時間    │ 7日      │ 45記事   │
└──────────┴──────────┴──────────┴──────────┘

📖 現在進行中のレッスン
┌─────────────────────────────────────┐
│ レッスンタイトル                   │
│ ████████████░░░░ 75%              │
│ [続きから学習する →]              │
└─────────────────────────────────────┘

🗺️ ロードマップ
┌─────────────────────────────────────┐
│ カテゴリ: デザイン基礎             │
│ ✓✓◐○○ 5レッスン中3完了            │
└─────────────────────────────────────┘

⭐ ブックマーク
┌─────────────────────────────────────┐
│ [サムネイル] 記事タイトル         │
│ レッスン名 | 5分                   │
└─────────────────────────────────────┘

🕐 最近学習した記事
┌─────────────────────────────────────┐
│ [サムネイル] 記事タイトル         │
│ 2時間前                            │
└─────────────────────────────────────┘
```

---

### 6.5 サブスクリプション連携

#### アクセス制御の実装

```typescript
// src/utils/subscription-guard.ts

export function canAccessArticle(
  article: Article,
  subscription: SubscriptionState
): boolean {
  // 無料記事は誰でもOK
  if (!article.isPremium) return true;

  // 有料記事は有料プラン必須
  return subscription.isSubscribed && subscription.planType !== "free";
}

export function canAccessLesson(
  lesson: Lesson,
  subscription: SubscriptionState
): "full" | "partial" | "none" {
  const articles = lesson.quests.flatMap((q) => q.articles);
  const accessibleCount = articles.filter((a) =>
    canAccessArticle(a, subscription)
  ).length;

  if (accessibleCount === 0) return "none";
  if (accessibleCount === articles.length) return "full";
  return "partial";
}
```

#### プレミアム記事の表示パターン

**パターン A: 完全ロック**

```
┌─────────────────────────────────────┐
│          🔒                         │
│   この記事はプレミアム限定です      │
│                                     │
│   [プランを見る]                    │
└─────────────────────────────────────┘
```

**パターン B: プレビュー表示（推奨）**

```
┌─────────────────────────────────────┐
│ [動画プレーヤー - 30秒のみ]        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                     │
│ この続きを見るには                 │
│ プレミアムプランが必要です          │
│                                     │
│ [プランを見る]                      │
└─────────────────────────────────────┘
```

---

## 7. 実装の優先順位まとめ

### 必須機能（MVP）

1. ✅ データベース・基盤整備
2. ✅ 記事進捗管理
3. ✅ サブスクリプション連携（アクセス制御）
4. ✅ レッスン進捗管理

### 重要機能

5. ✅ マイページ/ダッシュボード
6. ✅ ブックマーク機能

### 追加機能（余裕があれば）

7. プレビュー機能（有料記事の 30 秒視聴）
8. 学習統計の詳細分析
9. 連続学習日数・バッジ機能
10. 学習リマインダー通知

---

## 8. 技術スタック

- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Auth + Edge Functions)
- **CMS**: Sanity.io
- **決済**: Stripe
- **動画**: Vimeo Embed
- **状態管理**: React Query + Context API

---

## 9. 次のアクション

このドキュメントを確認後、以下を決定してください:

1. **実装順序の確認**: フェーズ 1 から順番に進めて良いか？
2. **スコープの調整**: 削りたい機能・追加したい機能はあるか？
3. **デザイン仕様**: UI デザインは既存のデザインシステムに従うか？
4. **プレビュー機能**: 有料記事の 30 秒プレビューは実装するか？

確認後、フェーズ 1 のデータベース設計から実装を開始します。
