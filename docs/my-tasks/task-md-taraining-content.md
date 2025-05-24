# マークダウンファイルで Training コンテンツを管理・表示する

以下の仕組みを実装して、マークダウンファイルで Training コンテンツを管理・表示できるようにしたいです。

# トレーニングコンテンツ管理システム実装方針

### 1. **何を作るか（ゴール・要件定義）**

#### 1.1 基本的な要件

- [ ] マークダウンファイルでトレーニングコンテンツを作成・管理したい
- [ ] 無料ユーザーと有料ユーザーでコンテンツを出し分けたい
  - [ ] 無料有料の出しわけは bo-no.design の members 権限
  - [ ] video_preview: 無料ユーザー用の動画、video_full：有料ユーザー用の動画
- [ ] セキュアに有料コンテンツを保護したい（Supabase Storage を非公開設定＋ Edge 関数経由）
- [ ] 新しいコンテンツを簡単に追加できるようにしたい

#### 1.2 具体的にできるようになること

- **コンテンツ作成**: Cursor でマークダウンファイルを書く
- **ファイル管理**: Supabase Storage にアップロードして管理
- 無料/有料制御: is_premium: true/false + <!-- PREMIUM_ONLY --> で切り分け
- **無料/有料制御**: `is_premium: true/false`で簡単に設定
- **自動表示**: 書いたファイルがサイトに自動で表示される

### 2. **ファイルをどう整理するか（構造設計）**

#### 2.1 Supabase Storage 構造（確定版）

```
content/training/
├── todo-app/                    # Training名（英語・小文字・ハイフン）
│   ├── index.md                 # Training全体の説明
│   └── tasks/
│       ├── 01-introduction/     # タスク（番号-英語名）
│       │   └── content.md       # タスクの内容
│       ├── 02-advanced/
│       │   └── content.md
│       └── 03-premium/
│           └── content.md
├── figma-basics/
│   ├── index.md
│   └── tasks/
│       └── 01-getting-started/
│           └── content.md
```

#### 2.2 命名ルール

- **Training 名**: `todo-app`, `figma-basics`（英語・小文字・ハイフン区切り）
- **タスク名**: `01-introduction`, `02-advanced`（番号-英語名）
- **ファイル名**: `index.md`（Training 説明）、`content.md`（タスク内容）

#### 2.3 URL 対応

- Training 一覧: `/training`
- Training 詳細: `/training/todo-app`
- Task 詳細: `/training/todo-app/introduction`

---

### 3. **どう書くか（マークダウン記述ルール）**

#### 3.1 Training 説明ファイル（index.md）のテンプレート

```markdown
---
title: "TodoアプリUI制作"
description: "実践的なTodoアプリのUIデザインを学ぶ"
type: "challenge"
difficulty: "normal"
tags: ["ui", "todo", "実践"]
estimated_total_time: "2時間"
task_count: 2
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

#### 3.2 タスク内容ファイル（content.md）のテンプレート

**無料タスクの場合**

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

**有料タスクの場合**

```markdown
---
title: "プロの実践テクニック"
slug: "pro-techniques"
order: 3
is_premium: true
difficulty: "hard"
estimated_time: "90分"
tags: ["上級", "プロ技術"]
video_preview: "https://.../preview.mp4"
video_full: "https://.../full.mp4"
---

# プロの実践テクニック

このタスクでは、プロが実際に使う技術を解説します。

## 基本内容（無料ユーザーにも表示）

- 画面設計の考え方
- ワイヤーフレームの整理法

<!-- PREMIUM_ONLY -->

## 実践内容（有料ユーザーのみに表示）

ここからは有料ユーザー限定の情報です：

- 高速なレイアウト調整法
- 実案件での UI 改善ポイント
```

#### 3.3 Front-matter 設定項目一覧

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

## 出し分けの実装仕様

### 4.1 セキュリティ設計

項目 内容

- Storage Supabase Storage を「非公開バケット（authenticated access）」で運用
- アクセス経路 クライアント → Edge 関数 → Storage 読込
- 直アクセス不可 クライアントから直接 .md や動画 URL にアクセス不可にする
- 認証 Edge 関数内で Supabase Auth を用いて isPremiumUser を確認
- 表示切り替え マークダウンの <!-- PREMIUM_ONLY --> を基準に分割し、必要な範囲だけレスポンスに含める

### 4.2 表示切り替えロジック

ユーザー種別 本文 動画

- 無料ユーザー <!-- PREMIUM_ONLY --> より前のみ video_preview を表示
- 有料ユーザー 全文 video_full を表示

### 4-3 Edge 関数での処理イメージ → 参考に

// pseudocode
const { user } = await getUserFromSessionOrToken(req)
const isPremium = checkMembership(user)

const content = await fetchMdFromSupabase(slug)
const [before, after] = content.split('<!-- PREMIUM_ONLY -->')

return {
body: isPremium ? before + after : before,
videoUrl: isPremium ? meta.video_full : meta.video_preview,
}

#### 4.4 動作確認チェックリスト

##### その１

- [ ] Training 一覧ページに新しい Training が表示される
- [ ] Training 詳細ページが表示される、タスク一覧が正しい順序で表示される
- [ ] 各タスクの詳細ページが正しく表示される

##### その 2

- [ ] 無料タスクが全内容表示される
- [ ] 有料タスクが途中でゲートバナーが表示される（無料ユーザー時）
- [ ] 有料タスクが全内容表示される（有料ユーザー時）

---
