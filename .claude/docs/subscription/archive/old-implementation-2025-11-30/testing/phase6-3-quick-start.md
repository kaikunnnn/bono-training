# Phase 6-3 テスト クイックスタートガイド

**対象**: Phase 6-3: Realtime通知実装のテスト
**所要時間**: 約15-20分

---

## 🚀 1分でテストを開始する

### ステップ1: 環境確認（1分）

```bash
# ターミナル1: 開発サーバー起動確認
npm run dev
# → http://localhost:8080 で起動していればOK

# ターミナル2（別のターミナルを開く）: Supabase確認
npx supabase status
# → API URL, DB URLが表示されればOK
```

### ステップ2: テスト用アカウントの準備（2分）

1. ブラウザで `http://localhost:8080` を開く
2. テスト用アカウントでログイン
   - 既存のサブスクリプションがあるアカウントを使う
   - **重要**: プランを変更できる状態にする

### ステップ3: チェックリストを開く（1分）

**ファイル**: `.claude/docs/subscription/testing/phase6-3-realtime-test-checklist.md`

このファイルを開いて、テスト結果を直接記録してください。

---

## 📝 各テストの重要度

### 必須テスト（必ず実施）

- ✅ **Test 1**: 正常系 - プラン変更のRealtime通知
- ✅ **Test 2**: タイミングテスト - 即座の反映確認
- ✅ **Test 4**: UX確認 - ページリロードの不発生

### 推奨テスト（実施推奨）

- 🔵 **Test 5**: 複数回のプラン変更
- 🔵 **Test 6**: useSubscription hookとの連携

### オプションテスト（上級者向け）

- 🟡 **Test 3**: エラー系 - タイムアウトテスト

---

## 🎯 最重要チェックポイント

### 1. ページリロードが発生しないこと

**確認方法**:
```javascript
// ブラウザコンソールで実行
const marker = document.createElement('div');
marker.textContent = 'TEST MARKER';
marker.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;z-index:9999;';
document.body.appendChild(marker);
```

→ プラン変更後もマーカーが残っていればOK ✅

### 2. 3秒より速く反映されること

**確認方法**:
- ブラウザコンソールでタイムスタンプを確認
- 「プラン変更を確定します」から「✅ プラン変更をRealtime検知」までの時間を測定
- **目標**: 1-2秒で完了

### 3. 成功メッセージが正しく表示されること

**期待されるメッセージ**:
1. 「プラン変更を受け付けました」
2. 「変更を処理中です。しばらくお待ちください...」
3. 「プラン変更が完了しました」
4. 「新しいプランが適用されました。」

---

## 🔍 よくある問題と対処法

### 問題1: Realtime通知が来ない

**症状**: 10秒経過してタイムアウト

**確認項目**:
1. Supabase RealtimeがONになっているか
   - Supabase Dashboard > Settings > API > Realtime
2. Edge Functionが正しくデプロイされているか
   ```bash
   npx supabase functions list
   ```
3. Webhookが正しく設定されているか
   - Stripe Dashboard > Developers > Webhooks

**対処法**:
- Supabase Realtimeを有効化
- Edge Functionを再デプロイ: `npx supabase functions deploy stripe-webhook`

---

### 問題2: ページリロードが発生する

**症状**: マーカーが消える

**原因**: `window.location.reload()` が残っている可能性

**確認項目**:
1. `src/pages/Subscription.tsx` のLine 209-276を確認
2. `setTimeout(() => window.location.reload(), 3000)` が削除されているか

**対処法**:
- Phase 6-3の実装を再確認
- Gitで最新のコードを確認

---

### 問題3: 複数回プラン変更するとエラー

**症状**: 2回目以降のプラン変更で通知が来ない

**原因**: チャンネルのクリーンアップが不十分

**確認項目**:
```javascript
// ブラウザコンソールで実行
supabase.getChannels();
```

**対処法**:
- ページをリロード
- コードを確認: `changeDetectionChannel.unsubscribe()` が呼ばれているか

---

## 📊 テスト結果の記録方法

### 成功した場合

```markdown
**結果**: [x] 成功

**所要時間**: `2秒`

**メモ**:
```
Realtime通知が1.8秒で検知され、スムーズにUIが更新された。
ページリロードは発生せず、マーカーも残存。
```
```

### 失敗した場合

```markdown
**結果**: [x] 失敗

**所要時間**: `10秒`

**メモ**:
```
10秒経過してタイムアウト。
コンソールに「⚠️ プラン変更のタイムアウト（10秒経過）」が表示。
原因調査が必要。
```
```

---

## 🎬 テストの流れ（全体像）

```
【準備】
1. 開発サーバー起動
2. テスト用アカウントでログイン
3. チェックリストを開く
   ↓
【Test 1: 正常系】5分
1. プラン変更を実行
2. Realtime通知を確認
3. タイムスタンプを記録
4. UIが更新されたか確認
   ↓
【Test 2: タイミング】3分
1. 別のプランに変更
2. 処理時間を測定
3. 3秒未満で完了したか確認
   ↓
【Test 4: ページリロード不発生】3分
1. マーカーを追加
2. プラン変更を実行
3. マーカーが残っているか確認
   ↓
【Test 5: 複数回プラン変更】5分
1. 3回連続でプラン変更
2. すべて正常に完了するか確認
   ↓
【Test 6: useSubscription連携】3分
1. 両方のRealtime subscriptionが動作するか確認
   ↓
【Test 3: タイムアウト】（オプション）
1. Edge Functionを停止
2. タイムアウトを確認
3. Edge Functionを再起動
   ↓
【テスト結果まとめ】2分
1. チェックリストに記録
2. 合格/不合格を判定
```

**合計所要時間**: 約20分（Test 3を除く）

---

## ✅ テスト完了の判断基準

### 最低限の合格条件

以下がすべて成功していれば合格:

1. ✅ Test 1（正常系）が成功
2. ✅ Test 2（タイミング）が成功し、3秒未満で完了
3. ✅ Test 4（ページリロード不発生）が成功

### 理想的な合格条件

上記に加えて:

4. ✅ Test 5（複数回プラン変更）が成功
5. ✅ Test 6（useSubscription連携）が成功

---

## 🛠️ トラブルシューティングチェックリスト

テストがうまくいかない場合、以下を確認:

- [ ] `npm run dev` で開発サーバーが起動している
- [ ] `npx supabase status` でSupabaseが起動している
- [ ] テスト用アカウントでログインしている
- [ ] テスト用アカウントに既存のサブスクリプションがある
- [ ] ブラウザコンソールにエラーが出ていないか
- [ ] Supabase Realtimeが有効化されているか（Dashboard確認）
- [ ] Edge Functionがデプロイされているか（`npx supabase functions list`）
- [ ] Stripe Webhookが正しく設定されているか

---

## 📞 サポート

問題が解決しない場合:

1. **エラーログを確認**
   - ブラウザコンソール
   - Supabase Edge Function Logs

2. **ドキュメントを確認**
   - `IMPLEMENTATION_LOG.md` (Phase 6-3セクション)
   - `error-database.md`

3. **Issueを作成**
   - 発見した問題をIssueとして記録
   - 再現手順、エラーログ、期待動作を記載

---

**準備ができたら、`phase6-3-realtime-test-checklist.md` を開いてテストを開始してください！**
