# フォーム設計パターン台帳(Sign Up お題用)

- **取得日**: 2026-07-03
- **用途**: ステップ型DailyUIトレーニング お題01「Sign Up(登録フォーム)」のリファレンス
- **方針**: 全エントリは取得日に実ページをWebFetch/HTTP取得して確認した内容のみ。原文引用は取得ページからの逐語引用(改変なし)。

## 取得に失敗したソース一覧

| ソース | URL | 状態 | 備考 |
|---|---|---|---|
| Material Design 3 — Text fields guidelines | https://m3.material.io/components/text-fields/guidelines | **未取得** | ページがJavaScriptレンダリング(Angular SPA)で、HTTP取得では本文が得られなかった。ブラウザ拡張(Chrome)も未接続で代替取得不可。代わりに、Material Design公式の旧サイト material.io のText fieldsページ(Wayback Machineアーカイブ、2019年取得のMaterial Design 2版)を取得し、下記では「Material Design(M2・アーカイブ)」と明記して使用。M3での文言は未確認。 |
| Apple HIG — Text fields(HTMLページ) | https://developer.apple.com/design/human-interface-guidelines/text-fields | 取得成功(注記あり) | HTMLページ自体はJSレンダリングで本文が取れず、同ページの公式データエンドポイント(developer.apple.com/tutorials/data/design/human-interface-guidelines/text-fields.json)から同一コンテンツを取得。引用はこのデータに基づく。 |

上記以外(GOV.UK 8ページ、NN/g、Polaris)はすべて取得成功。

## 取得済みソース

- GOV.UK Design System: Question pages / Validation / Error message / Error summary / Text input / Password input / Button / Checkboxes(いずれも design-system.service.gov.uk)
- Nielsen Norman Group: Website Forms Usability: Top 10 Recommendations(nngroup.com/articles/web-form-design/)
- Apple Human Interface Guidelines: Text fields(公式データAPI経由)
- Material Design(M2・material.io 2019アーカイブ): Text fields
- Shopify Polaris: Text field(polaris-react.shopify.com へ301リダイレクト後に取得)

---

### P-01: 1画面1質問(Question pages)
- **要点**: 1ページにつき1つの質問だけを置くと、ユーザーは「何を求められているか」に集中できる。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/patterns/question-pages/
- **原文引用**: "Asking just one question per question page helps users understand what you're asking them to do, and focus on the specific question and its answer."
- **日本語での説明**: フォームを細かいステップに分け、1画面に1質問だけを表示する考え方です。認知負荷が下がり、エラーも減ります。ただし同ページには「関連する質問はユーザーリサーチに基づいてまとめてよい」("Sometimes it makes sense to group a number of related questions on the same page. User research will tell you when you can group pages together.")ともあります。
- **Sign Upお題での使いどころ**: STEP1(構造)。「メール→パスワード→確認」を1画面に詰めるか、ステップ分割するかの判断基準として提示。
- **ソース間の相違**: NN/gやHIGは明示的に1画面1質問を求めておらず、GOV.UK特有の強い推奨。教材では「公共サービス系の設計思想」と文脈を添える。

### P-02: ラベルは常に可視・簡潔に(入力欄の近くに)
- **要点**: すべての入力にラベルを付け、原則として常に見える状態にする。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/text-input/ / NN/g — https://www.nngroup.com/articles/web-form-design/
- **原文引用**: "All text inputs must have labels, and in most cases the label should be visible."(GOV.UK)/ "Labels should be close to the fields they describe (immediately above the field for mobile and shorter desktop forms, or next to the field for extremely long desktop forms)."(NN/g)/ "Label text is used to inform users as to what information is requested for a text field. Every text field should have a label."(Material Design〈M2・アーカイブ〉 https://web.archive.org/web/2019/https://material.io/design/components/text-fields.html)
- **日本語での説明**: ラベルは入力欄の目的を伝える最重要要素で、入力中も消えずに見えている必要があります。位置は「フィールドのすぐ上」が基本(NN/g)。GOV.UKはさらに「短く、直接的に、文末コロンなし」("They should be short, direct and written in sentence case. Do not use colons at the end of labels.")と書き方まで指定しています。
- **Sign Upお題での使いどころ**: STEP1(構造)。「Email」「Password」ラベルの配置を決める最初の判断として提示。
- **ソース間の相違**: MaterialのFloating Label(入力時にラベルが上に移動)は「常時可視」を満たすが、GOV.UK/NN/gは静的な上置きラベルを推奨。動くラベルの是非は教材で対比できる。

### P-03: プレースホルダーをラベルの代わりにしない
- **要点**: プレースホルダーは入力開始で消えるため、ラベルや必須情報の代替にしてはいけない。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/text-input/ / NN/g — https://www.nngroup.com/articles/web-form-design/ / Shopify Polaris — https://polaris.shopify.com/components/selection-and-input/text-field
- **原文引用**: "Placeholder text causes many usability problems, and is best avoided."(NN/g)/ "Don't use the placeholder to provide information that's required to use the text field."(Polaris)
- **日本語での説明**: プレースホルダーは入力を始めた瞬間に消えるので、記憶に頼らせることになり、見直し時にも困ります。GOV.UKも「入力開始で消えることが記憶障害のあるユーザーや回答の見直し時に問題になる」「すべてのスクリーンリーダーが読み上げるわけではない」ことを理由に非推奨としています。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。「ラベルなし・プレースホルダーだけの美しいフォーム」がなぜNGかを示す反例として提示。
- **ソース間の相違**: Apple HIGはプレースホルダーの利用を許容しつつ("A text field can contain placeholder text — such as 'Email' or 'Password' — when there's no other text in the field.")、「消えるので別途ラベルを付けるのも有用」と補足する中立寄り。GOV.UK/NN/gは明確に否定的。ここは教材で扱うべき最大の相違点のひとつ。

### P-04: 必須・任意の示し方
- **要点**: 任意項目は極力減らし、残す場合は「任意(optional)」と明示する。
- **出典**: NN/g — https://www.nngroup.com/articles/web-form-design/ / Shopify Polaris — https://polaris.shopify.com/components/selection-and-input/text-field / Material Design(M2・アーカイブ) — https://web.archive.org/web/2019/https://material.io/design/components/text-fields.html
- **原文引用**: "Limit the form to only 1 or 2 optional fields, and clearly label them as optional."(NN/g)/ "Be labeled as 'Optional' when you need to request input that's not required"(Polaris)/ "To indicate that a field is required, display an asterisk (*) next to the label text and mention near the form that asterisks indicate required fields."(Material〈M2〉)
- **日本語での説明**: 「必須に*を付ける」か「任意にoptionalと書く」かの2流派があります。NN/g・Polarisは後者(任意を明示)で、Materialは必須にアスタリスクを付ける方式を認めつつ「大半が必須なら任意側にoptionalと表示する」と条件分岐しています。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。Sign Upはほぼ全項目必須なので「任意項目だけをマークする(あるいはそもそも任意項目を持たない)」判断を体験させる。
- **ソース間の相違**: あり。Material(M2)はアスタリスク方式を明記、NN/g/Polarisは「optional明示」方式を推奨。「全項目必須ならマーク自体不要」に収束するのがSign Upでの実践解。

### P-05: フィールド数の最小化
- **要点**: 不要なフィールドを削ることが完了率を最も確実に上げる。
- **出典**: NN/g — https://www.nngroup.com/articles/web-form-design/ / Apple HIG — https://developer.apple.com/design/human-interface-guidelines/text-fields
- **原文引用**: "Eliminating unnecessary fields requires more time, but the reduced user effort and increased completion rates make it worthwhile."(NN/g)/ "Use a text field to request a small amount of information, such as a name or an email address."(Apple HIG)
- **日本語での説明**: フォームは「聞きたいこと」ではなく「今必要なこと」だけを聞くのが原則です。削るのは手間ですが、入力の手間と離脱を確実に減らせます。HIGもテキスト入力自体を最小限にする方向(特にtvOS/watchOSでは "Minimize text input")を示しています。
- **Sign Upお題での使いどころ**: STEP1(構造)。「名前・電話番号・生年月日は登録時に本当に必要か?」をまず問う導入として提示。
- **ソース間の相違**: なし(全ソースが同方向)。

### P-06: 1カラムレイアウト
- **要点**: フォームは縦1列に並べ、複数カラムにしない。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/web-form-design/
- **原文引用**: "Multiple columns interrupt the vertical momentum of moving down the form."
- **日本語での説明**: 横に2列並べると視線が蛇行し、見落としや入力順の混乱が起きます。上から下へ一直線に進める1カラムが基本です。Apple HIGも複数フィールドは「可能なら縦に積む」("Stack multiple text fields vertically when possible, and use consistent widths to create a more organized layout.")としています。
- **Sign Upお題での使いどころ**: STEP1(構造)。ワイヤーを引く前のレイアウト大原則として最初に提示。
- **ソース間の相違**: なし。

### P-07: バリデーションのタイミング
- **要点**: 入力中のリアルタイム検証は避け、区切りのタイミング(送信時またはフィールド離脱時)で検証する。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/patterns/validation/ / Shopify Polaris — https://polaris.shopify.com/components/selection-and-input/text-field / Apple HIG — https://developer.apple.com/design/human-interface-guidelines/text-fields
- **原文引用**: "Wait until they try to move to the next part of the service - usually by clicking the 'continue' or 'submit' button at the bottom of the page."(GOV.UK)/ "Validate input as soon as merchants have finished interacting with a field (but not before)."(Polaris)/ "when entering an email address, it's best to validate when people switch to another field; when creating a user name or password, validation needs to happen before people switch to another field."(Apple HIG)
- **日本語での説明**: 「打っている最中に赤くなる」のは避けるのが共通見解ですが、いつ検証するかは分かれます。GOV.UKは送信ボタン押下時、Polarisはフィールド離脱時(blur)、HIGは内容によって使い分け(メールは離脱時、パスワード作成は離脱前=入力中の要件フィードバック)です。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。「パスワード要件チェックをいつ出すか」の設計判断として3案を比較提示。
- **ソース間の相違**: あり(本台帳で最も明確な相違)。GOV.UK=送信時 / Polaris=blur時 / HIG=文脈依存(パスワード作成は入力中フィードバックを許容)。

### P-08: エラーメッセージの文言(具体的・非難しない・専門用語なし)
- **要点**: エラー文は「何が起きたか+どう直すか」を質問の言葉で具体的に書き、汎用文・専門用語・責める言葉を使わない。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/error-message/
- **原文引用**: "Avoid messages like: 'An error occurred', 'Answer the question', 'Select an option', 'Fill in the field', 'This field is required'." / "Do not use: technical jargon like 'form post error', 'unspecified error' and 'error 0x0000000643'" / 禁止語として "words like 'forbidden', 'illegal', 'you forgot' and 'prohibited'"
- **日本語での説明**: 「エラーが発生しました」「この項目は必須です」のような汎用文は禁止。「メールアドレスを入力してください」のように、その質問のラベルの言葉を使って直し方まで伝えます("Error messages should directly include language from the question or fieldset label.")。「forbidden」「you forgot」などユーザーを責める言葉も避けます。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。エラー文言のBefore/After添削課題として提示。
- **ソース間の相違**: NN/gは表示方法について「色だけに頼らない」("Errors should be signaled through a variety of cues, not solely through color: outline the field AND use red text AND use a heavier font.")と補完的。矛盾はなし。

### P-09: エラーの位置(フィールド直下+ページ上部のエラーサマリー)
- **要点**: エラーは該当フィールドのそば(質問文・ヒントの後)に赤で表示し、さらにページ上部にエラー一覧を置いてフォーカスを移す。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/error-summary/ / https://design-system.service.gov.uk/components/error-message/
- **原文引用**: "Always show an error summary when there is a validation error, even if there's only one."(Error summary)/ エラーメッセージは "put the message in red after the question text and hint text"、"use a red border to visually connect the message and the question it belongs to"(Error message)
- **日本語での説明**: エラーサマリーはページ上部(h1の上)に置き、見出しは「There is a problem」、各エラーは該当フィールドへのリンクにし、キーボードフォーカスをサマリーへ移します。フィールド側のエラー文とサマリーの文言は一致させます("make sure the error messages in the error summary are worded the same as those which appear next to the inputs with errors.")。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。送信失敗時の画面状態(エラーステート)をデザインする課題で提示。
- **ソース間の相違**: エラーサマリーはGOV.UK特有の強い規定。HIG/Material/Polarisはフィールド近接表示のみ言及。1画面のSign Upではフィールド直下表示が最小要件、サマリーはアクセシビリティ強化オプションと位置づける。

### P-10: エラー時にユーザー入力を消さない
- **要点**: バリデーション失敗時も、入力済みの値(合格分も不合格分も)をすべて残す。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/error-message/ / https://design-system.service.gov.uk/patterns/validation/
- **原文引用**: "Do not clear any form fields when showing the Error message component. Keep both passing and failing answers." / "Keeping information that failed validation helps users to see what went wrong, edit their previous answer, avoid re-entering information."
- **日本語での説明**: エラーでフォームが空に戻ると、ユーザーは何が悪かったのか確認できず、全部打ち直しになります。失敗した値もそのまま表示し、修正だけで済むようにします。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。エラーステートのモック作成時、「入力値が残った状態」を描くルールとして提示。
- **ソース間の相違**: なし。

### P-11: パスワード入力のUX(表示切替・ペースト許可)
- **要点**: パスワードはデフォルトで隠しつつ「表示」ボタンで確認可能にし、コピー&ペーストは必ず許可する。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/password-input/ / Apple HIG — https://developer.apple.com/design/human-interface-guidelines/text-fields
- **原文引用**: "This allows users to visually check their password before they submit it, which helps them reduce errors and choose passwords that are more unique and secure."(GOV.UK)/ "Always allow users to copy and paste in password fields. People may have very good reasons why they want to do this, for example if they're using a password manager."(GOV.UK)/ "Always use a secure text field when your app asks for sensitive data, such as a password."(Apple HIG)
- **日本語での説明**: 表示切替(show/hide)は入力ミスを減らし、より強いパスワード選択を促します。パスワードマネージャー利用者のためにペースト禁止は絶対にしないこと。ログイン失敗時は「メールとパスワードのどちらが間違いか明かさない」("If the user enters their account details incorrectly, do not reveal whether they got the username or password wrong.")というセキュリティ配慮もGOV.UKに明記されています。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。パスワードフィールドのコンポーネント設計(トグル・要件表示)の根拠として提示。
- **ソース間の相違**: なし(HIGは「隠す」原則、GOV.UKは「隠した上で表示切替を付ける」とより具体的)。

### P-12: ボタンは動作を表すラベルで、主要ボタンは1つ
- **要点**: ボタン文言は実行される動作をそのまま書き、主要CTA(デフォルトボタン)は1画面に1つに絞る。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/button/
- **原文引用**: "Write button text in sentence case, describing the action it performs." / "Avoid using multiple default buttons on a single page. Having more than one main call to action reduces their impact, and makes it harder for users to know what to do next."
- **日本語での説明**: 「OK」「送信」ではなく「Create account」「Sign up」のように、押した結果が分かる動詞で書きます。主要ボタンを複数置くと迷いが生まれるので1つに。無効化(disabled)ボタンも「コントラストが低く混乱を招くため可能なら避ける」("Disabled buttons have poor contrast and can confuse some users, so avoid them if possible.")とされています。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。CTAボタンの文言決めと、「入力完了までボタンをdisabledにする」案の是非を議論する材料として提示。
- **ソース間の相違**: なし(この論点の一次ソースはGOV.UKのみ取得)。

### P-13: 入力欄の幅は期待される入力量に合わせる
- **要点**: フィールドの幅そのものが「どれくらい入力すべきか」のヒントになる。
- **出典**: NN/g — https://www.nngroup.com/articles/web-form-design/ / Apple HIG — https://developer.apple.com/design/human-interface-guidelines/text-fields / GOV.UK Design System — https://design-system.service.gov.uk/components/text-input/
- **原文引用**: "Text fields should be about the same size as the expected input since it's extremely error prone when users can't see their full entry."(NN/g)/ "To the extent possible, match the size of a text field to the quantity of anticipated text. The size of a text field helps people visually gauge the amount of information to provide."(Apple HIG)
- **日本語での説明**: 郵便番号のような短い入力に横幅いっぱいの欄を使うと、ユーザーは「もっと書くべき?」と迷います。GOV.UKも既知の長さには固定幅、そうでなければ可変幅(デフォルトはコンテナ幅いっぱい)と使い分けています。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。メール/パスワード欄の幅をカードやモーダルの中でどう決めるかの根拠として提示。
- **ソース間の相違**: なし。

### P-14: ヒント/ヘルプテキストの使い方
- **要点**: 補足情報はラベルとは別の短いヒントテキストで示し、重要な指示はラベル側に置く。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/text-input/ / Shopify Polaris — https://polaris.shopify.com/components/selection-and-input/text-field / Material Design(M2・アーカイブ) — https://web.archive.org/web/2019/https://material.io/design/components/text-fields.html
- **原文引用**: "Keep hint text to a single short sentence, without any full stops."(GOV.UK)/ "Use the label to provide instructions critical to using the text field"(Polaris)/ "Helper text conveys additional guidance about the input field, such as how it will be used. It should only take up a single line, being persistently visible or visible only on focus."(Material〈M2〉)
- **日本語での説明**: パスワード要件(「8文字以上」など)のような補足は、消えるプレースホルダーではなくフィールド下(Material)または上(GOV.UKはラベル直下)の常設ヒントに書きます。1文・短くが共通ルール。Materialではエラー時にヘルパーテキストがエラーテキストに置き換わり、レイアウトのガタつきを防ぎます。
- **Sign Upお題での使いどころ**: STEP2(パターン選択)。パスワード要件の提示方法(ヒント常設 vs エラー時のみ)を選ぶ場面で提示。
- **ソース間の相違**: 位置が異なる。GOV.UKはラベルと入力欄の間、Material/Polarisは入力欄の下。どちらも「消えない・短い」は共通。

### P-15: チェックボックス(同意など)の設計
- **要点**: チェックボックスは複数選択(または単独の同意)に使い、ラベルの左に置き、事前チェックしない。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/components/checkboxes/
- **原文引用**: "Always position checkboxes to the left of their labels. This makes them easier to find, especially for users of screen magnifiers." / "Do not pre-select checkbox options as this makes it more likely that users will not realise they've missed a question"
- **日本語での説明**: Sign Upでは「利用規約に同意する」「ニュースレターを受け取る」のような形で登場します。デフォルトでチェックを入れておくのは、見落としを誘発するためNG(特にオプトインの同意)。択一の場合はチェックボックスではなくラジオボタンを使います("Do not use the checkboxes component if users can only choose one option from a selection.")。
- **Sign Upお題での使いどころ**: STEP1(構造)で規約同意を含めるかを判断し、STEP2(パターン選択)で事前チェックなし・左配置のルールを提示。
- **ソース間の相違**: なし(この論点の一次ソースはGOV.UKのみ取得)。

### P-16: パスワード式は現役の標準パターンである(反例の根拠)
- **要点**: 確認コード式が実測4サービスで観察された一方、GOV.UKは今も「パスワードの作成・入力」を標準パターンとして定義している。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/patterns/passwords/(2026-07-07取得)
- **原文引用**: "You should follow this pattern whenever you need users to create or enter a password." / "set a minimum length of at least 8 characters" / "do not set a maximum length"
- **日本語での説明**: 「登録=確認コード式」は普遍法則ではなく、コンシューマアプリで観察された一方針です。行政サービスや長期アカウント管理ではパスワード式が現役の標準として定義されています。教材では「サービスの性質によって方針が分かれる」事実として提示すること。
- **Sign Upお題での使いどころ**: インプットカード②(サービス別方針表)の反例。断定・ミスリード防止(2026-07-07 Takフィードバック F3 対応)。
- **ソース間の相違**: これ自体が「相違の存在証明」。Uber/Airbnb(コード式)vs GOV.UK(パスワード式)。

---

## 論点カバレッジ早見表

| 設計論点 | 該当パターン |
|---|---|
| ラベルの位置と書き方 | P-02 |
| 必須・任意の示し方 | P-04 |
| プレースホルダーの扱い | P-03 |
| フィールド数の最小化 | P-05 |
| エラー表示(タイミング) | P-07 |
| エラー表示(文言) | P-08 |
| エラー表示(位置)・入力保持 | P-09, P-10 |
| パスワード入力のUX | P-11 |
| ボタンのラベルと配置 | P-12 |
| 1カラムレイアウト | P-06 |
| (補助)入力幅・ヒント・チェックボックス・1画面1質問 | P-13, P-14, P-15, P-01 |
