# 【完全リライト版】BONO トレーニングシステム仕様書

## ⭐️ システム概要

### 目的とポジショニング

UI/UX デザイン学習プラットフォーム **BONO** に、"ハンズオン特化" の **筋トレ型トレーニング** コンテンツを提供する。

- 小粒かつ実践的なチャレンジ（例: 「ToDo サービスを作ろう」）を繰り返し、**アウトプット量とフィードバック速度を最大化**
- サイト外の SNS やポートフォリオで成果物を公開 → キャリア支援やコミュニティ活性へつなげる

### バリュー差別化

| 視点                       | 既存 Courses / Series | 新 Training                                    |
| -------------------------- | --------------------- | ---------------------------------------------- |
| 学習スタイル               | "体系的ロードマップ"  | "短期集中・実践演習"                           |
| コンテンツ粒度             | 10–20 本 / Course     | 1–3 本 / Challenge                             |
| UI トーン & ブランディング | 落ち着いた教育サイト  | 軽快・ゲーミフィケーション（例: レベルバッジ） |
| ユースケース               | 体系的に学びたい      | 毎日 30 分のデザイン筋トレ                     |
| KPI                        | Course 完走率, 課金率 | Challenge 完遂率, SNS 共有件数                 |

---

## 🏗️ 既存 BONO との関係性

### ドメイン & URL

- 既存サイト: `https://bono.design`
- Training: `https://bono.design/training/*` （同ドメイン配下・サブディレクトリ）

### 共有レイヤー

| レイヤー                 | 共有方法                                                                   |
| ------------------------ | -------------------------------------------------------------------------- |
| **認証**                 | Supabase AuthContext を最上位で共通提供                                    |
| **課金/プラン**          | Stripe → Supabase `subscriptions` テーブル。`plan_members=true` で権限制御 |
| **ユーザープロフィール** | `public.users` テーブルを共用（アバター, DisplayName）                     |
| **Notification**         | 共通 Slack / Mailgun キュー                                                |

### 独立レイヤー

| レイヤー         | 実装方針                                              |
| ---------------- | ----------------------------------------------------- |
| **ファイル構造** | `content/training/*` でコンテンツ管理                 |
| **SEO メタ**     | Training 専用 `title`, `description`, Open Graph 画像 |

---

## 📁 ファイル構造設計

### Supabase Storage 構造

```
content/training/
├── ui-todo/                        # Training（英語・小文字・ハイフン）
│   ├── index.md                    # Training全体の説明
│   └── tasks/
│       ├── 01-introduction/        # Task（番号-英語名）
│       │   └── content.md          # Task内容
│       ├── 02-advanced/
│       │   └── content.md
│       └── 03-premium/
│           └── content.md
├── figma-basics/
│   ├── index.md
│   └── tasks/
│       ├── 01-getting-started/
│       │   └── content.md
│       └── 02-tools-overview/
│           └── content.md
```

### 命名規則

- **Training 名**: 英語・小文字・ハイフン区切り（例: `ui-todo`, `figma-basics`）
- **Task 名**: 番号-英語名（例: `01-introduction`, `02-advanced`）
- **ファイル名**: `index.md`（Training 説明）、`content.md`（Task 内容）

---

## 📝 Markdown ファイル仕様

### Training 説明ファイル（index.md）

```markdown
---
title: "TodoアプリUI制作"
description: "実践的なTodoアプリのUIデザインを学ぶ"
type: "challenge"
difficulty: "normal"
tags: ["ui", "todo", "実践"]
estimated_total_time: "2時間"
task_count: 3
---

# Todo アプリ UI 制作

実際に使える Todo アプリの UI デザインを作りながら、
実践的な UI 設計スキルを身につけます。

## 学習内容

- ユーザビリティを考慮した UI 設計
- 効果的な情報整理
- モバイルファーストデザイン

## 完成後のスキル

- 実用的なアプリ UI が作れる
- ユーザーの使いやすさを考慮したデザインができる
```

### Task 内容ファイル（content.md）

#### 無料タスクの例

```markdown
---
title: "はじめに"
slug: "introduction"
order: 1
is_premium: false
difficulty: "easy"
estimated_time: "60分"
tags: ["ui", "基本"]
video_preview: ""
video_full: ""
---

# はじめに

このタスクでは、Todo アプリの基本的な画面構成を学びます。

## 学習内容

- 画面の構成要素
- 基本的なレイアウト
- 色の使い方

## 手順

1. Figma で新しいファイルを作成
2. 画面サイズを設定（375×667px）
3. ヘッダーエリアを作成
4. メインコンテンツエリアを配置

## 完成イメージ

（ここに画像やスクリーンショットを挿入）

## 次のステップ

次のタスクでは、より詳細なコンポーネント設計を学びます。
```

#### 有料タスクの例

```markdown
---
title: "プロの実践テクニック"
slug: "pro-techniques"
order: 3
is_premium: true
difficulty: "hard"
estimated_time: "90分"
tags: ["上級", "プロ技術"]
video_preview: "https://storage.supabase.co/preview.mp4"
video_full: "https://storage.supabase.co/full.mp4"
---

# プロの実践テクニック

実際の制作現場で使われる高度なテクニックを学びます。

## 基本的な内容

ここは無料ユーザーにも見せる基本的な説明...

## 詳細な実践内容

ここから先の詳細な手順やプロの秘訣は、有料ユーザーのみに表示されます。

（システムが自動で無料ユーザーには途中まで表示し、
有料ユーザーには全内容を表示します）
```

### Front-matter 項目一覧

#### Training 用（index.md）

| 項目                   | 意味       | 例                       | 必須 |
| ---------------------- | ---------- | ------------------------ | ---- |
| `title`                | タイトル   | "Todo アプリ UI 制作"    | ✅   |
| `description`          | 説明       | "実践的な..."            | ✅   |
| `type`                 | タイプ     | "challenge", "skill"     | ✅   |
| `difficulty`           | 難易度     | "easy", "normal", "hard" | ⭐   |
| `tags`                 | タグ       | ["ui", "todo"]           | ⭐   |
| `estimated_total_time` | 総所要時間 | "2 時間"                 | ⭐   |
| `task_count`           | タスク数   | 3                        | ❌   |

#### Task 用（content.md）

| 項目             | 意味               | 例                       | 必須 |
| ---------------- | ------------------ | ------------------------ | ---- |
| `title`          | タイトル           | "はじめに"               | ✅   |
| `slug`           | URL 用の名前       | "introduction"           | ✅   |
| `order`          | 表示順序           | 1, 2, 3...               | ✅   |
| `is_premium`     | 有料かどうか       | true / false             | ✅   |
| `difficulty`     | 難易度             | "easy", "normal", "hard" | ⭐   |
| `estimated_time` | 所要時間           | "30 分"                  | ⭐   |
| `tags`           | タグ               | ["ui", "figma"]          | ⭐   |
| `video_preview`  | プレビュー動画 URL | "https://..."            | ❌   |
| `video_full`     | フル動画 URL       | "https://..."            | ❌   |

**凡例**: ✅ 必須、⭐ 推奨、❌ オプション

---

## 🔐 権限制御・セキュリティ設計

### 権限体系（統一）

```typescript
// 統一された権限チェック
const hasAccess = user?.subscription?.plan_members === true;

if (!hasAccess && task.is_premium) {
  // 無料ユーザー: 途中まで表示 + ゲートバナー
  return {
    content: body.substring(0, 300) + "...",
    showGate: true,
  };
} else {
  // 有料ユーザー: 全内容表示
  return {
    content: body,
    showGate: false,
  };
}
```

### 既存 subscriptions テーブル拡張

```sql
-- 既存テーブルに列追加
alter table public.subscriptions
  add column plan_members boolean default false;
```

---

## 🌐 URL・ページ構造設計

### URL 構造

```
/training                           # Training一覧
/training/ui-todo                   # Training詳細（タスク一覧）
/training/ui-todo/introduction      # Task詳細
/training/ui-todo/advanced          # Task詳細
```

### ページ構成

| Route                                 | コンポーネント     | 主な責務                      |
| ------------------------------------- | ------------------ | ----------------------------- |
| `/training`                           | `<TrainingHome>`   | Training 一覧・フィルタ・検索 |
| `/training/[trainingSlug]`            | `<TrainingDetail>` | Training 概要・タスク一覧     |
| `/training/[trainingSlug]/[taskSlug]` | `<TaskPage>`       | Task 内容・動画・ゲートバナー |

---

## 🛠️ 主要機能仕様

### 機能一覧

| ID      | 機能ブロック                | ユーザーストーリー & 価値                                                                 | 主な UI / API                                         | データ & 権限                           |
| ------- | --------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------- |
| **A01** | **アカウント共通化**        | As a 既存受講者, I want to use the same BONO account on Training pages.                   | `<AuthProvider>`（Supabase）                          | `public.users` (共通)                   |
| **S01** | **「members」購読権限**     | As a Pro 会員, I can view **paid training tasks**.<br>As a Free 会員, I can preview them. | `SubscriptionGuard role="members"`                    | `subscriptions.plan_members=true`       |
| **T01** | **Training カタログ**       | ブラウズ & フィルタで「チャレンジ」「スキル」2 タイプのトレーニングを選べる。             | `/training` (`<TrainingTabs>`, `<TagFilter>`)         | front-matter: `type: challenge / skill` |
| **T02** | **Training 詳細**           | 一覧で複数のお題 (Task) を確認し、順番に取り組む。                                        | `/training/[trainingSlug]` (`<TaskList>`)             | `index.md` (tasks[])                    |
| **T03** | **Task（お題）ページ**      | タイトル・カテゴリ・説明・ポイント・ナレッジを読んで実装開始。                            | `/training/[trainingSlug]/[taskSlug]`                 | `tasks/*/content.md`                    |
| **G01** | **有料 Task ゲート**        | Free 会員でも Task ページを開けるが、本文は `<GateBanner>` で途中ロック。                 | `<GateBanner>` (`plan_members` 判定)                  | `is_premium: true`                      |
| **C01** | **Markdown コンテンツ管理** | 記事型 Task を Markdown で記述。AI／Cursor と親和性 ◎                                     | `content/training/<training>/tasks/<task>/content.md` | Front-matter schema                     |

### 権限制御ロジック

```typescript
const isMember = user?.subscription?.plan_members === true;

if (!isMember && task.is_premium) {
  showPreview(); // タイトル・概要のみ
  render(<GateBanner />);
} else {
  render(<TaskBody />); // 全文 + 動画
}
```

---

## 📊 データベース設計

### 既存テーブルの活用

#### subscriptions テーブル拡張

```sql
-- Training用権限列を追加
alter table public.subscriptions
  add column plan_members boolean default false;
```

### Phase 2 で追加予定（現在は実装しない）

#### 進捗管理テーブル（将来的）

```sql
-- Phase 2で実装予定
create table public.user_progress (
  user_id uuid references auth.users (id) on delete cascade,
  training_slug text not null,
  task_slug text not null,
  status text check (status in ('done','todo')) default 'todo',
  completed_at timestamptz,
  primary key (user_id, training_slug, task_slug)
);
```

---

## 💻 システム実装仕様

### コンテンツ取得 API 設計

```typescript
// 統一されたコンテンツ取得関数
async function getTaskContent(
  trainingSlug: string,
  taskSlug: string,
  userHasAccess: boolean
): Promise<TaskContent> {
  // Supabase Storageからファイル取得
  const { data, error } = await supabase.storage
    .from("content")
    .download(`training/${trainingSlug}/tasks/${taskSlug}/content.md`);

  if (error) throw error;

  // Markdownとfront-matterを解析
  const { frontMatter, body } = parseMarkdown(await data.text());

  // 有料制御
  if (frontMatter.is_premium && !userHasAccess) {
    return {
      ...frontMatter,
      content: body.substring(0, 300) + "...",
      showGate: true,
      video: frontMatter.video_preview || "",
    };
  }

  return {
    ...frontMatter,
    content: body,
    showGate: false,
    video: frontMatter.video_full || frontMatter.video_preview || "",
  };
}
```

### 主要コンポーネント設計

```typescript
// ゲートバナーコンポーネント
interface GateBannerProps {
  title: string;
  description: string;
}

function GateBanner({ title, description }: GateBannerProps) {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold">🔒 有料会員限定コンテンツ</h3>
      <p className="mt-2">{description}</p>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        今すぐアップグレード
      </button>
    </div>
  );
}
```

---

## 📱 コンテンツ管理・運用フロー

### あなたの作業手順

1. **ローカルでファイル作成**: Cursor で .md ファイルを作成・編集
2. **内容確認**: Cursor のマークダウンプレビューで確認
3. **Supabase にアップロード**: 管理画面で該当フォルダにアップロード
4. **サイトで最終確認**: 実際の表示・権限制御をチェック

### 新しい Training 作成手順

1. **企画**: Training 名、タスク構成を決める
2. **フォルダ作成**: Supabase で `content/training/新training名/` 作成
3. **index.md 作成**: Training 全体の説明を作成
4. **タスク作成**: `tasks/01-taskname/content.md` を順次作成
5. **アップロード**: 全ファイルを Supabase にアップロード
6. **動作確認**: サイトで表示・権限制御確認

---

## 🚀 実装フェーズ計画

### Phase 1: 基盤構築（シンプル版）

**目的**: 最小限で動作するシステム

#### 実装項目

- [ ] Supabase Storage 設定・RLS 設定
- [ ] Markdown ファイル取得 API
- [ ] Training 一覧ページ
- [ ] Training 詳細ページ
- [ ] Task 詳細ページ
- [ ] 基本的な有料/無料制御

#### 成果物

- Training/Task 表示機能
- 基本的な権限制御
- コンテンツアップロード・表示フロー

### Phase 2: 機能拡張（将来的）

**目的**: ユーザー体験向上

#### 実装項目（後から追加可能）

- [ ] 進捗管理機能（チェックボックス・進捗バー）
- [ ] SNS シェア機能
- [ ] 検索・フィルタ機能
- [ ] タグ別一覧機能
- [ ] 動画プレイヤー機能

---

## 🎯 成功指標（KPI）

### Phase 1 目標

- [ ] Training/Task 表示の正常動作
- [ ] 有料/無料制御の確実な動作
- [ ] コンテンツアップロード・更新フローの確立

### 将来的な目標（Phase 2 以降）

- Challenge 完遂率: ≥ 60%
- 無料 → 有料転換率: ≥ 5%
- ユーザー満足度: ≥ 4.0/5.0

---

## 📚 サンプルコンテンツ

### Training 説明例（ui-todo/index.md）

```markdown
---
title: "TodoアプリUI制作チャレンジ"
description: "実践的なTodoアプリのUIデザインを3ステップで学ぶ"
type: "challenge"
difficulty: "normal"
tags: ["ui", "todo", "実践"]
estimated_total_time: "3時間"
task_count: 3
---

# Todo アプリ UI 制作チャレンジ

実際に使える Todo アプリの UI を作りながら、実践的なデザインスキルを身につけます。

## このチャレンジで学べること

- ユーザーフローを考慮した UI 設計
- 効率的なレイアウト手法
- アクセシビリティを考慮したデザイン

## 完成後のスキル

- 実用的なアプリ UI が作れるようになる
- ユーザビリティを意識したデザインができる
- Figma の実践的な機能を使いこなせる
```

### Task 例（tasks/01-introduction/content.md）

```markdown
---
title: "Todoアプリの基本画面を作ろう"
slug: "introduction"
order: 1
is_premium: false
difficulty: "easy"
estimated_time: "60分"
tags: ["ui", "基本", "figma"]
video_preview: ""
video_full: ""
---

# Todo アプリの基本画面を作ろう

このタスクでは、シンプルな Todo アプリのメイン画面をデザインします。

## 作るもの

- タスク一覧表示エリア
- 新規タスク追加ボタン
- シンプルなヘッダー

## 手順

1. Figma で新しいファイルを作成（375×667px）
2. ヘッダーエリアの作成
3. タスクリストのレイアウト
4. 追加ボタンの配置

## 完成イメージ

（ここに完成イメージ画像）

## ポイント

- 16px グリッドを意識したレイアウト
- タップしやすいボタンサイズ（44px 以上）
- 見やすいフォントサイズ（14px 以上）
```

---

## 🔧 技術的考慮事項

### パフォーマンス

- Markdown ファイルのキャッシュ戦略
- 画像・動画の最適化
- CDN 活用の検討

### セキュリティ

- RLS による確実なアクセス制御
- 有料コンテンツの漏洩防止
- API エンドポイントの認証

### 拡張性

- 新しい front-matter 項目の追加容易性
- 複数 Training タイプへの対応
- 国際化対応の準備

### 保守性

- 統一されたファイル構造
- 明確な命名規則
- ドキュメント化された運用フロー

---

この仕様書により、矛盾のない統一された Training システムの実装が可能になります。Phase 1 から段階的に開発を進め、将来的な機能拡張にも対応できる設計となっています。
