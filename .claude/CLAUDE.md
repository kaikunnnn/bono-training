# Claude Code プロジェクト指示

**最終更新**: 2025-12-06

---

## 🎯 最重要指示

### 作業開始前に必ず読むこと

1. **`.claude/PROJECT-RULES.md`** - このプロジェクトの開発ルール（必読）

### タスク確認して、の時に参照

2. **`.claude/docs/subscription/TASK-TRACKER.md`** - 現在のタスクと問題
3. task-tracker はやっている内容が変更した場合に必ずアップデートしながら進めること。違う作業に入る時に「TASK-TRACKER をアップデートしますか？」と聞くようにして下しあ

---

## 📋 作業フロー（必須）

### Step 1: 現状把握（作業開始時）

**サブスクリプション関連の作業の場合**:

```bash
# 必ず以下のファイルを読む（優先順位順）
1. .claude/docs/subscription/redesign/MASTER-PLAN.md
   → 現在のフェーズ、進捗、次のアクション

2. .claude/PROJECT-RULES.md
   → どうやって作業を進めるか

3. .claude/docs/subscription/redesign/README.md
   → redesignフォルダのナビゲーション
```

**その他の作業の場合**:

```bash
1. .claude/docs/subscription/TASK-TRACKER.md
   → 今何をすべきか、どんな問題があるか

2. .claude/PROJECT-RULES.md
   → どうやって作業を進めるか

3. .claude/docs/subscription/README.md
   → 関連ドキュメントがどこにあるか
```

---

### Step 2: タスク実行

**PROJECT-RULES.md に従って実装する**

---

### Step 3: 問題発見時

**即座に TASK-TRACKER.md の Critical Issues セクションに記録する**

---

### Step 4: 完了報告（作業終了時）

**TASK-TRACKER.md の該当タスクを「完了」に更新し、履歴に移動する**

---

## ⚠️ 禁止事項

以下の行為は**絶対に禁止**:

1. ❌ TASK-TRACKER.md を読まずに作業開始
2. ❌ PROJECT-RULES.md を無視した開発
3. ❌ 問題を発見しても記録せず放置
4. ❌ ドキュメント更新を忘れる
5. ❌ テストせずにデプロイ
6. ❌ 本番環境で実験的な操作

---

## 🔌 MCP運用ルール（ENV-004対策）

**問題**: MCPは常に本番環境（Supabase/Stripe）を参照するため、開発中にフロントエンドとデータが不整合になる。

### 開発時（ローカル開発）

```bash
npm run mcp:disable
```

- MCPが無効化され、環境不一致を防ぐ
- Claude CodeはDB/Stripeにアクセスできない（コードのみ操作）

### 本番確認時（デプロイ後の確認）

```bash
npm run mcp:enable
```

- MCPが有効化され、本番ログ・DB確認が可能
- **注意**: 本番データを操作するリスクあり

### 状態確認

```bash
npm run mcp:status
```

- 現在MCPが有効か無効かを表示

### 運用フロー

```
開発開始 → npm run mcp:disable → 開発作業 → コミット
    ↓
本番確認が必要 → npm run mcp:enable → ログ/DB確認 → npm run mcp:disable
```

---

## 📚 ドキュメント階層

```
.claude/
├── PROJECT-RULES.md                    ← 開発ルール（必読）
└── docs/
    ├── progress/                       ← レッスン進捗機能（調査中）
    │   ├── README.md                   ← ドキュメント索引
    │   ├── INVESTIGATION-PLAN.md       ← 調査計画
    │   ├── current-implementation.md   ← 現状の実装
    │   ├── database-schema.md          ← DBスキーマ
    │   ├── data-flow.md                ← データフロー
    │   └── potential-issues.md         ← 潜在的問題
    └── subscription/
        ├── TASK-TRACKER.md             ← タスク管理（必読）
        ├── README.md                   ← ドキュメント索引
        ├── specifications/
        │   ├── system-specification.md ← システム仕様
        │   └── ...
        ├── guides/
        │   ├── common-errors.md        ← よくある失敗
        │   └── ...
        └── plans/
            ├── phase2-stripe-pricing-final.md
            └── ...
```

---

## 🎯 優先順位

### 1. サブスクリプション実装 ✅ 完了

**サブスクリプション再構築プロジェクト - 本番デプロイ完了**

- **プロジェクト**: サブスクリプションシステム全体の再設計・再実装
  - **📋 全体計画**: `.claude/docs/subscription/redesign/MASTER-PLAN.md`
  - **ステータス**: ✅ Phase 5 完了（本番デプロイ成功）
  - **完了日**: 2025-12-02

**完了したフェーズ**:
```
Phase 0: 緊急現状精査     ✅ 完了
Phase 1.5: 緊急修正       ✅ 完了
Phase 1: 動作テスト       ✅ 完了
Phase 2: 問題の修正       ✅ 完了
Phase 3: 全体動作確認     ✅ 完了
Phase 4: ドキュメント更新 ✅ 完了
Phase 5: 本番デプロイ     ✅ 完了
```

**本番環境で解決した問題（2025-12-02）**:
- ENV-001: VercelローカルURL問題 → ブラウザキャッシュクリアで解決
- ENV-002: Webhook 401エラー → Signing Secret再設定で解決
- ENV-003: TypeError unit_amount → Price IDs設定で解決

---

### 2. 次のステップ: 本番環境検証（オプション）

**ステータス**: 準備完了（アカウント作成が必要）

- **📋 検証計画**: `.claude/docs/subscription/redesign/testing/2025-12-02-production-verification.md`
- **内容**: 本番環境でサブスクリプション機能の動作確認
- **前提**: 本番Supabaseにテスト用アカウントを作成する必要あり

---

### 3. レッスン進捗機能 ✅ 調査完了

**レッスン完了機能の技術調査**

- **プロジェクト**: レッスン・記事の完了機能の技術的問題調査
  - **📋 調査結果**: `.claude/docs/progress/README.md`
  - **📁 潜在的問題**: `.claude/docs/progress/potential-issues.md`
  - **ステータス**: ✅ 調査完了
  - **完了日**: 2025-12-06

**発見した重大な問題**:
| 重大度 | 問題 | 影響 |
|--------|------|------|
| 🔴 高 | RLS 無効 | 他ユーザーのデータ閲覧・改ざん可能 |
| 🔴 高 | レース条件 | 同時クリックでエラー発生 |
| 🟡 中 | キャッシュなし | パフォーマンス低下 |

**推奨アクション（優先度順）**:
1. RLS 有効化（セキュリティ修正）- 工数: 1h
2. upsert パターンへの変更（レース条件修正）- 工数: 30min
3. 楽観的更新の導入（UX 改善）- 工数: 2h

**調査フェーズ**:
```
Phase 1: フロントエンド実装の調査     ✅ 完了
Phase 2: データベース構造の調査       ✅ 完了
Phase 3: データフロー・状態管理の調査 ✅ 完了
Phase 4: 潜在的問題の分析             ✅ 完了
Phase 5: 調査結果のまとめ             ✅ 完了
```

---

### 4. 通常タスク

**その他の開発タスク**

※ サブスクリプション実装が完了したため、通常タスクに戻れます

---

## 🔄 このファイルの役割

このファイル（.claude/CLAUDE.md）は、Claude Code に対する最上位の指示です。

**このファイルで指示すること**:

- 他のドキュメントへの参照
- 絶対に守るべき最重要ルール
- 作業フローの概要

**このファイルで指示しないこと**:

- 詳細な開発ルール → PROJECT-RULES.md に記載
- 具体的なタスク → TASK-TRACKER.md に記載
- システム仕様 → specifications/に記載

---

## 📝 更新履歴

| 日付       | 更新内容                                                             |
| ---------- | -------------------------------------------------------------------- |
| 2025-12-06 | レッスン進捗機能の調査完了（RLS無効・レース条件など重大問題を発見）  |
| 2025-12-06 | レッスン進捗機能の調査開始（.claude/docs/progress/ フォルダ作成）    |
| 2025-12-03 | ENV-004対策: MCP運用ルールを追加（mcp:disable/enable/status）        |
| 2025-12-02 | サブスクリプション実装完了（Phase 5 本番デプロイ成功）               |
| 2025-11-30 | サブスクリプション再構築: redesign/MASTER-PLAN.md を最優先参照に設定 |
| 2025-11-28 | 初版作成（PROJECT-RULES.md、TASK-TRACKER.md 参照を追加）             |

---

**全ての作業は、このルールに従って実施してください。**
