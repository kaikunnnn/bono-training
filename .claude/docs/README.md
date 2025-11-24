# Bono Training - Documentation

**最終更新**: 2025-11-24

このディレクトリには、すべてのプロジェクトドキュメントが**目的別フォルダ構成**で整理されています。

---

## 🎯 クイックスタート

| 目的 | ドキュメント |
|------|------------|
| システム全体を理解したい | [../ STRUCTURE.md](../STRUCTURE.md) |
| サブスクリプション機能を修正したい | [subscription/README.md](./subscription/README.md) |
| データ移行を実施したい | [migration/README.md](./migration/README.md) |
| 開発ワークフローを確認したい | [workflows/WORKFLOW.md](./workflows/WORKFLOW.md) |
| インフラ設定を確認したい | [infrastructure/](#インフラ設定) |

---

## 📚 ドキュメント構成

### 🔄 **データ移行プロジェクト**（進行中）

**📁 migration/** フォルダ
- 既存 Stripe 顧客データ（2,162人、250件）の Supabase への移行
- **詳細は [migration/README.md](./migration/README.md) を参照**

**現在の状況**: Phase 0（1件テスト）の準備完了 ✅

**次にやること**:
1. [migration/migration-test-guide.md](./migration/migration-test-guide.md) を開く
2. Phase 0 の手順に従ってスクリプトを実行
3. 動作確認

---

### 💳 **Subscription システム開発**（完了 ✅）

#### 🎯 メインドキュメント索引

**📁 [subscription/](./subscription/)** - サブスクリプションシステム完全ドキュメント

すべてのサブスクリプション関連ドキュメントは **[subscription/README.md](./subscription/README.md)** から参照できます。

**主要ドキュメント**:
- **[system-specification.md](./subscription/specifications/system-specification.md)** - システム全体仕様（必読）
- **[common-errors.md](./subscription/guides/common-errors.md)** - よくある間違いと教訓（必読）
- **[testing-log.md](./subscription/testing/testing-log.md)** - 完全なテスト履歴

**目的別ガイド**:
- 新規開発者・引き継ぎ → [subscription/README.md - 新規開発者ガイド](./subscription/README.md#新規開発者引き継ぎ時に読むべきドキュメント)
- トラブルシューティング → [subscription/README.md - トラブルシューティング](./subscription/README.md#トラブルシューティング時に読むべきドキュメント)
- テスト実施 → [testing-log.md](./subscription/testing/testing-log.md)

---

### 🔧 **インフラ設定**

**📁 infrastructure/** フォルダ

#### Supabase

- **mcp-setup-guide.md** - Supabase MCP サーバーセットアップガイド
- **mcp-capabilities-summary.md** - MCP 機能概要
- **supabase-mcp-research.md** - MCP 調査記録

#### MCP (Model Context Protocol)

MCP サーバーの設定と使用方法に関するドキュメント

---

### 📋 **開発ワークフロー**

**📁 workflows/** フォルダ

- **[WORKFLOW.md](./workflows/WORKFLOW.md)** - 開発ワークフロー・ドキュメント管理ルール
- **[TESTING.md](./workflows/TESTING.md)** - テスト実施ガイド（統合版）

**重要**: すべての作業フロー・テスト手順は workflows/ フォルダを参照してください

---

### 🗂️ **アーカイブ**

**📁 archive/** フォルダ

古い・完了したドキュメントを月別に保管しています。

- `archive/2025-11/` - 2025年11月のアーカイブ
- `subscription/archive/old-investigations/` - サブスクリプション関連の過去の調査記録

---

## 🎯 現在のプロジェクト状況

### 💳 Subscription システム

**ステータス**: ✅ 完了（本番稼働可能）

詳細は [subscription/README.md](./subscription/README.md) を参照

### 🔄 データ移行プロジェクト

**ステータス**: 🔄 進行中

詳細は [migration/README.md](./migration/README.md) を参照

---

## 📚 関連リソース

### 外部ドキュメント

- [Stripe API ドキュメント](https://stripe.com/docs/api)
- [Supabase ドキュメント](https://supabase.com/docs)

### プロジェクトドキュメント

- [../ STRUCTURE.md](../STRUCTURE.md) - ディレクトリ構造ルール
- [subscription/README.md](./subscription/README.md) - サブスクリプションシステム
- [migration/README.md](./migration/README.md) - データ移行
- [workflows/WORKFLOW.md](./workflows/WORKFLOW.md) - 開発ワークフロー

---

**最終更新日**: 2025-11-24
