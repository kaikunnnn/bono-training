# セキュリティレビュー（ドメイン変更リリース前）

- status: in_progress
- 作成日: 2026-09-02
- ブランチ: `claude/domain-change-security-80wmob`
- 目的: ドメイン変更してリリースするにあたり、セキュリティ面の不安を潰す

## ゴール

1. 一般的なベストプラクティスを外部ドキュメントでリサーチし、出典付きで記録する（Step 1）
2. その基準で現状コードを監査する（Step 2）
3. ドメイン移行チェックリストを作る（Step 3）
4. 重大度順に修正する（Step 4）
5. 攻撃者視点でレビューし、成立する攻撃がないか確認する（Step 5）

## リサーチの制約（明示）

この作業環境は外部HTTPへのegressが遮断されており、`nextjs.org` / `supabase.com` / `docs.stripe.com` / `owasp.org` / `developer.mozilla.org` へ直接アクセスできない（すべて 403）。
そのため本ドキュメントの出典は **Web検索の要約 + Vercel公式ドキュメントMCP** 経由で得たものであり、
一次ソースのページ全文を取得して確認したわけではない。**重要な判断の前には下記URLを直接開いて裏取りすること。**
（`mcp__Vercel__search_vercel_documentation` 経由の Vercel 公式ドキュメントのみ、コード例まで一次情報として取得済み）

---

# Step 1: ベストプラクティス（出典付き）

## 1. Next.js — 認可はミドルウェアに依存しない（最重要）

> 認可チェックの本体は「データにアクセス・変更する場所」に置くこと。ミドルウェアは初期バリデーションには使えるが、データ保護の唯一の防衛線にしてはいけない。セキュリティチェックの大半は Data Access Layer (DAL) で行う。
> Server Actions と Route Handlers は「公開エンドポイント」として扱うこと。

- 出典: https://nextjs.org/docs/app/guides/authentication
- 出典: https://nextjs.org/blog/security-nextjs-server-components-actions
- 出典: https://nextjs.org/docs/app/guides/data-security

**本プロジェクトへの含意**: `src/proxy.ts` は auth cookie の「存在」しか見ていない（コメントで自認済み）。
ページ側 `getCurrentUser()` が真の検証を担う設計は方向性として正しい。**Step 2 で「全ての保護対象データ経路で本当に再検証しているか」を実測する**。
特に API Routes / Server Actions は proxy の matcher に一切入っていないため、proxy はそこを守っていない。

### 関連 CVE（本プロジェクトの該当有無）

| CVE | 内容 | 影響版 | 修正版 | 本プロジェクト |
|---|---|---|---|---|
| CVE-2025-29927 | `x-middleware-subrequest` ヘッダ偽装で middleware を丸ごとバイパス | <12.3.5 / <13.5.9 / <14.2.25 / <15.2.3 | 15.2.3 等 | **該当なし**（next 16.3.3） |
| CVE-2026-27978 | `Origin: null` を「Originなし」と誤判定し Server Actions の CSRF チェックをバイパス | >=16.0.1, <16.1.7 | **16.1.7** | **該当なし**（next 16.3.3） |

- 出典: https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/
- 出典: https://snyk.io/blog/cve-2025-29927-authorization-bypass-in-next-js-middleware/
- 出典: https://github.com/advisories/GHSA-mq59-m269-xvcx

> CVE-2026-27978 の緩和策として公式が挙げているもの: 機微な Server Action に CSRF トークンを付ける、認証 cookie に `SameSite=Strict` を使う、`serverActions.allowedOrigins` に `'null'` を入れない。

## 2. Next.js — Server Actions の CSRF 保護

> Next.js は Server Action リクエストの `Origin` ヘッダを `Host`（またはプロキシ環境では `X-Forwarded-Host`）と比較し、一致しなければリクエストを中断する。追加で許可したいオリジンがある場合のみ `serverActions.allowedOrigins` を使う。指定しなければ same-origin のみ許可。

```js
// next.config.js
module.exports = {
  experimental: {
    serverActions: { allowedOrigins: ['my-proxy.com', '*.my-proxy.com'] },
  },
}
```

- 出典: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions

**ドメイン移行での含意**: リバースプロキシや複数ドメイン（`bo-no.design` / `www.` / `app.` / `legacy.`）を挟む構成では、
Origin と Host がずれて Server Action が壊れる／逆に緩めすぎる事故が起きやすい。**移行後に必ず実挙動を確認する**。

## 3. Next.js — Content-Security-Policy（nonce方式）

> nonce は「1回だけ使う」ランダム文字列で、strict な CSP の下で特定のインラインスクリプトのみ許可するために使う。
> **ページが表示されるたびに新しい nonce を生成する必要がある = nonce を使うなら動的レンダリングが必須**。

- middleware で `Buffer.from(crypto.randomUUID()).toString('base64')` により nonce 生成 → CSP ヘッダと `x-nonce` リクエストヘッダの両方をセットし、コンポーネントから読む
- 代表的なディレクティブ: `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'` / `style-src 'self' 'nonce-${nonce}'`
- 代替として、静的生成を保ったまま strict CSP を効かせる **hash ベース CSP（SRI）** の実験的サポートがある

- 出典: https://nextjs.org/docs/app/guides/content-security-policy
- 出典: https://0xdbe.github.io/NextJS-Crafting-CSP/

**採用方針（決定）**: nonce方式は全ページ動的レンダリング化を招き、このサイト（Sanityコンテンツ中心・静的化前提）では
パフォーマンス退行が大きい。`next.config.ts` に既に書かれている方針どおり
**`Content-Security-Policy-Report-Only` から段階導入**し、レポートで誤爆を潰してから enforce に切り替える。
外部依存が多い（Sanity CDN / Stripe / Supabase / YouTube / Vimeo / GA4 / dicebear / placehold.co）ため、
いきなり enforce は本番を壊す。

## 4. Next.js — オープンリダイレクト

> ユーザー入力の絶対URLへは絶対にリダイレクトしない。相対パス（`/` 始まり）のみ許可する。
> 許可リストを持つか、URLをパースしてホスト名が自ドメインであることを検証してから飛ばす。
> **`//evil.com`（プロトコル相対）や `/\evil.com`（バックスラッシュ）は、`http://` `https://` の前方一致だけを見る素朴なチェックを回避できる。**

実例: Next.js 公式ドキュメントのセッショントークン交換エンドポイントの例に、`redirect_url` クエリを
検証なしで `new URL()` に渡すオープンリダイレクトがあった。攻撃は
`/api/auth/callback?session_token=VALID&redirect_url=https://evil.com` の形で、
セッション cookie をセットした直後に外部サイトへ飛ばしフィッシングやトークン窃取に繋げる。
修正パッチは「リクエストのオリジンと異なれば 400 を返す」オリジンチェックの追加。

- 出典: https://vibeappscanner.com/vulnerability-in/open-redirect-nextjs
- 出典: https://www.overmcp.com/blog/fix-open-redirect-next-js

**本プロジェクトへの含意（要確認・Step 2）**: `src/proxy.ts:83-89` で `redirectTo` クエリを検証なしに
`url.pathname` へ代入している。`?redirectTo=//evil.com` 等が成立するか **実際に検証すること**。

## 5. Supabase — RLS と service_role

> **service_role キーは RLS を完全にバイパスする。** Authorization ヘッダに service role キーを設定した
> Supabase クライアントは **常に** RLS を迂回する。サーバーサイド専用に留め、クライアントコードには絶対に置かない。

> **public スキーマの全テーブルで RLS を有効化する。例外なし。** Data API 経由で公開されるテーブルは全て RLS が必要。
> 有効化すると、anon / authenticated ロールからのリクエストはポリシーで許可されない限り拒否される。

その他:
- ポリシーのロールを実際の呼び出し元（`anon` / `authenticated`）に合わせ、サインアウト状態も考慮する
- ポリシーがフィルタに使うカラムにインデックスを張る
- ポリシーが再帰的／低速になるときの定石は security definer ヘルパー関数。**ただしそれを `public` に作るのが典型的ミス**。
  公開スキーマ内の関数は Data API から呼べてしまうため、RLS を近道するつもりの関数が
  「DBに直接問い合わせる裏口」になる。**公開スキーマ一覧に入っていないスキーマに置くこと。**
- INSERT/UPDATE/DELETE ポリシー未設定だと、anon キーを持つ第三者が任意の行を書き換え・全削除できる
- 最大のミスは service_role キーのクライアント露出。**RLS を完全にバイパスし、データが漏れるまで無言で成功し続ける**

- 出典: https://supabase.com/docs/guides/database/postgres/row-level-security
- 出典: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z
- 出典: https://zenn.dev/soooms/articles/144d2a4c85179d

**本プロジェクトへの含意**: service_role を使っている箇所が6つある（`api/cron/*` 2件、`api/questions/submit`、
`questions/[slug]/actions.ts`、`lib/questions/board-user-stats.ts`）。**すべて Step 2 で個別に精査する**。

## 6. Supabase Auth — Redirect URLs 許可リスト

> Supabase Auth はリダイレクト応答を返す前に許可リストを参照する。`redirectTo` パラメータが許可リストに
> 含まれない場合は Site URL が使われる。

> ワイルドカードも使えるが、**使うときは注意が必要。攻撃面を広げることになる。**

- Site URL = `redirectTo` 未指定時のデフォルトリダイレクト先
- カスタムドメイン移行時は、本番で `NEXT_PUBLIC_SITE_URL` を Vercel の自動URLではなくカスタムドメインで上書きし、
  Supabase の Redirect URLs 許可リストにも追加する

- 出典: https://supabase.com/docs/guides/auth/redirect-urls
- 出典: https://supabase.com/docs/guides/auth/general-configuration

**ドメイン移行での含意**: ここを更新し忘れると「メール確認・パスワードリセットのリンクが旧ドメインに飛ぶ」で
**ログインできなくなる（可用性障害）**。逆に `*` 等の緩いワイルドカードを入れると
**認証後リダイレクトを乗っ取られる（オープンリダイレクト + トークン窃取）**。Step 3 の必須項目。

## 7. Stripe — Webhook 検証

> **最重要ルール: 必ず `stripe.webhooks.constructEvent`（Node）を使う。HMAC 検証を自作しない。**
> 公式SDKは定数時間比較・タイムスタンプ許容幅・ヘッダのパースを正しく処理する。

- **raw body 必須**: 署名検証には生のリクエストボディが要る。JSONミドルウェア（Express body-parser 等）は
  ペイロードを暗黙に再シリアライズし、HMAC 検証を壊す
- **リプレイ攻撃対策**: `Stripe-Signature` にタイムスタンプが含まれる。**300秒より古いイベントは拒否する**
- **冪等性**: `event.id` をキーにした冪等ストアで、リトライとリプレイを重複排除する
- 2xx を素早く返す（永続化 or キュー投入してから）
- **環境ごとに署名シークレットとエンドポイントを分ける**（CLI / test / live）
- 受信した全イベントを ID・種別・検証結果つきで記録する

- 出典: https://docs.stripe.com/webhooks
- 出典: https://www.hooklistener.com/learn/stripe-webhook-security-guide

**ドメイン移行での含意**: Stripe ダッシュボードの Webhook エンドポイントURLを新ドメインに変更すると
**署名シークレット（`whsec_`）が変わる場合がある**。旧エンドポイントを消す前に新エンドポイントを作り、
両方を一時的に有効にしてから切り替える（課金イベントの取りこぼし = 決済したのに権限が付かない事故）。
本プロジェクトの webhook は Supabase Edge Function 側（`supabase/functions/stripe-webhook`）にあるため、
Next.js のドメイン変更とは独立している可能性が高い。**Step 2 で実際の登録先を確認する**。

## 8. Vercel — Cron の認証（コード例は公式から一次取得）

> Route Handler で `Authorization` ヘッダを `CRON_SECRET` 環境変数と照合する。

```ts
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json({ success: true });
}
```

- 出典: https://vercel.com/docs/cron-jobs/manage-cron-jobs （Vercel公式MCP経由で取得）

**本プロジェクトへの含意（要確認・Step 2）**: `vercel.json` に cron が2本登録されており、
両方の Route が `SUPABASE_SERVICE_ROLE_KEY` を使う。冒頭40行に認証チェックらしき記述が見当たらなかった。
**未認証なら、誰でもURLを叩いて service_role 権限の処理を起動できる**（DoS・情報漏洩・課金消費）。最優先で確認する。

## 9. Vercel / OWASP — HSTS

> HSTS は段階的に入れる: 短い `max-age` → 長い `max-age` → `includeSubDomains` → preload。
> **preload リストへの登録は事実上不可逆**。削除には数ヶ月かかり、しかも新しいブラウザバージョンにしか効かない。
> 古いバージョンのユーザーは何年も HTTPS を強制され続ける。

危険なケース: ドメインを第三者に売却する / サービスを畳んでドメインが再利用される / HSTS がキャッシュされ続ける。

> `includeSubDomains` を有効にする前にサブドメインの棚卸しをする。まず `includeSubDomains` なしで数週間運用し、
> DNSログと突き合わせて稼働中のサブドメインを洗い出してから切り替える。

> cookie はサブドメインから操作できるため、`includeSubDomains` を省くと HSTS が本来防げる
> cookie 関連攻撃の広い範囲を許すことになる。全ての cookie に `secure` フラグを立てることでも同種の攻撃を一部防げる。

- 出典: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html
- 出典: https://hstspreload.org/
- 出典: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security

**方針（決定）**: `next.config.ts` のコメントどおり **HSTS を自前で付けない**判断は妥当（Vercel が付与済み・preload 事故回避）。
ただし**ドメイン変更直後に preload 登録するのは特に危険**（新ドメインのサブドメイン構成が固まっていない）。
Step 3 で「Vercel が実際に何を返しているか」を実測して確認するに留める。

## 10. Sanity — トークンと CORS

> データを守るために最も重要なのは、アクセストークンを権限のない相手に開示しないこと。
> **最も多い漏洩経路はフロントエンドの JavaScript にバンドルしてしまうこと。**
> クライアント側にバンドルされ公開される JavaScript にアクセストークンを入れてはいけない。

> ユーザーにデータを投稿させたい場合は、**小さなプロキシサーバ or クラウド関数を作り、
> 受け取ったデータを検証してから、write トークンを持つクライアントで Sanity に投げる。**

> CORS オリジンを追加するときは credentials を許可するかを判断する。
> **credentials 有効なワイルドカードはセキュリティ上問題がある。** ホスト済みドメインは完全一致で指定する。

- 出典: https://www.sanity.io/docs/content-lake/keeping-your-data-safe
- 出典: https://www.sanity.io/docs/content-lake/browser-security-and-cors
- 出典: https://www.sanity.io/docs/content-lake/cors

**本プロジェクトへの含意**: `SANITY_WRITE_TOKEN` は `api/questions/submit` と `api/feedback-apply/submit` の
2つの API Route で使われている。これは公式が推奨する「検証つきプロキシ」パターン**の形**にはなっている。
**Step 2 で「本当に検証しているか（認証・入力検証・レート制限）」を確認する**。
ドメイン移行では Sanity の CORS オリジンに新ドメインを追加する必要がある。

## 11. レート制限（特に AI エンドポイント）

> レート制限がなければ、1人の悪意あるユーザーが数分で LLM の予算を使い切れる。
> 悪意ある利用者が 1,000 リクエスト送れば $500 の請求になり得る。
> **ユーザーがアクセスできる AI 機能にレート制限は「任意」ではない。**

> **サーバーレス／エッジではローカルのインメモリカウンタは機能しない**（各呼び出しが隔離されるため）。
> 分散型のレートリミッタが必要。Upstash Redis + 公式レート制限ライブラリがエッジでも動く。

> 金銭的コストや計算コストのかかるアクションは保護が必要。識別子は、認証済みユーザーならDB IDを使う。

- 出典: https://dev.to/whoffagents/how-to-rate-limit-your-ai-api-routes-in-nextjs-2d3
- 出典: https://www.omnikit.dev/blog/rate-limiting-nextjs-api-routes

**本プロジェクトへの含意**: `src/app/api/ai-chat/route.ts` が存在し、`@anthropic-ai/sdk` と `groq-sdk` が依存にある。
**Vercel はサーバーレスなのでインメモリ方式は無効**。Step 2 で現状のレート制限有無を確認する。最優先級。

## 12. OWASP Top 10 — A01 Broken Access Control / IDOR

> Broken Access Control は OWASP Top 10 2021 の **第1位**（前回5位から初めてインジェクションを抜いた）。
> テストしたアプリの **94%** に何らかのアクセス制御の弱点があった。

> IDOR は Broken Access Control の一種。**ユーザー入力から来たオブジェクトIDが、
> 「そのリソースにアクセスする権限があるか」を検証されないまま、そのままリソース参照に流れる**パターン。
> 典型例: ログイン中の顧客がIDを書き換えて他人の請求書を見る。

> アクセス制御は**全てのエンドポイントで、全てのロール・全てのリソース種別・全ての操作について**
> 正しいロジックを要求する。

- 出典: https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/
- 出典: https://www.invicti.com/blog/web-security/broken-access-control

**本プロジェクトへの含意**: このサービスは**有料サブスクで閲覧範囲が変わる**。
「無料ユーザーが有料コンテンツのIDを直接叩いたら取れてしまう」= 課金バイパス は、まさに A01。
Step 2・Step 5 の最重点。

## 13. 初心者がやりがちなミス（まとめ）

リサーチで繰り返し挙がったもの:

| # | ミス | 影響 | このプロジェクトでの確認先 |
|---|---|---|---|
| 1 | service_role キーをクライアントに露出 | RLS 全バイパス。**無言で成功し続ける** | `NEXT_PUBLIC_` 接頭辞の誤用、client bundle 混入 |
| 2 | RLS 未設定のまま anon key で公開 | `SELECT *` が素通り。購買履歴・profile が全部抜ける | `supabase/migrations/` 全テーブル |
| 3 | SELECT だけポリシーを書き INSERT/UPDATE/DELETE を忘れる | 第三者が任意の行を書き換え・全削除 | 同上 |
| 4 | security definer ヘルパーを `public` スキーマに作る | Data API から直接呼べる裏口になる | 同上 |
| 5 | 認可をミドルウェア（middleware / proxy）だけに任せる | API Route・Server Action が素通り | `src/proxy.ts` の matcher 外 |
| 6 | `redirectTo` 等をそのままリダイレクト先にする | オープンリダイレクト → フィッシング・トークン窃取 | `src/proxy.ts` |
| 7 | Webhook 署名検証を自作 or 省略 | 偽の決済成功イベントを注入され、無料で有料権限を取得される | `supabase/functions/stripe-webhook` |
| 8 | AI / 外部API エンドポイントにレート制限なし | 数分で予算枯渇。金銭的DoS | `api/ai-chat` |
| 9 | サーバーレスでインメモリのレート制限を使い、効いていると誤解する | 実質ノーガード | 同上 |
| 10 | CMS の write トークンを検証の薄いエンドポイントで使う | 任意コンテンツ投稿・スパム | `api/questions/submit`, `api/feedback-apply/submit` |
| 11 | Cron エンドポイントを未認証で公開 | 誰でも特権処理を起動できる | `api/cron/*` |
| 12 | CORS を `*` + credentials で許可 | オリジン制限が無意味に | Sanity / Supabase Edge Functions |
| 13 | ドメイン移行で Auth の Redirect URLs を更新し忘れる | ログイン不能（可用性障害） | Step 3 |
| 14 | ドメイン移行でワイルドカードを緩く入れる | 認証後リダイレクト乗っ取り | Step 3 |
| 15 | AI生成コードをそのままデプロイ | 約30%に改善点があったとの報告 | 全体 |

- 出典: https://zenn.dev/soooms/articles/144d2a4c85179d
- 出典: https://shiftb.dev/articles/indie-dev-security-guide

---

## 依存パッケージの現状（2026-09-02 時点）

```
npm audit --omit=dev
→ moderate: 1 / high: 0 / critical: 0
   moderate  @anthropic-ai/sdk
     "Claude SDK for TypeScript has Insecure Default File Permissions in Local Filesystem Memory Tool"
```

Next.js は **16.3.3**。上記2件の CVE はいずれも修正済みバージョン。

---

# Step 2 で確認する項目（Step 1 から導出したチェックリスト）

優先度は「壊れたときの被害 × 起きやすさ」で付けた。

## 最優先（P0）
- [ ] `api/cron/*` 2本に `CRON_SECRET` 検証があるか（無ければ service_role 処理が誰でも起動可能）
- [ ] `api/ai-chat` にレート制限・認証があるか。インメモリ方式なら実質無効
- [ ] `supabase/functions/stripe-webhook` が `constructEvent` で署名検証しているか / raw body / 冪等性
- [ ] 全テーブルの RLS 有効化と、SELECT 以外のポリシー有無
- [ ] 有料コンテンツの権限判定が、クライアントではなくサーバー側で行われているか（課金バイパス）

## 高（P1）
- [ ] `src/proxy.ts` の `redirectTo` オープンリダイレクト成立可否
- [ ] service_role 使用6箇所すべての呼び出し前認可
- [ ] `api/questions/submit` / `api/feedback-apply/submit` の認証・入力検証・レート制限
- [ ] `api/revalidate` の認証（未認証ならキャッシュ破壊DoS）
- [ ] `api/search` のインジェクション（GROQ / SQL）と件数制限
- [ ] client bundle への秘密混入（`NEXT_PUBLIC_` 誤用）
- [ ] Server Actions（`actions.ts` 各種）の認可と IDOR

## 中（P2）
- [ ] Supabase Edge Functions の CORS 設定（`_shared`）と JWT 検証
- [ ] cookie の `Secure` / `HttpOnly` / `SameSite`
- [ ] CSP Report-Only 導入計画（外部オリジンの洗い出し）
- [ ] `@anthropic-ai/sdk` の moderate 脆弱性の該当有無

---

# 進捗ログ

- 2026-09-02: Step 1 完了。外部ベストプラクティスを出典付きで記録。
  Next.js 16.3.3 が CVE-2025-29927 / CVE-2026-27978 いずれも非該当であることを確認。
  `npm audit --omit=dev` は moderate 1件のみ。Step 2 のチェックリストを導出。
