# Quality Ledger: Uber Base(Base Web)実トークン・実仕様

- **取得日**: 2026-07-04
- **主要取得経路**: GitHub `uber/baseweb` リポジトリ(mainブランチ)のrawソースファイル。Base Web は Uber の Base デザインシステムの公式Web実装(MIT License)であり、トークン定義がコードとして公開されている。
- **取得失敗ソース一覧**:
  - `https://base.uber.com/` — WebFetchで取得したがページタイトル「Base design system」のみでJSレンダリングのため本文未取得
  - `https://baseweb.design/` — WebFetchで取得したが本文が空(JSレンダリング)のため未取得
  - `https://raw.githubusercontent.com/uber/baseweb/main/src/tokens/colors.ts` — HTTP 404(現行mainでは `color-primitive-tokens.ts` に改名されていた)
- **注記**: 「実値」欄の数値・hexはすべて取得したソースコードからの転記。「計算値」と明記したもののみ、取得したコード(行送り+パディング+ボーダー幅)からの算術合成であり、コード上に直接の記載はない。

---

### Q-01: 使用フォント(フォントファミリー)
- **実値**: 本文=UberMoveText / 見出し・Display=UberMove / 等幅=UberMoveMono(フォールバック: system-ui, Helvetica Neue, Helvetica, Arial, sans-serif)
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/themes/shared/typography.ts
- **原文引用**: "primaryFontFamily: 'UberMoveText, system-ui, \"Helvetica Neue\", Helvetica, Arial, sans-serif', secondaryFontFamily: 'UberMove, UberMoveText, system-ui, \"Helvetica Neue\", Helvetica, Arial, sans-serif', monoFontFamily: 'UberMoveMono, \"Lucida Console\", Monaco, monospace'"
- **Sign Up模範への適用**: 画面タイトル(「Sign up」等)はUberMove、入力ラベル・本文・ボタンラベルはUberMoveText。UberMoveは非公開フォントのため、教材ではHelvetica Neue/system-ui代替を明記する。

### Q-02: Type scale(Paragraph/Label — 本文系、primaryFontFamily使用)
- **実値**:
  - ParagraphXSmall (font100): 12px / lh 20px / normal
  - LabelXSmall (font150): 12px / lh 16px / 500
  - ParagraphSmall (font200): 14px / lh 20px / normal
  - LabelSmall (font250): 14px / lh 16px / 500
  - ParagraphMedium (font300): 16px / lh 24px / normal
  - LabelMedium (font350): 16px / lh 20px / 500
  - ParagraphLarge (font400): 18px / lh 28px / normal
  - LabelLarge (font450): 18px / lh 24px / 500
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/themes/shared/typography.ts
- **原文引用**: "const font300: Font = { fontFamily: fontTokens.primaryFontFamily, fontSize: '16px', fontWeight: 'normal', lineHeight: '24px' }; const font350: Font = { ... fontSize: '16px', fontWeight: 500, lineHeight: '20px' };"
- **Sign Up模範への適用**: 入力テキスト=ParagraphMedium(16px/24px)、フォームラベル=LabelSmall(14px/16px/500)、キャプション・エラー文=ParagraphXSmall(12px/20px)、ボタンラベル=LabelMedium(16px/20px/500)。

### Q-03: Type scale(Heading/Display — 見出し系、secondaryFontFamily=UberMove使用、全てweight 700)
- **実値**:
  - HeadingXSmall (font550): 20px / lh 28px
  - HeadingSmall (font650): 24px / lh 32px
  - HeadingMedium (font750): 28px / lh 36px
  - HeadingLarge (font850): 32px / lh 40px
  - HeadingXLarge (font950): 36px / lh 44px
  - HeadingXXLarge (font1050): 40px / lh 52px
  - DisplayXSmall (font1150): 36px / lh 44px
  - DisplaySmall (font1250): 44px / lh 52px
  - DisplayMedium (font1350): 52px / lh 64px
  - DisplayLarge (font1450): 96px / lh 112px
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/themes/shared/typography.ts
- **原文引用**: "const font750: Font = { fontFamily: fontTokens.secondaryFontFamily, fontSize: '28px', fontWeight: 700, lineHeight: '36px' };"
- **Sign Up模範への適用**: モバイルSign Up画面のタイトルはHeadingMedium(28px/36px/700)〜HeadingLarge(32px/40px/700)。Displayはマーケ画面向けでフォームには使わない。

### Q-04: カラートークン — primary/グレースケール階層(ライトテーマ)
- **実値**(primitive):
  - black: #000000 / white: #FFFFFF
  - gray50: #F3F3F3 / gray100: #E8E8E8 / gray200: #DDDDDD / gray300: #C6C6C6 / gray400: #A6A6A6 / gray500: #868686 / gray600: #727272 / gray700: #5E5E5E / gray800: #4B4B4B / gray900: #282828
- **実値**(semantic割り当て):
  - contentPrimary = black(#000000)、contentSecondary = gray800(#4B4B4B)、contentTertiary = gray700(#5E5E5E)、contentStateDisabled = gray400(#A6A6A6)
  - backgroundPrimary = white(#FFFFFF)、backgroundSecondary = gray50(#F3F3F3)、backgroundTertiary = gray100(#E8E8E8)、backgroundInversePrimary = black
  - borderOpaque = gray50(#F3F3F3)、borderTransparent = rgba(black, 0.08)、borderSelected = black
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/tokens/color-primitive-tokens.ts および https://raw.githubusercontent.com/uber/baseweb/main/src/themes/light-theme/color-semantic-tokens.ts
- **原文引用**: "gray50: '#F3F3F3', gray100: '#E8E8E8', ... gray900: '#282828', black: '#000000'" / "contentPrimary: foundation.primaryA, contentSecondary: primitiveLightColors.gray800, contentTertiary: primitiveLightColors.gray700, ... borderSelected: foundation.primaryA"(primaryA = black)
- **Sign Up模範への適用**: 見出し・入力テキスト=#000000、補助テキスト=#4B4B4B、キャプション=#5E5E5E、プレースホルダー/disabled=#A6A6A6、画面背景=#FFFFFF、入力欄塗り=#F3F3F3。

### Q-05: カラートークン — accent色 / error(negative)色
- **実値**:
  - accent = blue600 = #276EF1(contentAccent / borderAccent も blue600)
  - negative/error = red600 = #DE1135(contentNegative / borderNegative = red600)
  - positive = green600 = #0E8345、warning = yellow600 = #9F6402(content用)
  - エラー淡背景: backgroundNegativeLight = red50 = #FFF0EE
  - 旧foundation系(参考): negative400 = #E11900、accent400 = #276EF1
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/tokens/color-primitive-tokens.ts、/src/themes/light-theme/color-semantic-tokens.ts、/src/themes/light-theme/color-foundation-tokens.ts
- **原文引用**: "blue600: '#276EF1'" / "red600: '#DE1135'" / "contentAccent: primitiveLightColors.blue600, contentNegative: primitiveLightColors.red600, ... borderNegative: primitiveLightColors.red600" / "accent: primitiveLightColors.blue600, negative: primitiveLightColors.red600"
- **Sign Up模範への適用**: リンク(「Log in」等)・フォーカスリング=#276EF1、エラーメッセージ文字とエラー時の入力枠=#DE1135。

### Q-06: スペーシングスケール
- **実値**: scale0=2px, scale100=4px, scale200=6px, scale300=8px, scale400=10px, scale500=12px, scale550=14px, scale600=16px, scale650=18px, scale700=20px, scale750=22px, scale800=24px, scale850=28px, scale900=32px, scale950=36px, scale1000=40px, scale1200=48px, scale1400=56px, scale1600=64px, scale2400=96px, scale3200=128px, scale4800=192px
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/themes/shared/sizing.ts
- **原文引用**: "const sizing: Sizing = { scale0: '2px', scale100: '4px', scale200: '6px', scale300: '8px', scale400: '10px', scale500: '12px', scale550: '14px', scale600: '16px', ... scale1600: '64px', ... };"
- **Sign Up模範への適用**: 単純な4/8倍数ではなく2px刻み混在(10px/14pxがある)のが特徴。画面左右余白=scale600(16px)、フォーム項目間=scale600(16px、FormControlのmarginBottomと一致)、セクション間=scale900(32px)。

### Q-07: Input / Text field
- **実値**:
  - 塗り(fill)ベース: 通常時 inputFill = backgroundSecondary = gray50(#F3F3F3)。通常時のボーダー色 = 塗りと同色(枠線が見えない)
  - ボーダー幅: 上下左右とも2px(常時確保。フォーカス時に borderSelected = #000000 が現れ、背景は inputFillActive = white に変化)
  - エラー時: border = inputBorderError = borderNegative = red600(#DE1135)、背景 = inputFillError = backgroundPrimary(white)
  - disabled時: 塗り・枠とも inputFillDisabled = backgroundStateDisabled = gray50、文字 = contentStateDisabled = gray400
  - 角丸: inputBorderRadius = 8px(mini用 inputBorderRadiusMini = 4px)
  - パディング(上下/左右): mini=4px/14px、compact=6px/14px、default=10px/14px、large=14px/14px
  - フォント: mini=font100(12px/20px)、compact=font200(14px/20px)、default=font300(16px/24px)、large=font400(18px/28px)
  - 高さ(計算値: lineHeight+上下padding+上下border2px×2): mini=32px、compact=36px、default=48px、large=60px
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/input/styled-components.ts、/src/themes/light-theme/color-component-tokens.ts、/src/themes/shared/borders.ts
- **原文引用**: "inputFill: semanticColors.backgroundSecondary, inputFillActive: semanticColors.backgroundPrimary, inputFillError: semanticColors.backgroundPrimary, inputBorderError: semanticColors.borderNegative" / "borderLeftWidth: '2px', borderRightWidth: '2px', borderTopWidth: '2px', borderBottomWidth: '2px'" / "[SIZE.default]: { paddingTop: sizing.scale400, paddingBottom: sizing.scale400, paddingLeft: sizing.scale550, paddingRight: sizing.scale550 }" / "inputBorderRadius: '8px'" / "if ($isFocused) { return { borderLeftColor: colors.borderSelected, ... backgroundColor: colors.inputFillActive };"
- **Sign Up模範への適用**: Email/Password欄はグレー塗り(#F3F3F3)・枠線なし見え・角丸8px・高さ48px(default)。フォーカスで白背景+黒2px枠、エラーで白背景+赤(#DE1135)2px枠に変化させる。

### Q-08: フォームのラベル・キャプション(FormControl)
- **実値**:
  - ラベル: font250(=LabelSmall: 14px/16px/500)、色 = contentPrimary(black)、上下マージン scale300(8px)
  - キャプション/エラー文: font100(12px/20px)、通常色 = contentTertiary(gray700 #5E5E5E)、エラー時 = contentNegative(red600 #DE1135)、上下マージン scale300(8px)
  - フォーム項目全体の下マージン: scale600(16px)
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/form-control/styled-components.ts
- **原文引用**: "export const Label = styled('label', (props) => { ... return { ...typography.font250, ... color: $disabled ? colors.contentSecondary : colors.contentPrimary, ... }" / "const Caption ... let fontColor = colors.contentTertiary; if ($error) { fontColor = colors.contentNegative; } ... return { ...typography.font100, ... marginTop: sizing.scale300, ... }" / "ControlContainer ... marginBottom: sizing.scale600"
- **Sign Up模範への適用**: ラベルは入力欄の上に14px/500/黒で置き、欄との間隔8px。エラー文は欄の下8pxに12pxの赤(#DE1135)。項目間は16px。

### Q-09: Button(primary)
- **実値**:
  - 塗り: buttonPrimaryFill = backgroundInversePrimary = black(#000000)、文字 = buttonPrimaryText = contentInversePrimary = white。hover = gray900(#282828)、active = gray800(#4B4B4B)
  - 角丸: buttonBorderRadius = 8px(mini用 = 4px。shape=pillは999px)
  - ラベル: mini/xSmall=LabelXSmall(12px/16px/500)、compact/small=LabelSmall(14px/16px/500)、default/medium=LabelMedium(16px/20px/500)、large=LabelLarge(18px/24px/500)
  - パディング(上下/左右): mini=6px/8px、compact=10px/12px、default=14px/16px、large=16px/20px
  - 高さ(計算値: lineHeight+上下padding、ボーダーなし): mini=28px、compact=36px、default=48px、large=56px
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/button/styled-components.ts、/src/themes/light-theme/color-component-tokens.ts、/src/themes/shared/borders.ts
- **原文引用**: "buttonPrimaryFill: semanticColors.backgroundInversePrimary, buttonPrimaryText: semanticColors.contentInversePrimary, buttonPrimaryHover: primitiveLightColors.gray900, buttonPrimaryActive: primitiveLightColors.gray800" / "buttonBorderRadius: '8px'" / "case SIZE.medium: case SIZE.default: default: return { paddingTop: $theme.sizing.scale550, paddingBottom: $theme.sizing.scale550, paddingLeft: ... $theme.sizing.scale600 }" / "default: return $theme.typography.LabelMedium;"
- **Sign Up模範への適用**: CTA「Continue/Sign up」は真っ黒(#000000)塗り・白文字・角丸8px・高さ48px(モバイル主要CTAならlarge=56pxも可)・ラベル16px/500。押下時は#4B4B4B系に暗転。

### Q-10: Checkbox
- **実値**:
  - チェックマーク部のサイズ: width/height = scale700 = 20px
  - 角丸: checkboxBorderRadius = 0px(完全な四角。Baseの特徴)
  - ボーダー幅: 3px、未選択時ボーダー色 = tickBorder = contentTertiary(gray700 #5E5E5E)
  - 選択時塗り: tickFillSelected = contentPrimary = black(#000000)、チェックマーク = tickMarkFill = contentInversePrimary(white)
  - エラー時選択塗り: tickFillErrorSelected = contentNegative(red600 #DE1135)
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/checkbox/styled-components.ts、/src/themes/light-theme/color-component-tokens.ts、/src/themes/shared/borders.ts
- **原文引用**: "width: sizing.scale700, height: sizing.scale700, ... borderLeftWidth: '3px', borderRightWidth: '3px', borderTopWidth: '3px', borderBottomWidth: '3px'" / "checkboxBorderRadius: '0px'" / "tickFillSelected: semanticColors.contentPrimary, tickBorder: semanticColors.contentTertiary, tickMarkFill: semanticColors.contentInversePrimary"
- **Sign Up模範への適用**: 利用規約同意チェックは20×20px・角丸0(四角)・グレー3px枠、チェック時は黒塗り+白チェック。角丸を付けないのがUberらしさ。

### Q-11: ボーダートークン(共通)
- **実値**: border100〜border600 = 1px solid、色は黒のアルファ階調 hsla(0,0%,0%, 0.04 / 0.08 / 0.12 / 0.16 / 0.2 / 0.24)。radius100=2px, radius200=4px, radius300=8px, radius400=12px, radius500=16px。surfaceBorderRadius(Card/Modal等)=0px、popoverBorderRadius=8px、tagBorderRadius=24px
- **出典**: GitHub uber/baseweb — https://raw.githubusercontent.com/uber/baseweb/main/src/themes/shared/borders.ts
- **原文引用**: "border300: { borderColor: 'hsla(0, 0%, 0%, 0.12)', borderStyle: 'solid', borderWidth: '1px' }, radius300: '8px', ... surfaceBorderRadius: '0px'"
- **Sign Up模範への適用**: 区切り線(「or」ディバイダー等)は1px・黒12%(hsla(0,0%,0%,0.12))。カード/モーダルは角丸0が既定で、角の丸さはInput/Button(8px)に限定するのがBase流。

### Q-12: 設計原則(取得できた範囲)
- **実値**: Base Web公式の一文のみ取得: モダン/レスポンシブ/生きたコンポーネントで構成されるデザインシステム。TypeScriptサポート、Styletronベースのスタイリング、LightTheme等のテーマ提供が特徴として記載。
- **出典**: GitHub uber/baseweb README — https://raw.githubusercontent.com/uber/baseweb/main/README.md
- **原文引用**: "Base is a design system comprised of modern, responsive, living components."
- **Sign Up模範への適用**: 思想ページ(base.uber.com配下)はJSレンダリングで未取得のため、原則の詳説は本台帳に載せない。トークンから読み取れる事実(白黒中心・角丸最小限・塗りベースの入力欄)を「Uberらしさ」の根拠として使う。

---

## 未取得項目(正直な申告)
- base.uber.com の設計原則・思想の本文(JSレンダリングのため未取得)
- モバイルネイティブ(iOS/Android)実装固有の数値(公開ソースが確認できたのはWeb実装のみ。本台帳の値は全てBase Web由来)
- UberMove/UberMoveTextフォントの入手先(非公開・ライセンスフォント)
- Input/Buttonの「高さ」はコードに直接の定義がなく、取得したlineHeight+padding+borderからの計算値である(Q-07/Q-09に明記)
