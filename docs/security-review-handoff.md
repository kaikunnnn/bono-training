# 引き継ぎ: ドメイン変更リリース前セキュリティレビュー

- status: Step 1 完了 / Step 2 未着手
- 作成日: 2026-09-07
- ブランチ: `claude/domain-change-security-80wmob`（origin に push 済み・作業ツリーはクリーン）
- 最新コミット: `22a7c23 docs(security): セキュリティレビューのベストプラクティス調査を記録（Step 1）`
- 関連ドキュメント: **`docs/security-review-2026-09.md`（347行・Step 1 の成果物本体。まず先にこれを読むこと）**

---

## 0. このドキュメントの位置づけ

セッションを跨いで作業を引き継ぐための要約。**Step 1（外部ベストプラクティスのリサーチ）まで完了**しており、
次のセッションは **Step 2（現状監査）から再開**する。

`.claude/CLAUDE.md` は「タスク管理は `/Users/kaitakumi/Documents/01_BONO事業/01_Docs/rebono/issues/` 配下のMDで行う」と
規定しているが、**そのパスはローカルMacのものでこのリモート実行環境からは見えない**。
そのため暫定的にリポジトリ内 `docs/` に置いている。**ユーザーが後で rebono/issues へ移す想定。**

---

## 1. ユーザーからの依頼（原文の要約）

> ドメインを変更してリリースするけどセキュリティ面が不安。
>
> 1. 今の状態でやるべきことを、今の技術ごとにセキュリティ面のベストプラクティスをリサーチしてほしい
> 2. 初心者がやりがちなセキュリティの間違いも調べてほしい
> 3. それらのリサーチ結果を元に修正する
> 4. 確認と修正が終わった後、**あなたがこのサービスをハッキングするならどうするか**を考えてチェックしてほしい
>
> これらを計画を立ててやってほしい。まず可能かどうかを考え、次に計画を立て、**1ステップずつリサーチして実行**していく。

### 途中でのユーザーからの確認

ユーザーから「**これは一般的なセキュリティの観点でリサーチして作成されたものですか？それなら進めていい**」と問われた。

これに対し**正直に「まだ外部リサーチはしていない。当初の計画はリポジトリ実測 + 既存知識で組んだもの」と回答**し、
「その外部リサーチをやるのが Step 1 そのもの」と説明したうえで Step 1 を実行した。
→ **この経緯は重要。ユーザーは「自己流ではなく外部の定石に基づいているか」を強く気にしている**
（`.claude/rules/09-work-loop.md` の「★外部ベストプラクティスのリサーチは厳守」に対応）。
今後も、根拠が自分の知識なのか外部ソースなのかを**必ず区別して報告すること**。

---

## 2. 合意済みの5ステップ計画

| Step | 内容 | 状態 |
|---|---|---|
| **Step 1** | 外部ベストプラクティスのリサーチ（出典URL付きで記録） | ✅ **完了** |
| **Step 2** | 現状監査（Step 1 のチェックリストでコード実測。**修正はせず指摘一覧を出すまで**） | ⬜ 未着手 |
| **Step 3** | ドメイン移行チェックリスト（コード変更分 / 手作業の設定変更分を分離） | ⬜ 未着手 |
| **Step 4** | 修正（Critical/High から順に。1件ごとに検証） | ⬜ 未着手 |
| **Step 5** | 攻撃者視点レビュー（レッドチーム） | ⬜ 未着手 |

**進め方の約束: 1ステップ完了ごとに結果を報告し、ユーザーの確認を取ってから次に進む。**

### Step 5 で想定している攻撃シナリオ（計画時に列挙したもの）

- 課金バイパス（プレミアム判定の回避）
- Stripe webhook の偽装
- service_role を持つ API の悪用
- 認証リダイレクトの悪用
- 他人の投稿・進捗の改ざん（RLS 抜け）
- Sanity write token の悪用
- cron エンドポイントの不正実行

---

## 3. できないこと（ユーザーに明示済み）

| 項目 | 理由 | 代替 |
|---|---|---|
| 本番への実攻撃（スキャナ実行・総当たり等） | 稼働中サービスを壊す・課金/認証を汚染するリスク | コード＆設定レビュー＋ローカル/プレビュー環境での安全な検証 |
| Vercel / Supabase / Stripe の**ダッシュボード設定**の直接変更 | 権限外。MCP経由の本番書き込みは要承認 | 「ユーザーが手で設定する項目」チェックリストを出す |
| `rebono/issues/` への起票 | ローカルMacのパス。この環境から見えない | リポジトリ内 `docs/` に置き、後でユーザーが移す |
| 秘密鍵の実値確認 | `.env.local` がこの環境に無い | 「何が設定されているべきか」の一覧で照合してもらう |

---

## 4. 作業環境の制約（次のセッションも同じはず）

### 外部HTTPアクセスが遮断されている（重要）

`WebFetch` も `curl` も、主要ドキュメントサイトが**すべて 403**（CONNECT tunnel failed）:

```
403  nextjs.org / supabase.com / docs.stripe.com / owasp.org
403  cheatsheetseries.owasp.org / developer.mozilla.org / vercel.com
```

**使えるリサーチ手段は次の2つだけ:**

1. **`WebSearch`** — 検索結果の要約＋URLが返る（Anthropic API経由なのでegressを通らない）
2. **`mcp__Vercel__search_vercel_documentation`** — Vercel公式ドキュメントを**コード例まで一次情報として**取得できる
   - 必須引数が2つある: `query` と `topic`（`topic` を省くと validation error になる）

→ したがって `docs/security-review-2026-09.md` の出典は**検索要約ベース**であり、一次ソース全文の確認はしていない。
**重要な判断の前にはユーザー側でURLを直接開いて裏取りする必要がある**。この制約はドキュメント冒頭にも明記済み。

### その他

- 作業ディレクトリ: `/home/user/bono-training`
- GitHub操作は `gh` CLI 不可。`mcp__github__*` ツールを使う
- `npm audit` 等のコマンドは正常に動く（npmレジストリは noProxy 対象）

---

## 5. リポジトリの実測結果（Step 1 のリサーチ中に確認した事実）

### 技術スタック（実測）

- **next 16.3.3** / react 19.2.3 / TypeScript 5
- `@supabase/ssr` ^0.9.0 / `@supabase/supabase-js` ^2.98.0
- `@sanity/client` ^7.16.0 / `@sanity/webhook` ^4.0.4
- `@anthropic-ai/sdk` ^0.89.0 / `groq-sdk` ^1.3.0 ← **AI機能あり**
- `resend` ^6.9.4（メール送信）
- ホスティング: Vercel

### API Routes（7本）

```
src/app/api/ai-chat/route.ts                  ← AI。レート制限要確認（P0）
src/app/api/search/route.ts
src/app/api/revalidate/route.ts
src/app/api/cron/storage-usage/route.ts       ← service_role 使用・認証要確認（P0）
src/app/api/cron/onboarding-funnel/route.ts   ← service_role 使用・認証要確認（P0）
src/app/api/questions/submit/route.ts         ← SANITY_WRITE_TOKEN + service_role
src/app/api/feedback-apply/submit/route.ts    ← SANITY_WRITE_TOKEN
```

### `SUPABASE_SERVICE_ROLE_KEY` の使用箇所（6箇所・全て要精査）

```
src/app/api/cron/storage-usage/route.ts:114
src/app/api/cron/onboarding-funnel/route.ts:147
src/app/api/questions/submit/route.ts:25
src/app/questions/[slug]/actions.ts:50
src/lib/questions/board-user-stats.ts:20
src/lib/services/training/training-detail.ts:14  ← コメントのみ（Edge Function が内部で使用と記載）
```

### Supabase Edge Functions（18本）

```
_shared/ check-migrated-user/ check-subscription/ clear-migrated-flag/
create-checkout/ create-customer-portal/ fetch-ogp/ get-content/
get-plan-prices/ get-training-content/ get-training-detail/ get-training-list/
preview-subscription-change/ stripe-webhook/ stripe-webhook-test/
update-subscription/ webflow-series/
```

→ **Stripe webhook は Next.js 側ではなく Supabase Edge Function 側にある**。
つまり Next.js のドメイン変更とは独立している可能性が高い（Step 2 で登録先を実確認）。

### `vercel.json` — cron が2本

```json
{ "crons": [
  { "path": "/api/cron/storage-usage",     "schedule": "0 21 * * 0" },
  { "path": "/api/cron/onboarding-funnel", "schedule": "0 22 * * 0" }
]}
```

### `next.config.ts` の要点

- **セキュリティヘッダ4種は導入済み**（直近コミット `bd14c66 feat(security): セキュリティヘッダ4種を追加（A-2・移行#198）`）
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: SAMEORIGIN`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **CSP は意図的に未導入**。コード内コメントに「Sanity画像/Stripe/Supabase/YouTube等の外部リソース依存が多く誤爆リスクが高いため、
  別ステップで `Content-Security-Policy-Report-Only` から段階導入する予定」と明記
- **HSTS も意図的に未導入**（「Vercelが付与済み・preload事故回避」とコメント）
- `rewrites.fallback` に **ドメインがハードコード**されている:
  ```
  source: "/:path*" → destination: "https://legacy.bo-no.design/:path*"
  has: [{ type: "host", value: "(www\\.)?bo-no\\.design" }]
  ```
  → **ドメイン変更で必ず触る箇所（Step 3 の必須項目）**
- `redirects()`: `/articles/:slug` → `/contents/:slug`（308）、`/feedback-apply/guide` → `/how-to/feedback`（308）
- `images.remotePatterns` に `bo-no.design` / `*.bo-no.design` を含む9ホスト
  （cdn.sanity.io, *.sanity.io, uploads-ssl.webflow.com, cdn.prod.website-files.com,
  placehold.co, api.dicebear.com, *.st-note.com）→ **ドメイン変更で追加が必要**

### 環境変数（`.env.example` より）

サーバー専用: `SUPABASE_SERVICE_ROLE_KEY` / `SANITY_WRITE_TOKEN` / `WEBFLOW_API_TOKEN` /
`SLACK_WEBHOOK_URL` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `SITE_URL`

クライアント公開（`NEXT_PUBLIC_`）: `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SITE_URL` /
`SANITY_PROJECT_ID` / `SANITY_DATASET` / `SANITY_API_VERSION` / `STRIPE_PUBLISHABLE_KEY` /
`BLOG_DATA_SOURCE` / `GHOST_URL` / `GHOST_KEY` / `WEBFLOW_*_COLLECTION_ID`

**実際に src/ 内で使われている `NEXT_PUBLIC_` は6つのみ**（実測）:
`NEXT_PUBLIC_SANITY_API_VERSION` / `NEXT_PUBLIC_SANITY_DATASET` / `NEXT_PUBLIC_SANITY_PROJECT_ID` /
`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_URL`
→ **この6つに秘密情報は含まれていない（現時点でOK）**。ただし client bundle への混入は Step 2 で別途確認。

`SITE_URL` の例示値が `https://app.bo-no.design` になっている点に注意。

### コードに登場するドメイン

`bo-no.design` / `www.bo-no.design` / `app.bo-no.design` / `legacy.bo-no.design`
（`legacy.` は Webflow の裏サブドメイン。未移植パスのフォールバック先）

---

## 6. Step 1 の成果（`docs/security-review-2026-09.md` に全文）

### 調査した13分野（すべて出典URL付きで記録済み）

1. **Next.js — 認可はミドルウェアに依存しない**（DAL パターン。Server Actions / Route Handlers は「公開エンドポイント」扱い）
2. **関連CVE の該当判定**（下記）
3. **Next.js — Server Actions の CSRF**（Origin vs Host 比較。`serverActions.allowedOrigins`）
4. **Next.js — CSP**（nonce方式は**全ページ動的レンダリング必須**。hash/SRI方式は実験的）
5. **Next.js — オープンリダイレクト**（`//evil.com` `/\evil.com` が素朴なチェックを回避）
6. **Supabase — RLS と service_role**（service_role は**常に** RLS をバイパス。public 全テーブルで RLS 必須）
7. **Supabase Auth — Redirect URLs 許可リスト**（ワイルドカードは攻撃面を広げる）
8. **Stripe — Webhook**（`constructEvent` 必須・raw body・300秒・`event.id` 冪等化・環境別シークレット）
9. **Vercel — Cron の `CRON_SECRET` 検証**（**公式コード例を一次取得済み。ドキュメント内に転記あり**）
10. **HSTS**（preload は**事実上不可逆**。`includeSubDomains` の前にサブドメイン棚卸し）
11. **Sanity — write トークンと CORS**（バンドル混入が最多の漏洩経路。検証つきプロキシパターンが公式推奨）
12. **レート制限**（**サーバーレスではインメモリ方式は機能しない**。1人で予算を数分で枯渇させられる）
13. **OWASP A01 Broken Access Control / IDOR**（2021年版**1位**。テスト対象の**94%**に弱点）

### 初心者がやりがちなミス15項目（表としてドキュメント化済み）

service_role のクライアント露出 / RLS未設定 / SELECTポリシーだけ書く /
security definer 関数を `public` に作る / 認可をミドルウェア任せ / `redirectTo` 無検証 /
webhook 署名検証の自作or省略 / AIエンドポイントにレート制限なし / サーバーレスでインメモリrate limit /
CMS write トークンを検証の薄いAPIで使う / cron を未認証公開 / CORS を `*` + credentials /
移行時に Auth Redirect URLs 更新忘れ / 移行時にワイルドカードを緩く入れる / AI生成コードの無検証デプロイ

### 実測して確認できた「良いニュース」

| CVE | 内容 | 影響版 | 修正版 | 本プロジェクト |
|---|---|---|---|---|
| CVE-2025-29927 | `x-middleware-subrequest` 偽装で middleware 全バイパス | <12.3.5 / <13.5.9 / <14.2.25 / <15.2.3 | — | **非該当**（16.3.3） |
| CVE-2026-27978 | `Origin: null` で Server Actions の CSRF チェック回避 | >=16.0.1, <16.1.7 | 16.1.7 | **非該当**（16.3.3） |

```
npm audit --omit=dev
→ moderate: 1 / high: 0 / critical: 0
   moderate  @anthropic-ai/sdk
     "Claude SDK for TypeScript has Insecure Default File Permissions in Local Filesystem Memory Tool"
```

**注**: `git push` 時に GitHub から Dependabot アラートの通知が出た。
`npm audit --omit=dev` は devDependencies を除外しているため**差分が出る可能性がある**。
Step 2 で `mcp__github__*` 経由で Dependabot アラートを確認し、突き合わせること。

---

## 7. 未検証の疑わしい箇所（Step 2 の起点。**まだ確定していない**）

### ① `src/proxy.ts` — オープンリダイレクトの疑い（P1）

Next.js 16 で `middleware.ts` から `proxy.ts` に改名されたファイル。`src/proxy.ts:83-89`:

```ts
const isAuthPage = AUTH_PAGE_PATHS.includes(pathname);
const isReauth = request.nextUrl.searchParams.get("reauth") === "1";
if (hasAuth && isAuthPage && !isReauth) {
  const redirectTo =
    request.nextUrl.searchParams.get("redirectTo") || "/mypage";
  const url = request.nextUrl.clone();
  url.pathname = redirectTo;          // ← 検証なしでクエリ値を代入
  url.searchParams.delete("redirectTo");
  return NextResponse.redirect(url);
}
```

`?redirectTo=//evil.com` や `?redirectTo=/\evil.com` が成立するか **実際に検証すること**
（`url.pathname` への代入なので Next.js 側で正規化される可能性もある。憶測で結論を出さない）。

### ② `src/app/api/cron/*` — `CRON_SECRET` 検証の有無（P0）

両ファイルとも `SUPABASE_SERVICE_ROLE_KEY` を使うが、**冒頭40行を grep した限り認証チェックらしき記述が見当たらなかった**
（`auth|getUser|SERVICE_ROLE|CRON_SECRET|headers\(|origin|token` で該当なし）。
40行しか見ていないので**ファイル全体を読んで確定させること**。
未認証なら「誰でもURLを叩いて service_role 権限の処理を起動できる」。

### ③ `src/proxy.ts` の matcher が守っていない範囲（P1）

matcher は以下のみ。**API Routes と Server Actions は一切含まれない**:

```
/mypage/:path*  /account/:path*  /profile/:path*  /settings/:path*
/feedback-apply/submit  /login  /signup
```

proxy 自体は cookie の**存在**しか見ていない（ファイル内コメントで自認済み・意図的な設計）。
「真の認証検証はページレベルの `getCurrentUser()` で行う」という設計方針は
Next.js 公式の DAL パターンと方向性は一致している。
**Step 2 では「全ての保護対象データ経路で本当に再検証しているか」を実測して確かめる**。

---

## 8. Step 2 のチェックリスト（Step 1 から導出。優先度は「被害 × 起きやすさ」）

### P0（最優先）
- [ ] `api/cron/*` 2本に `CRON_SECRET` 検証があるか
- [ ] `api/ai-chat` にレート制限・認証があるか。**インメモリ方式なら Vercel では実質無効**
- [ ] `supabase/functions/stripe-webhook` が `constructEvent` で署名検証しているか / raw body / 冪等性
- [ ] 全テーブルの RLS 有効化と、SELECT 以外（INSERT/UPDATE/DELETE）のポリシー有無（`supabase/migrations/`）
- [ ] 有料コンテンツの権限判定がクライアントでなくサーバー側で行われているか（**課金バイパス = OWASP A01**）

### P1（高）
- [ ] `src/proxy.ts` の `redirectTo` オープンリダイレクト成立可否
- [ ] service_role 使用6箇所すべての呼び出し前認可
- [ ] `api/questions/submit` / `api/feedback-apply/submit` の認証・入力検証・レート制限
- [ ] `api/revalidate` の認証（未認証ならキャッシュ破壊DoS）
- [ ] `api/search` のインジェクション（GROQ / SQL）と件数制限
- [ ] client bundle への秘密混入（`NEXT_PUBLIC_` 誤用）
- [ ] Server Actions（`actions.ts` 各種）の認可と IDOR

### P2（中）
- [ ] Supabase Edge Functions の CORS 設定（`supabase/functions/_shared`）と JWT 検証
- [ ] cookie の `Secure` / `HttpOnly` / `SameSite`
- [ ] CSP Report-Only 導入計画（外部オリジンの洗い出し）
- [ ] `@anthropic-ai/sdk` の moderate 脆弱性の該当有無 + GitHub Dependabot アラートとの突合

---

## 9. ❓未決Q

### Q1. 新ドメインは何か（**Step 3 のブロッカー**）

ユーザーに2回聞いたが**まだ回答を得ていない**。Step 2 は新ドメイン名がなくても進められるため、
先に Step 2 を実行してよい。ただし **Step 3 には必須**。

現状コードに登場するドメイン: `bo-no.design` / `www.bo-no.design` / `app.bo-no.design` / `legacy.bo-no.design`

### Q2. Step 2 に進む承認

「Step 2（現状監査）に進んでいいか」を聞いたところで前セッションが終わっている。**未回答**。

---

## 10. 次のセッションがやること

1. `docs/security-review-2026-09.md` を**先に読む**（Step 1 の成果物本体。このファイルは要約に過ぎない）
2. ユーザーに Step 2 の承認と新ドメイン名を確認する（Q1 / Q2）
3. **Step 2 を実行**: 上記チェックリストを P0 から順に実測。**この段階では修正しない**。
   指摘一覧（Critical / High / Medium / Low）を出して報告する
4. 結果を `docs/security-review-2026-09.md` の「進捗ログ」に追記し、コミット＆push

### 守るべき作法（このタスク固有）

- **根拠が外部ソースか自分の知識かを必ず区別して報告する**（ユーザーが最も気にしている点）
- 憶測で「脆弱性がある」と言わない。**実際にファイルを読んで確定させてから報告する**
- 1ステップごとに報告し、承認を得てから次へ進む
- コミット前に `npx tsc --noEmit` / `npm run build` / `npm run lint` / `npm test`（`.claude/rules/06`）
- コミットメッセージ末尾に Co-Authored-By と Claude-Session を付ける
- **PR は明示的に依頼されるまで作らない**
