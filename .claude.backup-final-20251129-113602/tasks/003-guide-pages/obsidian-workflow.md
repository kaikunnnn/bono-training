# Obsidianでの執筆ワークフロー

このドキュメントでは、Obsidianを使って実際のサイトデザインでプレビューしながら記事を書く方法を解説します。

---

## 🎯 ゴール

- Obsidianで快適に記事執筆
- リアルタイムで実デザインプレビュー
- Gitで下書き管理
- 公開までスムーズに

---

## 🔧 初期セットアップ（初回のみ）

### 1. Obsidian Vaultの設定

Obsidianで `content/guide/` をVaultとして開く：

```
1. Obsidianを起動
2. 「Open folder as vault」を選択
3. `/path/to/bono-training/content/guide/` を選択
```

これで `content/guide/` 配下のすべてのMarkdownファイルがObsidianで管理されます。

### 2. 開発サーバーの起動

ターミナルで：

```bash
cd /path/to/bono-training
npm run dev
```

ブラウザで自動的に `http://localhost:5173` が開きます。

### 3. ガイドページに移動

ブラウザで：
```
http://localhost:5173/guide
```

これで準備完了です！

---

## ✍️ 新規記事の作成フロー

### ステップ1: ブランチ作成（下書き管理）

ターミナルで：

```bash
# 下書きブランチ作成
git checkout -b draft/article-slug-name

# 例: 転職ロードマップの記事
git checkout -b draft/job-change-roadmap
```

### ステップ2: フォルダ&ファイル作成

Obsidianで新規ファイル作成：

```
content/guide/career/job-change-roadmap/index.md
```

**フォルダ構造:**
```
career/
  job-change-roadmap/
    index.md        ← 記事本文
    assets/         ← 画像ファイル（後で追加）
      hero.jpg
      step1.png
```

### ステップ3: Frontmatterを書く

`index.md` の先頭にメタデータを記述：

```yaml
---
title: "転職を成功させるデザイナーのロードマップ"
description: "未経験からデザイナーへ転職する方法を徹底解説"
slug: "job-change-roadmap"

category: "career"
tags:
  - "転職"
  - "キャリア"
  - "ロードマップ"

thumbnail: "/assets/guide/job-change-roadmap/hero.jpg"
icon: "/assets/emoji/rocket.svg"
order_index: 1

author: "BONO"
publishedAt: "2025-01-15"
readingTime: "10分"

isPremium: false

relatedGuides:
  - "designer-career-path"
  - "good-bad-study-methods"
---
```

### ステップ4: 本文を書く

Frontmatterの下にMarkdownで本文を記述：

```markdown
# 転職を成功させるデザイナーのロードマップ

デザイナーとして転職するための具体的なステップを解説します。

## 1. 現状の把握

まずは自分のスキルレベルを確認しましょう...

## 2. ポートフォリオ作成

ポートフォリオは転職活動の最重要ツールです...

### 2.1 何を載せるべきか

- プロジェクト概要
- 課題と解決策
- デザインプロセス

## 3. 求人探しと応募

...
```

### ステップ5: プレビュー確認

**リアルタイムプレビュー:**

1. Obsidianでファイルを保存（`Cmd + S` / `Ctrl + S`）
2. ブラウザが自動更新される（Hot Reload）
3. `http://localhost:5173/guide/job-change-roadmap` で確認

**確認ポイント:**
- レイアウトが崩れていないか
- 画像が表示されているか
- リンクが正しく機能するか
- スタイルが適用されているか

### ステップ6: 画像追加

#### 画像の配置

```bash
content/guide/career/job-change-roadmap/
  ├── index.md
  └── assets/
      ├── hero.jpg        ← サムネイル
      ├── step1.png       ← 記事内画像
      └── diagram.svg     ← 図解
```

#### Markdown内で参照

**相対パス:**
```markdown
![転職ロードマップのステップ](./assets/step1.png)
```

**絶対パス:**
```markdown
![転職ロードマップ](/assets/guide/job-change-roadmap/step1.png)
```

#### 画像最適化

```bash
# 画像を自動圧縮
npm run optimize-images
```

このコマンドで `content/guide/**/assets/` 配下の画像が自動的に圧縮されます。

### ステップ7: 下書き保存

定期的にGitコミット：

```bash
git add content/guide/career/job-change-roadmap/
git commit -m "下書き: 転職ロードマップ（セクション1-3完成）"
```

複数回コミットしてOK。作業履歴が残ります。

### ステップ8: 関連記事の設定

Frontmatterの `relatedGuides` に関連記事のslugを追加：

```yaml
relatedGuides:
  - "designer-career-path"      # デザイナーのキャリアパス
  - "good-bad-study-methods"     # 良い勉強法・悪い勉強法
  - "how-to-learn-design"        # デザインの学び方
```

プレビューで関連記事セクションが表示されます。

### ステップ9: 最終確認

- [ ] タイトル・説明文が適切か
- [ ] 誤字脱字がないか
- [ ] 画像が表示されるか
- [ ] リンクが機能するか
- [ ] 関連記事が表示されるか
- [ ] モバイル表示が崩れていないか
- [ ] 読了時間が適切か

### ステップ10: 公開

```bash
# mainブランチに戻る
git checkout main

# 下書きをマージ
git merge draft/job-change-roadmap

# リモートにプッシュ（自動デプロイ）
git push origin main
```

これで記事が公開されます！🎉

---

## 🔄 既存記事の更新フロー

### ステップ1: ブランチ作成

```bash
git checkout -b update/job-change-roadmap
```

### ステップ2: Obsidianで編集

記事を開いて編集。

### ステップ3: プレビュー確認

ブラウザで自動更新を確認。

### ステップ4: updatedAt を更新

Frontmatterの `updatedAt` を更新：

```yaml
publishedAt: "2025-01-15"
updatedAt: "2025-02-10"    # 更新日を追加
```

### ステップ5: コミット&プッシュ

```bash
git add content/guide/career/job-change-roadmap/
git commit -m "更新: 転職ロードマップ（新情報追加）"
git push origin update/job-change-roadmap
```

### ステップ6: マージして公開

```bash
git checkout main
git merge update/job-change-roadmap
git push origin main
```

---

## 💡 Tips & ベストプラクティス

### 1. Obsidianプラグイン活用

**推奨プラグイン:**

- **Templater** - Frontmatterテンプレート自動挿入
- **Paste image rename** - 画像貼り付け時に自動リネーム
- **Obsidian Git** - ObsidianからGit操作（オプション）

### 2. Frontmatterテンプレート

テンプレートファイルを作成：

```
content/guide/_templates/article-template.md
```

```yaml
---
title: "{{タイトル}}"
description: "{{説明文}}"
slug: "{{slug}}"

category: "{{career|learning|industry|tools}}"
tags:
  - "{{タグ1}}"
  - "{{タグ2}}"

thumbnail: "/assets/guide/{{slug}}/hero.jpg"
icon: "/assets/emoji/{{icon}}.svg"
order_index: 1

author: "BONO"
publishedAt: "{{date}}"
readingTime: "{{X}}分"

isPremium: false

relatedGuides:
  - "{{関連記事1}}"
  - "{{関連記事2}}"
---

# {{タイトル}}

記事の導入文...

## セクション1

内容...
```

新規記事作成時にコピー&ペーストして使用。

### 3. 画像命名規則

```
hero.jpg           # サムネイル（必須）
section-1.png      # セクション1の画像
diagram-workflow.svg  # ワークフロー図
screenshot-figma.png  # ツールのスクショ
```

わかりやすい名前をつけると管理しやすい。

### 4. 読了時間の計算

目安：
- 1分 = 約400-500文字
- 画像や図解が多い場合は +1-2分

### 5. カテゴリの選び方

| カテゴリ | 内容 |
|---------|------|
| `career` | 転職、キャリアパス、働き方 |
| `learning` | 学習方法、スキルアップ、勉強法 |
| `industry` | 業界動向、トレンド、未来予測 |
| `tools` | ツールの使い方、比較、選び方 |

迷ったら `learning` が無難。

### 6. タグのつけ方

- 3-5個が目安
- 具体的なキーワード
- 検索されやすい言葉

**良い例:**
```yaml
tags:
  - "転職"
  - "ポートフォリオ"
  - "未経験"
```

**悪い例:**
```yaml
tags:
  - "デザイン"  # 広すぎる
  - "いろいろ"  # 曖昧
```

### 7. 下書きの管理

**ブランチ命名規則:**
```
draft/{{slug}}        # 新規記事
update/{{slug}}       # 既存記事の更新
fix/{{slug}}          # バグ修正
```

**複数記事を同時執筆する場合:**
```bash
git checkout -b draft/article-1
# 執筆...
git commit -m "下書き: 記事1"

git checkout main
git checkout -b draft/article-2
# 執筆...
```

ブランチを切り替えることで、複数記事を並行して執筆可能。

---

## 🚨 トラブルシューティング

### Q1. プレビューが更新されない

**原因:** 開発サーバーがクラッシュしている

**解決策:**
```bash
# サーバーを再起動
Ctrl + C
npm run dev
```

### Q2. 画像が表示されない

**原因1:** パスが間違っている

**解決策:**
```markdown
# 相対パス（推奨）
![画像](./assets/image.jpg)

# 絶対パス
![画像](/assets/guide/{{slug}}/image.jpg)
```

**原因2:** 画像ファイルが存在しない

**解決策:**
```bash
ls content/guide/{{category}}/{{slug}}/assets/
```

でファイルを確認。

### Q3. Frontmatterのエラー

**原因:** YAMLの書式エラー

**解決策:**
- インデントを確認（スペース2個）
- `title: "タイトル"` のようにダブルクォートで囲む
- リスト項目は `- "項目"` の形式

### Q4. 記事が一覧に表示されない

**原因:** `order_index` が設定されていない

**解決策:**
```yaml
order_index: 1  # 必須
```

### Q5. Gitマージでコンフリクト

**原因:** 複数ブランチで同じファイルを編集

**解決策:**
```bash
# コンフリクトを確認
git status

# 手動でファイルを修正
# その後
git add .
git commit -m "コンフリクト解消"
```

---

## 📊 執筆の進め方（推奨）

### 1日目: 構成作成

- 見出しだけ作成
- 各セクションの概要をメモ

```markdown
# タイトル

## セクション1
（概要メモ）

## セクション2
（概要メモ）
```

### 2日目: 本文執筆

- セクションごとに執筆
- 定期的に保存&プレビュー確認

### 3日目: 画像追加

- 図解やスクリーンショットを追加
- 画像最適化

### 4日目: 推敲

- 誤字脱字チェック
- 読みやすさ確認
- 関連記事設定

### 5日目: 公開

- 最終プレビュー
- マージ&プッシュ

---

## 🎉 完成！

これでObsidianを使った快適な執筆環境が整いました！

**次のステップ:**
1. 実際に記事を書いてみる
2. プレビュー確認
3. 公開

何か質問があれば、いつでも聞いてください！
