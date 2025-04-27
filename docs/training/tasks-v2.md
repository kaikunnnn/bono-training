# Task 1 ── Supabase にテーブルを作成し、サンプルデータを挿入する

> **ゴール**  
> トレーニングとお題のメタデータを管理するためのテーブルを作成し、サンプルデータを挿入します。
> コンテンツ自体は Markdown ファイルで管理し、メタデータのみを Supabase で管理します。

## 🗒 やること（かんたん要約）

1. **training テーブル**を作成

   - `id`, `slug`, `title`, `description`, `type`, `difficulty`, `tags`, `created_at`
   - `type` は `'challenge'` または `'skill'`
   - `difficulty` は `'easy'`, `'normal'`, `'hard'`

2. **task テーブル**を作成

   - `id`, `training_id`, `slug`, `title`, `order_index`, `is_premium`, `preview_sec`, `video_full`, `video_preview`, `created_at`
   - `training_id` は `training` テーブルの外部キー
   - `is_premium` は有料コンテンツかどうか
   - `preview_sec` はプレビュー動画の長さ（秒）

3. **user_progress テーブル**を作成

   - `user_id`, `task_id`, `status`, `completed_at`
   - `status` は `'done'`, `'todo'`, `'in-progress'`
   - `user_id` と `task_id` の組み合わせでユニーク

4. **subscriptions テーブル**に `plan_members` 列を追加
   - 既存の `plan_pro` 列と同様に、メンバーシップの有無を管理

## 1️⃣ training テーブル作成

```sql
create table public.training (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  title         text        not null,
  description   text,
  type          text        check (type in ('challenge','skill')),
  difficulty    text        check (difficulty in ('easy','normal','hard')),
  tags          text[]      default '{}',
  created_at    timestamptz default now()
);
```

## 2️⃣ task テーブル作成

```sql
create table public.task (
  id            uuid        primary key default gen_random_uuid(),
  training_id   uuid        references public.training (id) on delete cascade,
  slug          text        not null,
  title         text        not null,
  order_index   int         not null,
  is_premium    boolean     default false,
  preview_sec   int         default 30,
  video_full    text,
  video_preview text,
  created_at    timestamptz default now(),
  unique (training_id, slug)
);
```

## 3️⃣ user_progress テーブル作成

```sql
create table public.user_progress (
  user_id     uuid    references auth.users (id) on delete cascade,
  task_id     uuid    references public.task  (id) on delete cascade,
  status      text    check (status in ('done','todo','in-progress')) default 'todo',
  completed_at timestamptz,
  primary key (user_id, task_id)
);
```

## 4️⃣ subscriptions テーブルに plan_members 列を追加

```sql
alter table public.subscriptions
  add column plan_members boolean default false;
```

## 5️⃣ サンプルデータの挿入

```sql
-- training テーブルにサンプルデータを挿入
insert into public.training (slug, title, description, type, difficulty, tags)
values
  ('ui-todo', 'UI Todo', 'Todo アプリで UI デザインを筋トレ', 'challenge', 'normal', array['ui', 'figma']),
  ('react-basics', 'React 基礎', 'React の基礎を学ぶ', 'skill', 'easy', array['react', 'javascript']);

-- task テーブルにサンプルデータを挿入
insert into public.task (training_id, slug, title, order_index, is_premium, preview_sec)
select
  id as training_id,
  'build-home-ui' as slug,
  'ホーム画面をつくる' as title,
  1 as order_index,
  false as is_premium,
  30 as preview_sec
from public.training
where slug = 'ui-todo';

insert into public.task (training_id, slug, title, order_index, is_premium, preview_sec)
select
  id as training_id,
  'add-todo-flow' as slug,
  'Todo 追加フロー' as title,
  2 as order_index,
  true as is_premium,
  30 as preview_sec
from public.training
where slug = 'ui-todo';

-- テスト用ユーザープログレスデータの挿入
insert into public.user_progress (user_id, task_id, status, completed_at)
select
  '00000000-0000-0000-0000-000000000000' as user_id,  -- テストユーザーID
  id as task_id,
  'done' as status,
  now() as completed_at
from public.task
where slug = 'build-home-ui';
```

## 6️⃣ 動作確認

1. Supabase ダッシュボード → SQL Editor → 新しいクエリに上記を貼り付け → 実行
2. GUI で「Tables」に反映されれば完了
3. サンプルデータが正しく挿入されているか確認

## ✅ 完了の目安

- [ ] 4 つのテーブルが正しく作成されている
- [ ] サンプルデータが正しく挿入されている
- [ ] 外部キー制約が正しく設定されている
- [ ] `plan_members` 列が `subscriptions` テーブルに追加されている

🟢 **全部 OK → Task 1 完了！**  
次は **Task 2（サンプルデータの挿入と UI 表示の確認）** に進んでください。

---

# Task 2 ── サンプルデータの挿入と UI 表示の確認

> **ゴール**  
> トレーニングとタスクのサンプルデータを挿入し、UI での表示を確認します。
> これにより、データベースと UI の連携が正しく機能していることを確認します。

## 🗒 やること（かんたん要約）

1. **サンプルデータの挿入**

   - トレーニングデータ（UI Todo, React 基礎）
   - タスクデータ（ホーム画面作成, Todo 追加フロー）
   - ユーザープログレスデータ（テスト用）

2. **UI 表示の確認**
   - トレーニング一覧ページ
   - タスク詳細ページ
   - 進捗バーの表示
   - プレミアムコンテンツの制限表示

## 1️⃣ サンプルデータの挿入

```sql
-- トレーニングデータの挿入
insert into public.training (slug, title, description, type, difficulty, tags)
values
  ('ui-todo', 'UI Todo', 'Todo アプリで UI デザインを筋トレ', 'challenge', 'normal', array['ui', 'figma']),
  ('react-basics', 'React 基礎', 'React の基礎を学ぶ', 'skill', 'easy', array['react', 'javascript']);

-- タスクデータの挿入
insert into public.task (training_id, slug, title, order_index, is_premium, preview_sec)
select
  id as training_id,
  'build-home-ui' as slug,
  'ホーム画面をつくる' as title,
  1 as order_index,
  false as is_premium,
  30 as preview_sec
from public.training
where slug = 'ui-todo';

insert into public.task (training_id, slug, title, order_index, is_premium, preview_sec)
select
  id as training_id,
  'add-todo-flow' as slug,
  'Todo 追加フロー' as title,
  2 as order_index,
  true as is_premium,
  30 as preview_sec
from public.training
where slug = 'ui-todo';

-- テスト用ユーザープログレスデータの挿入
insert into public.user_progress (user_id, task_id, status, completed_at)
select
  '00000000-0000-0000-0000-000000000000' as user_id,  -- テストユーザーID
  id as task_id,
  'done' as status,
  now() as completed_at
from public.task
where slug = 'build-home-ui';
```

## 2️⃣ UI 表示の確認

### トレーニング一覧ページ

1. `/training` にアクセス
2. 以下の要素を確認：
   - トレーニングカードが 2 つ表示されている
   - 各カードにタイトル、説明、難易度が表示されている
   - タグが正しく表示されている

### タスク詳細ページ

1. `/training/ui-todo/build-home-ui` にアクセス
2. 以下の要素を確認：
   - タスクのタイトルと説明が表示されている
   - 進捗バーが表示されている（50%）
   - チェックボックスが機能している

### プレミアムコンテンツ

1. `/training/ui-todo/add-todo-flow` にアクセス
2. 以下の要素を確認：
   - プレビュー部分まで表示されている
   - プレミアムバナーが表示されている
   - ログインしていない場合はログイン誘導が表示される

## ✅ 完了の目安

- [ ] サンプルデータが正しく挿入されている
- [ ] トレーニング一覧ページが正しく表示される
- [ ] タスク詳細ページが正しく表示される
- [ ] 進捗バーが正しく計算・表示される
- [ ] プレミアムコンテンツの制限が正しく機能する

🟢 **全部 OK → Task 2 完了！**  
次は **Task 3（トレーニング専用レイアウトの作成）** に進んでください。

---

# Task 3 ── 「Training 専用レイアウト」を作って"別サイトっぽい"見た目にする

> **ゴール** > `/training` 以下だけヘッダー・色・フォントが切り替わり、
> "オレンジ × 丸み" のブランディングで **独立サイトのように見える** 状態をつくる。
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

> _"モノレポ" で分ける場合の例。既存アプリ内に `/training` ルートを追加する形でも可。_

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

_非エンジニア向けメモ: 上記は "オレンジ基調・大きめ角丸" を Tailwind に教える設定。_

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

必要ないためオッケー！実装は大丈夫

<!--
> **ゴール** > `/training` を開くと **カード形式の一覧** が表示され、
> 画面上部のタグボタンで「UI だけ」「UX だけ」のように **リアルタイムで絞り込み** できる状態にする。
> （タップ／クリックだけで完了。検索窓は後回し）

---

## 🗒 やること（かんたん要約）

1. Supabase から **training テーブルを全部読む API** を用意
2. "カード" UI コンポーネントを作ってグリッド表示
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

_非エンジニア向けメモ: "training" 表の行を全部読み出す小さな関数です。_

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
次は **Task 5（Training 詳細ページ／進捗バー）** に進んでください。 -->

---

```markdown
# Task 5 ── 「Training 詳細ページ」を実装し、進捗バー＋有料表示を行う

> **ゴール**  
> `/training/<trainingSlug>` にアクセスすると
>
> 1. **トレーニング概要**（タイトル・説明・難易度・タグ）
> 2. **お題(Task) 一覧** を順番 (`order_index`) で表示し  
>      • 無料お題 → “FREE” バッジ  
>      • 有料お題 → 🔒 バッジ（※無料ユーザーだけに表示）
> 3. **進捗バー**：完了数 ÷ 全タスク数 × 100 %  
>    が見えるようにする。  
>    ※進捗保存は Task 7 で実装するため、ここでは常に 0 % 表示で OK。

---

## 🗒 やること（かんたん要約）

1. Supabase から **training 1 件 + task 一覧** を取得
2. 上部にタイトル・説明・難易度を表示
3. Task 一覧をリンク化し、無料／有料バッジを付ける
4. 進捗バーを 0–100 % で描画（いまは 0 %）

---

## 1️⃣ 必要ファイル
```

apps/training/src/
api/
getTrainingDetail.ts # NEW
components/
ProgressBar.tsx # NEW
TaskList.tsx # NEW
routes/
[trainingSlug]/index.tsx # NEW

````

---

## 2️⃣ API ── `getTrainingDetail.ts`

```ts
import { supabase } from "@/lib/supabaseClient";

export async function getTrainingDetail(slug: string) {
  const { data: training } = await supabase
    .from("training")
    .select("id,slug,title,description,difficulty,tags")
    .eq("slug", slug)
    .single();

  const { data: tasks } = await supabase
    .from("task")
    .select("id,slug,title,order_index,is_premium")
    .eq("training_id", training.id)
    .order("order_index");

  return { training, tasks };
}
````

---

## 3️⃣ `ProgressBar.tsx`

```tsx
export default function ProgressBar({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <>
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-full bg-brand rounded transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-gray-600">{pct}% 完了</p>
    </>
  );
}
```

---

## 4️⃣ `TaskList.tsx`

```tsx
import { Link } from "react-router-dom";
import { useSubscription } from "@/lib/useSubscription"; // 既存: plan_pro / plan_members を返す

export default function TaskList({
  tasks,
  baseSlug,
}: {
  tasks: any[];
  baseSlug: string;
}) {
  const { isMember } = useSubscription(); // plan_members 判定

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

              {/* バッジ表示ルール */}
              {t.is_premium ? (
                !isMember && <span className="text-brand text-xs">🔒 有料</span>
              ) : (
                <span className="text-gray-400 text-xs">FREE</span>
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

## 5️⃣ ルートページ ── `[trainingSlug]/index.tsx`

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

  const doneCount = 0; // Task7 で DB と連動させる
  return (
    <section className="space-y-8">
      {/* 概要 */}
      <header>
        <h2 className="text-3xl font-bold">{training.title}</h2>
        <p className="mt-2 text-gray-700">{training.description}</p>
        <span className="inline-block bg-brand/10 text-brand text-xs px-2 py-1 rounded mt-2">
          {training.difficulty}
        </span>
      </header>

      {/* 進捗 */}
      <ProgressBar done={doneCount} total={tasks.length} />

      {/* お題一覧 */}
      <TaskList tasks={tasks} baseSlug={`/training/${training.slug}`} />
    </section>
  );
}
```

---

## 6️⃣ 動作確認

1. `pnpm dev` を起動
2. ブラウザで `http://localhost:5173/training/ui-todo` を開く
   - タイトル・説明・難易度が表示
   - 進捗バー 0 %
   - お題 3 件が **FREE / 🔒** バッジ付きで並ぶ
3. ログイン中で `plan_members=true` のユーザーで確認
   - 🔒 バッジが消えて FREE/有料区別が無くなる (会員なら全部開放)

---

## ✅ 完了の目安

- [ ] 概要・難易度・タグが表示される
- [ ] 進捗バーが描画（いまは常に 0 %）
- [ ] 無料ユーザー：有料お題に 🔒 バッジが付く
- [ ] メンバー：🔒 が付かない
- [ ] お題カードをクリックで Task ページへ遷移

🟢 **全部 OK → Task 5 完了！**  
次は **Task 6（Task ページ ＋ 有料ゲート／動画なし版）** に進んでください。

---

# Task 6 （動画なし版）── お題ページ + 有料ゲート

> **ゴール** > `/training/ui-todo/build-home-ui` を開くと
>
> - **無料お題**: 本文全文を表示
> - **有料お題**: `<!--more-->` コメントより後を隠し、"ここから先はメンバー限定" バナーを挿入
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

# Task 7 ── "完了チェック" を保存できるようにする

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

> **シンプル運用**なら "Task ページから戻るたびにリロード" でも OK。  
> 後で Context + useEffect で自動反映に改良できます。

---

## 5️⃣ 動作確認チェックリスト

1. **無料ユーザー** でもチェックは押せる（DB に行が作成）
2. **完了にする → 戻る** とバーが 0%→25% … と伸びる
3. Supabase Table Editor で `user_progress` に行が入り、`user_id` が自分の ID
4. 別アカウントでは他人の行が見えない（RLS 有効）
5. 未ログインでチェックを押すと "ログイン画面へ誘導" などが出る（既存 AuthGuard を再利用）

---

## ✅ 完了の目安

- [ ] ✅ を押すとページ再読込後もチェック状態が保持
- [ ] ProgressBar が完了数に応じて更新
- [ ] Supabase の `user_progress` に正しい行が入る
- [ ] 他ユーザーからは他人の進捗が見えない

🟢 **全部 OK → Task 7 完了！**  
次は **Task 8（Subscription Guard 拡張：有料開放）** に進んでください。

---

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

```

```
