````markdown
# Task 1 ── Supabase に「Training 用テーブル」を作る

> **ゴール**  
> Supabase の管理画面で SQL を 1 回実行し、  
> ❶ `training` ❷ `task` ❸ `user_progress` の 3 テーブル  
> と、既存 `subscriptions` テーブルへの列追加を完了させる。  
> これが **/training ページの“土台データ”** になります。

---

## 🗒 やること（超かんたん要約）

1. Supabase の **SQL Editor** を開く
2. ここに貼ってある **青い SQL** をまるごとコピー → 画面にペースト
3. **Run** ボタンを押して実行
4. 左メニュー「Table Editor」を開き、3 つの新しいテーブルが見えたら OK

---

## 1️⃣ 事前に用意するもの

| 項目                      | メモ                                               |
| ------------------------- | -------------------------------------------------- |
| Supabase プロジェクト URL | 例 `https://abcde.supabase.co`                     |
| Supabase ログイン権限     | オーナー or 開発者ロールであれば十分               |
| このページの SQL          | 下の **`-- ▼▼▼`** から **`-- ▲▲▲`** まで全部コピー |

---

## 2️⃣ 実行手順（クリック操作だけで完了）

1. **Supabase Dashboard にログイン**
2. 左メニュー **「SQL Editor」** を選ぶ → 右上 **「New Query」**
3. クエリエディタが開いたら、下記 SQL を貼り付け
4. 画面右上の **緑色 Run ▶︎** をクリック
5. 「Run completed successfully」のメッセージを確認
6. 左メニュー **「Table Editor」** → **「public」** スキーマを開く
   - `training`, `task`, `user_progress` が増えていれば成功
   - 既存 `subscriptions` に `plan_members` 列が追加されていることも確認

---

## 3️⃣ コピペ用 SQL

```sql
-- ▼▼▼ ここからコピー ▼▼▼
-- ① training  (チャレンジ／スキルのメタ)
create table if not exists public.training (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  type          text check (type in ('challenge','skill')),
  difficulty    text check (difficulty in ('easy','normal','hard')),
  tags          text[] default '{}',
  created_at    timestamptz default now()
);

-- ② task  (個別お題のメタ)
create table if not exists public.task (
  id            uuid primary key default gen_random_uuid(),
  training_id   uuid references public.training (id) on delete cascade,
  slug          text not null,
  title         text not null,
  order_index   int  not null,
  is_premium    boolean default false,
  preview_sec   int  default 30,
  video_full    text,
  video_preview text,
  created_at    timestamptz default now(),
  unique (training_id, slug)
);

-- ③ user_progress  (完了チェック)
create table if not exists public.user_progress (
  user_id      uuid references auth.users (id) on delete cascade,
  task_id      uuid references public.task  (id) on delete cascade,
  status       text check (status in ('done','todo','in-progress')) default 'todo',
  completed_at timestamptz,
  primary key (user_id, task_id)
);

-- ④ subscriptions に members フラグを追加
alter table public.subscriptions
  add column if not exists plan_members boolean default false;
-- ▲▲▲ ここまでコピー ▲▲▲
```
````

> **ヒント**  
> `if not exists` を付けているので、うっかり 2 回実行してもエラーになりません。

---

## 4️⃣ 完了確認チェックリスト

- [ ] Table Editor に **training / task / user_progress** が表示される
- [ ] `subscriptions` テーブルの Columns に **plan_members (boolean)** が追加されている
- [ ] エラーが出ず “SUCCESS” と表示された

🟢 **全部 OK → Task 1 完了！**  
次は **Task 2（サンプルデータ投入）** へ進んでください。

---

# Task 2 ── 「UI Todo」サンプルデータを入れて画面で確認する

> **ゴール**  
> 実際に 1 件のトレーニングと 3 つのお題(Task)を登録し、  
> ブラウザで `/training` を開いたときに「UI Todo」がカード表示される状態にする。  
> これにより **一覧画面や詳細画面をリアルデータで動作確認** できます。

---

## 🗒 やること（かんたん要約）

1. Supabase の **SQL Editor** を開く
2. 下の **青い INSERT 文** をコピー → ペースト → Run
3. 「Table Editor」で行が増えたか確認
4. `/training` ページをリロード → UI Todo が見えれば完了

---

## 1️⃣ 事前に決める “お試し値”

| テーブル        | 入力内容 (例)                                     | 意味                         |
| --------------- | ------------------------------------------------- | ---------------------------- |
| `training`      | slug=`ui-todo`, title=`UI Todo`, type=`challenge` | トレーニングの親情報         |
| `task`          | 3 行（ホーム画面／追加フロー／状態管理）          | 個別お題                     |
| `user_progress` | 今回は **空のまま**                               | チェック機能は Task 7 で実装 |

---

## 2️⃣ 実行手順（クリック操作だけ）

1. **Dashboard → SQL Editor → New Query**
2. 下記 SQL を貼り付け
3. **Run ▶︎** をクリック
4. メッセージが `SUCCESS` になったら OK
5. **Table Editor** → `public.training` を開く
   - 1 行 (`ui-todo`) が入っていれば成功
6. **Table Editor** → `public.task` を開く
   - 3 行 (`build-home-ui`, …) が入っていれば成功
7. (オプション) `public.subscriptions` で自分のユーザー行を開き、`plan_members` を **true** にしておくと、有料お題も全開でテストできます。

---

## 3️⃣ コピペ用 SQL

```sql
-- ▼▼▼ Training 1 件 ----------
insert into public.training
(id, slug, title, description, type, difficulty, tags)
values (
  gen_random_uuid(),
  'ui-todo',
  'UI Todo',
  'Todo アプリで UI デザインを筋トレ',
  'challenge',
  'normal',
  array['ui','figma']
);

-- ▲▲ training.id を取得（GUIでコピーでもOK） ▼▼
with src as (
  select id from public.training where slug='ui-todo'
)
insert into public.task
(id, training_id, slug, title, order_index, is_premium, preview_sec)
values
  (gen_random_uuid(), (select id from src), 'build-home-ui',   'ホーム画面をつくる',       1, false, 30),
  (gen_random_uuid(), (select id from src), 'add-todo-flow',   'Todo 追加フロー',          2, true,  30),
  (gen_random_uuid(), (select id from src), 'state-management','状態管理を実装する',       3, true,  30);
-- ▲▲▲ ここまでコピー ▲▲▲
```

> **ポイント**  
> 2 回目以降に同じスクリプトを流すと slug が重複するので、既にある場合は `delete from training where slug='ui-todo';` で一度消してから実行してください。

---

## 4️⃣ 完了確認チェックリスト

- [ ] Table Editor → `training` に **UI Todo** が 1 行入った
- [ ] Table Editor → `task` に **3 行** 入った (`order_index = 1,2,3`)
- [ ] ブラウザで `http://localhost:5173/training` を開くとカードが表示される
- [ ] 有料お題のカードには 🔒 マーク（または Lock アイコン）が付いている

🟢 **全部 OK → Task 2 完了！**  
次は **Task 3（Training 用レイアウト作成）** に進んでください。

---

# Task 3 ── 「Training 専用レイアウト」を作って“別サイトっぽい”見た目にする

> **ゴール**  
> `/training` 以下だけヘッダー・色・フォントが切り替わり、  
> “オレンジ × 丸み” のブランディングで **独立サイトのように見える** 状態をつくる。  
> (ログイン状態・課金判定は既存と共通のまま)

---

## 🗒 やること（かんたん要約）

1. **色や角丸のテーマ変数** を Tailwind に登録
2. `TrainingLayout.tsx` を作り、ヘッダー＆背景を差し替え
3. ルーターで **`/training/*` を丸ごと TrainingLayout 配下** に置く
4. ブラウザで **`/` と `/training` の見た目が違う** ことを確認

---

## 1️⃣ 必要ファイルとフォルダ

```
apps/
  web/                    # 既存
  training/               # ★新アプリ (サブパッケージ)
    src/
      layouts/TrainingLayout.tsx
      routes/
        index.tsx
        tags/[tag].tsx
        [trainingSlug]/index.tsx
        [trainingSlug]/[taskSlug].tsx
```

> _“モノレポ” で分ける場合の例。既存アプリ内に `/training` ルートを追加する形でも可。_

---

## 2️⃣ デザインルールを Tailwind に追加

`tailwind.config.cjs`（共通）を編集して **Training 専用トークン** を extend します。

```js
module.exports = {
  content: [
    "./apps/web/src/**/*.{js,ts,jsx,tsx}",
    "./apps/training/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#FF9900", // Training用アクセント
        "bg-page": "#FFF9F3",
      },
      borderRadius: {
        xl: "1.5rem",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,.08)",
      },
    },
  },
};
```

_非エンジニア向けメモ: 上記は “オレンジ基調・大きめ角丸” を Tailwind に教える設定。_

---

## 3️⃣ TrainingLayout.tsx を作成

```tsx
// apps/training/src/layouts/TrainingLayout.tsx
import { Outlet } from "react-router-dom";

export default function TrainingLayout() {
  return (
    <div className="min-h-screen bg-bg-page text-gray-900">
      {/* ★ 専用ヘッダー */}
      <header className="bg-brand text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">BONO Training</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-10 max-w-5xl mx-auto">
        <Outlet /> {/* 子ページがここに差し込まれる */}
      </main>

      {/* フッター（既存と共有でもOK） */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © 2025 BONO Design
      </footer>
    </div>
  );
}
```

---

## 4️⃣ ルーティングに組み込む

### A) **React Router** (Vite SPA) の場合

```tsx
// apps/web/src/main.tsx など
createBrowserRouter([
  {
    element: <RootLayout />, // 既存レイアウト
    children: [
      /* 既存ルート… */
      {
        path: "training/*",
        element: <TrainingLayout />, // ★Training用ラッパー
        children: [
          { index: true, element: <TrainingHome /> },
          { path: "tags/:tag", element: <TrainingTagList /> },
          { path: ":trainingSlug", element: <TrainingDetail /> },
          { path: ":trainingSlug/:taskSlug", element: <TaskPage /> },
        ],
      },
    ],
  },
]);
```

### B) **Next.js App Router** の場合

```
app/
  layout.tsx          // RootLayout（既存）
  training/
    layout.tsx        // export default TrainingLayout
    page.tsx          // TrainingHome
    tags/[tag]/page.tsx
    [trainingSlug]/
      page.tsx
      [taskSlug]/page.tsx
```

---

## 5️⃣ 動作確認ステップ（ノーコード OK）

1. ターミナルで `pnpm dev` (または `npm run dev`)
2. ブラウザ `http://localhost:5173/` → 既存サイトの見た目
3. ブラウザ `http://localhost:5173/training` →
   - オレンジのヘッダー
   - クリーム色の背景
   - 角丸カード が表示されれば成功
4. URL を `/training/tags/ui` などに変えても同じトーンが維持される

---

## ✅ 完了の目安

- [ ] `/training` の配色・フォントがトップページと明確に違う
- [ ] 他ページ (`/courses` など) のデザインは変わっていない
- [ ] ログイン状態（右上のアバター or サインインボタン）は共通で表示
- [ ] コンソールにエラーが出ていない / ビルドが通る

🟢 **全部 OK → Task 3 完了！**  
次は **Task 4（Training 一覧ページのカード＆タグフィルタ）** に進んでください。

---

# Task 4 ── 「Training 一覧ページ」を作り、タグで絞り込めるようにする

> **ゴール**  
> `/training` を開くと **カード形式の一覧** が表示され、  
> 画面上部のタグボタンで「UI だけ」「UX だけ」のように **リアルタイムで絞り込み** できる状態にする。  
> （タップ／クリックだけで完了。検索窓は後回し）

---

## 🗒 やること（かんたん要約）

1. Supabase から **training テーブルを全部読む API** を用意
2. “カード” UI コンポーネントを作ってグリッド表示
3. **タグボタン** を並べ、押すと URL に `?tag=ui` が付く
4. そのクエリを見て一覧をフィルタリングする

---

## 1️⃣ 必要ファイル

```
apps/training/
  src/
    api/getTrainingIndex.ts       ← NEW
    components/ChallengeCard.tsx  ← NEW
    components/TagFilter.tsx      ← NEW
    routes/index.tsx              ← 一覧ページ
```

---

## 2️⃣ API 関数を作る

```ts
// apps/training/src/api/getTrainingIndex.ts
import { supabase } from "@/lib/supabaseClient";

export async function getTrainingIndex() {
  const { data, error } = await supabase
    .from("training")
    .select("id,slug,title,difficulty,tags,is_premium=false") // is_premium は常に false
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

_非エンジニア向けメモ: “training” 表の行を全部読み出す小さな関数です。_

---

## 3️⃣ カードコンポーネント

```tsx
// ChallengeCard.tsx
import { Link } from "react-router-dom";

export default function ChallengeCard({ item }) {
  return (
    <Link
      to={item.slug}
      className="bg-white rounded-xl shadow-card p-6 hover:opacity-90"
    >
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <span className="inline-block bg-brand/10 text-brand text-xs px-2 py-1 rounded">
        {item.difficulty}
      </span>
      <div className="mt-3 flex flex-wrap gap-1">
        {item.tags.map((t) => (
          <span key={t} className="text-xs text-gray-500">
            #{t}
          </span>
        ))}
      </div>
    </Link>
  );
}
```

---

## 4️⃣ タグフィルタコンポーネント

```tsx
// TagFilter.tsx
import { useSearchParams, useNavigate } from "react-router-dom";

const TAGS = ["ui", "ux", "figma", "layout", "accessibility"];

export default function TagFilter() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const active = params.get("tag");

  const toggle = (t: string) => {
    const next = active === t ? null : t;
    nav(next ? `?tag=${next}` : ".", { replace: true });
  };

  return (
    <div className="flex gap-2 mb-6">
      {TAGS.map((t) => (
        <button
          key={t}
          onClick={() => toggle(t)}
          className={`px-3 py-1 rounded-full text-sm ${
            active === t ? "bg-brand text-white" : "bg-gray-200"
          }`}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

---

## 5️⃣ 一覧ページ (`routes/index.tsx`)

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTrainingIndex } from "@/api/getTrainingIndex";
import ChallengeCard from "@/components/ChallengeCard";
import TagFilter from "@/components/TagFilter";

export default function TrainingHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const tag = params.get("tag");

  useEffect(() => {
    getTrainingIndex().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = tag ? items.filter((i) => i.tags.includes(tag)) : items;

  if (loading) return <p>Loading...</p>;

  return (
    <section>
      <TagFilter />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => (
          <ChallengeCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}
```

---

## 6️⃣ 動作確認ステップ（ノーコード OK）

1. **`pnpm dev`** でアプリを起動
2. ブラウザ `http://localhost:5173/training` を開く
   - UI Todo のカードが 1 枚表示される
3. 上部タグボタン `UI` を押す → 一覧にカードが残る（タグマッチ）
4. `Figma` を押す → 何も無ければリストが空になる
5. URL が `?tag=ui`, `?tag=figma` と変化するのを確認

---

## ✅ 完了の目安

- [ ] `/training` にカードグリッドが表示される
- [ ] タグボタンを押すたびにリストがリアルタイムで絞り込まれる
- [ ] ブラウザの戻るボタンでフィルタ状態が戻る
- [ ] ページ再読込しても URL の `?tag=` が有効で同じ絞り込みになる

🟢 **全部 OK → Task 4 完了！**  
次は **Task 5（Training 詳細ページ／進捗バー）** に進んでください。

---

# Task 5 ── 「Training 詳細ページ」を実装し、進捗バーを表示する

> **ゴール**  
> `/training/ui-todo` のような **トレーニング詳細ページ**を作り、
>
> - トレーニングの概要（タイトル・説明など）
> - お題(Task) 一覧をステップ順で表示
> - どれだけ終わったか 0–100% の **進捗バー**  
>   が見えるようにする。  
>   “完了 ✅” チェックをまだ付けなくても **計算式が動く** ところまで仕上げる。  
>   （チェック保存 API は Task 7 で実装）

---

## 🗒 やること（かんたん要約）

1. **トレーニング 1 件** と **そのお題リスト** を Supabase から取得
2. ページ上部にタイトル・説明・難易度バッジを表示
3. お題リストを **順番 (order_index)** で並べリンク化
4. 進捗バー =「完了数 ÷ 全タスク数 ×100」を横棒で描画
   > 今回は progress 表がまだ空なので常に 0 % になる

---

## 1️⃣ 必要ファイル

```
apps/training/src/
  api/
    getTrainingDetail.ts      ← NEW
  components/
    ProgressBar.tsx           ← NEW
    TaskList.tsx              ← NEW
  routes/
    [trainingSlug]/index.tsx  ← ← ← 実装対象
```

---

## 2️⃣ API：トレーニング + タスク取得

```ts
// getTrainingDetail.ts
export async function getTrainingDetail(slug: string) {
  const { data: training, error } = await supabase
    .from("training")
    .select("id,slug,title,description,difficulty,tags")
    .eq("slug", slug)
    .single();
  if (error) throw error;

  const { data: tasks } = await supabase
    .from("task")
    .select("id,slug,title,order_index,is_premium")
    .eq("training_id", training.id)
    .order("order_index");

  return { training, tasks };
}
```

---

## 3️⃣ ProgressBar コンポーネント

```tsx
// ProgressBar.tsx
export default function ProgressBar({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div>
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-full bg-brand rounded transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm mt-1 text-gray-600">{percent}% 完了</p>
    </div>
  );
}
```

---

## 4️⃣ TaskList コンポーネント

```tsx
// TaskList.tsx
import { Link } from "react-router-dom";

export default function TaskList({
  tasks,
  baseSlug,
}: {
  tasks: any[];
  baseSlug: string;
}) {
  return (
    <ol className="space-y-3">
      {tasks.map((t) => (
        <li key={t.id}>
          <Link
            to={`${baseSlug}/${t.slug}`}
            className="block p-4 bg-white rounded-xl shadow-card hover:opacity-90"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t.title}</span>
              {t.is_premium && (
                <span className="text-brand text-xs">🔒 有料</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
```

---

## 5️⃣ ルートページ (`routes/[trainingSlug]/index.tsx`)

```tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTrainingDetail } from "@/api/getTrainingDetail";
import ProgressBar from "@/components/ProgressBar";
import TaskList from "@/components/TaskList";

export default function TrainingDetail() {
  const { trainingSlug } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (trainingSlug) getTrainingDetail(trainingSlug).then(setData);
  }, [trainingSlug]);

  if (!data) return <p>Loading...</p>;

  const { training, tasks } = data;
  const doneCount = 0; // Task7でDBから取得して置き換える
  return (
    <section className="space-y-8">
      {/* ヘッダー */}
      <header>
        <h2 className="text-3xl font-bold">{training.title}</h2>
        <p className="mt-2 text-gray-700">{training.description}</p>
        <span className="inline-block bg-brand/10 text-brand text-xs px-2 py-1 rounded mt-2">
          {training.difficulty}
        </span>
      </header>

      {/* 進捗バー */}
      <ProgressBar done={doneCount} total={tasks.length} />

      {/* タスク一覧 */}
      <TaskList tasks={tasks} baseSlug={`/training/${training.slug}`} />
    </section>
  );
}
```

---

## 6️⃣ 動作確認ステップ

1. `pnpm dev` を起動
2. ブラウザで `http://localhost:5173/training/ui-todo` を開く
   - タイトル「UI Todo」
   - 説明テキスト
   - 進捗バー 0%
   - お題 3 件が順番どおり並ぶ
3. お題カードをクリック → `/training/ui-todo/build-home-ui` へ遷移（404 でなければ OK）。  
   (Task ページは Task 6 で実装)

---

## ✅ 完了の目安

- [ ] 詳細ページに概要・難易度バッジ・タグが表示
- [ ] 進捗バーが見える (今は 0%)
- [ ] お題リストがリンクになりクリックでページ遷移
- [ ] URL を変えると別のトレーニングも同様に表示（複数データを入れた場合）

🟢 **全部 OK → Task 5 完了！**  
次は **Task 6（Task ページ & 有料ゲート）** に進んでください。

---

# Task 6 （動画なし版）── お題ページ + 有料ゲート

> **ゴール**  
> `/training/ui-todo/build-home-ui` を開くと
>
> - **無料お題**: 本文全文を表示
> - **有料お題**: `<!--more-->` コメントより後を隠し、“ここから先はメンバー限定” バナーを挿入  
>   が実装される。進捗保存は Task 7 で追加予定。

---

### 1️⃣ 変更・追加ファイル

```
apps/training/
  src/
    api/getTaskDetail.ts        (動画カラムを無視する形に修正)
    components/
      GateBanner.tsx            (動画表記削除、本文用にそのまま利用)
      MdxPreview.tsx            ← NEW 先頭だけ描画
    routes/
      [trainingSlug]/[taskSlug].tsx  ← 更新
```

---

### 2️⃣ `getTaskDetail.ts`（動画列を除外）

```ts
export async function getTaskDetail(trainingSlug: string, taskSlug: string) {
  const { data: training } = await supabase
    .from("training")
    .select("id,slug,title")
    .eq("slug", trainingSlug)
    .single();

  const { data: task } = await supabase
    .from("task")
    .select("id,slug,title,is_premium") // ←動画列を取らない
    .eq("training_id", training.id)
    .eq("slug", taskSlug)
    .single();

  return { training, task };
}
```

---

### 3️⃣ `MdxPreview.tsx`（本文前半だけ描画）

```tsx
import { MDXProvider } from "@mdx-js/react";

/**
 * MDX ファイルに `<!--more-->` を入れ、
 * preview={true} のときはそこまでを描画するコンポーネント。
 */
export default function MdxPreview({
  Content,
  preview,
}: {
  Content: any;
  preview: boolean;
}) {
  if (!preview) return <Content />;

  // MDX を文字列で読み込み直す簡易実装
  const raw = Content.toString();
  const [beforeMore] = raw.split("<!--more-->");
  const PreviewComp = MDXProvider({ children: beforeMore });
  return <PreviewComp />;
}
```

> **簡易版** のため「MDX を文字列に変換 → `<!--more-->` で split」方式。  
> build 時に remark-plugin で前半だけ抽出する方法でも OK です。

---

### 4️⃣ GateBanner.tsx（変更なし）

```tsx
// same as 前回、動画文言を含んでいないため再掲不要
```

---

### 5️⃣ Task ページ (`[trainingSlug]/[taskSlug].tsx`)

```tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTaskDetail } from "@/api/getTaskDetail";
import { useAuth } from "@/lib/AuthProvider";
import GateBanner from "@/components/GateBanner";
import MdxPreview from "@/components/MdxPreview";

export default function TaskPage() {
  const { trainingSlug, taskSlug } = useParams();
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (trainingSlug && taskSlug)
      getTaskDetail(trainingSlug, taskSlug).then(setData);
  }, [trainingSlug, taskSlug]);

  if (!data) return <p>Loading...</p>;
  const { task } = data;
  const isMember = session?.user?.plan_members === true;
  const locked = task.is_premium && !isMember;

  // 動的 MDX import
  const MDXContent =
    require(`../../../../content/training/${trainingSlug}/${taskSlug}.mdx`).default;

  return (
    <article className="prose lg:prose-lg max-w-none">
      <h2>{task.title}</h2>

      {locked ? (
        <>
          <MdxPreview Content={MDXContent} preview={true} />
          <GateBanner />
        </>
      ) : (
        <MDXPreview Content={MDXContent} preview={false} />
      )}
    </article>
  );
}
```

---

### 6️⃣ MDX 側の書き方例

```mdx
---
title: "ホーム画面をつくる"
slug: "build-home-ui"
is_premium: true
---

# ホーム画面をデザインしよう

ここから前半。無料でも読める。

<!--more-->

ここより後半。メンバー限定で公開。
```

---

### 7️⃣ 動作確認

1. `pnpm dev` → `http://localhost:5173/training/ui-todo/build-home-ui`
2. **無料ユーザー**
   - `<!--more-->` 以前のみ表示
   - すぐ下に GateBanner
3. **メンバー** (`plan_members=true`)
   - `<!--more-->` 以降も全文表示
4. 動画が無いのでページが軽いことを確認。

---

## ✅ 完了の目安

- [ ] 無料ユーザー: 途中で本文がカットされ GateBanner 表示
- [ ] メンバー: 全文表示で GateBanner が出ない
- [ ] 無料お題は誰でも全文表示
- [ ] コンソールに MDX import エラーや undefined がない

🟢 **全部 OK → Task 6 完了！**  
次は **Task 7（進捗保存 API & チェックボックス）** へ進んでください！

---

````markdown
# Task 7 ── “完了チェック” を保存できるようにする

> **ゴール**
>
> - お題ページに **✅ チェックボックス** を追加
> - 押すと Supabase の `user_progress` テーブルに **保存／解除**
> - トレーニング詳細ページの **進捗バーがリアルタイム更新**  
>   まで動かす。  
>   （RLS ＝行レベルセキュリティも設定し、他人のデータは読めない）

---

## 🗒 やること（かんたん要約）

1. **API**：`POST /api/training/progress` で upsert、`GET …?trainingId=` で一覧取得
2. Supabase **RLS ポリシー**：`user_id = auth.uid()` の行だけ許可
3. **チェックボックス UI** を Task ページに設置
4. チェック変更 → API 呼び出し → 保存後、ProgressBar を再フェッチ

---

## 1️⃣ API（Edge Functions or Next.js Route）

### `POST /api/training/progress`

```ts
// body: { taskId: string; done: boolean }
const { taskId, done } = await req.json();
const status = done ? "done" : "todo";

await supabase.from("user_progress").upsert({
  user_id: auth.uid(),
  task_id: taskId,
  status,
  completed_at: done ? new Date() : null,
});
return res.json({ ok: true });
```
````

### `GET /api/training/progress?trainingId=…`

```ts
const { trainingId } = req.query;
const { data } = await supabase
  .from("user_progress")
  .select("task_id,status")
  .in(
    "task_id",
    supabase.from("task").select("id").eq("training_id", trainingId)
  );
return res.json(data);
```

> **サーバーレス選択肢**
>
> - **Next.js** を使っている場合 → `pages/api/training/progress.ts` で OK
> - Vite SPA + Supabase Edge Function の場合 → `supabase functions new training_progress`

---

## 2️⃣ Supabase RLS ポリシー

1. **Table Editor → user_progress → RLS → Enable**
2. **New Policy**
   - 名前: `user-is-owner`
   - Using Expression → `user_id = auth.uid()`
   - `SELECT`, `INSERT`, `UPDATE` を許可

> _非エンジニア向けメモ: 「ログイン中の本人だけ自分の進捗を読める／書ける」設定です。_

---

## 3️⃣ チェックボックス UI

### A) Task ページに追加

```tsx
// TaskPage.tsx 内・GateBanner/本文の後
const [done, setDone] = useState(false);

async function toggle() {
  const newDone = !done;
  await fetch("/api/training/progress", {
    method: "POST",
    body: JSON.stringify({ taskId: task.id, done: newDone }),
    headers: { "Content-Type": "application/json" },
  });
  setDone(newDone);
}

<button onClick={toggle} className="mt-6 flex items-center gap-2">
  <input type="checkbox" checked={done} readOnly />
  <span>{done ? "完了済み" : "完了にする"}</span>
</button>;
```

### B) 初期状態を取得

```tsx
useEffect(() => {
  supabase
    .from("user_progress")
    .select("status")
    .eq("task_id", task.id)
    .eq("user_id", session?.user.id)
    .single()
    .then((r) => setDone(r.data?.status === "done"));
}, [task.id]);
```

---

## 4️⃣ Training 詳細ページでバーを再計算

```tsx
// TrainingDetail.tsx  useEffect 追加
useEffect(() => {
  getProgress(training.id).then(setProgress); // GET API
}, [training.id, refreshFlag]); // refreshFlag は Task ページ完了後に context で更新

const doneCount = progress.filter((p) => p.status === "done").length;
<ProgressBar done={doneCount} total={tasks.length} />;
```

> **シンプル運用**なら “Task ページから戻るたびにリロード” でも OK。  
> 後で Context + useEffect で自動反映に改良できます。

---

## 5️⃣ 動作確認チェックリスト

1. **無料ユーザー** でもチェックは押せる（DB に行が作成）
2. **完了にする → 戻る** とバーが 0%→25% … と伸びる
3. Supabase Table Editor で `user_progress` に行が入り、`user_id` が自分の ID
4. 別アカウントでは他人の行が見えない（RLS 有効）
5. 未ログインでチェックを押すと “ログイン画面へ誘導” などが出る（既存 AuthGuard を再利用）

---

## ✅ 完了の目安

- [ ] ✅ を押すとページ再読込後もチェック状態が保持
- [ ] ProgressBar が完了数に応じて更新
- [ ] Supabase の `user_progress` に正しい行が入る
- [ ] 他ユーザーからは他人の進捗が見えない

🟢 **全部 OK → Task 7 完了！**  
次は **Task 8（Subscription Guard 拡張：有料開放）** に進んでください。

---

````markdown
# Task 8 ── 既存のサブスクリプション判定に **`plan_members`** を追加し、有料お題を開放する

> **ゴール**  
> 既存サイトで使っている **サブスクリプション判定ロジック**（Pro プラン用など）をそのまま流用し、
>
> - **`plan_members` = true** のユーザーは Training の有料お題を全文表示
> - **`plan_members` = false**（無料プラン）は GateBanner のまま  
>   という動作にする。  
>   新たな Guard コンポーネントは作らず、**既存 Hook / HOC / middleware を 1 行だけ拡張**する方式。

---

## 🗒 やること（かんたん要約）

1. **Stripe Webhook** 内で `plan_members=true` を書き込む
2. **既存サブスク判定 Hook / 関数** に `plan_members` を追加
3. Task ページのロック判定を `isPremium && !plan_members` に変更
4. `/pricing` ページに「Training も含まれる」文言を追記（マーケ連携）

---

## 1️⃣ Stripe Webhook 変更例（Supabase Edge Functions or Next.js API）

```ts
// 例: handleCheckoutSessionCompleted()
if (session.mode === "subscription" && session.customer) {
  const planMembers = true; // 今回は同一プランで開放
  await supabase
    .from("subscriptions")
    .update({ plan_members: planMembers })
    .eq("stripe_customer_id", session.customer.toString());
}
```
````

> _既に Pro フラグ (`plan_pro`) を更新している処理に **1 行追加**するだけで済みます。_

---

## 2️⃣ 既存判定ロジックに `plan_members` を加える

例：`useSubscription()` Hook がある場合

```ts
export function useSubscription() {
  const { session } = useAuth();
  const sub = session?.user?.subscription ?? {}; // { pro: true/false, members: true/false }

  return {
    isPro: !!sub.pro,
    isMember: !!sub.members, // ★ 追加
  };
}
```

_もし JWT に `subscription` オブジェクトが入っていない場合は、  
`supabase.rpc('get_subscription')` のようなサーバー関数で取得しても OK。_

---

## 3️⃣ Task ページのロック判定を差し替え

```tsx
const { isMember } = useSubscription(); // 既存 Hook に置き換え
const locked = task.is_premium && !isMember;
```

> Pro 判定と切り分けたい場合は
>
> ```tsx
> const locked = task.is_premium && !(isPro || isMember);
> ```
>
> のように OR 条件にしてもよいです。

---

## 4️⃣ UI 文言 & GateBanner の見直し

- **GateBanner.tsx**
  - 「メンバー登録して全文を読む」→ 既存プラン名 (例: “Pro メンバーになる”) に合わせる
- **/pricing**
  - プラン比較表に「Training 有料お題の全文アクセス ✔︎」を追加
  - 料金は変えない前提（同一プランで開放）

---

## 5️⃣ 動作確認チェックリスト

1. Stripe **Test モード** で決済 → webhook で `plan_members=true` になったか確認
2. 無料状態で有料お題を開く → GateBanner が表示
3. 決済後に再読込 → GateBanner が消え全文表示
4. 既存の Pro コンテンツ（Course 有料部分）が問題なく見られることを再確認
5. 既存無料ユーザー → Training 有料お題はロックされたまま

---

## ✅ 完了の目安

- [ ] Webhook で `plan_members` が確実に書き込まれる
- [ ] Hook / 判定ロジックに `isMember` が追加され、UI が連動
- [ ] マーケページ（/pricing）の文言更新
- [ ] 既存 Pro 機能にリグレッションがない

🟢 **全部 OK → Task 8 完了！**  
次は **Task 9（GA4 イベント計測 & QA）** に進んでください。

````markdown
# Task 9 ── GA4 イベント計測を追加し、品質チェック（QA）を行う

> **ゴール**
>
> 1. BONO Training の主要アクションを **Google Analytics 4** に送信
>    - お題ページ閲覧 / 完了チェック / シェア など
> 2. **レスポンシブ・パフォーマンス・アクセシビリティ** を最終確認し、  
>    本番リリースに耐える品質を確保する。

---

## 🗒 やること（かんたん要約）

| Part  | 内容                                                                       |
| ----- | -------------------------------------------------------------------------- |
| **A** | GA4 でプロパティを作成し、既存 gtag スニペットに「Training」イベントを追加 |
| **B** | ✅ チェック時・GateBanner クリック時などに `gtag('event', …)` を仕込む     |
| **C** | Lighthouse／手動テストでモバイル・PC 表示崩れ、速度、A11y をチェック       |
| **D** | リリース前チェックリスト（404, pricing 更新、課金テスト etc.）を完了       |

---

## A. GA4 セットアップ

1. **GA4 プロパティ**（既存サイトと同じで可）
2. 管理 → **カスタム定義**
   - 追加: `training_slug`, `task_slug`, `membership` (boolean)
3. **gtag スニペット確認**
   - 既に `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>` が入っていれば OK
   - 無い場合は `apps/web/index.html` の `<head>` に挿入

---

## B. イベント実装

| イベント名      | 発生タイミング                           | パラメータ                                 |
| --------------- | ---------------------------------------- | ------------------------------------------ |
| `view_training` | `/training/:slug` ページロード           | `training_slug`                            |
| `view_task`     | `/training/:training/:task` ページロード | `training_slug`, `task_slug`, `membership` |
| `complete_task` | ✅ チェックを ON にした瞬間              | `training_slug`, `task_slug`               |
| `share_task`    | シェアボタン押下                         | `task_slug`, `platform`                    |
| `upgrade_click` | GateBanner の CTA クリック               | `task_slug`                                |

### 実装例（React）

```ts
import { useEffect } from "react";
import { gtag } from "@/lib/ga";           // ラッパー関数

// Task Page: ページ閲覧
useEffect(()=>{
  gtag("event", "view_task", {
    training_slug: training.slug,
    task_slug: task.slug,
    membership: isMember,
  });
}, [training.slug, task.slug]);

// チェックボックス
async function toggle() {
  ...
  if (newDone) gtag("event", "complete_task", { training_slug, task_slug });
}
```
````

> **非エンジニア向けメモ:** ここで言う `gtag` は `window.gtag` をラップした関数。イベントを送るだけなので 1 行で完了します。

---

## C. Lighthouse & 手動 QA

| 項目              | 基準値 / 確認方法                                    |
| ----------------- | ---------------------------------------------------- |
| **Performance**   | Lighthouse モバイルスコア ≥ **80**                   |
| **PWA**           | `installable`、`service-worker` OK、スコア ≥ **90**  |
| **Accessibility** | ARIA ラベル・対比比率・キーボード操作確認            |
| **レスポンシブ**  | 360 px〜1920 px でレイアウト崩れがない               |
| **404 / 500**     | ありえそうな typo URL が Training 404 にリダイレクト |
| **課金テスト**    | Stripe Test Card で購入 → GateBanner が消える        |
| **RLS テスト**    | 別ユーザーが他人の `user_progress` 行を取得できない  |

---

## D. リリース前チェックリスト

- [ ] `/pricing` に「Training 有料お題　 ✔︎」が記載
- [ ] sitemap.xml に `/training` と `/training/tags/*` を追加
- [ ] Robots TXT で `/training` を block していない
- [ ] Cloudflare / Vercel のキャッシュルールに `/training/*` を含めた
- [ ] Apple / Android アイコンに Training テーマ色 (#FF9900) を追加
- [ ] コンソール Warnings / Errors が 0

---

## ✅ 完了の目安

- [ ] GA4 リアルタイムで `view_task`, `complete_task` が受信される
- [ ] Lighthouse レポートで Perf ≥ 80 / PWA ≥ 90 / A11y ≥ 90
- [ ] モバイル・PC 両方で UI 崩れなし
- [ ] Stripe Test 決済後に有料お題が全文表示
- [ ] Check list 全項目に ✅

🟢 **全部 OK → Task 9 完了！**  
これで **/training サブアプリ MVP** の開発フェーズは終了です。  
リリース後は GA4 の数値を見ながら改善サイクルに移行しましょう。

```

```
