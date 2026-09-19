# 表示速度の継続チェック

最初の対象は `/top`（会員）、公開 `/`（ゲスト）。トップ → 記事 → レッスンの順で改善し、会員の学習中のページ移動を優先する。

## トップの設計ルール

- `NewTopContent` の冒頭で CMS 全件を `await` しない。Hero・固定リンクは同期的なシェル、新着・ガイド・レッスン・実績は独立した Server Component + Suspense とする。
- 会員 `/top` はページ冒頭で `getSubscriptionStatus()` をawaitしない。Heroの見出し・説明文をシェルに残し、会員で非表示になる入会CTAだけをasync Server Component + Suspenseにする。公開 `/` のゲストCTAは待たせない。
- 認証・契約判定は route/layout に維持する。個人データを `unstable_cache` やモジュール変数でユーザー間共有しない。
- LayoutのUserProviderとページ/サービスのgetCachedUserは、同じ `getCachedAuth`（React cache、RSCリクエスト内）を使う。400/401/403と一時障害の分類を保ち、getClaimsへの置換は混ぜない。
- トップ下部のLessonCardだけ `imageLoading="lazy"` を明示する。共有カードの既定値やLCP候補を一括lazy化しない。縦横比を保持し、スクロール前の未取得とスクロール後の表示を両方確認する。
- fallback と完了表示のセクション部品を共有する。カードの縦横比・列数・余白も合わせ、PC/スマホで CLS を確認する。文字量による高さの差は残るため、スケルトンがあるだけで CLS 合格とはしない。
- 完了後のコンテンツ、リンク、会員CTA、h1、metadata/JSON-LD を維持する。Layout の fallback に本文全体を複製しない。
- TTL延長、課金条件変更、画像の一括preload、全体のClient Component化は速度対策として一緒に混ぜない。
- その画面で使わないフォントを全ページpreloadしない。Geist Monoは必要時取得とし、CSS変数/書体自体を削除しない。日本語のunicode-range分割は件数だけで無駄と判断しない。

## 変更時のチェック

1. `npm run test:performance`：同期シェル、独立したデータ待ち、CTA、fallback、画像loading、認証共有・エラー分類を確認。
2. `npx tsc --noEmit` と変更ファイルの ESLint、`npm run test:run`、`npm run build`。
3. 環境変数を設定し `npm run start -- --hostname 127.0.0.1 --port 3217`。`npm run perf:top-response` で5回のHTML到着診断を保存。必要なら `/` も測る。
4. 本番用ビルドのブラウザでPC/スマホ、通常通信/低速通信、画面上部/下部を確認。全セクション、リンク、画像、スケルトン置換、console、表示ずれを確認。
5. 許可された学習会員で `/top` → レッスン → 記事 → 次記事 → 戻るを5回。画面条件、CPU/回線、キャッシュ、prefetch、デプロイcommitを同じにする。完了・ブックマーク・投稿は変更しない。閲覧履歴や視聴イベントは発生し得る。
6. 変更前後を同条件で比較してから本番反映を判断。実ユーザーのp75は別途収集する。
7. フォント変更時は `npm run perf:font-preloads`。本番用ローカルサーバーのHTML/HTTP Linkヘッダ双方を検査する。ブラウザで未使用fontが取得されないことと、必要時に取得できることも確認する。

## 記事ページの設計ルール

- `/contents/[slug]` のサイドバーは多数のdynamic routeを同時に表示する。記事リンクをviewportだけで全件prefetchしない。初期値は `prefetch={false}`、非activeリンクの `mouseenter` / `focus` 後だけNext.jsの通常prefetchを使う。
- 記事CMSと購読判定は同時に開始する。記事IDが分かったら、購読の完了を待たずブックマークと記事進捗を開始する。`article-page-data.test.ts` のdeferred Promiseでwaterfallを戻さない。
- 記事タイトル、概要、学習目標、前後関係はCMSシェルに残す。動画アクセス、個人操作、本文アクセスは会員状態が必要なので個別のSuspense境界に置く。ページ全体を購読・ブックマーク・進捗の完了まで止めない。
- fallbackは最終UIと同じ面積を予約する。動画は16:9、操作群はPCの1行／スマホの2段、本文後の前後ナビは本文と同じ境界に置き、遅い本文が既存ナビを押し下げないようにする。
- サイドバーのレッスン全体進捗は記事の初期表示を止めない。hydration後にServer Functionをtransition内で呼び、`null`の間は0%ではなく読み込み中として表示する。
- 進捗snapshotの取得中に完了操作があった場合は、client側overrideをserver snapshotへmergeする。遅い応答で楽観的更新を巻き戻さない。
- レッスンの手動完了statusは記事表示時に全件取得せず、完了済み記事を解除する操作時に最新値を読む。statusがcompletedなら確認ダイアログを維持する。
- 個人進捗を共有cacheへ入れない。公開CMSデータのcacheと会員データの待ちを同じものとして扱わない。
- LCPだけで採用しない。ストリーミング後にLive Metricsが収束してから読み、5回のLCP中央値と全回のCLSを保存する。途中値やトレース有効時の値を最終比較へ混ぜない。

## 通常レッスンページの設計ルール

- `/lessons/[slug]` はlesson CMSと購読を同時に開始し、lesson ID取得直後に進捗を開始する。購読完了後に進捗を始めるwaterfallへ戻さない。
- タイトル、説明、画像、開始導線、タブ枠はCMSシェル。進捗バー、記事ロック、記事完了状態、カリキュラムは会員データを待つSuspense境界とする。
- 進捗と購読から作る`presentationPromise`は進捗バーとカリキュラムで共有する。境界ごとに同じ個人DB読取を再実行しない。
- 進捗fallbackは最終バーと同じ64%幅を予約し、0%と誤表示しない。カリキュラムfallbackも上端と記事行高を予約する。
- 通常レッスンの記事リンクは初期 `prefetch={false}`、`mouseenter` / `focus` 後に通常prefetchを有効化する。表示だけで複数のarticle dynamic layoutを実行しない。
- 専用 `scenario-based-design` は別UI。通常レッスンの境界を無理に適用せず、変更時は専用テストと実画面を別に確認する。

初回の文書読込には `scripts/browser-top-load-probe.js` を使う。固定条件でフルナビゲーション後にConsoleで実行し、TTFB/FCP/LCP・font受信・サイズを記録する。ルーターcache再訪と混ぜず、サーバー/CDNの完全coldとは呼ばない。採用判断にはばらつきも含める。

Vitest は async RSC の実レンダリングを検証しない。追加テストは関数とツリー構造の回帰防止であり、Next.js のストリーミング・ブラウザ操作・CLSの代用ではない。

認証テストはAsyncLocalStorageによるリクエストcacheモデルを使う。実際のReact RSCでの呼出し回数・本番の短縮時間を証明するものではない。2026-09-18の全体検証は20ファイル・153テスト成功、型チェック・本番用ビルド成功。

2026-09-19の通常レッスンバッチ完了時点は27ファイル・172テスト成功、性能回帰セットは9ファイル・39テスト成功。型チェック、変更ファイルESLint、diff check、本番用ビルドも成功。記事・レッスンのローカル比較とサーバー内訳は外部プロジェクト記録 `measurements/2026-09-19/` を参照する。

HTTP診断も未ログインのHTML到着時刻であり、LCP・INP・会員遷移速度ではない。1回目と後続を分け、CMS/CDNキャッシュが制御されていない測定の改善率を断定しない。

## 会員ページ移動の補助診断

### ローカルの接続先を必ず確認する

2026-09-19、別worktreeの設定を流用した結果、認証先がローカルSupabaseのままなのに「本番会員でログイン可能」と誤案内した。URLの設定名やNODE_ENVだけで接続先を判断しない。過去のローカルゲスト計測は本番認証の待ち時間を再現していない。

本番接続の明示許可を得た今回の比較用に `scripts/perf-production-auth.mjs` を追加した。認証先は本番会員DBなので、独立したテスト環境ではない。閲覧履歴等の書き込みは発生し得る。決済・完了・投稿・ブックマーク操作はしない。

```sh
node scripts/perf-production-auth.mjs --allow-production-auth --dir=/absolute/path/to/checkout --port=3217
node scripts/perf-production-auth.mjs --allow-production-auth --no-trace --dir=/absolute/path/to/checkout --port=3217
node scripts/perf-production-auth.mjs --allow-production-auth --no-build --no-trace --dir=/absolute/path/to/checkout --port=3217
node scripts/perf-production-auth.mjs --allow-production-auth --dir=/absolute/path/to/checkout --port=3217 --verify
```

- 本番公開JSのURL・anonキーのproject ref/role/期限を照合し、読み取り専用 `/auth/v1/settings` のHTTP200を確認。キー自体は出力しない。公開形式が変わった場合は停止する。
- OSの最低限の変数と明示した公開設定だけでbuild/startする。暗黙の `.env` 読み込みを拒否。管理者キー、Stripe/通知秘密鍵、Cookie、会員パスワードはコピーしない。
- ビルド時と起動時に同じ値を使う。`--verify` は実際に配信されるブラウザJSも本番と照合する。URLだけ変えて古いビルドを使わない。3217/3218の127.0.0.1限定。
- 現在worktreeの3217だけ、起動スクリプトは既定で `PERF_TRACE_SERVER=1` を設定する。固定ラベル・整数ms・成否のみを出し、ユーザー/結果/エラー本文は出さない。最終ブラウザ比較は `--no-trace` を付ける。直前と同じbuild artifactを再起動する時だけ `--no-build` を使い、ソース変更後には使わない。通常起動と変更前3218では無効。
- 公開Sanityのproject/datasetは既存のcqszh4up/production。認証後の閲覧検証向けの最小構成であり、決済・管理者機能・メール通知等を含む本番環境全体の再現ではない。
- 最後にブラウザをハードリロードし、本人にログインしてもらって会員・学習権限を確認する。設定一致とログイン成功は別々に記録する。

許可済みテスト会員のDevTools Consoleに `scripts/browser-navigation-probe.js` を貼り付け、通常のリンク操作をする。`BONO_NAV` の記録を保存し、終了時は `window.bonoNavigationProbe.stop()` を実行する。アプリへの組み込みや常設分析ツールではない。

- 診断値はクリックから遷移先 `main h1` のDOM変更後2フレームまで。見出しの画面内表示、LCP、画像・動画の準備完了ではない。同じ見出しへの移動、戻る/進むは測れない。
- RSCのdurationはストリーム受信を含む通信全体で、サーバー処理時間ではない。`startedBeforeClick` で先読みとクリック後の通信を区別する。既存キャッシュ・prefetchは変更しない。
- Cookie・storage・レスポンス本文・会員ID・クエリ値は保存しない。記録するのは対象パスと時刻/サイズ。会員Cookieを別環境にコピーせず、ローカル比較はユーザー本人のログインを使う。
- 各経路1回の予備診断を正式な5回比較や実ユーザーp75として扱わない。
- `scripts/browser-navigation-repeat.js` は既存リンクのDOM clickで5巡を補助する。1秒の待機とルーターcacheを含む再訪診断であり、実入力/INPや初回のデータ取得時間ではない。会員の `/` は `/mypage` に戻るため、トップへはそこから移動する。タイムアウト・構文エラーがある巡回は採用しない。
- 無料記事が表示できたことだけで学習権限を確認済みにしない。isPremium=trueの代表記事でも本文を確認する。動画のローカル埋め込み制限は別に記録し、無断で解除しない。

参考: [Soft navigation](https://developer.chrome.com/docs/web-platform/soft-navigations?hl=ja)、[ResourceTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)、[img loading](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)。

## 記録先と根拠

計画・決定・本番計測は `rebono/02_Projects/14_読み込み速度改善/`。今回の改善はローカル実装段階で、デプロイ・本番実ユーザー測定は別工程。

このリポジトリの `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` と `01-app/02-guides/streaming.md` を基準にする。Web版: [データ取得](https://nextjs.org/docs/app/getting-started/fetching-data)、[ストリーミング](https://nextjs.org/docs/app/guides/streaming)。Next.js更新時は同梱ガイドを読み直す。
