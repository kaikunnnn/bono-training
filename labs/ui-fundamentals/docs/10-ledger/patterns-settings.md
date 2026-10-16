# 設定画面パターン台帳(お題02「モバイルアプリの設定画面」用)

- **取得日**: 2026-07-06
- **用途**: ステップ型DailyUIトレーニング お題02「モバイルアプリの設定画面」のリファレンス(設定画面・リスト・トグル・グルーピング)
- **方針**: 全エントリは取得日に実ページをWebFetch/HTTP取得して確認した内容のみ。原文引用は取得ページからの逐語引用(改変なし)。記憶からの記述は含まない。

## 取得に失敗した/迂回が必要だったソース一覧

| ソース | URL | 状態 | 備考 |
|---|---|---|---|
| Apple HIG(HTMLページ3件) | developer.apple.com/design/human-interface-guidelines/{settings, toggles, lists-and-tables} | HTMLは**本文取得不可**(JSレンダリング) | 公式JSONエンドポイント(developer.apple.com/tutorials/data/design/human-interface-guidelines/{page}.json)をcurlで取得し、全文抽出に**成功**。引用はこのデータに基づく |
| Material Design 3(直接取得) | https://m3.material.io/components/lists/guidelines 、https://m3.material.io/components/switch/guidelines | 直接のWebFetchは**本文取得不可**(JSレンダリング) | r.jina.aiプロキシ(r.jina.ai/https://m3.material.io/...)経由で本文取得に**成功**。下記では「M3(r.jina.ai経由)」と明記 |
| Shopify Polaris | https://polaris.shopify.com/patterns/app-settings-layout | 301リダイレクト | polaris-react.shopify.com/patterns/app-settings-layout へ追従して取得**成功** |
| 「設定画面に検索を付けるべき条件」の直接記述 | (該当ページを発見できず) | **未取得** | 今回取得したHIG/M3/Polaris/NN/gのいずれにも「設定内検索をいつ導入するか」の明文はなかった。近い記述はHIG watchOSの長リスト緩和策のみ(SET-13参照)。この論点は台帳では断定しない |

## 取得済みソース

- Apple HIG: Settings / Toggles / Lists and tables(公式JSONデータエンドポイント経由、curl取得)
- Material Design 3: Lists guidelines / Switch guidelines(r.jina.aiプロキシ経由、WebFetch)
- Shopify Polaris: App settings layout パターン(polaris-react.shopify.com、WebFetch)
- Nielsen Norman Group: Toggle-Switch Guidelines / Confirmation Dialogs Can Prevent User Errors(WebFetch)
- GitHub Primer: ActionList(primer.style/components/action-list、WebFetch)

---

### SET-01: 設定項目は最小限にする
- **要点**: 設定が多すぎると探しにくく、体験がとっつきにくくなるため、項目数そのものを絞る。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/settings(公式JSONエンドポイント経由)
- **原文引用**: "Minimize the number of settings you offer. Although people appreciate having control over an app or game, too many settings can make the experience feel less approachable, while also making it hard to find a particular setting."
- **日本語での説明**: 設定画面は「載せられるだけ載せる」場所ではありません。項目が増えるほど目的の設定が見つけにくくなります。まず項目を削れないか考えるのが設計の第一歩です。
- **お題02での使いどころ**: STEP0(ブリーフ理解)。要件の設定項目リストを「本当に全部必要か」と問い直す最初の観点。

### SET-02: 賢いデフォルトで「設定不要」にする
- **要点**: 大多数にとって最適なデフォルト値を提供すれば、ユーザーは設定を触らずに済む。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/settings(公式JSONエンドポイント経由)
- **原文引用**: "Aim to provide default settings that give the best experience to the largest number of people." / "Avoid using settings to ask for setup information you can get in other ways."
- **日本語での説明**: 最良の設定画面は「開かなくていい設定画面」です。自動検出できる情報(ダークモードの利用有無など)をユーザーに聞くのは設計の手抜きだとHIGは指摘しています。
- **お題02での使いどころ**: STEP1(構造)。各トグルの初期値(ON/OFF)を決める根拠として提示。

### SET-03: 「一般設定」と「タスク固有の設定」を置き場所で分ける
- **要点**: 低頻度の一般設定は設定エリアに、特定タスクに関わるオプションはそのタスクの画面内に置く。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/settings(公式JSONエンドポイント経由)
- **原文引用**: "Put general, infrequently changed settings in your custom settings area." / "When possible, prefer letting people modify task-specific options without going to your settings area." / "Putting this type of option in a separate settings area disconnects it from its context, requiring people to suspend their task to make adjustments, and often hiding the results until people resume the task."
- **日本語での説明**: 表示の並び替えやフィルタのような「作業中に変えたい設定」を設定画面に隠すと、ユーザーは作業を中断させられ、結果も見えません。設定画面に置くべきは「たまにしか変えない全般設定」だけです。
- **お題02での使いどころ**: STEP1(構造)。項目の仕分け基準(この設定は設定画面行きか、機能画面内か)として提示。

### SET-04: OSのシステム設定を重複させない
- **要点**: OS全体の設定(アクセシビリティ等)のコピーをアプリ内設定に置くと、適用範囲について混乱を招く。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/settings(公式JSONエンドポイント経由)
- **原文引用**: "Respect people's systemwide settings and avoid including redundant versions of them in your custom settings area." / "Including custom versions of global options in your settings area is likely to confuse people because it implies that systemwide settings may not apply to your app or game"
- **日本語での説明**: 通知やアクセシビリティなどOSが管理する設定をアプリ内に複製すると、「OS設定はこのアプリに効かないのか?」という誤解を生みます。OS設定への導線を貼るのが正解です。
- **お題02での使いどころ**: STEP2(パターン選択)。「通知設定」項目をアプリ内で完結させるかOS設定へ誘導するかの判断材料。

### SET-05: グルーピングはgroupedスタイル(ヘッダー・フッター・余白)で示す
- **要点**: iOSのgroupedスタイルは、ヘッダー・フッター・追加の余白でデータのグループを区切る。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/lists-and-tables(公式JSONエンドポイント経由)
- **原文引用**: "In iOS and iPadOS, for example, the grouped style uses headers, footers, and additional space to separate groups of data" / "Choose a table or list style that coordinates with your data and platform. Some styles use visual details to help communicate grouping and hierarchy"
- **日本語での説明**: iOSの設定画面でおなじみの「角丸カードのかたまり+セクション見出し+間の余白」がgroupedスタイルです。線を引かなくても、余白と見出しでグループの切れ目を伝えられます。
- **お題02での使いどころ**: STEP1(構造)。設定項目をセクションに分けるときの視覚表現の経典として提示。

### SET-06: リスト行の構造 — ラベル必須、先頭・末尾要素は任意
- **要点**: リスト項目はコンテナとラベルテキストが必須で、先頭のアイコンや末尾のメタ情報(値)は任意の追加要素。
- **出典**: Material Design 3 — https://m3.material.io/components/lists/guidelines(r.jina.aiプロキシ経由)
- **原文引用**: "Container and label text are required. All other elements are optional" / "Trailing text can provide additional meta-information about a list item, such as a price, count, or other details" / "Limit supporting text to one to three lines"
- **日本語での説明**: 設定行の基本形は「(先頭アイコン)+ラベル+(補足テキスト)+(末尾の現在値や操作)」。必須なのはラベルだけで、残りは情報量に応じて足します。補足テキストは1〜3行までが目安です。
- **お題02での使いどころ**: STEP2(パターン選択)。「言語 > 日本語」のような行の解剖図(ラベル・値・シェブロン)を描くときの根拠。

### SET-07: シェブロン(disclosure indicator)は「次の階層へ」、infoボタンは「詳細表示」
- **要点**: 行の末尾のシェブロンは階層を掘る合図であり、infoボタンをナビゲーションに使ってはいけない。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/lists-and-tables(公式JSONエンドポイント経由)
- **原文引用**: "If you need to let people drill into a list or table row's subviews, use a disclosure indicator accessory control." / "An info button shows details about a list item; it doesn't support navigation." / "A disclosure indicator reveals the next level in a hierarchy; it doesn't show details about the item."
- **日本語での説明**: 行末の「>」は「タップすると次の画面に進む」という約束のサインです。逆に、その場で完結する行(トグル行など)にシェブロンを付けてはいけません。記号ごとに意味が固定されています。
- **お題02での使いどころ**: STEP2〜3。トグル行とナビゲーション行の見分け方、およびチェックリスト「シェブロンとスイッチが同じ行に共存していないか」。

### SET-08: スイッチ(switchスタイル)はリスト行の中でだけ使う
- **要点**: iOSではswitchスタイルのトグルはリスト行内限定で、行の内容がラベルの役割を果たすため専用ラベルは不要。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/toggles(公式JSONエンドポイント経由)
- **原文引用**: "Use the switch toggle style only in a list row. You don't need to supply a label in this situation because the content in the row provides the context for the state the switch controls." / "Outside of a list, use a button that behaves like a toggle, not a switch."
- **日本語での説明**: iOSの緑のスイッチは「設定リストの行の右端」が定位置です。リストの外(ツールバーなど)でON/OFFを切り替えたいときは、スイッチではなく状態が変わるボタンを使います。
- **お題02での使いどころ**: STEP2(パターン選択)。トグルの配置ルールの経典。M3の "Switches are often arranged in stacked layouts"(SET-09参照)とも整合。

### SET-09: トグルは即時反映 — 保存ボタンを要求しない
- **要点**: トグルの効果は切り替えた瞬間に適用されるべきで、Save/Submitを要求してはいけない。
- **出典**: NN/g — https://www.nngroup.com/articles/toggle-switch-guidelines/ / Material Design 3 — https://m3.material.io/components/switch/guidelines(r.jina.aiプロキシ経由)
- **原文引用**: "Toggle switches should take immediate effect and should not require the user to click Save or Submit to apply the new state."(NN/g)/ "The effects of a switch should start immediately, without needing to save."(M3)/ "Settings screens are common places to use switches"(M3)
- **日本語での説明**: 物理的な電気のスイッチと同じで、倒した瞬間に点くのがトグルの約束です。NN/gとMaterialが完全に同じことを言っている、ソース間の一致度が最も高いルールのひとつです。
- **お題02での使いどころ**: STEP2(パターン選択)の中心論点「なぜ設定画面に保存ボタンがないのか」。STEP3のチェックリストにも入れる。

### SET-10: トグルを使ってはいけない場面 — 複数選択・保存型フォーム
- **要点**: 即時反映できない場面や複数項目の選択には、トグルではなくチェックボックス/ラジオボタンを使う。
- **出典**: NN/g — https://www.nngroup.com/articles/toggle-switch-guidelines/ / Material Design 3 — https://m3.material.io/components/switch/guidelines(r.jina.aiプロキシ経由)
- **原文引用**: "If immediate results are not achievable or seem ill-suited, an alternative (i.e. radio buttons or a single checkbox) should be used instead."(NN/g)/ "If you're considering including toggles in long forms where other types of form fields are present, and users will need to click a Submit button for other changes to take effect, don't."(NN/g)/ "Use checkboxes (not switches) to let people select one or more options from a list"(M3)
- **日本語での説明**: 「送信ボタンのあるフォームの中にトグルを混ぜる」のは典型的なアンチパターンです。即時反映されるのか送信後に反映されるのかユーザーが分からなくなります。複数選択はチェックボックスの仕事です。
- **お題02での使いどころ**: STEP4(批評)。学習者の作品で「保存ボタン+トグル」の混在が起きたときの指摘根拠。

### SET-11: トグルのラベルは「ONのとき何が起こるか」を短く書く
- **要点**: ラベルは短く直接的に、スイッチがONのときの動作を記述する(二値であって対立概念ではない)。
- **出典**: NN/g — https://www.nngroup.com/articles/toggle-switch-guidelines/ / Material Design 3 — https://m3.material.io/components/switch/guidelines(r.jina.aiプロキシ経由)
- **原文引用**: "Keep labels for toggle switches short and direct" / "The toggle labels should describe what the control will do when the switch is on."(NN/g)/ "Switches control binary options, not opposing ones."(M3)
- **日本語での説明**: 「通知」ではなく「プッシュ通知を受け取る」のように、ONの状態を説明するラベルにします。「ダーク/ライト」のような対立する2択はトグルの守備範囲外(その場合は選択コントロール)です。
- **お題02での使いどころ**: STEP3(ライティング)。各トグル行のラベル文言レビューの基準。

### SET-12: 破壊的操作は確認ダイアログ+動作を明示したボタンラベル
- **要点**: 取り消せない操作の前には確認を挟み、ボタンは Yes/No でなく「何が起こるか」を書く。破壊的項目は見た目でも区別する。
- **出典**: NN/g — https://www.nngroup.com/articles/confirmation-dialog/ / GitHub Primer — https://primer.style/components/action-list
- **原文引用**: "Use a confirmation dialog before committing to actions with serious consequences — such as destroying users' work or costing large amounts of money." / "In particular, consider a confirmation dialog before actions that cannot be undone." / "Instead of Yes/No answers, provide response options that summarize what will happen for each possible response. For example, in the case of file deletion, use buttons labeled Delete file and Keep file."(NN/g)/ "`danger` indicates that the item is destructive."(Primer ActionList)
- **日本語での説明**: ログアウトやアカウント削除は、①リスト内で通常項目と視覚的に区別し(Primerはdangerバリアントを定義)、②タップ後に確認を挟み、③確認ボタンには「削除する」など動作そのものを書きます。ただしNN/gは "Do not use confirmation dialogs for routine actions."(確認の乱用は無視を招く)とも警告しています。
- **お題02での使いどころ**: STEP2〜3。「ログアウト/アカウント削除をどこに置き、どう見せるか」の根拠。配置(最下部への隔離)自体の明文は今回のソースには無かったため、教材では「区別+確認」を根拠にし、配置は実物画面層(V層)の観察で補強する。

### SET-13: 階層化 — 設定はリストの階層で表現し、長いリストは絞る
- **要点**: iOSの設定はリストの階層構造でナビゲーションを表現する。行数はできるだけ絞り、長い場合は「もっと見る」等の緩和策を用意する。
- **出典**: Apple HIG — https://developer.apple.com/design/human-interface-guidelines/lists-and-tables(公式JSONエンドポイント経由)
- **原文引用**: "iOS Settings uses a hierarchy of lists to help people choose options" / "many apps use lists to express an overall information hierarchy and help people navigate it" / "When possible, limit the number of rows. Short lists are easier for people to scan" / "You can help make a long list more manageable by listing the most relevant items and providing a way for people to view more."(最後の2つはwatchOSの項)
- **日本語での説明**: 設定項目が増えたら、1画面に詰めるのではなく「アカウント >」のような中間ページに束ねて階層化します。ただし階層を深くしすぎると探せなくなるため、まず行数を絞るのが先です。なお「設定内に検索を付けるべき条件」の明文は今回のどのソースにもありませんでした(未取得)。
- **お題02での使いどころ**: STEP1(構造)。項目数が多いときに「フラットに並べる/セクションで区切る/階層に潜らせる」を選ぶ判断の根拠。

### SET-14: 設定ページのレイアウト — 左に見出し・説明、右にカードでグループ化(Polaris/Web)
- **要点**: Polarisの設定レイアウトは「走査用のラベル列」と「操作用のカード列」を分離し、設定グループを縦に積む。
- **出典**: Shopify Polaris — https://polaris-react.shopify.com/patterns/app-settings-layout(polaris.shopify.com/patterns/app-settings-layout から301リダイレクト後に取得)
- **原文引用**: "In the left column, glanceable labels and descriptions are listed to make it easier for merchants to scan the page and quickly find what they are looking for." / "In the right column, settings are grouped in cards to make it easier for merchants to configure a setting after it's been found." / "Stack all setting groups vertically on the page." / "Don't include a description unless it's helpful."
- **日本語での説明**: 設定画面のユーザー行動は「探す→変更する」の2段階です。Polarisは探す段階(見出し・説明)と変更する段階(カード内のコントロール)を列で分けています。モバイルでは1列に畳まれますが「グループ単位のカード+縦積み」という骨格は同じです。
- **お題02での使いどころ**: STEP4(比較)。モバイル(HIGのgroupedリスト)とWeb管理画面(Polarisのannotatedレイアウト)で同じ「グループ化」原則がどう形を変えるかの対比材料。

### SET-15: グループの区切り — 見出し・余白(gap)を優先し、区切り線は最終手段
- **要点**: グループ分けはまず見出しと余白で行い、区切り線(divider)は強い分離が必要なときに限定する。
- **出典**: Material Design 3 — https://m3.material.io/components/lists/guidelines(r.jina.aiプロキシ経由)/ GitHub Primer — https://primer.style/components/action-list
- **原文引用**: "Use gaps for contained lists. Gaps leverage expressive shape and containment tactics" / "Limit dividers to uncontained or complex lists, only when a stronger visual separation is necessary"(M3)/ "ActionList is a vertical list of interactive actions or options."(Primer。Primerはグループ化手段として "Grouping items with a heading" と "Grouping items with a divider" の両方を定義)
- **日本語での説明**: 「とりあえず全行に線を引く」のは冗長です。M3は角丸コンテナ間の余白(gap)での分離を第一に挙げ、線はより強い分離が必要な複雑なリストに限るとしています。見出し(セクションヘッダー)+余白が基本形です。
- **お題02での使いどころ**: STEP3(ビジュアル)。区切り線を引きすぎた学習者作品への指摘根拠。SET-05(HIGのgroupedスタイル)と同じ思想。

---

## ソース間の相違・注意点(教材設計メモ)

- **トグルの即時反映**は NN/g・M3・(HIGはリスト行限定の文脈で)3者が実質一致。教材の中心ルールに据えてよい。
- **スイッチ vs チェックボックス**: HIG(macOS)は「すでにチェックボックスならスイッチに置き換えるな」("In general, don't replace a checkbox with a switch.")と保守的。M3は「リスト内の複数選択はチェックボックス、単独設定はスイッチ」と用途で切る。プラットフォーム差として提示できる。
- **区切り線**: M3は明確に「余白優先・線は限定」。HIGはgroupedスタイル(余白+ヘッダー)で同思想だが、線について明文の禁止はない。
- **破壊的操作の「配置」**(リスト最下部に置く等)は、今回のどのソースにも明文が無い。「dangerスタイルで区別(Primer)+確認ダイアログ(NN/g)」までが引用で言える範囲。
- **設定内検索**の導入基準は未取得(上記の失敗一覧参照)。
