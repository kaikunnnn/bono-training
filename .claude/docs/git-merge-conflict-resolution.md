# Git マージコンフリクトの解決手順

**作成日**: 2025-11-14
**対象ファイル**: `src/App.tsx`

---

## 🔍 コンフリクトの内容

`devin/1762157967-webflow-integration` ブランチを `main` にマージしようとした際、`src/App.tsx` でコンフリクトが発生しました。

### コンフリクト箇所1: import文（33行目付近）

```tsx
import ComponentsReferencePage from "./pages/Dev/Components";
<<<<<<< devin/1762157967-webflow-integration
import WebflowTest from "./pages/Dev/WebflowTest";
=======
import GuideManual from "./pages/Dev/GuideManual";
>>>>>>> main
import LessonDetail from "./pages/LessonDetail";
```

### コンフリクト箇所2: Route定義（85行目付近）

```tsx
<Route path="/dev" element={<DevRoute><DevHome /></DevRoute>} />
<Route path="/dev/components" element={<DevRoute><ComponentsReferencePage /></DevRoute>} />
<<<<<<< devin/1762157967-webflow-integration
<Route path="/dev/webflow-test" element={<DevRoute><WebflowTest /></DevRoute>} />
=======
<Route path="/dev/guide-manual" element={<DevRoute><GuideManual /></DevRoute>} />
>>>>>>> main
```

---

## 💡 解決方針

**両方のルートを残す**（どちらも必要な機能）

- `WebflowTest`: Webflow連携のテストページ（作業ブランチで追加）
- `GuideManual`: ガイドマニュアルページ（mainで追加済み）

---

## 📝 解決手順

### Step 1: コンフリクトマーカーを確認

エディタで `src/App.tsx` を開くと、以下のようなマーカーが表示されています:

```
<<<<<<< devin/1762157967-webflow-integration
（作業ブランチのコード）
=======
（mainブランチのコード）
>>>>>>> main
```

### Step 2: import文を修正

**修正前**:
```tsx
import ComponentsReferencePage from "./pages/Dev/Components";
<<<<<<< devin/1762157967-webflow-integration
import WebflowTest from "./pages/Dev/WebflowTest";
=======
import GuideManual from "./pages/Dev/GuideManual";
>>>>>>> main
import LessonDetail from "./pages/LessonDetail";
```

**修正後**（両方のimportを残す）:
```tsx
import ComponentsReferencePage from "./pages/Dev/Components";
import WebflowTest from "./pages/Dev/WebflowTest";
import GuideManual from "./pages/Dev/GuideManual";
import LessonDetail from "./pages/LessonDetail";
```

### Step 3: Route定義を修正

**修正前**:
```tsx
<Route path="/dev" element={<DevRoute><DevHome /></DevRoute>} />
<Route path="/dev/components" element={<DevRoute><ComponentsReferencePage /></DevRoute>} />
<<<<<<< devin/1762157967-webflow-integration
<Route path="/dev/webflow-test" element={<DevRoute><WebflowTest /></DevRoute>} />
=======
<Route path="/dev/guide-manual" element={<DevRoute><GuideManual /></DevRoute>} />
>>>>>>> main
```

**修正後**（両方のRouteを残す）:
```tsx
<Route path="/dev" element={<DevRoute><DevHome /></DevRoute>} />
<Route path="/dev/components" element={<DevRoute><ComponentsReferencePage /></DevRoute>} />
<Route path="/dev/webflow-test" element={<DevRoute><WebflowTest /></DevRoute>} />
<Route path="/dev/guide-manual" element={<DevRoute><GuideManual /></DevRoute>} />
```

### Step 4: コンフリクトマーカーを削除

以下の行をすべて削除:
```
<<<<<<< devin/1762157967-webflow-integration
=======
>>>>>>> main
```

### Step 5: ファイルを保存

`src/App.tsx` を保存します。

---

## 🔧 Git操作（ターミナル）

### 1. 現在の状態を確認

```bash
git status
```

出力例:
```
On branch devin/1762157967-webflow-integration
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   src/App.tsx
```

### 2. 修正したファイルをステージング

```bash
git add src/App.tsx
```

### 3. マージを完了

```bash
git commit
```

デフォルトのマージコミットメッセージが表示されます:
```
Merge branch 'main' into devin/1762157967-webflow-integration

# Conflicts:
#       src/App.tsx
#
# It looks like you may be committing a merge.
# If this is not correct, please run
#       git update-ref -d MERGE_HEAD
# and try again.
```

そのまま保存してエディタを閉じます（Vim の場合は `:wq`）。

### 4. マージ完了を確認

```bash
git status
```

出力例:
```
On branch devin/1762157967-webflow-integration
nothing to commit, working tree clean
```

### 5. リモートにプッシュ

```bash
git push origin devin/1762157967-webflow-integration
```

---

## ✅ 確認事項

マージ後、以下を確認してください:

1. **ビルドが通るか**:
   ```bash
   npm run build
   ```

2. **両方のルートが動作するか**:
   - http://localhost:5173/dev/webflow-test
   - http://localhost:5173/dev/guide-manual

3. **コンソールエラーがないか**:
   ブラウザの開発者ツールでエラーを確認

---

## 🚨 トラブルシューティング

### エラー: "error: Your local changes to the following files would be overwritten by merge"

**原因**: 未コミットの変更がある

**解決**:
```bash
# 変更を一時保存
git stash

# マージ実行
git merge main

# コンフリクト解決後、変更を戻す
git stash pop
```

### エラー: "fatal: You have not concluded your merge (MERGE_HEAD exists)"

**原因**: 前回のマージが完了していない

**解決**:
```bash
# マージを中止する場合
git merge --abort

# または、コンフリクトを解決してコミット
git add .
git commit
```

### マージを取り消したい場合

**マージコミット前**:
```bash
git merge --abort
```

**マージコミット後**:
```bash
# 直前のコミットを取り消す（変更は保持）
git reset --soft HEAD~1

# 完全に取り消す（変更も破棄）
git reset --hard HEAD~1
```

---

## 📚 参考情報

### コンフリクトが起きる理由

1. **同じファイルの同じ箇所**を、異なるブランチで編集
2. Gitが自動でマージできない
3. 手動で「どちらを残すか」を決める必要がある

### コンフリクトマーカーの読み方

```
<<<<<<< HEAD (現在のブランチ)
現在のブランチのコード
=======
マージしようとしているブランチのコード
>>>>>>> branch-name
```

### 解決の選択肢

- **Option A**: 上のコードだけ残す（`<<<<<<< HEAD` 側）
- **Option B**: 下のコードだけ残す（`>>>>>>> branch-name` 側）
- **Option C**: **両方残す**（今回のケース）✅
- **Option D**: 両方削除して新しいコードを書く

---

## 🎯 今回の結果

- ✅ `WebflowTest` ページ: Webflow連携テスト用
- ✅ `GuideManual` ページ: ガイドマニュアル表示用
- ✅ 両方のルートが共存し、正常に動作

**結論**: 両方の機能が必要なので、両方を残す形でコンフリクト解決完了！
