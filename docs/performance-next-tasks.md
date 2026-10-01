# 読み込み速度改善：次タスク引き継ぎ書

更新日: 2026-09-26  
基準コミット: `cc52b6ab`（`origin/main`）  
対象: BONO の会員導線を中心とした表示速度、画面遷移、Web Vitals  
関連ルール: [`docs/performance.md`](./performance.md)

## 1. この文書の目的

これまでの改善で、コードを見ただけで確実に直せる大きな waterfall、N+1、不要な初期 prefetch はほぼ解消した。次は推測でコードを増やす段階ではなく、実際の会員セッションと実ユーザー指標で残ったボトルネックを特定する段階である。

この文書は、別のエージェントが過去の経緯を知らなくても、次の作業を安全に実行できるようにするための引き継ぎである。タスクは次の3種類に分ける。

- **必須**: 次の実装判断に必要。まず実施する。
- **条件付き**: 必須計測で閾値を超えた場合だけ実装する。
- **保守**: 性能の主課題ではない。別PRで扱う。

結論として、最初にやるべきことは **変更後の会員ブラウザ再計測** と **本番 Web Vitals の継続収集** である。認証レイアウト、契約照会、掲示板DBを同時に変更してはいけない。

## 2. 現在地

### 2.1 完了済みの主な改善

以下は原則として再実装しない。新しい本番データで回帰が確認された場合だけ再調査する。

| 領域 | 完了内容 | 主なPR |
| --- | --- | --- |
| トップ・記事・レッスン | 同期シェル、CMSと会員データの独立ストリーミング、waterfall削減 | #190 ほか |
| マイページ・掲示板・ナビ | 初期表示を止める待ちの削減 | #191 |
| レッスン・ロードマップ一覧 | 一覧取得と画像読み込みの改善 | #192 |
| トレーニング | 一覧画像、LCP、詳細データの改善 | #193, #197, #198 |
| ガイド・実績・検索・How-to | 取得とprefetchの改善 | #194, #195, #196 |
| フォント | 未使用フォントの全ページpreloadを停止 | #200 |
| Vimeo | 不要なイベント・ポーリングの削減と回帰テスト | #201, #202 |
| トップの詳細ページprefetch | viewportに入っただけのレッスン・記事一括取得を停止し、hover/focus後に限定 | #217 |
| 掲示板一覧 | ゲストの必ず0件になるSupabase集計を省略し、投稿CTA待ちからカード表示を分離 | #218 |

過去にはレッスンのN+1、記事の認証重複、画像、RichText、CDN、公開CMS cacheなども改善済み（#143〜#150）。完了した領域を横断的に書き直すPRは避ける。

### 2.2 直近の確認結果

- PR #217 後のゲスト相当ローカルブラウザでは、`/top` を15秒表示しても `/lessons/*` と `/contents/*` の自動prefetchは0件だった。
- PR #218 のローカル本番ビルド・ゲスト `/questions` は、5回のHTML到着が変更前 `745 / 142 / 177 / 60 / 68 ms`、変更後 `119 / 13 / 8 / 8 / 8 ms`。中央値は約 `142 ms → 8 ms`。これは同条件のローカルHTML診断であり、LCPや本番会員値ではない。
- PR #218 後の本番公開 `/questions` は質問リンク6件を返すことを確認済み。
- トップの不要な詳細prefetch除去後について、**ログイン会員の同条件5回比較はまだ完了していない**。

### 2.3 変更前ログに残っていた待ち

2026-09-24以前のログイン会員 `/top` 診断には次が記録されていた。PR #217 より前なので、詳細ページmetadataの値はすでに除去済みの可能性が高い。現在のボトルネックだと決めつけず、再計測の比較材料としてだけ使う。

| ラベル | 記録値 |
| --- | ---: |
| `auth.get_user` | 287 ms |
| `subscription.query` | 247〜511 ms |
| `subscription.total` / `top.subscription` | 537〜565 ms |
| `top.achievements.cms` | 469〜493 ms |
| `top.guides.cms` | 820〜863 ms |
| `top.latest.cms` | 837〜866 ms |
| `top.lessons.cms` | 898〜907 ms |
| 不要だったレッスンmetadata 3件 | 各326〜339 ms |
| 不要だった記事metadata/layout | 325〜340 ms |

掲示板の会員集計は、warm時に各 `42〜139 ms`、cold相当の単発で約 `622〜623 ms` が観測された。2本はすでに並列であり、1回のcold値だけを根拠に統合してはいけない。

## 3. 優先順位と判断フロー

| 優先度 | タスク | 種類 | 依存 |
| --- | --- | --- | --- |
| P0 | A. 会員ブラウザ再計測と証跡保存 | 必須 | なし |
| P1 | B. Web Vitalsの本番RUM設計・導入 | 必須 | 収集先の決定 |
| P1 | C. 画面・CLS・キャッシュ影響の回帰確認 | 必須 | Aと並行可 |
| P1 | D. 共有レイアウトの認証待ちを分離 | 条件付き | Aで認証が支配的 |
| P1/P2 | E. 契約照会クエリを調査・改善 | 条件付き | Aで契約照会が支配的 |
| P2 | F. 掲示板会員集計を調査・統合 | 条件付き | Aで会員掲示板が遅い |
| P3 | G. ビルド警告の整理 | 保守 | 性能タスクと分離 |

判断順は次のとおり。

1. Aで現在の会員導線を同条件で5回測る。
2. 体感問題があるのにラボ値だけで説明できない場合も含め、Bで実ユーザーp75を取得できる状態にする。
3. `auth.get_user` が初期HTMLを継続して支配する場合だけDへ進む。
4. `subscription.query` が会員コンテンツ表示を継続して支配する場合だけEへ進む。
5. `/questions` の会員経路で2本の集計が継続的に支配する場合だけFへ進む。
6. 各変更は1ボトルネック1PRにする。D・E・Fを同じPRに含めない。

## 4. タスクA：会員ブラウザ再計測と証跡保存

**種類:** 必須 / P0  
**目的:** PR #217・#218 後の現在値を確定し、次にコードを触る根拠を作る。

### 対象導線

- `/top` の初回表示
- `/top` → 代表レッスン
- レッスン → 有料記事
- 有料記事 → 次の記事
- 記事 → 戻る
- `/questions` の初回表示と再訪

代表記事は `isPremium=true` で本文が表示されるものを使う。無料記事が見えただけで学習権限確認済みとしない。

### 実施手順

1. `docs/performance.md` と、現在の `node_modules/next/dist/docs/` にある data fetching、streaming、prefetching のガイドを読む。
2. 比較対象のコミットSHA、日時、ブラウザ、viewport、CPU/回線、cache状態、ログイン状態を記録する。
3. サーバー内訳用の起動では次を使う。

   ```sh
   node scripts/perf-production-auth.mjs \
     --allow-production-auth \
     --dir=/Users/kaitakumi/.superset/worktrees/BONO/numerous-quotation \
     --port=3217
   ```

4. 本番公開SupabaseのURL・anon key形式が検証され、`/auth/v1/settings` が200であることを確認する。キー、cookie、パスワード、レスポンス本文はログへ残さない。
5. ユーザー本人がブラウザでログインする。cookieを別ブラウザや別環境へコピーしない。
6. サーバートレースで `auth.*`、`subscription.*`、`top.*`、`lesson.*`、`article.*`、`questions.*` の順序と時間を保存する。
7. 最終比較用は `--no-trace` で起動し直す。同じビルド成果物の再起動に限り `--no-build` を使える。
8. DevTools Consoleで `scripts/browser-navigation-probe.js` を実行する。補助的な5巡には `scripts/browser-navigation-repeat.js` を使う。
9. 各導線を5回測る。初回ナビゲーションとrouter cache再訪を別の表にする。
10. `/top` を15秒静置し、ユーザーがhover/focusしていない `/lessons/*` と `/contents/*` のRSC/HTMLリクエストが0件であることを再確認する。
11. Performance/NetworkのHARまたはスクリーンショット、`BONO_NAV` 出力、サーバートレースを、秘密情報を含まない形で保存する。

### 注意

- `PERF_TRACE_SERVER=1` は診断用であり、最終値には使わない。
- HTTPのTTFBをLCPと呼ばない。DOM見出し変更までの時間をINPと呼ばない。
- localとproductionをbefore/afterとして比較しない。
- 1回目とwarm再訪を混ぜて平均しない。中央値と全5サンプルを両方残す。
- 学習完了、ブックマーク、投稿、決済、通知許可を変更しない。閲覧履歴・視聴イベントは発生し得る。
- 自動ブラウザ操作が使えない場合、許可なくdriverを追加インストールしない。ユーザーのログイン済みブラウザとDevToolsで実施する。

### 完了条件

- すべての対象導線について5サンプル、中央値、条件、コミットSHAがある。
- `/top` 静置中の不要な詳細prefetchが0件である。
- trace有効値と無効値が明確に分離されている。
- 次の判定が文章で残る。
  - Dへ進む / 進まない
  - Eへ進む / 進まない
  - Fへ進む / 進まない
- 再現できない値や失敗した巡回は、成功値へ混ぜず理由を記録している。

### 成果物

- `docs/performance-measurements/YYYY-MM-DD-member-baseline.md` を新規作成する。
- 可能なら秘密情報を除いた画像・JSON・テキストを同じ日付ディレクトリへ置く。
- コード変更は原則行わない。計測補助スクリプトの修正が必要なら別コミットにする。

## 5. タスクB：本番Web VitalsのRUM設計・導入

**種類:** 必須 / P1  
**目的:** 単発の開発者計測ではなく、実ユーザーのp75で改善・回帰を判断できるようにする。

Next.js 16.3.3 の同梱ガイド `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-report-web-vitals.md` を実装前に必ず読む。学習済みの古いNext.js APIを推測で使わない。

### 最初に決めること

実装前に、収集先を短い設計メモで決める。

- 候補1: 既存GA4へカスタムイベントを送る。
- 候補2: Vercel Speed Insights等の専用基盤を使う。
- 候補3: GA4 + BigQuery等、p75集計が再現できる基盤を使う。

GA4標準画面だけで望む粒度のpercentileが安定して出せない場合がある。イベント送信だけ実装して「p75が取れる」と完了扱いしない。費用・権限・保持期間・分析方法を確認し、収集先を先に確定する。

### 推奨実装形

- `useReportWebVitals` を使う小さなClient Componentを1つ作る。
- `src/app/layout.tsx` 自体をClient Componentにしない。
- callbackの参照を安定させ、再レンダリングで不要な登録を増やさない。
- 既存の `isAnalyticsHost()` と同じ本番host allowlistを使い、localhostとpreviewでは送信しない。
- `TTFB`、`FCP`、`LCP`、`CLS`、`INP` を扱う。FIDは移行期間の互換性が必要な場合だけ扱う。
- CLSだけは整数送信が必要な収集先では `value * 1000` とし、単位をドキュメント化する。
- metric updateの重複送信方針を明示する。`metric.id` で重複排除またはdistribution集計できる設計にする。

推奨する低cardinalityパラメータ:

| パラメータ | 内容 |
| --- | --- |
| `metric_name` | LCP / CLS / INP / FCP / TTFB |
| `metric_value` | 数値。CLSの倍率を明記 |
| `metric_id` | Web Vitalsが渡す識別子 |
| `metric_rating` | good / needs-improvement / poor |
| `metric_delta` | 直前報告からの差分 |
| `navigation_type` | navigate / reload / back-forward等 |
| `route_group` | `top`, `lesson`, `article`, `questions`, `mypage`, `other` 程度 |

送ってはいけないもの:

- 完全なslugやURL query
- ユーザーID、メールアドレス、契約情報
- 記事タイトルなど高cardinality値
- cookie、storage、レスポンス本文

### 主な変更候補

- `src/components/common/WebVitals.tsx`（新規）
- `src/lib/analytics/web-vitals.ts`（必要なら新規）
- `src/lib/analytics/config.ts`
- `src/app/layout.tsx`（小さなServer→Client境界の追加のみ）
- 対応テスト
- `docs/performance.md` の運用ルール

### テスト

- production hostで正しいイベントと単位になる。
- localhost、preview、GA未初期化時は送らない。
- route groupがslugを含まず期待値になる。
- 同一metric updateの重複方針をテストする。
- 既存のGA page_viewとcontent eventを二重送信しない。
- RootLayoutがServer Componentのままである。

### 完了条件

- 本番でイベント受信を確認できる。
- p75を `route_group × device × navigation_type` 程度で確認する手順が文書化されている。
- 7日または十分なサンプル数を待つ基準がある。
- Core Web Vitalsのgood目安と、BONO内での回帰アラート閾値が決まっている。
- PII・高cardinality値を送っていない。

## 6. タスクC：画面・CLS・Service Worker影響の回帰確認

**種類:** 必須 / P1  
**目的:** 速くても、専用デザイン、画像、スケルトン、SEO、キャッシュ更新を壊していないことを確認する。

### 画面マトリクス

| 画面 | PC | スマホ | 通常回線 | 低速回線 | 上部 | 下部 |
| --- | --- | --- | --- | --- | --- | --- |
| `/top` | 必須 | 必須 | 必須 | 必須 | 必須 | 必須 |
| 通常 `/lessons/[slug]` | 必須 | 必須 | 必須 | 必須 | 必須 | 必須 |
| `/lessons/persona-based-design` | 必須 | 必須 | 必須 | 必須 | 必須 | 必須 |
| `/contents/[slug]` | 必須 | 必須 | 必須 | 必須 | 必須 | 必須 |
| `/questions` | 必須 | 必須 | 必須 | 必須 | 必須 | 必須 |

### 確認項目

- fallbackから実表示への置換で大きなCLSがない。
- 画像の縦横比が予約され、LCP候補だけが適切に優先される。
- 画面下部の画像は初期表示で不要取得されず、スクロール後に表示される。
- h1、metadata、JSON-LD、本文が重複しない。
- `persona-based-design` が通常レッスンUIに戻らず、専用デザイン・タブ挙動を維持する。
- 有料記事の本文、ロック、完了状態、前後ナビが正しい。
- consoleにhydration error、React key error、失敗リクエストがない。

### Service Workerについて

現在の `public/sw.js` はpushとnotification clickだけを扱い、`fetch` handlerやCache Storageを持たない。したがって、現状ではページやRSCをoffline cacheする性能要因ではない。一般的な「Service Worker cache削除」を改善策として実施しない。

ただしデプロイ確認時は次を記録する。

- 登録済みSWのscript URLと更新時刻
- hard reload後に新しいJS/CSS build IDが配信されること
- 古いタブだけで再現する不具合か、新規タブでも再現するか
- SW登録失敗がpush以外を壊していないこと

もし将来 `fetch` handlerやCache Storageを追加するなら、この前提を更新し、cold/warm計測をSW制御あり・なしで分ける。

### 完了条件

- マトリクスの結果とスクリーンショットが日付付きで残る。
- 専用personaデザインを含め、機能・見た目の回帰がない。
- CLSの発生箇所がある場合、Performance trace上のshift sourceが記録される。
- 失敗があれば性能変更と混ぜず、再現手順付きの個別issue/PRに分ける。

## 7. タスクD：共有レイアウトの認証待ちを分離

**種類:** 条件付き / P1 / 高リスク  
**開始条件:** タスクAまたはRUMで、`LayoutWrapper` の認証が初期シェルを継続して支配し、ユーザー影響が確認できた場合のみ。

### 現状

`src/components/layout/LayoutWrapper.tsx` は `UserProvider()` をawaitしてから `Layout` と `children` を返す。このため、認証が遅いリクエストではページの同期シェルも待つ可能性がある。

過去に、Suspense fallbackと解決後の両方へ `children` を置いた実装があり、SSR HTMLに本文が2回入り、h1とHTMLサイズが重複した。**この形を絶対に再導入しない。**

### 調査・設計手順

1. `LayoutWrapper`、`Layout`、`Header`、`Sidebar`、`UserProvider`、認証cacheを図にして、どのUIだけがuser依存か分ける。
2. `children` を一度だけ描画したまま、user依存のSidebar/Header部分だけをasync slotにできるか検証する。
3. ログイン前fallbackからログイン後UIへの置換で、リンク位置や横幅が大きく動かない構造を作る。
4. `StaleSessionCleaner` の400/401/403と一時障害の分類を維持する。
5. 通知ベル、掲示板新着dot、会員用ナビ、レイアウトを使わないrouteを維持する。
6. 小さなprototypeとbrowser検証で有効性を確認してから本実装する。

### 禁止事項

- fallbackと解決後の両方に `children` を入れる。
- RootLayoutやページ全体をClient Componentにする。
- 認証結果を `unstable_cache`、`cacheLife`、モジュール変数でユーザー間共有する。
- `getUser` を根拠なく `getClaims` へ置き換える。
- stale session cleanupやログイン判定を削除する。

### 完了条件

- `children`、h1、主要本文がSSR HTMLに1回だけ存在する。
- 未ログイン、ログイン、stale cookie、一時的認証失敗をテストする。
- 通知ベルと掲示板dotがページ本体をブロックしない。
- Aと同じ条件で5回比較し、初期シェルまたはLCPのp50/p75に実質的改善がある。
- CLS、SEO、アクセシビリティ、会員ナビに回帰がない。
- `npm run test:performance` と本番ビルド・ブラウザ検証が成功する。

改善が測れない場合は実装を採用せず、調査結果だけ残す。

## 8. タスクE：契約照会クエリを調査・改善

**種類:** 条件付き / P1〜P2  
**開始条件:** タスクAで `subscription.query` が複数回の中央値でも会員コンテンツ表示を支配する場合のみ。

### 現状

`src/lib/subscription.ts` の `getSubscriptionStatus()` は、request-scopedの `getCachedUser()` を再利用し、`user_subscriptions` を次の条件で1件取得する。

- `user_id = current user`
- `environment = live/test`
- `plan_type`, `duration`, `is_active`, cancel情報、period endをselect

トップの入会CTAはすでにSuspense内にあり、契約照会がトップ本文全体を止めない。したがって、トップのtraceが遅いだけではクエリ変更の理由にならない。レッスン・記事のアクセス判定でユーザーが待っているかを見る。

### 実施手順

1. Aのtraceで呼出回数、中央値、p75相当、どのSuspense境界を止めるか確認する。
2. 本番相当スキーマで `(user_id, environment)` のunique/index有無を確認する。
3. 安全な環境で `EXPLAIN (ANALYZE, BUFFERS)` を取得し、Seq Scan、rows、planning/execution timeを確認する。
4. インデックス不足が原因なら、concurrent作成可否、ロック、rollback、適用順を含むmigrationを設計する。
5. データ取得項目の削減やRPC化は、権限判定の正しさと実測差を示せる場合だけ採用する。
6. 変更前後を同じ会員・同じ導線・同じ条件で5回比較する。

### 安全条件

- 共有Next.js cacheへ会員の契約状態を入れない。
- `plan_type`、`is_active`、environment分離、cancel/renewal意味を変えない。
- service roleをブラウザや通常のServer Componentへ持ち込まない。
- DB migrationの本番適用は、明示された権限とロールバック手順なしに行わない。
- 課金・アクセス制御変更を性能PRへ混ぜない。

### 完了条件

- query planと遅さの原因が記録されている。
- 変更を採用する場合、同条件5回で実質的な短縮がある。
- 全plan、cancel-at-period-end、未契約、期限、test/live分離の回帰テストがある。
- migration → appの安全な適用順とrollbackがある。

## 9. タスクF：掲示板の会員集計を調査・統合

**種類:** 条件付き / P2  
**開始条件:** タスクA/RUMで、ログイン会員の `/questions` において次の2本が継続的な主要因だと確認できた場合のみ。

- `questions.engagement.summaries`
- `questions.engagement.reactions`

### 現状

- ゲストは `getCachedUser()` 後に早期returnし、Supabaseへ2本とも送らない。
- 会員は `question_comment_summaries` と `question_reaction_counts` を `Promise.all` で並列取得する。
- コメントindexとリアクションindexは既存migrationにある。
- 2本を1本にしても、並列通信の片方が減るだけなら効果は小さい可能性がある。View内部の集計が原因ならRPC統合だけでは直らない。

### 実施手順

1. warm/coldを分け、5回以上のtraceを取る。
2. `supabase/migrations/20260721_create_question_comment_summaries.sql` と `20260622_create_question_comments_and_reactions.sql` を読む。
3. 実行計画でView内のscan、sort、aggregate、rowsを確認する。
4. 次の候補を比較する。
   - 現状維持
   - index調整
   - 質問ID配列を受け、コメント要約とリアクションを一度に返すRPC
   - 更新時集計テーブル。ただし整合性・運用負荷が増えるため最後の候補
5. 返却サイズ、DB execution、API round trip、アプリ全体時間を別々に測る。

### 必須互換性

- `security_invoker` / RLS / authenticated grantを維持する。
- service roleでRLSを迂回しない。
- コメントだけ、リアクションだけ、両方なしの質問を正しく返す。
- `recentCommenters` は重複除去済み最新順・最大3人を維持する。
- `lastActivityAt` と浮上ソートを維持する。
- 個人・会員データを共有Next.js cacheへ入れない。
- query失敗時の一覧フォールバックとエラーログ方針を維持する。

### ロールアウト

DB変更が必要なら、既存アプリと互換のmigrationを先に適用し、その後アプリを切り替える。rollback SQLを用意する。DBとアプリを同時に切り替えないと壊れる設計は避ける。

### 完了条件

- 実行計画で原因を説明できる。
- 会員 `/questions` の同条件5回で実質的改善がある。
- ゲストの高速化を維持する。
- RLS、並び順、件数、直近コメント者、リアクションの統合テストがある。

## 10. タスクG：ビルド警告の整理

**種類:** 保守 / P3  
**性能改善とは別PRにする。**

現在確認されている主なノイズ:

- Node 25系で `@sanity/client -> get-it -> debug(browser)` に由来する `--localstorage-file` 警告
- `@sanity/image-url` のdefault export deprecation

これらは現時点で本番表示速度の原因だと証明されていない。警告を消したことを性能改善として報告しない。依存更新はlockfile差分、Next/Sanity互換性、ビルド、画像URL出力を個別に検証する。

## 11. エージェント分担案

最大でも次の4担当に分ける。共有ファイルの競合を避けるため、最終統合担当を1人決める。

| 担当 | 作業 | 並行可否 | 主な変更範囲 |
| --- | --- | --- | --- |
| Agent A | 会員再計測・証跡作成 | 最初に開始 | `docs/performance-measurements/`、原則コードなし |
| Agent B | Web Vitals収集先の設計とRUM実装 | A/Cと並行可 | analytics、WebVitals、root layout、テスト |
| Agent C | PC/スマホ/低速の画面・CLS回帰 | A/Bと並行可 | 証跡、必要なら個別issueのみ |
| Agent D | DB/認証の深掘り | Aの判定後 | D/E/Fのうち1件だけ |

競合ルール:

- `docs/performance.md` は最終統合担当だけが編集する。
- `src/app/layout.tsx` はRUM担当と認証レイアウト担当が同時に編集しない。
- `src/lib/subscription.ts` とDB migrationは別担当でも、同一PRに混ぜない。
- Agent DはD/E/Fを同時実装せず、Aが示した最大要因1件だけを選ぶ。
- 各担当は最新 `origin/main` から別branch/worktreeを使い、1PR1目的にする。

## 12. 他のエージェントへ渡すプロンプト

### Agent A：会員計測

```text
docs/performance.md と docs/performance-next-tasks.md の「タスクA」を読み、現在のorigin/mainで会員導線の本番用ローカルブラウザ再計測を実施してください。コード最適化はまだ行わず、/top→レッスン→有料記事→次記事→戻る、および/questionsを固定条件で各5回測り、初回とrouter cache再訪を分離してください。trace有効は原因調査だけ、最終比較は--no-traceにしてください。cookie・パスワード・レスポンス本文・会員IDを保存せず、完了・ブックマーク・投稿・決済を変更しないでください。結果を docs/performance-measurements/YYYY-MM-DD-member-baseline.md に全サンプル、中央値、条件、commit SHA、D/E/Fへ進むかの判断付きでまとめてください。
```

### Agent B：Web Vitals RUM

```text
docs/performance.md と docs/performance-next-tasks.md の「タスクB」を読み、Next.js 16.3.3同梱のuse-report-web-vitalsガイドも読んでください。まずGA4/専用基盤でp75をどう再現するか短い設計メモを作り、その後、小さなClient ComponentでTTFB/FCP/LCP/CLS/INPをproduction hostだけ送る実装をしてください。RootLayoutはServer Componentのまま、stable callback、低cardinality route_group、PIIなし、localhost/preview送信なし、既存page_viewの二重送信なしを守ってください。テスト、docs/performance.md、受信確認手順まで含め、1PRで提出してください。
```

### Agent C：視覚・CLS回帰

```text
docs/performance-next-tasks.md の「タスクC」にある画面マトリクスを、PC/スマホ、通常/低速、上部/下部で確認してください。特に /lessons/persona-based-design が専用デザインのままか、fallback置換のCLS、画像lazy、h1/本文重複、console/hydration errorを確認してください。public/sw.jsにはfetch handlerがない前提を検証し、一般的なcache削除をコード変更として行わないでください。結果とスクリーンショットを日付付き文書にし、回帰があれば実装修正と混ぜず再現手順付きで報告してください。
```

### Agent D：条件付きボトルネック改善

```text
Agent Aの会員計測結果を読み、docs/performance-next-tasks.md のD/E/Fの開始条件を満たす最大要因を1つだけ選んでください。開始条件を満たさなければ実装せず、その理由を報告してください。認証ならchildrenをfallbackと解決後へ重複させず、契約/掲示板なら会員データを共有cacheへ入れず、DB変更は実行計画・RLS・適用順・rollbackを用意してください。変更前後を同条件5回で比較し、npm run test:performance、型、対象lint、全テスト、本番build、ブラウザ回帰を通してください。
```

## 13. 共通の検証コマンド

コードを変更したPRでは、影響範囲に応じて次を実行する。

```sh
npm run test:performance
npx tsc --noEmit
npx eslint <変更したts/tsxファイル>
npm run test:run
npm run build
git diff --check
```

トップ、共有レイアウト、データ取得を変更した場合、unit testやHTTP値だけで完了にしない。必ずproduction buildのブラウザで会員ナビゲーション、CLS、SEO、専用persona画面を確認する。

## 14. 計測記録テンプレート

```md
# 会員速度計測 YYYY-MM-DD

- commit:
- branch/deploy:
- browser/version:
- viewport/device scale:
- network/CPU:
- cache状態:
- login/plan確認:
- trace: on（原因調査）/ off（最終値）
- Service Worker状態:

## 初回ナビゲーション

| 導線 | 1 | 2 | 3 | 4 | 5 | 中央値 | 補足 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |

## Router cache再訪

| 導線 | 1 | 2 | 3 | 4 | 5 | 中央値 | 補足 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |

## Server trace

| route | label | samples | median | max | 境界をブロックするか |
| --- | --- | --- | ---: | ---: | --- |

## Network/prefetch

- /top静置中のlesson detail request:
- /top静置中のarticle detail request:
- hover/focus後のprefetch:

## Visual/CLS

- LCP element:
- CLS値とshift source:
- console error:

## 判断

- タスクD: 実施 / 見送り。根拠:
- タスクE: 実施 / 見送り。根拠:
- タスクF: 実施 / 見送り。根拠:
```

## 15. 共通の禁止事項

- 1回の速い/遅い値だけで結論を出す。
- localとproduction、trace on/off、cold/warmを同じ比較表へ混ぜる。
- HTTP TTFBをLCPやINPとして報告する。
- 会員データを共有cache、CDN、モジュール変数へ入れる。
- 性能目的でplan、権限、TTL、RLSを変更する。
- 全画像preload、全リンクprefetch、全体Client Component化を行う。
- persona専用ページを通常レッスン実装へ寄せる。
- ログインcookieや本番秘密情報をコピー・保存する。
- DB migrationをアプリ変更と同時必須にし、rollbackなしで本番適用する。
- 計測PRへ無関係なリファクタや依存更新を混ぜる。

## 16. この改善プロジェクトの完了条件

次を満たした時点で、読み込み速度改善をいったん完了扱いにする。

- 会員の主要導線について、再現可能な5回計測と条件が保存されている。
- 本番のLCP・CLS・INP・TTFBを継続してp75確認できる。
- 不要なviewport prefetchが戻っていない。
- 主要画面とpersona専用画面に視覚・SEO・機能回帰がない。
- 認証、契約照会、掲示板DBのうち、実測で主要因と判定されたものだけが改善または見送り判断されている。
- 変更後のp75が目標内、または次の最大要因が外部サービス/費用/仕様判断として明文化されている。
- 新しい本番データがない限り、完了済み領域を再び広く書き換えない運用になっている。

