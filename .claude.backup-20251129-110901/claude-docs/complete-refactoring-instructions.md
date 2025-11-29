# .claudeフォルダ完全リファクタリング指示書（改善版）

**目的**: 
1. サブスクリプション特化から、スケーラブルな階層構造へ
2. **「毎回現状精査→実装方針策定→ドキュメント化→実装」のワークフロー確立**
3. **環境変数・技術定義の完全なドキュメント化**
4. **失敗時の原因追求とブレない修正を可能にする**

---

## 📋 最終的なフォルダ構成

```
.claude/
├── CLAUDE.md                              # プロジェクト全体の憲法
├── CURRENT-FOCUS.md                       # 今取り組んでいること
├── PROJECT-RULES.md                       # 開発ルール（既存）
└── docs/
    ├── project-knowledge/                 # プロジェクト全体の知識
    │   ├── environment-variables.md       # 環境変数定義（新規）
    │   ├── tech-stack-map.md              # 技術マッピング（新規）
    │   └── decision-log.md                # 実装決定ログ（新規）
    └── subscription/
        ├── README.md
        ├── WORK-GUIDE.md                  # サブスク作業ガイド（新規）
        ├── TASK-TRACKER.md
        ├── implementation-plans/          # 実装計画（新規）
        │   ├── TEMPLATE.md                # テンプレート
        │   └── YYYY-MM-DD-task-name.md    # 各実装の計画書
        ├── troubleshooting/               # トラブルシューティング（新規）
        │   ├── error-database.md          # エラーデータベース
        │   └── solutions-log.md           # 解決策ログ
        ├── specifications/
        ├── guides/
        └── plans/
```

---

## 🎯 新しいワークフロー（実装前計画の徹底）

### Phase 1: 現状精査（必須）

**実施内容**:
1. CURRENT-FOCUS.mdで今の状況を確認
2. 該当機能のドキュメントを読む
3. 環境変数定義を確認
4. 技術マッピングで関連ファイルを把握
5. エラーデータベースで既知の問題を確認

**成果物**: 現状の理解

---

### Phase 2: 実装計画策定（必須）

**実施内容**:
1. `implementation-plans/TEMPLATE.md`をコピー
2. 以下を詳細に記述:
   - 現状分析（何ができている/いない）
   - 実装方針（なぜこの方法を選ぶか）
   - 使用する環境変数・ライブラリ
   - テストケース
   - リスクと対策

**成果物**: `implementation-plans/YYYY-MM-DD-task-name.md`

**重要**: この計画書を作成せずに実装を開始してはいけない

---

### Phase 3: ドキュメント化（実装と並行）

**実施内容**:
1. 新しい環境変数を追加 → `environment-variables.md`に記録
2. 新しいファイル・機能を追加 → `tech-stack-map.md`に記録
3. 重要な実装決定 → `decision-log.md`に記録
4. エラー発生 → `error-database.md`に記録

**成果物**: 常に最新のドキュメント

---

### Phase 4: 実装（計画に従う）

**実施内容**:
1. 実装計画に従ってコーディング
2. 小さく分割して進める
3. こまめにテスト
4. ブレない（計画と異なることをしない）

**成果物**: 動作するコード

---

### Phase 5: 記録と完了報告

**実施内容**:
1. 実装計画に実施ログを追記
2. エラーが発生した場合は解決方法を記録
3. TASK-TRACKER.mdを更新
4. CURRENT-FOCUS.mdの履歴に記録

**成果物**: 完全な実装記録

---

## 📝 作業手順（ステップバイステップ）

### Step 1: バックアップ作成

```bash
cp -r .claude .claude.backup-$(date +%Y%m%d-%H%M%S)
```

---

### Step 2: 新しいドキュメントを作成

以下のファイルを作成してください：

#### 2-1: プロジェクト知識ディレクトリ作成

```bash
mkdir -p .claude/docs/project-knowledge
```

#### 2-2: 環境変数定義

**ファイル**: `.claude/docs/project-knowledge/environment-variables.md`

**内容**: 別途提供されたファイルの内容を使用
（environment-variables.mdの内容）

---

#### 2-3: 技術マッピング

**ファイル**: `.claude/docs/project-knowledge/tech-stack-map.md`

**内容**: 別途提供されたファイルの内容を使用
（tech-stack-map.mdの内容）

---

#### 2-4: 実装決定ログ

**ファイル**: `.claude/docs/project-knowledge/decision-log.md`

**内容**: 別途提供されたファイルの内容を使用
（decision-log.mdの内容）

---

#### 2-5: 実装計画ディレクトリ

```bash
mkdir -p .claude/docs/subscription/implementation-plans
```

**ファイル**: `.claude/docs/subscription/implementation-plans/TEMPLATE.md`

**内容**: 別途提供されたファイルの内容を使用
（implementation-plan-template.mdの内容）

---

#### 2-6: トラブルシューティングディレクトリ

```bash
mkdir -p .claude/docs/subscription/troubleshooting
```

**ファイル**: `.claude/docs/subscription/troubleshooting/error-database.md`

**内容**: 別途提供されたファイルの内容を使用
（error-database.mdの内容）

---

### Step 3: 既存ファイルの更新

#### 3-1: CLAUDE.md

既存のCLAUDE.mdを`.claude/CLAUDE.md.old`にリネームし、新しいCLAUDE.mdを作成

**内容**: 前回提供した改善版CLAUDE.mdの内容

**追加セクション**:

```markdown
## 🔄 実装ワークフロー（必須）

全ての実装は以下のフローに従ってください：

### 1. 現状精査
- [ ] CURRENT-FOCUS.mdで今の状況確認
- [ ] 該当機能のドキュメント確認
- [ ] environment-variables.md確認
- [ ] tech-stack-map.mdで関連ファイル把握
- [ ] error-database.mdで既知の問題確認

### 2. 実装計画策定
- [ ] implementation-plans/TEMPLATE.mdをコピー
- [ ] 現状分析を記述
- [ ] 実装方針を詳細に記述
- [ ] 使用する技術・環境変数を明記
- [ ] テストケース定義
- [ ] リスク評価

### 3. 計画レビュー
- [ ] 計画を読み返す
- [ ] 不明点があれば質問
- [ ] 承認を得る

### 4. 実装
- [ ] 計画に従ってコーディング
- [ ] ブレない（計画外のことをしない）
- [ ] こまめにテスト

### 5. ドキュメント更新
- [ ] 環境変数を追加したら environment-variables.md更新
- [ ] 新機能を追加したら tech-stack-map.md更新
- [ ] 重要な決定をしたら decision-log.md更新
- [ ] エラーが発生したら error-database.md更新

### 6. 完了報告
- [ ] 実装計画に実施ログ追記
- [ ] TASK-TRACKER.md更新
- [ ] CURRENT-FOCUS.md履歴更新

**このワークフローを守ることで、ミスのない実装とブレない修正が可能になります。**
```

---

#### 3-2: CURRENT-FOCUS.md

前回提供した内容で作成

---

#### 3-3: WORK-GUIDE.md

**ファイル**: `.claude/docs/subscription/WORK-GUIDE.md`

前回提供した内容をベースに、以下のセクションを追加：

```markdown
## 📋 実装前の必須チェックリスト

### Phase 1: 現状精査
- [ ] CURRENT-FOCUS.mdを読んだ
- [ ] このWORK-GUIDE.mdを読んだ
- [ ] environment-variables.mdで必要な環境変数を確認した
- [ ] tech-stack-map.mdで関連ファイルを把握した
- [ ] error-database.mdで既知の問題を確認した
- [ ] 既存コードを読んだ

### Phase 2: 実装計画策定
- [ ] implementation-plans/TEMPLATE.mdをコピーした
- [ ] 現状分析を詳細に記述した
- [ ] 実装方針を明確にした
- [ ] 使用する環境変数をすべてリストアップした
- [ ] 使用するライブラリ・APIを明記した
- [ ] テストケースを定義した
- [ ] リスクと対策を評価した
- [ ] 計画をレビューしてもらった

### Phase 3: 実装開始前
- [ ] 計画書に不明点がない
- [ ] すべての環境変数が設定されている
- [ ] 必要なライブラリがインストールされている
- [ ] テスト環境が整っている

**これらをクリアしてから実装を開始してください。**
```

---

#### 3-4: PROJECT-RULES.md

既存のPROJECT-RULES.mdに以下のセクションを追加：

```markdown
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

### ドキュメント化のルール

1. **実装前に計画書を作成する**
   - implementation-plans/TEMPLATE.mdを使用
   - 詳細に記述する（後で見返せるように）

2. **実装中にドキュメントを更新する**
   - 環境変数を追加 → environment-variables.md
   - 新機能を追加 → tech-stack-map.md
   - 重要な決定 → decision-log.md
   - エラー発生 → error-database.md

3. **実装後に記録を残す**
   - 実装計画に実施ログ
   - TASK-TRACKER.md
   - CURRENT-FOCUS.md

**「後でドキュメント書く」は禁止。実装と同時にドキュメント化する。**
```

---

### Step 4: 既存の問題をドキュメント化

現在進行中のcreate-checkoutエラーを記録：

#### 4-1: error-database.mdに追加

既に作成したerror-database.mdにcreate-checkoutエラーを記載済み

#### 4-2: 実装計画を作成

**ファイル**: `.claude/docs/subscription/implementation-plans/2025-11-28-create-checkout-debug.md`

```markdown
# create-checkout Edge Functionエラー修正

**作成日**: 2025-11-28
**担当**: Takumi + Claude
**ステータス**: 調査中

---

## 🎯 実装の目的

**何を実装するか**:
create-checkout Edge Functionの500エラーを修正する

**なぜ実装するか**:
プレミアムプラン申込時に決済画面に進めず、ユーザーがサブスクリプションを開始できない

---

## 📋 現状分析

### 現在の状態

**何ができている**:
- プラン選択画面の表示
- ボタンのクリック

**何ができていない**:
- Checkout Session作成
- Stripe決済画面への遷移

**問題点**:
- create-checkout Edge Functionが500エラーを返す
- 詳細なエラーメッセージが取得できていない

---

### 関連する既存コード・設定

**影響を受けるファイル**:
- `supabase/functions/create-checkout/index.ts` - Edge Function本体
- `app/subscription/plans/page.tsx` - フロントエンド（呼び出し元）
- `lib/stripe/config.ts` - Stripe設定

**使用する環境変数**:
- `STRIPE_SECRET_KEY` - Stripe APIキー
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe公開キー
- `NEXT_PUBLIC_APP_URL` - リダイレクトURL

参照: `.claude/docs/project-knowledge/environment-variables.md`

**依存するライブラリ・API**:
- Stripe API（Checkout Session作成）
- Supabase Edge Functions

---

## 🎨 実装方針

### アプローチ

**Phase 1: エラー詳細の取得**
1. Edge Function内にconsole.log追加
2. try-catchブロックで詳細なエラーキャッチ
3. Supabaseログで確認

**Phase 2: 原因特定**
（Phase 1の結果次第）

**Phase 3: 修正実装**
（原因特定後に計画）

---

## ⚠️ リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 環境変数の問題 | 🔴 高 | environment-variables.mdで再確認 |
| Stripe APIキーの問題 | 🔴 高 | Dashboardで有効性確認 |
| コードのバグ | 🟡 中 | デバッグログ追加 |

---

## 🧪 テストケース

### 正常系

**ケース1: プレミアムプラン申込**
- **前提条件**: 無料プランユーザーがログイン中
- **実行内容**: プレミアムプラン選択→ボタンクリック
- **期待結果**: Stripe Checkout画面に遷移

---

## 📝 実装ログ

### 2025-11-28 15:00

**やったこと**:
- 問題の確認
- この実装計画書の作成
- ドキュメント構成のリファクタリング

**発見した問題**:
- 詳細なエラーログが取得できていない
- Edge Function内のエラーハンドリングが不十分

**次回やること**:
1. Edge Functionにデバッグログ追加
2. try-catchで詳細エラー取得
3. Supabaseログ確認

---

（実装進行に合わせて更新）
```

---

### Step 5: 動作確認

#### 5-1: ファイル構成確認

```bash
tree .claude -L 4
```

期待される構成を確認

---

#### 5-2: ワークフローテスト

**シナリオ**: 新しいバグ修正を開始する

1. CURRENT-FOCUS.mdを開く
2. 該当のWORK-GUIDE.mdを確認
3. environment-variables.mdで環境変数確認
4. tech-stack-map.mdで関連ファイル確認
5. error-database.mdで既知の問題確認
6. implementation-plans/TEMPLATE.mdをコピーして計画書作成
7. 計画書に従って実装
8. エラー発生→error-database.mdに記録
9. 完了→TASK-TRACKER.md更新

このフローがスムーズに進むか確認

---

## ✅ 完了チェックリスト

### 新規ファイル作成
- [ ] `.claude/docs/project-knowledge/environment-variables.md`
- [ ] `.claude/docs/project-knowledge/tech-stack-map.md`
- [ ] `.claude/docs/project-knowledge/decision-log.md`
- [ ] `.claude/docs/subscription/implementation-plans/TEMPLATE.md`
- [ ] `.claude/docs/subscription/troubleshooting/error-database.md`
- [ ] `.claude/docs/subscription/implementation-plans/2025-11-28-create-checkout-debug.md`

### 既存ファイル更新
- [ ] `.claude/CLAUDE.md` - 実装ワークフローセクション追加
- [ ] `.claude/CURRENT-FOCUS.md` - 作成
- [ ] `.claude/docs/subscription/WORK-GUIDE.md` - チェックリスト追加
- [ ] `.claude/PROJECT-RULES.md` - ドキュメント管理セクション追加

### ワークフロー確認
- [ ] 現状精査→計画→実装→記録の流れが明確
- [ ] 環境変数・技術定義が参照しやすい
- [ ] エラー時の対応方法が明確
- [ ] ブレない修正ができる仕組みになっている

---

## 🎯 この改善版で実現すること

### 1. 「毎回現状精査→計画→実装」のワークフロー
✅ 実装計画テンプレートで強制
✅ WORK-GUIDE.mdのチェックリストで確認
✅ ドキュメントを読まずに実装開始できない仕組み

### 2. 環境変数・技術定義の完全ドキュメント化
✅ environment-variables.md で一元管理
✅ tech-stack-map.md で技術マッピング
✅ decision-log.md で実装決定の記録

### 3. 失敗時の原因追求とブレない修正
✅ error-database.md でエラーと解決策を蓄積
✅ 実装計画で「なぜこの方法」が明確
✅ ドキュメントを参照すれば原因が分かる

### 4. スケーラブルな構成
✅ 新機能追加時も同じ構造を適用可能
✅ CLAUDE.mdはプロジェクト全体の憲法として機能
✅ 機能ごとに独立したドキュメント管理

---

**この指示書に従えば、ユーザーの要件を完全に満たす.claude構成が完成します。**
