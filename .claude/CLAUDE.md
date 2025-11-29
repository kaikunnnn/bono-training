# Claude Code プロジェクト憲法

**最終更新**: 2025-11-29
**バージョン**: 3.0 (UX分離・自動フォルダ作成版)

---

## 🎯 このプロジェクトの開発哲学

### 原則

1. **実装前に計画する** - 「考えながら実装」ではなく、「計画してから実装」
2. **ドキュメントは実装と同時に書く** - 「後で書く」は禁止
3. **ブレない** - 計画に従い、計画外のことはしない
4. **記録する** - すべての決定、エラー、解決策を記録

---

## 🔄 実装ワークフロー（必須）

すべての実装は以下のフローに従ってください:

### Phase 0: フォルダ構造の確認・作成（新タスク開始時）

**いつ実行**: 新しいタスクを受け取った時、最初に実行

**チェックリスト**:
- [ ] タスクを分析（機能ベース or 領域ベース）
- [ ] 既存フォルダに該当するか確認（`docs/機能名/` または `docs/領域名/`）
- [ ] 該当フォルダがない → 新規フォルダ構造を作成
- [ ] テンプレートから必須ファイルを配置
- [ ] Takumiさんに報告・UX定義を依頼

**成果物**:
- 適切なフォルダ構造
- 必須ファイル（README.md, flows.md, requirements.md等）

**詳細**: [新しい作業を開始する時の自動フォルダ作成ルール](#-新しい作業を開始する時の自動フォルダ作成ルール) 参照

---

### Phase 1: 現状精査（実装開始前）

**チェックリスト**:
- [ ] `CURRENT-FOCUS.md`で今の状況を確認
- [ ] 該当機能のドキュメント確認
- [ ] `docs/project-knowledge/environment-variables.md`で必要な環境変数確認
- [ ] `docs/project-knowledge/tech-stack-map.md`で関連ファイル把握
- [ ] `docs/subscription/troubleshooting/error-database.md`で既知の問題確認

**成果物**: 現状の完全な理解

---

### Phase 2: 実装計画策定（実装開始前・必須）

**チェックリスト**:
- [ ] `docs/subscription/implementation-plans/TEMPLATE.md`をコピー
- [ ] 現状分析を詳細に記述
- [ ] 実装方針を明確化（なぜこの方法を選ぶか）
- [ ] 使用する環境変数を全てリストアップ
- [ ] 使用するライブラリ・APIを明記
- [ ] テストケースを定義
- [ ] リスクと対策を評価

**成果物**: `docs/subscription/implementation-plans/YYYY-MM-DD-task-name.md`

**重要**: この計画書を作成せずに実装を開始してはいけない

---

### Phase 3: 計画レビュー

**チェックリスト**:
- [ ] 計画を読み返す
- [ ] 不明点がないか確認
- [ ] ユーザーに承認を得る（必要に応じて）

---

### Phase 4: 実装

**チェックリスト**:
- [ ] 計画に従ってコーディング
- [ ] ブレない（計画外のことをしない）
- [ ] 小さく分割して進める
- [ ] こまめにテスト

**成果物**: 動作するコード

---

### Phase 5: ドキュメント更新（実装と並行）

**チェックリスト**:
- [ ] 環境変数を追加 → `environment-variables.md`更新
- [ ] 新機能を追加 → `tech-stack-map.md`更新
- [ ] 重要な決定 → `decision-log.md`更新
- [ ] エラー発生 → `error-database.md`更新

**成果物**: 常に最新のドキュメント

---

### Phase 6: 完了報告

**チェックリスト**:
- [ ] 実装計画に実施ログ追記
- [ ] TASK-TRACKER.md更新（該当する場合）
- [ ] CURRENT-FOCUS.md履歴更新

**成果物**: 完全な実装記録

---

## 👥 役割分担（重要）

このプロジェクトでは、**UX定義**と**技術実装**を明確に分離します。

### Takumiさん（UXエキスパート）の担当

**作業エリア**: `docs/[機能名または領域名]/user-experience/`

**責任範囲**:
- ユーザーフロー定義（flows.md）
- UX要件定義（requirements.md）
- エッジケース定義（edge-cases.md）
- UX問題の記録（issues.md）

**具体例**:
```markdown
# flows.md
## フロー1: 新規プラン登録

**Given（前提）**:
- ユーザーは未登録

**When（操作）**:
1. /subscriptionページを開く
2. 「Starterプラン」の「このプランを選択」ボタンをクリック

**Then（結果）**:
- ✅ 即座にStarterプランの機能が使える
```

---

### Claude Code（開発者）の担当

**作業エリア**: `docs/[機能名または領域名]/implementation/`

**責任範囲**:
- 実装計画（implementation/plans/）
- 技術仕様書（implementation/specifications/）
- 実装決定ログ（implementation/decisions/）
- エラーデータベース（troubleshooting/error-database.md）

**重要ルール**:
1. **UX定義を必ず読む**: 実装開始前に必ず `user-experience/` の内容を確認
2. **UX要件を満たす**: `requirements.md` に記載された要件を100%満たす
3. **エッジケースを考慮**: `edge-cases.md` のすべてのケースを実装でカバー

**具体例**:
```markdown
# implementation/plans/2025-11-29-stripe-webhook-fix.md

## UX要件の確認

### flows.md から
- フロー2（プラン変更）: 即座に新プランが使える

### requirements.md から
- 絶対に守るべきUX原則1: 即時反映（3秒以内）
- 絶対に守るべきUX原則3: 2重課金の絶対防止

### edge-cases.md から
- Edge Case 9: Webhook失敗時の挙動

## 技術実装方針

上記UX要件を満たすため、以下の方針で実装:
1. Webhook 401エラーを修正
2. 冪等性チェックを追加
3. ...
```

---

## 🗂️ 新しい作業を開始する時の自動フォルダ作成ルール

新しいタスクを受け取ったら、**Phase 0で必ず**以下の手順を実行してください。

### ステップ1: タスクを分類する

タスクは以下の2種類に分類されます:

#### 1. 機能ベースのタスク（Feature-based）

**定義**: ユーザーが直接使う機能の実装・修正

**例**:
- サブスクリプション機能（`docs/subscription/`）
- 認証機能（`docs/auth/`）
- 動画プレイヤー機能（`docs/video-player/`）
- コメント機能（`docs/comments/`）

**フォルダ名**: 機能名を使う（例: `subscription`, `auth`, `video-player`）

---

#### 2. 領域ベースのタスク（Domain-based）

**定義**: 特定機能に限らず、横断的な領域の修正・改善

**例**:
- フロントエンド全体のリファクタリング（`docs/frontend/`）
- デザインシステムの改善（`docs/design-system/`）
- パフォーマンス最適化（`docs/performance/`）
- インフラ改善（`docs/infrastructure/`）
- セキュリティ強化（`docs/security/`）

**フォルダ名**: 領域名を使う（例: `frontend`, `performance`, `infrastructure`）

---

### ステップ2: 既存フォルダを確認する

新しいタスクを受け取ったら:

```bash
ls .claude/docs/
```

**判断基準**:
1. 該当する機能または領域のフォルダが**既に存在する** → そのフォルダを使う
2. 該当するフォルダが**存在しない** → ステップ3へ

**例**:

```
タスク: 「サブスクリプションのプラン変更でWebhook 401エラーを修正」

判断:
- `docs/subscription/` が存在する
→ 既存フォルダを使う
→ Phase 0完了、Phase 1へ進む
```

```
タスク: 「動画プレイヤーに字幕機能を追加」

判断:
- `docs/video-player/` が存在しない
→ 新規フォルダ作成が必要
→ ステップ3へ
```

---

### ステップ3: 新規フォルダ構造を作成する

該当フォルダが存在しない場合、以下の手順で作成:

#### 3-1. テンプレートを選択

**機能ベース**: `.claude/templates/feature/` を使用
**領域ベース**: `.claude/templates/domain/` を使用

#### 3-2. フォルダをコピー

```bash
# 機能ベースの例（動画プレイヤー）
cp -r .claude/templates/feature/ .claude/docs/video-player/

# 領域ベースの例（フロントエンド）
cp -r .claude/templates/domain/ .claude/docs/frontend/
```

#### 3-3. 必須ファイルを確認

作成したフォルダに以下が含まれているか確認:

```
docs/[機能名または領域名]/
├── README.md
├── user-experience/
│   ├── README.md
│   ├── flows.md          ← Takumiさんが記入
│   ├── requirements.md   ← Takumiさんが記入
│   ├── edge-cases.md     ← Takumiさんが記入
│   └── issues.md         ← Takumiさんが記入
├── implementation/
│   ├── README.md
│   ├── plans/
│   │   └── TEMPLATE.md
│   ├── specifications/
│   │   └── .gitkeep
│   └── decisions/
│       └── decisions.md
└── troubleshooting/
    ├── error-database.md
    └── solutions-log.md
```

---

### ステップ4: Takumiさんに報告・UX定義を依頼

新規フォルダを作成したら、**必ず**Takumiさんに報告してください。

**報告テンプレート**:

```markdown
## 📁 新規フォルダ作成のご報告

**タスク**: [タスク内容]
**分類**: [機能ベース / 領域ベース]
**フォルダ名**: `docs/[機能名または領域名]/`

以下のフォルダ構造を作成しました:
- user-experience/ （Takumiさんの作業エリア）
- implementation/ （Claude Codeの作業エリア）
- troubleshooting/

**次のステップ**:
1. Takumiさんに `user-experience/` のUX定義をご記入いただく
   - flows.md（ユーザーフロー）
   - requirements.md（UX要件）
   - edge-cases.md（エッジケース）
   - issues.md（既知の問題）

2. UX定義が完了したら、Claude Codeが実装を開始

よろしくお願いいたします。
```

---

### 自動判断フロー

```
新しいタスクを受け取った
    ↓
【Phase 0開始】
    ↓
タスクを分析:
- 機能ベース？（サブスク、認証、動画など）
- 領域ベース？（フロント、パフォーマンス、インフラなど）
    ↓
既存フォルダ確認:
`ls .claude/docs/`
    ↓
フォルダ存在する？
    ├─ YES → 既存フォルダを使用 → Phase 1へ
    └─ NO  → 新規作成
              ↓
          テンプレート選択:
          - 機能ベース: templates/feature/
          - 領域ベース: templates/domain/
              ↓
          フォルダコピー:
          `cp -r templates/[type]/ docs/[name]/`
              ↓
          Takumiさんに報告:
          「user-experience/ のUX定義をお願いします」
              ↓
          UX定義完了を待つ
              ↓
          Phase 1へ進む
```

---

### 使用例

#### 例1: 機能ベースタスク（新機能）

**タスク**: 「コメント機能を実装してほしい」

**Phase 0の実行**:

1. **分類**: 機能ベース（コメント機能）
2. **既存確認**: `ls .claude/docs/` → `comments/` なし
3. **新規作成**:
   ```bash
   cp -r .claude/templates/feature/ .claude/docs/comments/
   ```
4. **報告**:
   ```markdown
   ## 📁 新規フォルダ作成のご報告

   **タスク**: コメント機能の実装
   **分類**: 機能ベース
   **フォルダ名**: `docs/comments/`

   Takumiさん、`user-experience/` のUX定義をお願いいたします:
   - flows.md: コメント投稿・編集・削除のフロー
   - requirements.md: コメント機能のUX要件
   - edge-cases.md: 連投防止、文字数制限など
   ```

---

#### 例2: 領域ベースタスク（横断的改善）

**タスク**: 「フロントエンド全体のパフォーマンスを改善してほしい」

**Phase 0の実行**:

1. **分類**: 領域ベース（パフォーマンス）
2. **既存確認**: `ls .claude/docs/` → `performance/` なし
3. **新規作成**:
   ```bash
   cp -r .claude/templates/domain/ .claude/docs/performance/
   ```
4. **報告**:
   ```markdown
   ## 📁 新規フォルダ作成のご報告

   **タスク**: フロントエンドパフォーマンス改善
   **分類**: 領域ベース
   **フォルダ名**: `docs/performance/`

   Takumiさん、`user-experience/` のUX定義をお願いいたします:
   - requirements.md: 目標とする表示速度、体感速度の要件
   - edge-cases.md: 低速回線、古いデバイスでの挙動
   ```

---

#### 例3: 既存機能の修正

**タスク**: 「サブスクリプションのWebhook 401エラーを修正」

**Phase 0の実行**:

1. **分類**: 機能ベース（サブスクリプション）
2. **既存確認**: `ls .claude/docs/` → `subscription/` **存在する**
3. **判断**: 既存フォルダを使用
4. **Phase 0完了**: Phase 1へ進む

（新規フォルダ作成不要）

---

## 📚 プロジェクト知識の管理

### 必ず参照・更新すべきドキュメント

#### 環境変数（environment-variables.md）
**いつ参照**: 実装開始前、エラー発生時
**いつ更新**: 新しい環境変数を追加した時

#### 技術マッピング（tech-stack-map.md）
**いつ参照**: 「この機能はどこ？」と思った時
**いつ更新**: 新しいファイル・機能を追加した時

#### 実装決定ログ（decision-log.md）
**いつ参照**: 「なぜこうなっているか？」と思った時
**いつ更新**: 重要な実装方針を決定した時

#### エラーデータベース（error-database.md）
**いつ参照**: エラーが発生した時
**いつ更新**: 新しいエラーに遭遇した時、解決した時

#### 実装計画（implementation-plans/）
**いつ作成**: 実装を開始する前（必須）
**いつ更新**: 実装中、完了時

---

## 📂 ドキュメント構造

```
.claude/
├── CLAUDE.md                              # このファイル（プロジェクト憲法）
├── CURRENT-FOCUS.md                       # 今取り組んでいること
├── PROJECT-RULES.md                       # 開発ルール
├── templates/                             # 新規フォルダ作成用テンプレート
│   ├── feature/                           # 機能ベーステンプレート
│   │   ├── README.md
│   │   ├── user-experience/               # Takumiさんの作業エリア
│   │   │   ├── README.md
│   │   │   ├── flows.md
│   │   │   ├── requirements.md
│   │   │   ├── edge-cases.md
│   │   │   └── issues.md
│   │   ├── implementation/                # Claude Codeの作業エリア
│   │   │   ├── README.md
│   │   │   ├── plans/
│   │   │   ├── specifications/
│   │   │   └── decisions/
│   │   └── troubleshooting/
│   │       ├── error-database.md
│   │       └── solutions-log.md
│   └── domain/                            # 領域ベーステンプレート
│       └── (同じ構造)
└── docs/
    ├── project-knowledge/                 # プロジェクト全体の知識
    │   ├── environment-variables.md       # 環境変数定義
    │   ├── tech-stack-map.md              # 技術マッピング
    │   └── decision-log.md                # 実装決定ログ
    └── subscription/                      # サブスクリプション機能
        ├── README.md                      # フォルダ索引
        ├── user-experience/               # Takumiさんの作業エリア
        │   ├── README.md
        │   ├── flows.md                   # ユーザーフロー定義
        │   ├── requirements.md            # UX要件定義
        │   ├── edge-cases.md              # エッジケース定義
        │   └── issues.md                  # UX問題トラッキング
        ├── implementation/                # Claude Codeの作業エリア
        │   ├── README.md
        │   ├── plans/                     # 実装計画
        │   │   ├── TEMPLATE.md
        │   │   └── YYYY-MM-DD-task.md
        │   ├── specifications/            # 技術仕様書
        │   └── decisions/                 # 実装決定ログ
        │       └── decisions.md
        └── troubleshooting/               # トラブルシューティング
            ├── error-database.md          # エラーデータベース
            └── solutions-log.md           # 解決策ログ
```

---

## ⚠️ 禁止事項

以下の行為は**絶対に禁止**:

1. ❌ 実装計画を作成せずに実装開始
2. ❌ ドキュメントを読まずに作業開始
3. ❌ 計画と異なることを実装（ブレる）
4. ❌ 「後でドキュメント書く」（実装と同時に書く）
5. ❌ エラーを記録せずに放置
6. ❌ 環境変数を追加したのに environment-variables.mdを更新しない
7. ❌ テストせずにデプロイ
8. ❌ 本番環境で実験的な操作

---

## 🎯 このワークフローで実現すること

### 1. ミスのない実装
✅ 実装前に計画を立てるため、見落としがない
✅ 環境変数・技術定義が明確なため、設定ミスがない

### 2. ブレない修正
✅ 実装計画に「なぜこの方法」が記録されている
✅ 後から見返しても理由が分かる

### 3. 失敗時の原因追求
✅ エラーデータベースに過去の失敗が蓄積されている
✅ 同じエラーに遭遇しても即座に解決できる

### 4. スケーラブルな開発
✅ 新機能追加時も同じ構造を適用
✅ チーム全体で統一された方法で開発

---

## 🚀 クイックスタート（新しいタスクを始める時）

1. **CURRENT-FOCUS.mdを開く** - 今の状況確認
2. **該当機能のドキュメントを読む**
3. **environment-variables.mdで環境変数確認**
4. **tech-stack-map.mdで関連ファイル確認**
5. **error-database.mdで既知の問題確認**
6. **implementation-plans/TEMPLATE.mdをコピーして計画書作成**
7. **計画をレビュー**
8. **実装開始**

---

## 📝 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2025-11-29 | v3.0 UX分離・自動フォルダ作成版（Phase 0追加、役割分担明確化、テンプレート作成） |
| 2025-11-29 | v2.0リファクタリング版（実装ワークフロー追加、ドキュメント構造再編） |
| 2025-11-28 | v1.0初版作成 |

---

**このワークフローを守ることで、ミスのない実装とブレない修正が可能になります。**
**全ての作業は、このルールに従って実施してください。**
