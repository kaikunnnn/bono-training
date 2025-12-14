# Sanity Dataset Separation テスト仕様書

**作成日**: 2025-12-13
**テスト対象**: 開発/本番データセット分離機能

---

## 前提条件

- [○] ローカルサーバーが起動している (`npm run dev` → http://localhost:8080)
- [○] Sanity Studio が起動している (http://localhost:3333)

---

## テスト 1: ローカルアプリが development データセットを参照していることを確認

### 手順

1. ブラウザで http://localhost:8080/lessons を開く
2. レッスン一覧が表示されることを確認
3. いずれかのレッスンをクリックして詳細ページに遷移

### 期待結果

- [○] レッスン一覧が表示される
- [○] レッスン詳細ページが表示される
- [○] エラーが発生しない

---

## テスト 2: Sanity Studio が development データセットに接続していることを確認

### 手順

1. ブラウザで http://localhost:3333 を開く
2. 画面上部のタイトルを確認

### 期待結果

- [❌️] タイトルが「**BONO (開発)**」と表示される
- [❌️] 「BONO (本番)」ではないことを確認

---

## テスト 3: development での編集がローカルアプリに反映されることを確認

### 手順

1. Sanity Studio (http://localhost:3333) で任意のレッスンを開く
2. タイトルの末尾に「【テスト】」を追加して保存（Publish）
3. ローカルアプリ (http://localhost:8080/lessons) をリロード

### 期待結果

- [○] 編集したレッスンのタイトルに「【テスト】」が表示される

### 後処理

- [○] 「【テスト】」を削除して元に戻す（Publish）

---

## テスト 4: production データセットが変更されていないことを確認

### 手順

1. ターミナルで以下を実行:
   ```bash
   cd sanity-studio
   npx sanity documents query '*[_type == "lesson"][0].title' --dataset production
   ```
2. タイトルに「【テスト】」が含まれていないことを確認

### 期待結果

- [○] production のデータにはテスト 3 で追加した「【テスト】」が含まれていない

---

## テスト 5: npm run sanity:prod で本番データセットに接続できることを確認

### 手順

1. 現在の Sanity Studio を停止（Ctrl+C）
2. プロジェクトルートで以下を実行:
   ```bash
   npm run sanity:prod
   ```
3. ブラウザで http://localhost:3333 を開く（またはリロード）

### 期待結果

- [○] タイトルが「**BONO (本番)**」と表示される
- [○] 「BONO (開発)」ではないことを確認

### 後処理

- [○] Studio を停止して `npm run sanity:dev` で開発用に戻す

---

## テスト 6: 本番ビルドが production データセットを参照することを確認

### 手順

1. プロジェクトルートで以下を実行:
   ```bash
   npm run build
   ```
2. ビルドログまたは生成されたファイルを確認

### 期待結果

- [○] ビルドが正常に完了する
- [○] `.env.production` の `VITE_SANITY_DATASET=production` が使用される

### 確認方法（オプション）

```bash
npm run preview
```

でプレビューサーバーを起動し、production のデータが表示されることを確認

---

## テスト 7: データ同期（sanity:sync）が動作することを確認

⚠️ **注意**: このテストは production のデータを上書きします。本番に影響がない場合のみ実行してください。

### 手順

1. プロジェクトルートで以下を実行:
   ```bash
   npm run sanity:sync
   ```
2. 完了まで待つ

### 期待結果

- [○] エクスポートが成功する
- [○] インポートが成功する（82 documents）
- [○] 一時ファイルが削除される

---

## テスト結果サマリー

| #   | テスト項目                          | 結果 | 備考       |
| --- | ----------------------------------- | ---- | ---------- |
| 1   | ローカルアプリが development を参照 | ✅   |            |
| 2   | Studio が「BONO (開発)」と表示      | ✅   |            |
| 3   | development の編集がローカルに反映  | ✅   |            |
| 4   | production が変更されていない       | ✅   |            |
| 5   | sanity:prod で本番に接続            | ✅   |            |
| 6   | 本番ビルドが production を参照      | ✅   |            |
| 7   | sanity:sync が動作                  | ✅   | 82 docs synced |

---

## トラブルシューティング

### Studio のタイトルが変わらない場合

ブラウザをハードリロード（Cmd+Shift+R）してキャッシュをクリアしてください。

### ローカルアプリにデータが表示されない場合

1. `.env.local` の `VITE_SANITY_DATASET=development` を確認
2. Vite サーバーを再起動（`npm run dev`）

### Studio でエラーが出る場合

1. `sanity-studio/sanity.config.ts` の設定を確認
2. `npx sanity dataset list` でデータセットが存在するか確認
