VideoDetailTest ページを新規に作ってコンテンツだし分けを確認できるようにしたいです
コース用のデータは今あるコースページにもし可能だったら反映してください

````markdown
# **(追加) ステップ 6: テスト用「動画詳細ページ」の作成**

以下では「実際に CMS と連携する前に、**サブスクリプション状態で動画の表示が切り替わるか**を確認するための**テストページ**」を作成するステップを追加します。  
将来的に microCMS や他の CMS に移行する前段階として、**仮データ**（型を含む）を用意して実装しておくやり方です。

---

# コンテンツ単位で出し分けを検証するテスト環境

> **目的**
>
> - `/content/:id` の URL をそのまま共有できる
> - 無料／有料ユーザーで **動画＋記事** を切り替えられるか先に検証
> - microCMS 連携時は mock → CMS に差し替えるだけで移行完了

---

## 6‑1. 型定義（TypeScript）

```ts
/** 動画＋記事 1 本 */
export type Content = {
  id: string;           // "ui-basic-02"
  title: string;
  releaseDate: string;  // "2025-04-03"
  videoId: string;      // フル動画 Vimeo ID
  // プレビュー再生区間（同一動画を区切る運用）
  previewStartSec?: number;
  previewDurationSec?: number;
  bodyHtml: string;         // 有料本文
  freePreviewHtml?: string; // 無料抜粋
  paidOnly: boolean;
  courseId: string;    // 所属コースID（UI側でナビに利用）
};

/** コース（既存ページ用。詳細取得には使わない） */
export type Course = {
  id: string;
  courseTitle: string;
  description?: string;
  contents: Content[];  // ← 一括で並べる時に利用
};

---

## **6-2. テスト用の仮データセット**

CMS がまだ連携されていない状態では、サーバーサイドまたはコード内に**テスト用データ**を直書きしておきます。
例：`mockData.ts`

``// mockCourses.ts
import { Course } from "./types";

export const TEST_COURSES: Course[] = [
  {
    id: "ui-basic",
    courseTitle: "UIデザイン基礎",
    description: "UI の必須スキルを 5 本で学ぶコース",
    contents: [
      {
        id: "ui-basic-01",
        title: "レイアウトの考え方",
        releaseDate: "2025-04-01",
        videoId: "12345678",
        bodyHtml: "<p>有料本文…</p>",
        paidOnly: false,
        courseId: "ui-basic"
      },
      {
        id: "ui-basic-02",
        title: "カラー設計",
        releaseDate: "2025-04-03",
        videoId: "22334455",
        bodyHtml: "<p>有料全文…</p>",
        freePreviewHtml: "<p>抜粋: 色はブランド印象に…</p>",
        previewDurationSec: 30,
        paidOnly: true,
        courseId: "ui-basic"
      }
    ]
  }
];
```

---

## **6-3. サーバー API: `/api/testvideo/:id`**

1. **受け取った `:id`** でテスト用データから該当の動画を探す。
2. **paidOnly === true** ならサブスク有効かチェック。
3. OK なら Vimeo 埋め込み HTML を返し、NG なら 403 を返す。

``// routes/testcontent.ts
import { TEST_COURSES } from "./mockCourses";
import { checkUserPlan } from "./checkUserPlan";

app.get("/api/testcontent/:contentId", async (req, res) => {
/_ 1) 認証 _/
const user = getUserFromSessionOrToken(req);
if (!user) return res.status(401).json({ message: "Unauthorized" });

/_ 2) サブスク状態 _/
const { isActive } = await checkUserPlan(user.id);

/_ 3) コンテンツ検索（コース跨ぎで flatMap） _/
const content = TEST_COURSES.flatMap(c => c.contents)
.find(c => c.id === req.params.contentId);

if (!content) return res.status(404).json({ message: "Not found" });

/_ 4) 出し分け _/
const safeContent = !content.paidOnly || isActive
? content
: {
...content,
bodyHtml: content.freePreviewHtml ?? "",
locked: true
};

res.json(safeContent); // 200 で JSON 返却
});

````


- これで**CMS 連携なし**でも `/api/testvideo/video001` や `/api/testvideo/video002` といった URL で「無料/有料の違い」をテストできます。

---

## **6-4. フロントエンド: テスト用「動画詳細ページ」**

### 6-4-1. ページ例: `ContentDetailTest.tsx`

```import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

type Content = {
  id: string;
  title: string;
  videoId: string;
  bodyHtml: string;
  locked?: boolean;
  previewStartSec?: number;
  previewDurationSec?: number;
};

export default function ContentDetailTest({ contentId }: { contentId: string }) {
  const [data, setData] = useState<Content | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/testcontent/${contentId}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => setErr(e.message));
  }, [contentId]);

  if (err) return <p style={{ color: "red" }}>Error: {err}</p>;
  if (!data) return <p>Loading…</p>;

  /* プレビュー再生用パラメータ付与 */
  const src = data.locked && data.previewDurationSec
    ? `https://player.vimeo.com/video/${data.videoId}#t=${data.previewStartSec ?? 0},${data.previewDurationSec}`
    : `https://player.vimeo.com/video/${data.videoId}`;

  return (
    <article className={data.locked ? "locked" : ""}>
      <h1>{data.title}</h1>
      <iframe src={src} allowFullScreen />
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.bodyHtml) }}
      />
      {data.locked && (
        <div className="upgrade">
          有料プランにアップグレードして続きを読む →
          <a href="/pricing">プランを見る</a>
        </div>
      )}
    </article>
  );
}
````

- **動画 ID** (`videoId`) を props で受け取って、サーバー API `/api/testvideo/:id` を呼び出し、**HTML 埋め込み**を表示。
- 有料動画か無料動画かは**サーバーで判定**。
- 403 の場合は「有料でした…」などのエラーメッセージを出す。

### 6‑5. ルーティング & テストフロー

テスト URL 状態 期待挙動
/testcontent/ui-basic-01 無料/有料共通 フル視聴
/testcontent/ui-basic-02 無料ユーザー 30  秒プレビュー＋抜粋＋ CTA
/testcontent/ui-basic-02 有料ユーザー フル動画＋全文

#### 出しワケ

未ログイン → 無料画面
無料ユーザーでテスト → locked 表示確認
Stripe Webhook で課金 → ページ再読み込みで locked が外れるか確認

---

## **6-5. テストの流れ**

1. **ログイン or ログインレス**(401 の確認)
2. **ユーザーが isActive=false**（サブスク未加入）状態 →
   - `video001`(無料) → 再生可能 / `video002`(有料) → 403 となるか
3. **ユーザーが isActive=true** →
   - 両方の動画が見られるか？
4. **プランや planType** →
   - もし成長プラン(`growth`)だけ見れる動画がある場合は、`CONTENT_PERMISSIONS` で判定して Forbidden になるかなどを検証

---

## **まとめ: テストページ組み込み**

- これまでのステップに**「ステップ 6: テスト用の動画詳細ページ」** を加え、**CMS がまだ無い段階**でも**mockData**を使って有料/無料動画の差を確認できるようにする。
- 将来的に microCMS と連携するときは、`fetchFromMicroCMS` 相当の実装を**この mockData から切り替える**だけで済む。
- 以上により、**サブスク状態で表示管理できるか**を簡単にテストできるページが用意され、後々「コンテンツ一覧」「カテゴリ分け」などへ拡張する際もスムーズに移行できます。

```

```
````
