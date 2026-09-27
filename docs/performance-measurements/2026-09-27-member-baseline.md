# 会員速度計測 2026-09-27

関連: issue #211 / [`docs/performance-next-tasks.md`](../performance-next-tasks.md) タスクA

## 計測条件

- commit: `cc52b6ab`（`origin/main`）
- branch: `docs/perf-member-baseline-20260927`
- 計測対象: 本番 `https://www.bo-no.design`（ローカル本番ビルドではない）
- 計測方式: **本番サイト直接計測**（issue #211 の決定D2）
  - 引き継ぎ書の本来手順（`scripts/perf-production-auth.mjs` でローカル本番ビルドを起動しサーバー内訳traceを取る）は、ログイン操作に人の手が必要なため今回は採用しなかった
  - **したがって `auth.*` / `subscription.*` / `*.cms` のサーバー内訳traceは本記録に存在しない**
- trace: off（`PERF_TRACE_SERVER` 未使用）
- Service Worker状態: 未確認（ブラウザ計測時に記録する）

## セクション1: ゲストHTML到着（完了）

`npm run perf:top-response -- https://www.bo-no.design/top` の出力。

**これはHTML到着時間のみであり、LCPでもINPでもない。ブラウザの描画を含まない。会員のLCPと比較してはいけない。**

- 認証: ゲスト（cookieなし）
- cache: 未クリア。run 1 はプロセス・接続のwarm-upを含む。サーバー/CDN cacheは未制御
- 取得時刻: 2026-09-27T07:47:15Z

| run | headers到着 (ms) | hero HTML到着 (ms) | 全body完了 (ms) | bytes | h1数 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 607 | 771 | 1883 | 252,935 | 1 |
| 2 | 582 | 731 | 893 | 252,579 | 1 |
| 3 | 316 | 434 | 587 | 252,579 | 1 |
| 4 | 297 | 297 | 444 | 252,892 | 1 |
| 5 | 399 | 635 | 721 | 252,665 | 1 |
| **中央値** | **399** | **635** | **721** | 252,665 | 1 |

読み取れること:

- `h1` は全5回で1個。過去に発生した「Suspense fallbackと解決後の両方に `children` を置きSSR HTMLに本文が2回入る」回帰は本番で再発していない（引き継ぎ書 §7 の禁止事項の確認）
- run 1 のみ全body完了が `1883 ms` と外れ値。接続warm-upを含むため、これをcold値として扱わない
- HTMLは約253KB。ゲスト `/top` の同期シェルは安定してhero到着まで到達している

読み取れないこと:

- 会員のLCP・CLS・INP
- サーバー内訳（認証・契約照会・CMSのどれが支配的か）
- router cache再訪の挙動

## セクション2: 会員ブラウザ計測（未実施・ブロック中）

**ブロック理由: Claude用ブラウザ拡張が未接続のため、実ブラウザ操作ができない。**

接続後に以下を実施する。

### 対象導線（各5回、初回とrouter cache再訪を分離）

- [ ] `/top` 初回表示
- [ ] `/top` → 代表レッスン
- [ ] レッスン → 有料記事（`isPremium=true` で本文が表示されるもの。無料記事で代替しない）
- [ ] 有料記事 → 次の記事
- [ ] 記事 → 戻る
- [ ] `/questions` 初回表示と再訪

### 初回ナビゲーション

| 導線 | 1 | 2 | 3 | 4 | 5 | 中央値 | 補足 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| | | | | | | | 未計測 |

### Router cache再訪

| 導線 | 1 | 2 | 3 | 4 | 5 | 中央値 | 補足 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| | | | | | | | 未計測 |

### Network/prefetch

- [ ] `/top` を15秒静置し、hover/focusしていない `/lessons/*` と `/contents/*` のRSC/HTMLリクエストが0件であること（PR #217 の回帰確認）
- [ ] hover/focus後にprefetchが発生すること

### Visual/CLS

- [ ] LCP element
- [ ] CLS値とshift source
- [ ] console error / hydration error

## 判断

サーバー内訳traceが取れない方式を選んだため、**この記録だけではD/E/Fの切り分けはできない。**

- タスクD（共有レイアウトの認証待ち分離）: **判定保留**。根拠: `auth.get_user` が初期シェルを支配しているかを本方式では観測できない。タスクB（Web Vitals RUM）のp75蓄積を待つ
- タスクE（契約照会クエリ）: **判定保留**。同上
- タスクF（掲示板会員集計）: **判定保留**。同上

判定にはタスクBのRUMデータ（`route_group × device × navigation_type` のp75）を使う。ラボ1回の値でDB変更・認証レイアウト変更に踏み込まない。

## セクション3: 会員ログイン状態のDOM検査（完了・可視性に依存しない項目）

本番 `https://www.bo-no.design/top`、ログイン済み会員セッション、Chrome（macOS）。

### 見出し構造（SEO）

- `h1` は1個のみ
- 階層は `h1` → `h2` → `h3` で、レベル飛びなし（`.claude/rules/08-seo-semantics.md` 準拠）

### Service Worker

- `navigator.serviceWorker.controller` あり（登録・制御されている）
- ただし `public/sw.js` は `push` と `notificationclick` のみで `fetch` handler と Cache Storage を持たない（ローカル・本番の配信物の両方をgrepで確認済み）
- したがって **SWはページ/RSCのoffline cache要因ではない。「SW cache削除」を改善策として実施しない**（引き継ぎ書 §6 の前提を本番で検証済み）

### 画像

`/top` の `img` 要素32個の内訳。

| 項目 | 件数 |
| --- | ---: |
| 合計 | 32 |
| `loading="lazy"` | 29 |
| `loading="eager"` | 0 |
| `fetchPriority="high"` | **0** |
| width/height未指定 | 0 |

- width/height が全画像で指定済み。縦横比が予約されており、画像起因のCLSリスクは低い
- **⚠️ 所見: LCP候補の画像が優先されていない。** 計測時のLCP要素は above-the-fold のカード画像（`IMG.object-cover transition-transform`、top=433px）だったが、この3枚は `loading="auto"` / `fetchPriority="auto"` で、`fetchPriority="high"` の画像がページ内に1枚も存在しない。Next.js の `<Image priority>` を付けると `fetchpriority="high"` とpreloadが入るが、現状は付いていない
- 補足: BONOロゴ（top=36px、above-the-fold）が `loading="lazy"` になっている。小さいので影響は限定的だが、above-the-fold要素をlazyにする理由はない

この2点は**推測ではなく本番DOMの実測**だが、改善効果は未検証。LCPの実測値（下記ブロック解消後）と合わせて判断する。

### 計測上の制約（重要）

初回計測時、タブが前面になく `document.visibilityState === "hidden"` だった。この状態ではブラウザが描画を遅延させるため、
FCP `5800 ms` / LCP `5800 ms` という値が出たが、**同じ読み込みのTTFBは `309 ms`**。描画だけが止められた値であり、
**これらのpaint系数値は無効として破棄する**。

→ 以降の計測は `document.visibilityState === "visible"` かつ `document.hasFocus() === true` を各runで検証してから記録する。
