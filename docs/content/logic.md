# プランの基礎情報

## プランの種類

- standard

  - 1 ヶ月
  - 3 ヶ月

- growth

  - 1 ヶ月
  - 3 ヶ月

- community
  - 1 ヶ月
  - 6 ヶ月

## プランごとの出し分けロジック

- プランごとに切れるようにする
- learning
  - 以下のプランを含める
    - standard
    - growth
- member
  - 以下のプランを含める
  - standard
  - growth
  - community

# プランの出し分け実装

# **Vite で機密コンテンツをプラン別に出し分ける実装プラン**

以下は、複数プラン（`standard`・`growth`・`community` など）と複数期間（1 ヶ月・3 ヶ月・6 ヶ月など）を想定し、**Vite フロントエンド + サーバーサイド API** で機密コンテンツを安全に出し分ける実装プランです。

---

## **ステップ 1: 認証 & 課金状態を管理する仕組み**

### 1-1. ユーザー認証

- ログイン成功時にセッション ID / トークンを付与
- フロントエンドは、以降の API コールで `Authorization: Bearer <token>` を送ってサーバーでユーザー ID を特定できるようにする

### 1-2. サブスク管理 (is_active)

- 例: DB テーブル `user_subscriptions`
  ````sql
  user_id    VARCHAR
  plan_type  VARCHAR  -- e.g. "standard" | "growth" | "community"
  is_active  BOOLEAN  -- true/false  ```
  ````
- あるいは外部サービス (Stripe) 連携で定期チェックし、DB 反映。

  • Stripe などの外部サービスと連携する場合、Webhook や定期バッチで以下を更新：
  • is_active = true → サブスクを開始 or 再開したタイミング
  • is_active = false → キャンセル or 支払い失敗のタイミング

目標
• checkUserPlan(userId) で { planType:"standard", isActive:true } のような情報を取得できる状態にする。

---

## ステップ 2: サーバー API で機密コンテンツを返す仕組み

#### 1. **コンテンツ保管方法**

- DB: `contents (id, requiredPlans, htmlSnippet)`
- ファイル: `member.html, learning.html` など
- コード内に権限制御用オブジェクトを配置 (`CONTENT_PERMISSIONS`) し、コンテンツ取得時に参照する。

#### 2. **プラン制御のマッピング (`CONTENT_PERMISSIONS` 例)**

```js
const CONTENT_PERMISSIONS = {
  learning: ["standard", "growth"],
  member: ["standard", "growth", "community"],
};
```

#### 2-3. API 実装例 (GET /api/content/:contentKey)

app.get('/api/content/:contentKey', async (req, res) => {
// 1) ログイン判定
const user = await getUserFromSessionOrToken(req);
if (!user) return res.status(401).send('Unauthorized');

// 2) サブスク状態取得
// e.g. { planType: "growth", isActive: true }
const { planType, isActive } = await checkUserPlan(user.id);

// 2.1) active か？
if (!isActive) {
return res.status(403).send('Subscription is not active');
}

// 3) planType が許可されているか
const allowedPlans = CONTENT_PERMISSIONS[req.params.contentKey];
if (!allowedPlans) {
return res.status(404).send('Content not found');
}

if (!allowedPlans.includes(planType)) {
return res.status(403).send('Forbidden');
}

// 4) コンテンツ返却 (DB or ファイル)
const html = getHtmlSnippet(req.params.contentKey);
return res.type('text/html').send(html);
});
完了目安
• 有効プランかつ is_active = true のユーザーだけが特定コンテンツを取得可能
• そうでなければ 403

---

## ステップ 3: フロントエンド (Vite) 側の実装

#### 3-1. ログイン状態 & プラン情報の取得

// 例: /api/user/plan → { planType:"growth", isActive:true }
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
return (...); // ここで UI 構築
}

• 画面ロード時に呼び出し、planType や expiresAt を state に保存。

#### 3-2. コンテンツ取得

async function fetchContent(contentKey) {
const res = await fetch(`/api/content/${contentKey}`, {
headers: { Authorization: `Bearer ${token}` }
});
if (!res.ok) throw new Error('Forbidden');
return await res.text();
}

function PaidContent({ contentKey }) {
const [html, setHtml] = useState('');
const [error, setError] = useState('');

useEffect(() => {
fetchContent(contentKey)
.then(setHtml)
.catch(e => setError(e.message));
}, [contentKey]);

if (error) return <div>{error}</div>;
if (!html) return <div>Loading content...</div>;

return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

    •	結果：プランOK の場合だけサーバーが html を返す → 画面表示。
    •	NG の場合は 403 → フロントでエラー表示 or 課金案内。

#### 3-3. UI 分岐（プランに応じた見た目の変更）

    •	if (planType === 'growth' && isActive) → 有料ページのリンクを表示、といった形で UI を変える
    •	機密保護はサーバーサイドが行うので、UI での分岐はあくまでユーザー体験をよくするため。

---

# ステップ 4: 期間 (1/3/6 ヶ月) への対応

1. サブスク テーブルの拡張
   • user_id, plan_type, duration, expires_at
2. API で期限切れチェック
   • if (now > expires_at) { return 403 }
3. オブジェクト配列での planType & duration チェック

// 例: member は standard(1,3), growth(1,3), community(6)
if (!allowedList.some(item =>
item.planType === planType && item.duration === duration
)) {
return res.status(403).send('Forbidden');
} 4. フロント表示
• 期間によって「UI をどう変えるか」は任意。
• 重要なのはサーバーサイドで「duration に応じて OK / NG」を厳格に制御すること。

⸻

# ステップ 6: テスト & 運用

1. プラン別テストユーザー
   • standard(1m/3m), growth(1m/3m), community(1m/6m) などを用意し、それぞれで学習ページ(learning)・会員ページ(member)へアクセス。
   • 期待通りに表示や制限がされているかをチェック。
2. 期限切れテスト
   • expires_at を過去日付に設定 → 403 Subscription expired となるか確認。
3. プラン変更
   • コード or DB の CONTENT_PERMISSIONS を修正すれば、新規プランや期間を追加できる。
   • テスト用に Webhook などで Stripe からサブスク情報を更新する流れも確認する。
