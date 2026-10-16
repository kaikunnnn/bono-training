# Foundations 台帳 — 数値基準を持つUI基礎ルール

このファイルの全エントリは、2026-07-03 時点で実際に取得できた一次ソースの内容のみに基づく。
記憶からの記述は含まない。原文引用は取得ページからの英語原文をそのまま掲載している。

- **取得日**: 2026-07-03
- **取得方法**: WebFetch(静的HTML / AppleのJSONデータエンドポイント / GitHub rawファイル)

## 取得に失敗したソース一覧(未取得)

以下は取得を試みたが本文が得られなかったソース。これらのページ固有の記述は本台帳に載せていない。

| ソース | URL | 状態 |
|---|---|---|
| Material Design 3(m3.material.io 全ページ) | https://m3.material.io/foundations/layout/understanding-layout/spacing 、https://m3.material.io/styles/typography/type-scale-tokens 、https://m3.material.io/foundations/designing/structure | 未取得(JSクライアントレンダリングのためHTMLに本文なし。curlでも確認済み)。**追記(2026-08-30)**: Spacing system & tokens ページ(https://m3.material.io/m3/pages/spacing/overview)はレンダリングプロキシ(r.jina.ai)経由で取得成功 → principles-structure.md の S-15 に引用を掲載(space100 = 8dp / "Spacing units follow an 8dp scale")。F-09の8dpグリッドはm3原文でも確認できたことになる |
| Material Design 3 accessibility-basics | https://m3.material.io/foundations/accessible-design/accessibility-basics | 未取得(HTTP 404) |
| Material Design 2(m2.material.io) | https://m2.material.io/design/usability/accessibility.html 、https://m2.material.io/design/layout/spacing-methods.html | 未取得(JSレンダリングのため本文なし) |
| Wayback Machine 経由の取得 | https://web.archive.org/... | 未取得(WebFetchがweb.archive.orgへのアクセス不可) |
| Apple HIG(HTMLページ直接) | https://developer.apple.com/design/human-interface-guidelines/accessibility 等 | HTML直接ではタイトルのみ。ただしApple公式のJSONデータエンドポイント(developer.apple.com/tutorials/data/design/human-interface-guidelines/*.json)から同一コンテンツの取得に**成功**。台帳では出典URLとして正規のHIGページURLを併記 |

**Material Design の数値については代替の公式ソース(developer.android.com、support.google.com、m1.material.io、material-components GitHub の公式トークン定義)から取得した。** m3.material.io の文言そのものは未確認である点に注意。

---

## コントラスト

### F-01: テキストのコントラスト比(最小・AA)
- **数値基準**: 通常テキスト 4.5:1 以上 / 大きなテキスト(18pt以上、または14pt太字以上)3:1 以上
- **出典**: W3C — Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- **原文引用**: "contrast ratio of at least 4.5:1" / "Large-scale text and images of large-scale text have a contrast ratio of at least 3:1" / 大きなテキストの定義: "with at least 18 point or 14 point bold or font size that would yield equivalent size for Chinese, Japanese and Korean (CJK) fonts"
- **日本語での説明**: 文字色と背景色の明るさの差(コントラスト比)が小さいと、多くの人にとって文字が読めなくなる。通常サイズの文字は4.5:1以上、大きな文字(18pt以上、または太字14pt以上)は3:1以上が最低ライン。ロゴや装飾・非アクティブなUI部品の文字は対象外。
- **決定論判定**: 可 — 前景色・背景色の2色からコントラスト比を計算して閾値と比較できる。注意: 計算値は丸めない(Understandingページ原文: "the computed values should not be rounded (e.g., 4.499:1 would not meet the 4.5:1 threshold)")
- **適用ステップ**: STEP2(配色決定時)+ STEP3(制作時チェック)

### F-02: テキストのコントラスト比(強化・AAA)
- **数値基準**: 通常テキスト 7:1 以上 / 大きなテキスト 4.5:1 以上
- **出典**: W3C — Understanding SC 1.4.6: Contrast (Enhanced) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html
- **原文引用**: "contrast ratio of at least 7:1" / "Large-scale text and images of large-scale text have a contrast ratio of at least 4.5:1"
- **日本語での説明**: F-01の上位基準(AAAレベル)。より広い範囲のロービジョンの人が読めるようにするための強化値。教材では「必須は4.5:1、余裕があれば7:1を狙う」という2段構えで使う。例外(非アクティブ部品・装飾・ロゴ等)はF-01と同じ。
- **決定論判定**: 可 — F-01と同じ計算で閾値だけが異なる
- **適用ステップ**: STEP3(制作時チェック・任意の上級基準)

### F-03: 非テキスト要素のコントラスト比
- **数値基準**: UIコンポーネントの識別に必要な視覚情報・グラフィックの理解に必要な部分は、隣接色に対して 3:1 以上
- **出典**: W3C — Understanding SC 1.4.11: Non-text Contrast (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- **原文引用**: "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components: Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author; Graphical Objects: Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed."
- **日本語での説明**: 文字だけでなく、ボタンの枠線・入力欄の境界・アイコン・チェックボックスの状態表示など「それがUI部品だと分かるために必要な見た目」も、隣の色と3:1以上の差が必要。薄いグレーの枠線の入力欄が典型的な違反例。非アクティブな部品は対象外。
- **決定論判定**: 可(条件付き)— コントラスト比の計算自体は機械判定できるが、「識別に必要な視覚情報はどの部分か」の特定には文脈判断が入る
- **適用ステップ**: STEP3(制作時チェック)

---

## タップ/クリック領域

### F-04: ターゲットサイズの最小値(WCAG)
- **数値基準**: ポインタ入力のターゲットは 24×24 CSSピクセル 以上(5つの例外あり)
- **出典**: W3C — Understanding SC 2.5.8: Target Size (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- **原文引用**: "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:" — Spacing例外: "Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target" — 他の例外: Equivalent("The function can be achieved through a different control on the same page that meets this criterion")、Inline("The target is in a sentence or its size is otherwise constrained by the line-height of non-target text")、User Agent Control、Essential
- **日本語での説明**: ボタンやリンクなど押せる領域は最低24×24CSSピクセル必要、というWebの法的・規格的な最低ライン。小さくても、周囲に十分な間隔があれば(24px円が他のターゲットと重ならなければ)例外として許される。文中リンクも例外。ただしこれは「最低限」であり、快適さの基準はF-05/F-06のOS基準の方が大きい。
- **決定論判定**: 可 — ターゲットの外接矩形サイズと、Spacing例外の24px円交差判定はいずれも座標計算で機械判定できる(Inline/Essential例外の該当判断のみ文脈が必要)
- **適用ステップ**: STEP3(制作時チェック)

### F-05: ヒット領域(Apple HIG)
- **数値基準**: iOS/iPadOS のコントロールサイズ: デフォルト 44×44pt、最小 28×28pt。要素間パディングの目安: ベゼルあり要素の周囲 約12pt、ベゼルなし要素の可視端の周囲 約24pt
- **出典**: Apple Human Interface Guidelines — Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility (取得はApple公式JSONデータ https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json 経由)
- **原文引用**: "Offer sufficiently sized controls. Controls that are too small are hard for many people to interact with and select. Strive to meet the recommended minimum control size for each platform to ensure controls and menus are comfortable for all when tapping and clicking." / 表: iOS, iPadOS — Default control size: 44x44 pt / Minimum control size: 28x28 pt / "Consider spacing between controls as important as size. Include enough padding between elements to reduce the chance that someone taps the wrong control. In general, it works well to add about 12 points of padding around elements that include a bezel. For elements without a bezel, about 24 points of padding works well around the element's visible edges."
- **日本語での説明**: Appleのガイドラインでは、指で押す部品はデフォルトで44×44ポイント、どうしても小さくする場合でも28×28ポイントを下回らないこと。さらに「サイズと同じくらい間隔が重要」で、隣の部品との押し間違いを防ぐパディング(12pt/24pt目安)も求めている。見た目のアイコンが小さくても、タップ可能領域を広げれば満たせる。
- **決定論判定**: 可 — ヒット領域の幅・高さ(pt)と要素間距離をピクセル/ポイント計算で判定できる
- **適用ステップ**: STEP3(制作時チェック・iOS/モバイルデザイン時)

### F-06: タッチターゲット(Material Design / Android)
- **数値基準**: 48×48dp 以上(約9mm)、ターゲット間の間隔 8dp 以上
- **出典**: Google アクセシビリティ ヘルプ(Accessibility Scanner: Touch target size)— https://support.google.com/accessibility/android/answer/7101858 / Material Design(m1)Metrics & keylines — https://m1.material.io/layout/metrics-keylines.html ※ m3.material.io 本体は未取得(冒頭の失敗一覧参照)
- **原文引用**: "Consider making touch targets at least 48x48dp, separated by 8dp of space or more, to ensure balanced information density and usability." / "Ensure that each of those elements is 48x48dp in size, or approximately 9mm in each dimension." (support.google.com) / "Touch targets should be at least 48 x 48 dp. In most cases, there should be 8dp or more space between them." (m1.material.io)
- **日本語での説明**: Google/Material Design系では、タップできる要素は48×48dp(実寸約9mm)以上を推奨。指の腹のサイズに基づく値で、要素同士は8dp以上離す。アイコン自体は24dpでも、周囲に透明な余白を含めてタップ領域を48dpにすればよい。
- **決定論判定**: 可 — タップ領域のdpサイズと要素間距離を計算で判定できる
- **適用ステップ**: STEP3(制作時チェック・Android/モバイルデザイン時)

---

## タイポグラフィ

### F-07: 最小フォントサイズ(Apple HIG)
- **数値基準**: iOS/iPadOS: デフォルト17pt・最小11pt / macOS: デフォルト13pt・最小10pt / tvOS: デフォルト29pt・最小23pt / visionOS: デフォルト17pt・最小12pt / watchOS: デフォルト16pt・最小12pt
- **出典**: Apple Human Interface Guidelines — Typography — https://developer.apple.com/design/human-interface-guidelines/typography (取得はApple公式JSONデータ https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json 経由)
- **原文引用**: "Follow the recommended default and minimum text sizes for each platform — for both custom and system fonts — to ensure your text is legible on all devices." / ウェイトについて: "In general, avoid light font weights. For example, if you're using system-provided fonts, prefer Regular, Medium, Semibold, or Bold font weights, and avoid Ultralight, Thin, and Light font weights, which can be difficult to see, especially when text is small."
- **日本語での説明**: Appleはプラットフォームごとに「これ以下にしてはいけない」文字サイズを定めている。iOSなら本文の標準は17pt、キャプション等でも11ptが下限。また小さい文字ほど細いウェイト(Thin/Light等)は避け、Regular以上を使う。教材の実践では「iOSデザインで11pt未満の文字が1つでもあれば違反」と判定できる。
- **決定論判定**: 可 — フォントサイズ(pt)を下限値と比較するだけで機械判定できる(ウェイトの推奨は準決定的: ウェイト名の列挙で判定可能)
- **適用ステップ**: STEP2(タイポグラフィ設計時)+ STEP3(制作時チェック)

### F-08: Material 3 タイプスケール(body / label)
- **数値基準**: body-large: 1rem(16sp相当)・行送り1.5rem / body-medium: 0.875rem(14sp)・1.25rem / body-small: 0.75rem(12sp)・1rem / label-large: 0.875rem(14sp)・1.25rem / label-medium: 0.75rem(12sp)・1rem / label-small: 0.6875rem(11sp)・1rem
- **出典**: material-components/material-web(Google公式リポジトリ)デザイントークン定義 md-sys-typescale v0.192 — https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-typescale.scss ※ m3.material.io の type scale ページ本体は未取得(冒頭の失敗一覧参照)
- **原文引用**: "'body-large-size': if($exclude-hardcoded-values, null, 1rem)," / "'body-medium-size': if($exclude-hardcoded-values, null, 0.875rem)," / "'body-small-size': if($exclude-hardcoded-values, null, 0.75rem)," / "'label-large-size': if($exclude-hardcoded-values, null, 0.875rem)," / "'label-medium-size': if($exclude-hardcoded-values, null, 0.75rem)," / "'label-small-size': if($exclude-hardcoded-values, null, 0.6875rem),"
- **日本語での説明**: Material 3 の公式トークンでは、本文(body)は16/14/12、ラベル(ボタン文字など)は14/12/11という段階が定義されている(1rem=16px換算)。本文の標準は body-large の16。UI内で恣意的なサイズを増やさず、このスケール上の値だけを使うのが基本。
- **決定論判定**: 可 — 使用フォントサイズがスケール上の値(16/14/12/11)に一致するかを機械判定できる
- **適用ステップ**: STEP2(タイポグラフィ設計時)+ STEP3(制作時チェック)

---

## 余白・レイアウト

### F-09: 8dp / 4dp グリッド
- **数値基準**: レイアウト・コンポーネント・スペーシングは 8dp の倍数。アイコン・文字・コンポーネント内部の小要素は 4dp の倍数
- **出典**: Android Developers(公式デザインガイド)Grids and units — https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units / Material Design(m1)Metrics & keylines — https://m1.material.io/layout/metrics-keylines.html ※ m3.material.io の spacing ページ本体は未取得
- **原文引用**: "Building with an underlying grid helps create consistent spacing and alignment across your UI. Android UI utilizes an 8 dp grid for layout, components, and spacing." / "Smaller elements such as icons, type, and some elements within components are best aligned to a 4 dp grid." / "If using a baseline grid, stick to measurements of 4 and 8." (developer.android.com) / "All components align to an 8dp square baseline grid for mobile, tablet, and desktop." (m1.material.io)
- **日本語での説明**: 余白やサイズを「なんとなく」で決めず、8の倍数(8, 16, 24, 32…)に揃えるのが基本ルール。アイコンなど小さな要素だけは4の倍数まで許容。これによりデザイン全体のリズムが揃い、実装時の指定も単純になる。
- **決定論判定**: 可 — マージン・パディング・サイズの値が4または8の倍数かを剰余計算で機械判定できる
- **適用ステップ**: STEP1(レイアウト設計時)+ STEP3(制作時チェック)

### F-10: 画面マージンとコントロール周りの余白
- **数値基準**: Material: 画面左右マージン モバイル/タブレット 16dp、タブレット/デスクトップ 24dp。Apple: 数値の全画面共通マージンは規定なし(コントロール周囲の空間確保を要求。例: visionOS はボタン中心間 60pt 以上、tvOS は上下 60pt・左右 80pt インセット)
- **出典**: Material Design(m1)Metrics & keylines — https://m1.material.io/layout/metrics-keylines.html / Apple Human Interface Guidelines — Layout — https://developer.apple.com/design/human-interface-guidelines/layout (取得はApple公式JSONデータ https://developer.apple.com/tutorials/data/design/human-interface-guidelines/layout.json 経由)
- **原文引用**: "Screen edge left and right margins: 16dp"(mobile/tablet)、"Screen edge left and right margins: 24dp"(tablet/desktop)(m1.material.io) / "Make controls easier to use by providing enough space around them and grouping them in logical sections." / visionOS: "For example, place buttons so their centers are at least 60 points apart." / tvOS: "Inset primary content 60 points from the top and bottom of the screen, and 80 points from the sides." (Apple HIG Layout)
- **日本語での説明**: 画面の端にコンテンツを貼り付けず、Material系ならモバイルで左右16dp、大画面で24dpのマージンを取るのが標準。AppleのLayoutガイドは全画面共通の数値マージンを固定せず「コントロールの周囲に十分な空間を確保する」ことを原則とし、tvOS/visionOSなど一部プラットフォームにのみ具体値を示している。
- **決定論判定**: 一部可 — Materialの16dp/24dpマージン、visionOSの60pt、tvOSのインセットは座標計算で機械判定できる。Appleの「十分な空間」という一般原則は不可(F-05のパディング数値で代替判定する)
- **適用ステップ**: STEP1(レイアウト設計時)+ STEP3(制作時チェック)

### F-11: テキストスペーシング(WCAG 1.4.12)
- **数値基準**: 行の高さ フォントサイズの1.5倍 / 段落後スペース 2倍 / 文字間隔 0.12倍 / 単語間隔 0.16倍 — ユーザーがこれらの値に変更しても内容・機能が失われないこと(Level AA)
- **出典**: W3C — Understanding SC 1.4.12: Text Spacing (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html (取得日: 2026-08-30)
- **原文引用**: "Line height (line spacing) to at least 1.5 times the font size; Spacing following paragraphs to at least 2 times the font size; Letter spacing (tracking) to at least 0.12 times the font size; Word spacing to at least 0.16 times the font size."
- **日本語での説明**: 【事実】この達成基準が直接要求するのは「ユーザーが行間等を上記の値まで広げたときにコンテンツや機能が失われないこと」であり、著者に最初から1.5倍を設定させるルールではない。【解釈】ただし「本文の行間はフォントサイズの1.5倍」は、この基準値を根拠とする実務上の安全な初期値として広く参照されている。教材では事実と解釈を分けて提示すること。
- **決定論判定**: 可 — line-height / margin / letter-spacing / word-spacing の計算値をフォントサイズ比で機械判定できる(「壊れないこと」の検証はスタイル上書きテストで機械化可能)
- **適用ステップ**: STEP2(タイポグラフィ設計時)+ STEP3(制作時チェック)

### F-12: レスポンシブ・スペーシングスケール(GOV.UK)
- **数値基準**: スタティックスケール: 0, 5, 10, 15, 20, 25, 30, 40, 50, 60px(Unit 0〜9)。レスポンシブスケール: Unit 0〜3(0/5/10/15px)は全画面共通、Unit 4〜9は小画面/大画面で異なる(例: Unit 4 = 15px/20px、Unit 9 = 40px/60px)。境界はタブレットブレークポイント 640px
- **出典**: GOV.UK Design System — Spacing — https://design-system.service.gov.uk/styles/spacing/ (取得日: 2026-08-30)
- **原文引用**: "The spacing for 'large screens' is used when the screen is wider than the tablet breakpoint (640px)." / "To use the responsive spacing scale, include either: the govuk-responsive-margin mixin [or] the govuk-responsive-padding mixin" / "For the static spacing scale, use the govuk-spacing function"
- **日本語での説明**: 【事実】GOV.UKのスペーシングは5px刻みのスケールで、画面幅640pxを境に同じ「単位」でも実際の余白量が変わるレスポンシブ設計になっている。【解釈】(1) 8の倍数(F-09)が唯一の正解ではないことを示す実在の反例(Base の2px刻み Q-06 に続く2例目)。重要なのは「恣意的な値を使わず、宣言されたスケール上の値だけを使う」というスケール思考そのもの。(2) 「余白は固定値ではなく画面幅に応じて段階的に変える」というレスポンシブ余白の一次根拠。
- **決定論判定**: 可 — 余白値がスケール集合{0,5,10,15,20,25,30,40,50,60}に含まれるか、ブレークポイント前後で対応表どおりに変化するかを機械判定できる
- **適用ステップ**: STEP1(レイアウト設計時)+ STEP3(制作時チェック・レスポンシブ検証)

---

## 色(色だけに頼らない・カラーシステム)

以下の3件は 2026-08-31 に配色記事(`knowledge/color.html`)向けに追加取得したもの。取得日・原文引用付き。既存ID体系の続番(F-13〜)。

### F-13: 色を情報伝達の唯一の手段にしない(Use of Color)
- **数値基準**: なし(閾値を持たない禁止形の要求 — 色を、情報・操作・状態・要素の区別を伝える"唯一の視覚手段"にしてはならない。WCAG 2.2 Level A)
- **出典**: W3C — Understanding SC 1.4.1: Use of Color (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html (取得日: 2026-08-31)
- **原文引用**: "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." / 意図: "providing the information conveyed with color through another visual means ensures users who cannot see color can still perceive the information." / 適用範囲の限定: 本基準は色の使用一般を禁じるものではなく、"situations where color has not been used to convey information, indicate an action, prompt a response or distinguish a visual element" には適用されない。
- **日本語での説明**: エラーを「赤」だけ、リンクを「色」だけで示すと、色覚特性のある人や白黒表示では情報が伝わらない。色に加えて、テキスト・アイコン・下線・形状など"色以外の手がかり"を必ず併用する、というのが本基準。閾値(コントラスト比)を持つ F-01/F-03 とは別の、独立した達成基準である。
- **決定論判定**: 不可 — 「色以外の手がかりが併用されているか」の特定には文脈判断が入る(色の使用箇所の列挙までは機械化可能)
- **適用ステップ**: STEP2(配色決定時)+ STEP3(制作時チェック)

### F-14: 色だけに頼らない/セマンティックカラー/複数環境での検証(Apple HIG — Color)
- **数値基準**: なし(推奨事項 — ①色だけに頼らない ②動的システムカラー/セマンティックカラーを意図どおり使う・ハードコードしない ③ライト/ダーク/ハイコントラストの各コンテキストで検証)
- **出典**: Apple Human Interface Guidelines — Color — https://developer.apple.com/design/human-interface-guidelines/color (取得はApple公式JSONデータ https://developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json 経由。取得日: 2026-08-31、肯定形の引用を追加取得: 2026-09-01)
- **原文引用**: "Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information. When you use color to convey information, be sure to provide the same information in alternative ways so people with color blindness or other visual disabilities can understand it. For example, you can use text labels or glyph shapes to identify objects or states." / セマンティックカラー: "Avoid redefining the semantic meanings of dynamic system colors. ... use dynamic system colors as intended." / "Avoid hard-coding system color values in your app. ... The actual color values may fluctuate from release to release" / 検証: "Make sure all your app's colors work well in light, dark, and increased contrast contexts."
- **原文引用(肯定形・色は強調とアクションに使う / 取得日 2026-09-01)**: "If you apply color, reserve it for elements that truly benefit from emphasis, such as status indicators or primary actions." / "To emphasize primary actions, apply color to the background rather than to symbols or text." / ブランドカラーでインタラクティブ性を示す: "For example, if you use your brand color to indicate that a borderless button is interactive, using the same or similar color to stylize noninteractive text is confusing."
- **日本語での説明**: F-13(WCAG)と同趣旨の「色だけに頼らない」を、Apple がプラットフォームガイドとして明文化している。加えて、色は個別に決め打ちせず"意味(セマンティック)"を持ったシステムカラーとして扱い、ライト/ダーク/ハイコントラストで見え方を検証せよ、とする。**さらに HIG は肯定形として、色は「ステータス表示やプライマリアクションの強調」のために使うこと、ブランドカラーで「ボーダーレスボタンがインタラクティブであること」を示す用法を明文化している(＝有彩色の第一の仕事はアクション・強調の目印)。プライマリアクションを強調する際は、記号や文字ではなく背景に色を適用せよ、とする。** 項目4(色だけに頼らない)・項目1(色は役割)・**項目6(アクションに色を置く)**の一次根拠。
- **決定論判定**: 不可(推奨の性質。ハードコード検出などは部分的に機械化可能)
- **適用ステップ**: STEP2(配色設計時)+ STEP3(制作時チェック)

### F-15: カラーパレットと本文色(GOV.UK — Colour)【反例素材】
- **数値基準**: 本文/テキスト色 = #0b0c0c(純黒 #000000 ではない、わずかに濃い灰) / リンク色 = #1a65a6 / ブランド色 = #1d70b8。WCAG 2.2 SC 1.4.3 Contrast (minimum) Level AA 準拠を要求
- **出典**: GOV.UK Design System — Colour — https://design-system.service.gov.uk/styles/colour/ (取得日: 2026-08-31)。ライセンス: Open Government Licence v3.0
- **原文引用**: text colour "#0b0c0c" / link colour "#1a65a6" / brand colour "#1d70b8" / "Always use the GOV.UK colour palette." / "You must make sure that the contrast ratio of text and interactive elements in your service meets Web Content Accessibility Guidelines (WCAG 2.2) success criterion 1.4.3 Contrast (minimum) level AA" / "All content is available under the Open Government Licence v3.0, except where otherwise stated"
- **日本語での説明**: 【事実】GOV.UK の本文色は純黒 #000000 ではなく #0b0c0c(わずかに濃い灰)。リンク・ブランドは青系(#1a65a6 / #1d70b8)で、青を基調とする。【解釈】Uber Base の本文色 #000000(Q-04)と割れており、「本文=純黒が唯一の正解」ではないことを示す実在の反例。基調色も Base(白黒中心)と GOV.UK(青中心)で方針が異なる。重要なのは色そのものより「役割と基準(コントラスト・意味)を決め、その中で選ぶ」こと。項目9(反例)の中核素材。
- **決定論判定**: 可 — hex値の比較(#0b0c0c ≠ #000000)、および各ペアのコントラスト比計算は機械判定できる
- **適用ステップ**: STEP2(配色決定時)+ STEP3(制作時チェック)

---

## 台帳の使い方(教材側への注記)

- 「決定論判定: 可」のエントリは、STEP3 の自動チェック(Figma/実装のピクセル・カラー値検査)に組み込める。
- F-06/F-08/F-09 は m3.material.io の原文が未取得のため、公式代替ソース(Google Support / Android Developers / m1.material.io / material-components GitHub)の文言で担保している。m3.material.io の取得に成功した時点で原文引用を差し替えること。**追記(2026-08-30)**: F-09の8dpグリッドはm3のSpacing systemページ原文("Spacing units follow an 8dp scale" / "space100 = 8dp")でも確認済み — principles-structure.md S-15 参照。
- WCAG(F-01〜F-04)は規範文書であり法的要求に接続しうる「必須」、OSガイドライン(F-05〜F-10)は品質のための「推奨」として教材内で区別すること。
