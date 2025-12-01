# Claude Code プロジェクト指示

**最終更新**: 2025-11-30

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

## 📚 ドキュメント階層

```
.claude/
├── PROJECT-RULES.md                    ← 開発ルール（必読）
└── docs/
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

### 1. Critical Issues（🔴）

**現在進行中: サブスクリプション実装全面見直しプロジェクト**

- **プロジェクト**: サブスクリプションシステム全体の再設計・再実装
  - **📋 全体計画**: `.claude/docs/subscription/redesign/MASTER-PLAN.md` ← **必ず最初に読む**
  - **ステータス**: Phase 1 実施中（実際の動作テスト）
  - **現状**: 全機能が動作していない（新規登録、プラン変更、キャンセル全て不可）
  - **アプローチ**: フェーズ型で確実に実装（Phase 0 完了 → Phase 1 実施中）

**作業開始時の手順**:

1. `MASTER-PLAN.md`を開いて現在のフェーズと次のタスクを確認
2. 該当フェーズの詳細ドキュメントを開く
3. 作業実施
4. `MASTER-PLAN.md`の進捗を更新

---

### 2. 通常タスク

**TASK-TRACKER.md の優先度に従って対応**

※ 現在は Critical Issue が最優先のため、通常タスクは保留中

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
| 2025-11-30 | サブスクリプション再構築: redesign/MASTER-PLAN.md を最優先参照に設定 |
| 2025-11-28 | 初版作成（PROJECT-RULES.md、TASK-TRACKER.md 参照を追加）             |

---

**全ての作業は、このルールに従って実施してください。**
