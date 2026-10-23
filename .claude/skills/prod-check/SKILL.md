---
name: prod-check
description: 本番の実際の挙動（HTTPステータス・リダイレクト・関数リージョン・表示時間）を curl とブラウザで確かめる手順。次のどれかに当てはまったら必ず使う — proxy.ts / vercel.json / next.config の redirects・rewrites / page・layout の redirect()・notFound() / loading.tsx / root layout・LayoutWrapper / 認証・cookie / 環境変数・リージョン・キャッシュ設定を変更した時、本番デプロイの直後、「遅い」「ログインしてるのに変」「リダイレクトがおかしい」と言われた時。build・tsc・テストが通っても、本番で確かめるまで完了にしない。
argument-hint: [BASE_URL（省略時 https://www.bo-no.design）]
allowed-tools: Read, Grep, Bash, Edit, mcp__claude_ai_Vercel__get_runtime_errors, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__javascript_tool
---

# 本番の実挙動チェック（prod-check）

## なぜあるか（#257 / #258）

コードが正しく見えて build も通るのに、本番では別物だったことが2回あった。

- 関数が Vercel 既定の iad1（ワシントン）で動き、東京の Supabase と毎回太平洋を往復していた。`x-vercel-id: hnd1::iad1::…` を1回見れば分かった
- page.tsx の `redirect()` が、ルート `loading.tsx` のストリーミングのせいで 307 ではなく「200＋HTMLに埋め込んだ NEXT_REDIRECT」になっていた

どちらも本番に1回 curl すれば見えた。だから**測る前にコードを直さない／本番を見る前に完了と言わない**。

## 手順

### 0. 対象を決める

- 既定は本番 `https://www.bo-no.design`。preview はデプロイ保護で 401 になることがあるので、その場合は本番デプロイ後に行う
- 変更したものに応じて、`e2e/fixtures/routing-expectations.json`（期待値の正）に確認したいURLが入っているか見る。足りなければ**ここに追加する**（スクリプトとE2Eの両方が読む。他の場所にURLを書かない）

### 1. ステータス・リダイレクト・リージョンを見る

```bash
python3 .claude/skills/prod-check/scripts/prod-check.py            # 本番
python3 .claude/skills/prod-check/scripts/prod-check.py https://…  # 別の対象
E2E_BASE_URL=https://www.bo-no.design npm run test:e2e             # 同じ期待値をPlaywrightで
```

- 1行ごとに PASS / FAIL / KNOWN（既知の問題）/ FIXED?（既知の問題が直った）を出す
- ダミー auth cookie（`sb-…-auth-token=dummy`）で「ログイン済みの入口の振る舞い」を確かめる。proxy は cookie 名しか見ないので本物のログインは要らない。本番DBへの書き込みは無い

### 2. 偽リダイレクト・偽404を探す

- 200 で返ったのに中身が移動指示だけ、が一番見落としやすい
- `curl -s -H "Cookie: <ダミーcookie>" <URL> | grep -o 'NEXT_REDIRECT[^"]*'` で埋め込みリダイレクトを探す
- 404 のはずのURLが 200＋`<meta name="robots" content="noindex">` になっていないか見る

### 3. 表示時間を測る（速度に関わる変更・「遅い」と言われた時）

- 手軽: スクリプトの `ttfb`（自分のPC→入口の往復を含む。比較は同じPCで）
- 体感の合計（ログイン状態）: claude-in-chrome で、www.bo-no.design のタブから
  1. `sessionStorage.setItem('t0', Date.now()); location.href='https://bo-no.design/'`
  2. 移動後に `performance.timeOrigin - t0` と `first-contentful-paint` を足す
  - デプロイ直後の1回目はサーバーの寝起きで遅い。3回測って1回目は別扱いにする
- サーバー内訳: preview に `PERF_TRACE_SERVER=1` を付けてデプロイし、1時間以内に Vercel のランタイムログで `performance_trace` を読む（`src/lib/performance/server-trace.ts`。Hobby はログ保持1時間）

### 4. 本番エラー

- Vercel MCP `get_runtime_errors` を直近3〜6時間で見る。自分の変更起因でなくても、壊れているサインは止めて報告する

### 5. 記録する

- 該当の rebono/issues のMDの進捗ログに、日付・対象・結果（スクリプトの出力そのまま）・表示時間を貼る
- 基準値は #258（`258_本番の実挙動チェックの仕組み化.md`）にある。大きく悪化していたら報告する

## 合格基準

- ページ本体が返る 200 のURLで、`x-vercel-id` の2つ目が `hnd1`
  - 3xx には `hnd1` が付かないのが正常（proxy・next.config は入口で返す）
- リダイレクトを期待するURLは**最初の応答が 3xx**で location が期待どおり。最終URLが合っているだけでは合格にしない
- `NEXT_REDIRECT` を含む 200 は不合格
- 表示時間が基準値から大きく悪化していない
- 結果が issue MD に残っている

## 直し方の定石

- 固定の飛び先（名前が変わった等）→ `next.config.ts` の `redirects()`
- cookie の有無で決まる振り分け → `src/proxy.ts`（matcher への追加を忘れない）
- DB/CMS を見ないと決まらないもの → ページ側に残す（200＋埋め込みになるのは受け入れ、noindex を確認）
- 出典: https://nextjs.org/docs/app/api-reference/functions/redirect / https://nextjs.org/docs/app/api-reference/file-conventions/loading / https://vercel.com/docs/functions/configuring-functions/region
