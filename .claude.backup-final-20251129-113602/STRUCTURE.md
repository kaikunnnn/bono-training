# .claude ディレクトリ構造ルール

**最終更新**: 2025-11-24
**目的**: AI 開発効率を最大化するための標準化されたドキュメント構造

---

## 📁 ディレクトリ構造

```
.claude/
├── README.md                    # プロジェクト概要・AI への指示
├── STRUCTURE.md                 # このドキュメント（構造ルール）
├── project_overview.md          # アプリケーション構造
├── technical-stack.md           # 技術スタック
│
├── docs/                        # ドキュメントルート
│   ├── README.md                # ドキュメント索引
│   │
│   ├── subscription/            # サブスクリプションシステム
│   │   ├── README.md            # サブスクリプション索引
│   │   ├── specifications/      # システム仕様書
│   │   ├── guides/              # ガイド・エラー集
│   │   ├── testing/             # テスト記録
│   │   └── archive/             # 歴史的記録
│   │
│   ├── migration/               # データ移行プロジェクト
│   │   ├── README.md
│   │   ├── guides/
│   │   └── archive/
│   │
│   ├── infrastructure/          # インフラ関連
│   │   ├── supabase/           # Supabase 設定・ガイド
│   │   └── mcp/                # MCP サーバー設定
│   │
│   ├── workflows/               # 開発ワークフロー
│   │   ├── WORKFLOW.md         # 開発フロー
│   │   └── TESTING.md          # テストガイド
│   │
│   └── archive/                 # 古いドキュメント（月別）
│       └── 2025-11/
│
├── tasks/                       # 機能開発タスク
│   ├── phase1-database-setup.md
│   ├── phase2-bookmark-feature.md
│   └── 999-template/           # タスクテンプレート
│
├── temp/                        # 一時ファイル（削除可能）
├── debug/                       # デバッグログ（削除可能）
└── logs/                        # 実行ログ（削除可能）
```

---

## 🎯 設計原則

### 1. **目的別フォルダ構成**

AI が必要な情報を素早く見つけられるよう、目的別にフォルダを分離します。

**Good ✅**:
```
docs/subscription/guides/common-errors.md
docs/infrastructure/supabase/setup-guide.md
```

**Bad ❌**:
```
docs/subscription-common-errors.md
docs/supabase-setup-guide.md
```

---

### 2. **README による索引提供**

各重要フォルダには README.md を配置し、目的別ナビゲーションを提供します。

**必須の README 配置場所**:
- `.claude/README.md` - プロジェクト全体概要
- `docs/README.md` - ドキュメント索引
- `docs/subscription/README.md` - サブスクリプションシステム索引
- `docs/migration/README.md` - データ移行プロジェクト索引

**README に含むべき内容**:
1. 🎯 **目的別ガイド** - 「〇〇したいとき」に読むべきドキュメント
2. 📄 **ドキュメント一覧** - 各ドキュメントの役割と内容サマリー
3. 🔗 **クイックリンク** - 頻繁に参照するドキュメントへの直リンク
4. ❓ **FAQ** - よくある質問と回答

---

### 3. **仕様書とガイドの分離**

**specifications/** - システム仕様（What・How）
**guides/** - 実践ガイド・エラー集（Why・Lessons Learned）

```
specifications/
├── system-specification.md      # システム全体仕様
├── user-flow-specification.md   # ユーザーフロー
└── double-billing-prevention.md # 二重課金防止の技術仕様

guides/
├── common-errors.md             # よくある間違い集
└── troubleshooting/
    └── webhook-401-error.md     # 個別エラー詳細
```

---

### 4. **アーカイブポリシー**

古い・重複したドキュメントは削除せず、アーカイブします。

**アーカイブする基準**:
- ✅ 過去の失敗記録（同じエラーを防ぐため）
- ✅ 実装の経緯（意思決定の背景を残すため）
- ✅ 完了したプロジェクトの記録

**アーカイブ先**:
- `docs/[project]/archive/` - プロジェクト固有のアーカイブ
- `docs/archive/YYYY-MM/` - 一般的なドキュメントは月別にアーカイブ

**削除してよいもの**:
- ❌ 完全に重複したファイル
- ❌ 一時的なメモ・下書き
- ❌ 実装されなかった計画

---

## 📝 ファイル命名規則

### 仕様書・ガイド

```
[対象]-[種類]-[詳細].md

例:
system-specification.md
user-flow-specification.md
common-errors.md
webhook-401-error.md
```

### プロジェクト・タスク

```
phase[番号]-[機能名].md

例:
phase1-database-setup.md
phase2-bookmark-feature.md
```

### アーカイブ

```
元のファイル名のまま（日付情報は含めない）

理由: アーカイブフォルダが日付ごとに分かれているため
```

---

## 🔄 ドキュメント更新ルール

### いつドキュメントを更新するか

| イベント | 更新すべきドキュメント |
|---------|----------------------|
| 新機能追加 | `specifications/system-specification.md` |
| バグ修正 | `guides/common-errors.md` |
| テスト実施 | `testing/testing-log.md` |
| エラー発生・解決 | `guides/common-errors.md` + 詳細ドキュメント作成 |
| 仕様変更 | `specifications/system-specification.md` |

### ドキュメント更新フロー

```
1️⃣ 実装・修正を完了
   ↓
2️⃣ 該当する仕様書を更新
   ↓
3️⃣ 必要に応じてガイドに教訓を追加
   ↓
4️⃣ テスト実施後、テストログに記録
   ↓
5️⃣ README の最終更新日を更新
```

---

## 🚫 やってはいけないこと

### ❌ ドキュメントを無秩序に増やす

**Bad**:
```
docs/
├── subscription-spec.md
├── subscription-spec-v2.md
├── subscription-spec-final.md
├── subscription-spec-final-REAL.md
```

**Good**:
```
docs/subscription/
├── specifications/
│   └── system-specification.md (常に最新)
└── archive/
    └── old-investigations/
        └── subscription-spec-2025-11-20.md
```

---

### ❌ 情報を複数ファイルに分散させる

**Bad**:
```
- subscription-errors-1.md
- subscription-errors-2.md
- subscription-errors-additional.md
```

**Good**:
```
- guides/common-errors.md (すべてのエラーを1ファイルに集約)
```

---

### ❌ 古い情報を削除する

**Bad**:
```
# common-errors.md の一部を削除
rm old-investigation.md
```

**Good**:
```
# 古い調査記録は archive/ に移動
mv old-investigation.md archive/old-investigations/
```

---

## ✅ ドキュメント作成チェックリスト

新しいドキュメントを作成する前に確認：

- [ ] 既存のドキュメントに追記できないか？
- [ ] 同じ内容のドキュメントが既に存在しないか？
- [ ] 適切なフォルダに配置しているか？
- [ ] README にリンクを追加したか？
- [ ] ファイル名は命名規則に従っているか？
- [ ] 最終更新日を記載したか？

---

## 🎯 AI 開発での活用方法

### 新規開発時

1. `docs/[project]/README.md` を開く
2. 「新規開発者ガイド」セクションを読む
3. 必要な仕様書・ガイドを参照
4. 開発開始

### トラブルシューティング時

1. `docs/[project]/guides/common-errors.md` で類似エラーを検索
2. 見つからない場合は `specifications/system-specification.md` のトラブルシューティングを確認
3. それでも解決しない場合は新しいエラードキュメントを作成

### テスト実施時

1. `testing/testing-log.md` で該当するテストケースを確認
2. テスト手順に従って実施
3. 結果を testing-log.md に記録

---

## 📊 ディレクトリ健全性チェック

定期的に以下を確認：

### ✅ チェック項目

- [ ] docs/ ルートには README.md のみ存在するか？
- [ ] 各プロジェクトフォルダに README.md があるか？
- [ ] archive/ フォルダが適切に使われているか？
- [ ] 重複したドキュメントがないか？
- [ ] すべての README の最終更新日が正しいか？

---

## 📚 関連ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [docs/README.md](./docs/README.md) - ドキュメント索引
- [docs/subscription/README.md](./docs/subscription/README.md) - サブスクリプションシステム索引
- [docs/workflows/WORKFLOW.md](./docs/workflows/WORKFLOW.md) - 開発ワークフロー

---

**作成日**: 2025-11-24
**管理者**: AI 開発チーム
**目的**: AI 開発効率を最大化するための標準化されたドキュメント構造を提供
