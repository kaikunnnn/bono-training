# 情報設計・視覚階層の原則 リファレンス台帳(STEP0/STEP1用)

- **取得日**: 2026-07-03
- **用途**: ステップ型DailyUIトレーニングの STEP0(お題を読む)/ STEP1(構造を決める:要素の洗い出しと情報の階層)で、AIがガイドする際の根拠台帳
- **方針**: 本台帳の「原文引用」はすべて、取得日当日に実際のWebページを取得して確認した英語原文をそのまま転記したもの(改変なし)。記憶からの記述は含まない。

## 取得に失敗したソース一覧

| ソース | URL | 状態 |
|---|---|---|
| Material Design 3 — Understanding layout | https://m3.material.io/foundations/layout/understanding-layout/ | 直接取得は失敗(JSレンダリングのためWebFetchでは本文が空)。レンダリングプロキシ(r.jina.ai)経由で同ページの本文を取得し、S-12に引用を掲載。引用元URLは実ページのもの |
| Material Design 3 — Accessibility designing / structure | https://m3.material.io/foundations/designing/structure | **未取得**(本文が空。台帳エントリなし) |
| Material Design 3 — layout overview(旧URL) | https://m3.material.io/foundations/layout/understanding-layout/overview | 直接取得は404。プロキシ経由では取得成功(S-12参照) |
| Material Design 3 — Color system overview | https://m3.material.io/styles/color/system/overview | 未取得(2026-08-31)。r.jina.ai プロキシ経由でもナビゲーションリンクのみで本文が得られず。**Color roles ページ(同 /styles/color/roles)はプロキシ経由で取得成功** → S-17に引用。ロール名・トーン刻みは material-web 公式トークン(GitHub raw)で担保(S-17/S-18) |

上記以外のNN/g、Laws of UX、GOV.UKの全ページは直接取得に成功。

---

## Nielsen Norman Group

### S-01: 視覚的階層(Visual Hierarchy)
- **要点**: 視覚的階層とは、意図した重要度の順に視線が誘導されるよう、ページ上のデザイン要素を組織化すること。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/visual-hierarchy-ux-definition/(記事名: "Visual Hierarchy in UX: Definition")
- **原文引用**: "Visual hierarchy (of a 2D display (webpage, graphic, print, etc.): Refers to the organization of the design elements on the page so that the eye is guided to consume each design element in the order of intended importance." / "Good visual design uses color or contrast (or both) to create visual hierarchy on the page."
- **日本語での説明**: 画面の要素には「見てほしい順番」があり、その順番どおりに目が動くように大きさ・色・コントラスト・余白で差をつけるのが視覚的階層です。全部を同じ強さで見せると、ユーザーは何が大事か分からなくなります。
- **STEP0/STEP1での使いどころ**: STEP1で「この画面で一番大事な情報/行動は何?2番目は?」と優先順位を言語化させる問いの根拠。要素リストに1位〜3位の順位をつけさせる。

### S-02: 近接の原則(Gestalt: Proximity)
- **要点**: 近くに置かれた要素同士は、同じグループ・関連する機能として知覚される。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/gestalt-proximity/(記事名: "Proximity Principle in Visual Design")
- **原文引用**: "Items close together are likely to be perceived as part of the same group — sharing similar functionality or traits."
- **日本語での説明**: 人は「距離が近いもの=仲間」と自動的に判断します。関連する要素は近づけ、関係ないものの間には余白を空けるだけで、線や枠を使わなくても情報のまとまりが伝わります。
- **STEP0/STEP1での使いどころ**: STEP1で要素を洗い出した後、「どれとどれが同じグループ?」とグルーピングさせる問いの根拠。「ラベルは対応する入力欄の近くにあるか」のチェックにも使う。

### S-03: 類同の原則(Gestalt: Similarity)
- **要点**: 色・形・サイズなど視覚的特徴を共有する要素は、互いに関連していると知覚される。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/gestalt-similarity/(記事名: "Similarity Principle in Visual Design")
- **原文引用**: "Items which share a visual characteristic are perceived as more related than items that are dissimilar."
- **日本語での説明**: 同じ見た目のものは「同じ役割」だと思われます。逆に、役割が違うのに見た目が同じだと混乱のもとになります。同じ種類の要素は同じスタイルに、違う種類は見た目を変えるのが基本です。
- **STEP0/STEP1での使いどころ**: STEP1で「同じ役割の要素は同じ見た目になっているか?主要ボタンと二次的ボタンは見分けがつくか?」という問いの根拠。

### S-04: 共通領域の原則(Gestalt: Common Region)
- **要点**: 境界(枠・背景)の中にある要素は1つのグループとして知覚され、共通の性質や機能を持つと想定される。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/common-region/(記事名: "The Principle of Common Region: Containers Create Groupings")
- **原文引用**: "The principle of common region says that items within a boundary are perceived as a group and assumed to share some common characteristic or functionality."
- **日本語での説明**: カードや枠、背景色で囲むと、その中身は「ひとまとまり」として認識されます。近接だけでは伝わりにくい複雑なグルーピングを、コンテナで明確にできます。
- **STEP0/STEP1での使いどころ**: STEP1で「このグループはカード/セクションとして囲むべきか、余白だけで分けるべきか?」を判断させる根拠。

### S-05: 一貫性と標準(Usability Heuristic #4)
- **要点**: ユーザーが言葉や操作の意味を推測しなくて済むよう、プラットフォームや業界の慣習に従う。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/ten-usability-heuristics/(記事名: "10 Usability Heuristics for User Interface Design")
- **原文引用**: "Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions."
- **日本語での説明**: 同じ意味のものには同じ言葉・同じ配置を使い、世の中の標準的なUIパターンから理由なく外れないこと。独自すぎるUIはユーザーに学習コストを強います。
- **STEP0/STEP1での使いどころ**: STEP0でお題を読んだ直後に「この種の画面(ログイン、設定など)の定番の構成は何か?」を先に確認させる根拠。奇抜な構造案へのフィードバックにも使う。

### S-06: 想起より再認(Usability Heuristic #6)
- **要点**: 要素・行動・選択肢を見えるようにして、ユーザーの記憶負荷を最小化する。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/ten-usability-heuristics/
- **原文引用**: "Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another. Information required to use the design (e.g. field labels or menu items) should be visible or easily retrievable when needed."
- **日本語での説明**: 「思い出させる」より「見れば分かる」ように作ります。操作に必要なラベルや選択肢は隠さず画面上に出しておき、前の画面の内容を覚えていないと進めない構造は避けます。
- **STEP0/STEP1での使いどころ**: STEP1の要素の洗い出しで「ユーザーがこの画面で判断するために必要な情報は全部画面上にあるか?」と漏れを確認させる根拠。

### S-07: 美的で最小限のデザイン(Usability Heuristic #8)
- **要点**: 無関係・稀にしか使わない情報は載せない。余計な情報は重要な情報の視認性を奪う。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/ten-usability-heuristics/
- **原文引用**: "Interfaces should not contain information that is irrelevant or rarely needed. Every extra unit of information in an interface competes with the relevant units of information and diminishes their relative visibility."
- **日本語での説明**: 情報を足すたびに、本当に大事な情報が目立たなくなります。「入れられるから入れる」ではなく、目的に効かない要素は削るのが原則です。
- **STEP0/STEP1での使いどころ**: STEP1で要素リストを作った後、「この要素を消したらユーザーは困るか?」と1つずつ問い、削る判断を促す根拠。

## Laws of UX

### S-08: ヒックの法則(Hick's Law)
- **要点**: 選択肢の数と複雑さが増えるほど、意思決定にかかる時間は長くなる。
- **出典**: Laws of UX — https://lawsofux.com/hicks-law/
- **原文引用**: "The time it takes to make a decision increases with the number and complexity of choices." / "Break complex tasks into smaller steps in order to decrease cognitive load."
- **日本語での説明**: 選択肢が多いほどユーザーは迷い、行動が遅くなります。1画面あたりの選択肢を絞り、複雑なタスクは小さなステップに分割するのが有効です。
- **STEP0/STEP1での使いどころ**: STEP1で「この画面でユーザーにさせたい選択はいくつある?減らせないか?ステップに分けられないか?」という問いの根拠。

### S-09: ミラーの法則(Miller's Law)
- **要点**: 平均的な人がワーキングメモリに保持できるのは7±2項目程度なので、コンテンツは小さなかたまり(チャンク)に整理する。
- **出典**: Laws of UX — https://lawsofux.com/millers-law/
- **原文引用**: "The average person can only keep 7 (plus or minus 2) items in their working memory." / "Organize content into smaller chunks to help users process, understand, and memorize easily."
- **日本語での説明**: 人が一度に把握できる情報量には限界があります。長いリストやフォームは意味のあるまとまりに分割(チャンキング)すると、理解も記憶も楽になります。なお「7」を機械的な上限として使うのは誤用とされています。
- **STEP0/STEP1での使いどころ**: STEP1で洗い出した要素が多いとき、「意味のあるまとまりに分けると何グループになる?」とチャンク化を促す根拠。

### S-10: 近接の法則(Law of Proximity)
- **要点**: 近くにある要素同士はグループとして知覚され、似た機能や性質を共有すると受け取られる。
- **出典**: Laws of UX — https://lawsofux.com/law-of-proximity/
- **原文引用**: "Objects that are near, or proximate to each other, tend to be grouped together." / "Elements in close proximity are perceived to share similar functionality or traits."
- **日本語での説明**: S-02(NN/g)と同じゲシュタルト原則のLaws of UX版。距離そのものが「関係の強さ」を伝える情報になる、と覚えると使いやすいです。
- **STEP0/STEP1での使いどころ**: S-02と併用。「グループ内の余白 < グループ間の余白」という具体ルールをAIが提示する際の根拠。

### S-11: ヤコブの法則(Jakob's Law)
- **要点**: ユーザーは他のサイトで大半の時間を過ごしているため、あなたのサイトも既知のサイトと同じように動くことを望む。
- **出典**: Laws of UX — https://lawsofux.com/jakobs-law/
- **原文引用**: "Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know." / "By leveraging existing mental models, we can create superior user experiences in which the users can focus on their tasks rather than on learning new models."
- **日本語での説明**: ユーザーはすでに持っている「こう動くはず」というメンタルモデルを新しい画面にも持ち込みます。定番のレイアウトや配置を踏襲すれば、ユーザーは学習ではなくタスクに集中できます。
- **STEP0/STEP1での使いどころ**: STEP0で「同種の有名サービスはこの画面をどう構成しているか?」と参照を促す根拠。S-05(一貫性と標準)とセットで使う。

## Material Design 3

### S-12: レイアウトの3つの役割(組織化・階層・注意の誘導)
- **要点**: レイアウトは、画面上の全要素を組織化し、階層を示し、主要なアクションに注意を引くために使う。
- **出典**: Material Design 3 — https://m3.material.io/foundations/layout/understanding-layout/(※本文はJSレンダリングのため、レンダリングプロキシ経由で同ページを取得して確認)
- **原文引用**: "Use layout to organize all elements in a screen, signal hierarchy, and draw attention to key actions"
- **日本語での説明**: レイアウトは飾りではなく、「何がどこにあるか(組織化)」「何が重要か(階層)」「次に何をすべきか(注意)」を伝える機能そのものです。この3つを満たしているかがレイアウトの評価軸になります。
- **STEP0/STEP1での使いどころ**: STEP1の構造レビューで「この配置は①要素を整理できているか ②重要度の差が見えるか ③キーアクションに目が行くか」の3点チェックの根拠。

### S-15: スペーシングシステム(パディング/ギャップ/マージンの使い分け)
- **要点**: M3のスペーシングは8dpスケール(space100 = 8dp)。要素内の余白はパディング、要素間はギャップで定義し、マージンは最後の手段。文脈(モバイル/デスクトップ、密度設定)に応じて値を変える。
- **出典**: Material Design 3 — Spacing system & tokens — https://m3.material.io/m3/pages/spacing/overview (※本文はJSレンダリングのため、レンダリングプロキシ(r.jina.ai)経由で取得して確認。取得日: 2026-08-30)
- **原文引用**: "space100 = 8dp" / "Spacing units follow an 8dp scale" / "Padding is the spacing inside an element. It adds a buffer from the container edge to the content" / "Gaps are the spaces between elements in a grid or container" / "Use padding & gaps before using margins: Material rarely uses margins in components" / "Adapt spacing to different values based on context, like mobile vs desktop, or density settings"
- **日本語での説明**: 余白には3種類の道具がある — パディング(要素の内側)、ギャップ(要素と要素の間)、マージン(親のパディングを超えてさらに空けるとき・レイアウト用)。M3は「まずパディングとギャップで組み、マージンはめったに使わない」と明言している。また余白量は固定ではなく、画面サイズや密度設定という文脈で変わる。
- **STEP0/STEP1での使いどころ**: STEP1で「この余白は要素の内側(パディング)か、要素間(ギャップ)か」を区別して言語化させる根拠。F-09(8dpグリッド)のm3側の一次確認としても機能する。

### S-16: ホワイトスペースによるフォーム要素のグルーピング
- **要点**: ラベルは対応する入力欄の近くに置き、関連するフィールドはホワイトスペースでグループ化する。近接の法則(ゲシュタルト心理学)が根拠。
- **出典**: Nielsen Norman Group — https://www.nngroup.com/articles/form-design-white-space/(記事名: "Group Form Elements Effectively Using White Space"、著者: Marieke McCloskey、2013-11-03。取得日: 2026-08-30)
- **原文引用**: "Improve the layout of your online forms by placing form labels near the associated text field and by grouping similar fields." / "Grouping related fields together helps users make sense of the information that they must fill in. For example, the name and the date of birth could be Personal Information, while the address and the phone number could form the group Contact Information." / "even the slightest moment of hesitation when completing a form can significantly hurt the form's response rate"
- **日本語での説明**: フォームでは余白そのものが「どのラベルがどの入力欄のものか」「どの項目同士が仲間か」を伝える。氏名+生年月日=個人情報、住所+電話=連絡先のように、意味のまとまりごとに余白で区切ると、ユーザーは記入すべき内容を把握しやすくなる。フォームでのわずかなためらいが完了率を大きく下げるという知見も引用されている。
- **STEP0/STEP1での使いどころ**: S-02/S-10(近接)のフォーム特化版。「ラベル〜入力欄の余白 < 項目間の余白 < グループ間の余白」という3段階の使い分けを指導する根拠。Q-07/Q-08(Baseの実測値)と組み合わせて実値まで下ろせる。

## GOV.UK Design System / Service Manual

### S-13: 見出しの階層(Headings)
- **要点**: 見出しレベルの通常の階層に従い、見出しのスタイルを一貫させることで、明確なコンテンツ構造を作る。
- **出典**: GOV.UK Design System — https://design-system.service.gov.uk/styles/headings/
- **原文引用**: "Style headings consistently to create a clear content structure throughout your service." / "Follow the usual hierarchy of heading levels and styles associated with them."
- **日本語での説明**: h1→h2→h3のような見出しレベルは「情報の親子関係」を表します。レベルを飛ばしたり、見た目の好みで階層を崩したりすると、構造が伝わらなくなります。
- **STEP0/STEP1での使いどころ**: STEP1で「この画面のタイトル(h1相当)は何?その下の中見出しは?」と、要素を階層ツリーとして書き出させる根拠。

### S-14: 1ページ1つのこと(One thing per page)
- **要点**: フォームは複数ページに分割し、各ページには1つのことだけを載せることで、ユーザーが求められていることを理解しやすくなる。
- **出典**: GOV.UK Service Manual — https://www.gov.uk/service-manual/design/form-structure(記事名: "Structuring forms")
- **原文引用**: "Start by splitting the form across multiple pages with each page containing just one thing" / "Starting with one thing on a page helps people to understand what you're asking them to do"
- **日本語での説明**: 1画面に多くの質問や判断を詰め込まず、「1画面=1つの用事」に分けると、ユーザーは今何をすべきかを迷いません。ヒックの法則(S-08)の実践形とも言えます。
- **STEP0/STEP1での使いどころ**: STEP0/STEP1で「このお題は本当に1画面に収めるべきか?複数ステップに分けるべきか?」という画面分割の判断を促す根拠。フォーム系お題(Sign Up等)で特に有効。

## Material Design 3(カラー)

以下の2件は 2026-08-31 に配色記事(`knowledge/color.html`)向けに追加取得したもの。既存ID体系の続番(S-17〜)。

### S-17: カラーロール(役割で色を割り当てる)
- **要点**: M3 は色を「ロール(役割)」として定義する。primary / secondary / tertiary(強調度の階層)、surface(背景)、そして "on-" 接頭辞の色(その親色の上に載る文字・アイコン用)。UI要素に「用途」で色を割り当て、トークンで実装する。
- **出典**: Material Design 3 — Color roles — https://m3.material.io/styles/color/roles (本文はJSレンダリングのため r.jina.ai プロキシ経由で取得。取得日: 2026-08-31)。ロール名の担保として material-components/material-web 公式トークン定義 — https://raw.githubusercontent.com/material-components/material-web/main/tokens/_md-sys-color.scss (GitHub raw、取得日: 2026-08-31)
- **原文引用**: "Color roles are like the 'numbers' in a paint-by-number canvas. They're the connective tissue between elements of the UI and what color goes where." / "Roles are implemented in design and code through tokens." / "Primary: High-emphasis fills, texts, and icons against surface" / "On primary: Text and icons against primary." / "Secondary: Less prominent fills, text, and icons against surface" / "Surface: Default color for backgrounds" / "On surface: Text and icons against any surface or surface container color." / "[On] Roles starting with this term indicate a color for text or icons on top of its paired parent color." / トークン名(_md-sys-color.scss): 'primary', 'on-primary', 'primary-container', 'on-primary-container', 'secondary', 'on-secondary', 'tertiary', 'on-tertiary', 'surface', 'on-surface', 'surface-variant', 'on-surface-variant', 'background', 'on-background', 'error', 'on-error', 'outline', 'outline-variant', 'inverse-surface', 'scrim' ほか
- **日本語での説明**: 色を「装飾」ではなく「役割(ロール)」として管理する、という考え方。「この色は何に使う色か(高強調のprimaryか、背景のsurfaceか、その上に載る文字のon-surfaceか)」を先に決め、トークンとして実装する。"on-色" は必ず対になる親色の上での可読性(コントラスト)を前提に組まれている。項目1(色は役割を運ぶ道具)・項目8(パレットの作り方)の一次根拠。
- **決定論判定**: 不可(役割設計は文脈依存。トークン名の実在は機械確認可能)
- **STEP0/STEP1での使いどころ**: STEP1の配色設計で「この色は何のロールか」を言語化させる根拠。Q-04/Q-05(Baseのセマンティック割当)と対にして、抽象(ロール)→具体(実hex)まで下ろせる。

### S-18: トーナルパレット(トーン0〜100から役割色を導く)
- **要点**: M3 は1つの色相について、明度(トーン)0〜100 の段階からなる「トーナルパレット」を持ち、そこから役割色(on-色・surface など)を体系的に取り出す。色を1つずつ選ぶのではなく、明度スケールを1本用意して役割ごとに抜き出す。
- **出典**: material-components/material-web 公式トークン定義 — https://raw.githubusercontent.com/material-components/material-web/main/tokens/_md-ref-palette.scss (GitHub raw、取得日: 2026-08-31)。m3.material.io の解説文本体(/styles/color/system/overview)は未取得(冒頭の失敗一覧参照)
- **原文引用**: トークン名(_md-ref-palette.scss): 'primary0', 'primary10', 'primary20', 'primary30', 'primary40', 'primary50', 'primary60', 'primary70', 'primary80', 'primary90', 'primary95', 'primary99', 'primary100'(トーン刻み 0/10/20/30/40/50/60/70/80/90/95/99/100)。同パターンで 'secondary0'〜'secondary100'、'tertiary0'〜'tertiary100'、'neutral0'〜'neutral100'、'neutral-variant0'〜'neutral-variant100'、'error0'〜'error100'
- **日本語での説明**: 「良い色を1つずつ当てる」のではなく「明度(トーン)のスケールを1本決めて、その中から役割ごとに取り出す」という配色の作り方。トーン100=最も明るい、0=最も暗い。余白の8pxグリッド(F-09)と同じ"スケール思考"が色にもある、という説明の一次根拠。※M3公式の解説文本体は未取得のため、根拠はトークン定義(トーン刻みの実在)に限る。
- **決定論判定**: 可(トークンがトーン刻みのスケール上にあるかは機械確認可能。役割への割当は文脈依存)
- **STEP0/STEP1での使いどころ**: STEP1で「配色を"スケール"として持てているか(恣意的に色を足していないか)」を問う根拠。項目8の図解の裏付け。
