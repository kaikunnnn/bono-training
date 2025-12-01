# Claude Code プロジェクトルール

**作成日**: 2025-11-28
**目的**: Claude Codeがこのプロジェクトで開発する際の必須ルール

---

## 📌 最重要ルール

### 1. タスク管理の徹底

**ルール**: すべてのタスクは `.claude/docs/subscription/TASK-TRACKER.md` に集約する

**やること**:
- ✅ 作業開始時: TASK-TRACKER.mdを読んで現状把握
- ✅ 作業中: 新しい問題を発見したら即座にCritical Issuesセクションに追記
- ✅ 作業終了時: 完了したタスクを「完了履歴」に移動し、進捗を更新

**やってはいけないこと**:
- ❌ タスクを別のドキュメントに分散させる
- ❌ 問題を見つけても記録せずに進む
- ❌ TASK-TRACKER.mdを数日間更新しない

**例（良い例）**:
```markdown
## 🚨 現在のCritical Issues

### Issue 3: 新たに発見された問題 🔴
- **発見日**: 2025-11-28
- **優先度**: 🔴 CRITICAL
- **ステータス**: ⏳ 未対応
- **影響**: ...
- **次のアクション**: ...
```

**例（悪い例）**:
```
# コメントやログに書くだけ
console.log('なんかエラーあるけど後で見る');  // ❌ 記録されない
```

---

### 2. ドキュメントファーストの開発

**ルール**: コードを書く前に、必ず関連ドキュメントを確認する

**確認すべきドキュメント（優先順）**:
1. **TASK-TRACKER.md** - 今何をすべきか
2. **README.md** - どこに何の情報があるか
3. **specifications/system-specification.md** - システムの仕様
4. **guides/common-errors.md** - 過去の失敗例

**やること**:
```bash
# 実装前の確認フロー
1. TASK-TRACKER.mdを開く
2. 該当タスクの「関連ドキュメント」を確認
3. 関連ドキュメントを読む
4. 理解してから実装開始
```

**やってはいけないこと**:
- ❌ ドキュメントを読まずにいきなりコード実装
- ❌ 過去の失敗例（common-errors.md）を無視
- ❌ 「たぶんこうだろう」で進める

---

### 3. 問題発見時の即座の対応

**ルール**: エラーや問題を発見したら、必ず以下を実施する

**必須アクション（3分以内）**:
1. **TASK-TRACKER.mdのCritical Issuesセクションに追記**
2. **優先度を判定**（🔴 CRITICAL / 🟡 MEDIUM / 🟢 LOW）
3. **影響範囲を記載**
4. **次のアクションを明記**

**テンプレート**:
```markdown
### Issue X: [問題の簡潔な説明] [優先度絵文字]

**発見日**: YYYY-MM-DD
**優先度**: 🔴/🟡/🟢
**ステータス**: ⏳ 未対応
**担当**: 未定

**影響範囲**:
- [どの機能が影響を受けるか]

**エラー内容**:
```
[エラーメッセージ]
```

**再現手順**:
1. ...
2. ...

**次のアクション**:
1. [ ] ...
2. [ ] ...

**関連ドキュメント**:
- [関連するドキュメントへのリンク]
```

---

### 4. 実装完了の定義（Definition of Done）

**ルール**: 以下を全て満たすまで「完了」としない

**チェックリスト**:
- [ ] コードが正しく動作する
- [ ] TypeScriptのコンパイルエラーがない
- [ ] テストが通る（該当する場合）
- [ ] ドキュメントを更新した
- [ ] TASK-TRACKER.mdの該当タスクを「完了」に更新
- [ ] Git commitメッセージが明確
- [ ] Edge Functionをデプロイした（該当する場合）

**やってはいけないこと**:
- ❌ 動作確認せずにcommit
- ❌ ドキュメント更新を忘れる
- ❌ TASK-TRACKER.mdの更新を忘れる

---

## 📂 ドキュメント管理ルール

### ドキュメント作成時のルール

1. **必ず目的を明記する**
   ```markdown
   **目的**: このドキュメントは〇〇のために存在する
   ```

2. **作成日・最終更新日を記載**
   ```markdown
   **作成日**: YYYY-MM-DD
   **最終更新**: YYYY-MM-DD
   ```

3. **関連ドキュメントへのリンクを追加**
   ```markdown
   ## 🔗 関連ドキュメント
   - [README.md](./README.md)
   - [system-specification.md](./specifications/system-specification.md)
   ```

4. **TODOを残さない**
   - ドキュメント内に`TODO`や`TBD`を残してはいけない
   - 未完成の場合は、TASK-TRACKER.mdに「ドキュメント完成タスク」を追加

---

### ドキュメント更新時のルール

1. **最終更新日を必ず変更**
2. **変更履歴セクションに記録**
   ```markdown
   ## 📝 更新履歴
   | 日付 | 更新内容 | 更新者 |
   |------|---------|--------|
   | 2025-11-28 | Issue 1追加 | AI開発チーム |
   ```

3. **古い情報は削除せず、アーカイブに移動**
   - `archive/old-investigations/`に移動
   - README.mdに移動先を記載

---

## 🧪 テストルール

### テスト実施の必須条件

**ルール**: コード変更後は、必ず以下のテストを実施する

1. **ローカルでの動作確認**
   ```bash
   npm run dev
   # → ブラウザで動作確認
   ```

2. **TypeScriptコンパイル確認**
   ```bash
   npx tsc --noEmit
   # → エラー0件を確認
   ```

3. **Edge Functionログ確認**（Edge Function変更時）
   ```bash
   npx supabase functions logs [function-name] --project-ref fryogvfhymnpiqwssmuu
   # → エラーがないことを確認
   ```

4. **データベース確認**（DB操作時）
   ```sql
   SELECT * FROM [table_name] WHERE ... LIMIT 10;
   # → 期待通りのデータが入っていることを確認
   ```

---

### テスト結果の記録

**ルール**: テスト結果は必ずドキュメントに記録する

**記録場所**:
- `testing/testing-log.md` - テスト結果の詳細
- `TASK-TRACKER.md` - タスク完了の証跡

**記録内容**:
```markdown
### Test X: [テスト名]

**実施日**: YYYY-MM-DD
**結果**: ✅ 成功 / ❌ 失敗

**テスト内容**:
1. ...
2. ...

**結果詳細**:
- [スクリーンショット]
- [ログ出力]
- [データベーススナップショット]

**備考**:
- [気づいた点]
```

---

## 🚀 デプロイルール

### デプロイ前チェックリスト

**ルール**: 以下を全て確認してからデプロイする

- [ ] ローカルで動作確認済み
- [ ] TypeScriptコンパイルエラーなし
- [ ] テスト実施済み
- [ ] ドキュメント更新済み
- [ ] TASK-TRACKER.md更新済み
- [ ] Git commitメッセージが明確
- [ ] 環境変数の設定を確認（test/live）

---

### Edge Functionデプロイ手順

**ルール**: 以下の順序で実施する

```bash
# 1. ローカルでテスト
npm run dev

# 2. TypeScriptチェック
npx tsc --noEmit

# 3. デプロイ
npx supabase functions deploy [function-name] --project-ref fryogvfhymnpiqwssmuu

# 4. ログ確認（デプロイ後すぐ）
npx supabase functions logs [function-name] --project-ref fryogvfhymnpiqwssmuu

# 5. 動作確認
# → ブラウザで実際に操作して確認

# 6. TASK-TRACKER.mdを更新
# → 「デプロイ完了」を記録
```

---

## 🔧 環境管理ルール

### ⚠️ 重要: Supabase MCPツールの注意点

**警告**: Supabase MCPツール（`mcp__supabase__*`）は**本番DB**に接続しています。

**ローカルDBを確認する場合は、以下のDocker経由コマンドを使用してください**:

```bash
# ローカルDBのテーブル確認
/Applications/Docker.app/Contents/Resources/bin/docker exec supabase_db_fryogvfhymnpiqwssmuu psql -U postgres -d postgres -c "SELECT * FROM [table] WHERE environment = 'test' LIMIT 10;"

# ローカルDBのスキーマ確認
/Applications/Docker.app/Contents/Resources/bin/docker exec supabase_db_fryogvfhymnpiqwssmuu psql -U postgres -d postgres -c "\d [table]"
```

**使い分け**:
- `mcp__supabase__execute_sql` → 本番DBを確認したい時
- Docker psql → ローカルDBを確認したい時（テスト中はこちらを使う）

---

### 🧪 ローカルテスト開始前チェックリスト

**ルール**: ローカルテストを開始する前に、以下を全て確認する

```bash
# 1. Supabase localが起動しているか
npx supabase status
# → 全てのサービスがrunningであること

# 2. Edge Functionsが起動しているか
lsof -i :54321 | grep -i functions
# → プロセスが存在すること
# もしなければ: npx supabase functions serve --env-file .env --no-verify-jwt

# 3. Stripe CLIが動いているか
ps aux | grep "stripe listen"
# → プロセスが存在すること
# もしなければ: ~/bin/stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# 4. フロントエンドがローカルを向いているか
grep VITE_SUPABASE_URL .env.local
# → http://127.0.0.1:54321 であること

# 5. 開発サーバーが起動しているか
lsof -i :8080
# → プロセスが存在すること
# もしなければ: npm run dev
```

**チェックリストまとめ**:
- [ ] `npx supabase status` → 全サービスrunning
- [ ] Edge Functions起動中（ポート54321）
- [ ] stripe listen起動中
- [ ] `.env.local`がローカルURL（127.0.0.1:54321）
- [ ] `npm run dev`起動中（ポート8080）

---

### 環境の明確化

**ルール**: 常にどの環境で作業しているか明確にする

**環境の種類**:
- **localhost**: テスト環境（固定）
- **Vercel Preview**: テスト環境（自動）
- **Vercel Production**: テスト環境（手動切替で本番可能）
- **Edge Functions**: `STRIPE_MODE`環境変数で制御

**確認コマンド**:
```bash
# Edge Functionの環境確認
npx supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
# → 「環境判定: test」または「環境判定: live」を確認

# データベースの環境確認
SELECT DISTINCT environment FROM user_subscriptions;
```

---

### 本番環境での作業

**ルール**: 本番環境では以下を厳守する

⚠️ **警告**: 本番環境での作業は**実際のお金が動く**

**必須確認事項**:
1. [ ] テスト環境で完全に動作確認済み
2. [ ] deployment-checklist.mdを全て確認済み
3. [ ] ロールバック手順を理解している
4. [ ] バックアップを取得している

**禁止事項**:
- ❌ テスト不十分な状態でのデプロイ
- ❌ ドキュメント未更新のままのデプロイ
- ❌ 環境変数の設定を間違える
- ❌ 本番データベースで実験的なクエリを実行

---

## 💬 コミュニケーションルール

### ユーザーへの質問

**ルール**: 以下の場合は必ずユーザーに質問する

**質問すべき状況**:
- 🤔 仕様が不明確で判断できない
- 🤔 複数の選択肢があり、どれが良いか判断が難しい
- 🤔 大きな変更が必要で、影響範囲が広い
- 🤔 ドキュメントに記載がなく、推測でしか進められない

**質問してはいけない状況**:
- ❌ ドキュメントに既に書いてある内容
- ❌ common-errors.mdに解決方法が書いてある問題
- ❌ 自分で調査すれば分かること

---

### ユーザーへの報告

**ルール**: 以下のタイミングで必ず報告する

**報告すべきタイミング**:
1. Critical Issueを発見したとき
2. タスクが完了したとき
3. 予定より大幅に遅延しそうなとき
4. 想定外の問題が発生したとき

**報告フォーマット**:
```markdown
## 報告: [タイトル]

**日時**: YYYY-MM-DD HH:MM
**カテゴリ**: 完了報告 / 問題報告 / 進捗報告

**内容**:
- [簡潔に状況を説明]

**次のアクション**:
- [次に何をするか]

**関連ドキュメント**:
- TASK-TRACKER.md
```

---

## 🎯 優先度の判断基準

### Critical（🔴）の基準

以下のいずれかに該当する場合は🔴 CRITICAL:

- 本番環境でユーザーに影響がある
- 新規登録・プラン変更・キャンセルができない
- データ不整合が発生する可能性がある
- セキュリティリスクがある
- 決済エラーが発生する

**対応期限**: 即座（数時間以内）

---

### Medium（🟡）の基準

以下のいずれかに該当する場合は🟡 MEDIUM:

- テスト環境でのみ影響がある
- UXが悪化するが、機能は使える
- パフォーマンスが低下する
- ドキュメントが古い・不足している

**対応期限**: 1-2日以内

---

### Low（🟢）の基準

以下のいずれかに該当する場合は🟢 LOW:

- 将来的な改善案
- コードのリファクタリング
- 追加機能の提案
- デザインの微調整

**対応期限**: 時間があるときに対応

---

## 📚 このルールの運用

### ルールの確認タイミング

**必須確認タイミング**:
1. **新しいタスクを開始する前**
2. **問題を発見したとき**
3. **デプロイする前**
4. **ユーザーに質問する前**

### ルールの更新

**ルール**: このルールも改善していく

**更新すべき状況**:
- 新しいベストプラクティスを発見したとき
- ルールが不明確で混乱が生じたとき
- プロジェクトの状況が変わったとき

**更新手順**:
1. 変更内容を明確化
2. ユーザーに提案
3. 承認後、更新履歴に記録

---

## 📝 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2025-11-28 | 初版作成 | AI開発チーム |

---

## 🔗 関連ドキュメント

- **TASK-TRACKER.md** - タスク管理の実際の運用
- **README.md** - ドキュメント索引
- **guides/common-errors.md** - 過去の失敗例
- **deployment-checklist.md** - デプロイ時のチェック項目

---

**このルールは全ての開発作業の基盤です。必ず守ってください。**
