# コンテンツの出しわけロジックの開発ドキュメント

この内容を参照してステップごとに実装と確認をしながら
アカウントのサブスクリプションの登録状態を確認して
コンテンツを出しわけできるようにしていってください！

---

# Vite で機密コンテンツをプラン別に出し分ける実装プラン (is_active 判定バージョン) - *microCMS + Vimeo 対応*版

以下は、**サーバーサイドでは「プラン」と「is_active（有効かどうか）」のフラグのみ**でサブスクリプションを管理するケースを想定した実装プランです。  
**有効期限や残り日数といった期間管理は行わず、サブスクがアクティブかどうかのみで**有料コンテンツを閲覧可否する基本方針は同じです。

さらに、本プランでは **microCMS を使って有料/無料のフラグ (paidOnly) や Vimeo の動画情報 (vimeoId) を管理** し、サーバー側がそれを参照してコンテンツを生成する場合にも対応できるようアップデートしています。

---

## ステップ 0: 開発環境の前提確認

1. **フロントエンド**:
   - Vite でビルドした React/Vue/プレーン JS など。
2. **サーバーサイド**:
   - Node.js や Supabase Edge Functions など、少なくとも API を実行できる環境。
3. **データベース or 保管場所**:
   - サブスク情報（ユーザーの `planType`, `is_active`）は DB で管理。
   - **コンテンツ情報は microCMS** で管理し、(例)「paidOnly: true なら有料動画」をフラグ付け。
4. **認証基盤**:
   - JWT やセッションでログイン状態を管理し、サーバーがユーザーを識別可能。
5. **Vimeo**:
   - 動画をアップロード & ホスティング。ドメイン制限やプレイヤー埋め込み用 URL を使用する。

---

## ステップ 1: 認証 & 課金状態を管理する仕組み

### 1-1. ユーザー認証

- ログイン成功時にセッション ID / トークンを付与。
- フロントエンドは、以降の API コールで `Authorization: Bearer <token>` を送ってサーバーでユーザー ID を特定できるようにする。

### 1-2. サブスク管理 (is_active)

- **DB テーブル例**: `user_subscriptions`

  ```sql
  user_id    VARCHAR
  plan_type  VARCHAR  -- e.g. "standard" | "growth" | "community"
  is_active  BOOLEAN  -- true/false

  ```

- Stripe などと連携する場合、Webhook や定期バッチで以下を更新:
  • is_active = true → サブスクを開始 or 再開したタイミング
  • is_active = false → キャンセル or 支払い失敗など
- 目標
  • checkUserPlan(userId) が { planType:"standard", isActive:true } のようなオブジェクトを返せる状態。

---

## ステップ 2: サーバー API で機密コンテンツを返す仕組み

### 2-1. コンテンツ保管方法

microCMS で動画情報や有料/無料フラグを管理する想定

例: モデル videos に以下のフィールドを定義

フィールド タイプ 説明
vimeoId String Vimeo 動画の ID (ex: "12345678")
paidOnly Boolean true なら有料、false なら無料
title String 動画のタイトル
... ... カテゴリ・説明など追加で管理可能
本来 contents (id, required_plans, html_snippet) と想定していた箇所を、 microCMS で管理する形に置き換える。

### 2-2. プラン制御のマッピング (例)

以下のように簡易的に planType による制御を行いつつ、さらに microCMS の paidOnly フラグが true ならサブスクが必要という二重チェックが可能:

// 例: learning は standard or growth, member は standard, growth, community
// ただし、最終的な「有料/無料」は microCMS の paidOnly も参照
const CONTENT_PERMISSIONS = {
learning: ['standard','growth'],
member: ['standard','growth','community']
};

### 2-3. API 実装例 (GET /api/content/:contentId)

app.get('/api/content/:contentId', async (req, res) => {
// 1) ログイン判定
const user = await getUserFromSessionOrToken(req);
if (!user) return res.status(401).send('Unauthorized');

// 2) サブスク状態取得 (planType, isActive)
const { planType, isActive } = await checkUserPlan(user.id);

// 3) microCMS から動画情報を取得
// e.g. { title, vimeoId, paidOnly, ... }
const contentData = await fetchFromMicroCMS(req.params.contentId);

if (!contentData) {
return res.status(404).send('Content not found');
}

// 3.1) paidOnly === true ならサブスクチェック
if (contentData.paidOnly && !isActive) {
return res.status(403).send('Subscription is not active');
}

// 4) planType がそもそも不一致の場合も 403 (例: "learning"の場合、standard/growth のみ etc.)
// (もし microCMS 側で全動画の paidOnly を管理し、プラン種別チェックを細かくしない場合は省略しても OK)
const allowedPlans = CONTENT_PERMISSIONS[contentData.category ?? 'default'] || [];
if (allowedPlans.length > 0 && !allowedPlans.includes(planType)) {
return res.status(403).send('Forbidden (plan mismatch)');
}

// 5) Vimeo 埋め込み用 HTML を組み立てる
const html = buildVimeoEmbedHtml({
vimeoId: contentData.vimeoId,
title: contentData.title,
});

return res.type('text/html').send(html);
});

function buildVimeoEmbedHtml({ vimeoId, title }) {
return `  <iframe
      src="https://player.vimeo.com/video/${vimeoId}"
      width="640"
      height="360"
      frameborder="0"
      allow="autoplay; fullscreen"
      allowfullscreen
    ></iframe>
    <p>${title}</p>`;
}

### 完了目安

- isActive = true & paidOnly = true → 有料コンテンツ OK
- paidOnly = false → 誰でも見れる or plan 判定だけ行う
- いずれの場合もソースに直接 Vimeo URL は書かれず、サーバー API 経由で取得する。

---

## ステップ 3: フロントエンド (Vite) の実装

### 3-1. ログイン状態 & プラン取得

// /api/user/plan → { planType:"growth", isActive:true }
async function getUserPlan() {
const res = await fetch('/api/user/plan', {
headers: { Authorization: `Bearer ${token}` }
});
if (!res.ok) throw new Error('Not logged in');
return await res.json(); // { planType, isActive }
}

function App() {
const [userPlan, setUserPlan] = useState(null);

useEffect(() => {
getUserPlan()
.then(setUserPlan)
.catch(err => console.error(err));
}, []);

if (!userPlan) {
return <div>Loading...</div>;
}

// userPlan.planType => "growth", userPlan.isActive => true/false
return (...); // UI 構築
}

### 3-2. 機密コンテンツ (Vimeo 埋め込み) 取得

async function fetchContent(contentId) {
const res = await fetch(`/api/content/${contentId}`, {
headers: { Authorization: `Bearer ${token}` }
});
if (!res.ok) throw new Error('Forbidden or Not Found');
return await res.text();
}

function VideoPage({ contentId }) {
const [html, setHtml] = useState('');
const [error, setError] = useState('');

useEffect(() => {
fetchContent(contentId)
.then(setHtml)
.catch(e => setError(e.message));
}, [contentId]);

if (error) return <div>{error}</div>;
if (!html) return <div>Loading content...</div>;

return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

### 3-3. UI レベルの分岐 (オプション)

planType が "growth" で isActive=true なら「有料ページへのリンク」を見せるなど、ユーザー体験向上用の分岐。
ただし最終的な機密保護はサーバーが 403 制御するため、フロントの if 文は「案内表示」程度の位置づけ。

---

## ステップ 4: 動画などの保護 (オプション)

1. Vimeo の埋め込み

   1. サーバーが <iframe src="https://player.vimeo.com/video/${vimeoId}"> を返す形だが、ドメイン制限（Vimeo の設定）で不正な埋め込みを抑止できると尚安全。

2. もしファイル直リンクを避けたい場合
   1. Vimeo 以外の自前ホスティングなら 期限付き URL (S3 presigned URL) などを使うが、Vimeo 利用なら基本的に iframe 埋め込みで OK。

---

## ステップ 5: テスト & 運用

### プラン別テストユーザー

- standard, growth, community などのテストユーザーを作成
- 各プランで有効/無効状態を切り替えて以下を確認:
  - アクセス時の 403 エラー表示
  - コンテンツ再生の成功

### フロントエンド UI のテスト

- 以下の条件での表示確認:
  - ログイン状態 vs 非ログイン状態
  - isActive=true vs false
- microCMS での paidOnly 切り替え時の挙動確認

### Stripe 決済連携のテスト

- Webhook による支払いキャンセル後の動作確認
  - is_active=false への更新
  - 403 エラーの表示

### 運用フロー

#### コンテンツ管理

- microCMS 管理画面での更新項目:
  - vimeoId
  - paidOnly 設定

#### プラン拡張時の対応

- CONTENT_PERMISSIONS の拡張検討
- 認可ロジックの修正確認

---

# まとめ

## 基本設計

- **サブスクリプション判定**: `is_active` フラグのみで管理
  - 有効期限管理は Stripe のステータスに委任

## コンテンツ管理

### microCMS

- 動画のメタ情報を一元管理
  - vimeoId
  - paidOnly
  - title
  - その他メタデータ

### サーバー API

1. microCMS からコンテンツ情報を取得
2. アクセス制御
   - `paidOnly=true` & `is_active=false` → 403 エラー
   - アクセス許可時 → `<iframe>` 生成

### フロントエンド (Vite)

1. `/api/content/:id` を呼び出し
2. 受け取った HTML スニペット（iframe 含む）を `dangerouslySetInnerHTML` で挿入

## セキュリティ強化

- Vimeo のドメイン制限機能で不正埋め込みを防止

## 結論

シンプルな構成（サブスク判定 + microCMS + Vimeo）でありながら、
セキュアな有料コンテンツ配信システムを実現可能

---

````markdown
# **(追加) ステップ 6: テスト用「動画詳細ページ」の作成**

以下では「実際に CMS と連携する前に、**サブスクリプション状態で動画の表示が切り替わるか**を確認するための**テストページ**」を作成するステップを追加します。  
将来的に microCMS や他の CMS に移行する前段階として、**仮データ**（型を含む）を用意して実装しておくやり方です。

---

## **6-1. 仮のデータ型 (TypeScript の場合)**

本番では microCMS から取得するデータを想定した**型**を作っておくと、**移行がスムーズ**です。  
たとえば、以下のように「video ID」「paid フラグ」「タイトル」「カテゴリ」を持つデータとします。

```ts
export type VideoContent = {
  id: string; // "video001" など
  title: string; // "サンプル動画"
  paidOnly: boolean; // true => 有料、false => 無料
  vimeoId: string; // "12345678"
  category?: string; // optional: "learning", "member" など
};
```
````

---

## **6-2. テスト用の仮データセット**

CMS がまだ連携されていない状態では、サーバーサイドまたはコード内に**テスト用データ**を直書きしておきます。  
例：`mockData.ts`

```ts
// mockData.ts - テスト用データ
import { VideoContent } from "./types";

export const TEST_VIDEOS: VideoContent[] = [
  {
    id: "video001",
    title: "無料デモ動画",
    paidOnly: false,
    vimeoId: "12345678",
    category: "learning",
  },
  {
    id: "video002",
    title: "有料限定動画",
    paidOnly: true,
    vimeoId: "87654321",
    category: "member",
  },
];
```

---

## **6-3. サーバー API: `/api/testvideo/:id`**

1. **受け取った `:id`** でテスト用データから該当の動画を探す。
2. **paidOnly === true** ならサブスク有効かチェック。
3. OK なら Vimeo 埋め込み HTML を返し、NG なら 403 を返す。

```ts
// routes/testvideo.ts (Node.js の例)
import { TEST_VIDEOS } from "./mockData";
import { checkUserPlan } from "./checkUserPlan";

app.get("/api/testvideo/:id", async (req, res) => {
  // 1) ユーザー判定
  const user = getUserFromSessionOrToken(req);
  if (!user) return res.status(401).send("Unauthorized");

  // 2) サブスク状態
  const { planType, isActive } = await checkUserPlan(user.id);

  // 3) テストデータから対象検索
  const video = TEST_VIDEOS.find((v) => v.id === req.params.id);
  if (!video) {
    return res.status(404).send("Not found");
  }

  // 3.1) paidOnly & !isActive => 403
  if (video.paidOnly && !isActive) {
    return res.status(403).send("Subscription is not active");
  }

  // 4) ビデオ埋め込みHTML生成
  const htmlSnippet = `
    <iframe
      src="https://player.vimeo.com/video/${video.vimeoId}"
      width="640"
      height="360"
      frameborder="0"
      allow="autoplay; fullscreen"
      allowfullscreen
    ></iframe>
    <p>${video.title}</p>
  `;
  return res.type("text/html").send(htmlSnippet);
});
```

- これで**CMS 連携なし**でも `/api/testvideo/video001` や `/api/testvideo/video002` といった URL で「無料/有料の違い」をテストできます。

---

## **6-4. フロントエンド: テスト用「動画詳細ページ」**

### 6-4-1. ページ例: `VideoDetailTest.tsx`

```tsx
// VideoDetailTest.tsx
import React, { useState, useEffect } from "react";

export default function VideoDetailTest({ videoId }: { videoId: string }) {
  const [htmlSnippet, setHtmlSnippet] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!videoId) return;

    fetch(`/api/testvideo/${videoId}`, {
      headers: {
        // 認証トークンが必要なら付与
        Authorization: `Bearer xxx`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error("有料動画です (403 Forbidden)");
        if (res.status === 404) throw new Error("動画が見つかりません");
        if (!res.ok) throw new Error("何らかのエラー");
        return res.text();
      })
      .then((data) => setHtmlSnippet(data))
      .catch((err) => setError(err.message));
  }, [videoId]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }
  if (!htmlSnippet) {
    return <div>読み込み中...</div>;
  }
  return <div dangerouslySetInnerHTML={{ __html: htmlSnippet }} />;
}
```

- **動画 ID** (`videoId`) を props で受け取って、サーバー API `/api/testvideo/:id` を呼び出し、**HTML 埋め込み**を表示。
- 有料動画か無料動画かは**サーバーで判定**。
- 403 の場合は「有料でした…」などのエラーメッセージを出す。

### 6-4-2. Routing for test

- たとえば `react-router` で `/testvideo/:id` にアクセス → `VideoDetailTest` を表示。
- URL: `http://localhost:3000/testvideo/video001` → 無料動画再生 OK
- URL: `http://localhost:3000/testvideo/video002` → 有料 → サブスクが `isActive=false` なら 403

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
