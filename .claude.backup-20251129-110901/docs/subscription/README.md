# サブスクリプション実装ドキュメント

**最終更新**: 2025-11-29

---

## 📄 現在使用するドキュメント

### 🎯 **MASTER_PLAN.md**（メインドキュメント）

**サブスクリプション実装の完全ガイド**

- 現状サマリー
- Phase 1: 料金バグ修正（35分）
- Phase 2: 完全テスト（1時間45分）
- Phase 3: 本番環境準備（1時間25分）
- 進捗チェックリスト

**👉 このドキュメントだけ読めば実装完了までの全体像がわかります**

---

## 📂 フォルダ構造

```
subscription/
├── MASTER_PLAN.md          ← 📌 これだけ見ればOK
├── README.md               ← このファイル
└── archive/                ← 過去のドキュメント（参考用）
    ├── issues/             ← バグ分析レポート
    ├── plans/              ← 過去の実装計画
    ├── specifications/     ← システム仕様書
    ├── testing/            ← テスト計画・結果
    ├── guides/             ← トラブルシューティングガイド
    └── old-investigations/ ← 初期調査ドキュメント
```

---

## 🚀 クイックスタート

### 今すぐ始めるには

1. **MASTER_PLAN.mdを開く**
2. **Phase 1 Task 1.1から実行**（料金バグ修正）
3. **チェックリストを順番に進める**

---

## 📊 現在の進捗

| Phase | ステータス | 所要時間 |
|-------|----------|---------|
| Phase 1: 料金バグ修正 | ⏳ 次のタスク | 35分 |
| Phase 2: 完全テスト | ⏸️ 待機中 | 1時間45分 |
| Phase 3: 本番環境準備 | ⏸️ 待機中 | 1時間25分 |

**全体進捗**: 約4%
**完了済み**: Test 1（新規登録）のみ
**次のアクション**: Phase 1 Task 1.1実行

---

## 🔍 アーカイブドキュメント（参考用）

### 修正済みBugs

- `archive/issues/browser-back-bug-analysis.md`
  - ブラウザバックで既存プラン解除（✅ 2025-11-28修正）

- `archive/issues/2025-11-28-webhook-environment-bug.md`
  - Webhook環境変数バグ（✅ 2025-11-28修正）

### システム仕様

- `archive/specifications/system-specification.md`
  - 全体アーキテクチャ
  - データフロー
  - Edge Functions仕様

### 開発ガイド

- `archive/deployment-checklist.md`
  - デプロイ前チェックリスト

- `archive/environment-management.md`
  - 環境変数管理ガイド

- `archive/guides/troubleshooting/`
  - エラーデバッグガイド
  - Webhook 401エラー対処法

---

## ❓ よくある質問

### Q1: どのドキュメントを読めばいい？

**A**: `MASTER_PLAN.md` だけ読めばOKです。

### Q2: 過去のドキュメントは削除していい？

**A**: `archive/` フォルダは参考用です。削除しても実装には影響ありません。

### Q3: 実装にどれくらい時間がかかる？

**A**: 約3時間45分
- Phase 1: 35分
- Phase 2: 1時間45分
- Phase 3: 1時間25分

### Q4: テストはいつ実行する？

**A**: Phase 1（料金バグ修正）完了後、Phase 2で1つずつ実行します。

---

**次のアクション**: `MASTER_PLAN.md` を開いて Phase 1 Task 1.1 を実行
