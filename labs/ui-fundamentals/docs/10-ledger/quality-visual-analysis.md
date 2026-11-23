# 洗練されたSign Up/ログイン画面のビジュアル品質分析(リファレンス台帳)

取得日: 2026-07-04
取得方法: WebFetch(静的HTML取得+要約)および WebSearch。**記憶に基づく記述は一切含まない。** 取得できなかったものは下記に正直に記録する。

## 取得失敗ソース一覧

| URL | 結果 | 備考 |
|---|---|---|
| https://www.airbnb.com/signup_login | HTTP 403 Forbidden | 本文取得不可 |
| https://www.airbnb.jp/login | HTTP 403 Forbidden | 本文取得不可 |
| https://accounts.spotify.com/en/register | HTTP 404 Not Found | URL自体が存在せず。代替として login と www.spotify.com/signup を取得 |
| https://linear.app/signup | 取得成功だが本文なし | 静的HTMLは「Linear」「Loading…」のみ。フォームはJSレンダリングのため観察不可 |
| https://dashboard.stripe.com/register | 取得成功だが本文なし | 見出し "Sign up and create a Stripe account" とブラウザ警告文のみ。フォーム本体はJSレンダリング |
| https://app.notion.com/signup (www.notion.so/signup から301) | 取得成功だが本文なし | 「Notion」というテキストのみ。JSレンダリング |
| https://www.dropbox.com/register | 取得成功だが本文なし | titleタグ「Login or Sign Up - Dropbox」のみ |
| https://www.figma.com/signup | 部分的取得 | 見出し "Sign Up for Figma" のみ確認。フィールド構成はJSレンダリングで観察不可 |
| https://airbnb.design/building-a-visual-language/ (www.airbnb.com へ302) | HTTP 403 Forbidden | 代替としてMedium公式掲載版を取得(成功、A-04) |

---

## 事実観察(ソース別)

### V-01: Uber — ログイン/サインイン開始画面
- **出典**: https://auth.uber.com/login/ (WebFetchで静的HTML取得・成功)
- **観察された事実**:
  - 見出しは質問文 **"What's your phone number or email?"**
  - テキスト入力フィールドは **1個のみ**(電話番号またはメール兼用)。国コード表示(🇯🇵)付き
  - ソーシャルログイン3種: **"Continue with Google" / "Continue with Apple" / "Continue with Rakuten ID"**
  - SMS/WhatsAppで確認コードを送る旨の同意文言あり
  - 認証フローの最初のステップのみを表示する構成(パスワード欄は同一画面に存在しない)
  - 注: JS依存の動的要素は静的HTMLからは確認できず。CTAボタン文言は取得HTML内で明示確認できなかった

### V-02: Spotify — ログイン画面
- **出典**: https://accounts.spotify.com/en/login (WebFetchで取得・成功)
- **観察された事実**:
  - 見出し **"Welcome back"**
  - 入力フィールドは **メールアドレス1個**(パスワードは同一画面に非表示=段階分割)
  - ソーシャルログイン3種: **"Continue with Google" / "Continue with Facebook" / "Continue with Apple"**
  - CTAは **"Continue"**、別途サインアップ導線 "Sign up"
  - reCAPTCHA保護の表示あり

### V-03: Spotify — サインアップ画面(日本語表示)
- **出典**: https://www.spotify.com/signup (WebFetchで取得・成功)
- **観察された事実**:
  - 見出し **「登録してコンテンツを楽しもう」**(ベネフィット訴求型の文言)
  - 最初のステップは **メールアドレス1フィールドのみ**。詳細情報は次画面に分割される段階的フロー
  - ソーシャルログインあり(Google、Apple)
  - プライマリCTA **「次へ」**、既存ユーザー向けセカンダリ導線「ログイン」
  - reCAPTCHA・Google利用規約の注記あり

### V-04: Vercel — サインアップ画面
- **出典**: https://vercel.com/signup (WebFetchで取得・成功)
- **観察された事実**:
  - 見出し **"Your first deploy is just a sign-up away."**(価値提案を1文で示すコピー)
  - 静的HTML上、**メール/パスワード入力欄は存在せず**、認証プロバイダ選択のみ: **"Continue with Google" / "Continue with GitHub" / "Continue with Apple"** + **"Show other options"**(その他の手段は折りたたみ)
  - 法的条項への同意テキストあり
  - 単一ステップ(=プロバイダ選択)構成。メール入力等はJSで後出しの可能性あり(静的HTMLからは未確認)

### V-05: Figma — サインアップ画面(部分的観察)
- **出典**: https://www.figma.com/signup (WebFetchで取得・**部分的成功**)
- **観察された事実**: 見出し **"Sign Up for Figma"** のみ確認。フォーム構成はJSレンダリングのため観察できず。以下の帰納の根拠には**使用しない**。

### A-01: Uber — Base Web 公式発表記事
- **出典**: https://www.uber.com/us/en/blog/introducing-base-web/ (WebFetchで取得・成功)
- **観察された事実**:
  - タイトル "Introducing Base Web, Uber's New Design System for Building Websites in React"(2019年4月16日)
  - Base WebはBaseデザイン言語を実装するReactコンポーネントライブラリで、複数Webアプリ間の**一貫性**のために設計されたと記載
  - 原則として記載: ビジュアルリグレッションテストによる**ピクセルパーフェクト**保証、**アクセシビリティ**(キーボード操作・スクリーンリーダー)、テーマ(色・サイズ・タイポグラフィ)の一元管理とオーバーライドパターン

### A-02: Linear — デザインリフレッシュ公式記事
- **出典**: https://linear.app/now/behind-the-latest-design-refresh (WebFetchで取得・成功)
- **観察された事実**:
  - タイトル "A calmer interface for a product in motion"(Charlie Aufmann・Maxime Heckel、2026年3月12日)
  - 目的: 機能追加で複雑化したUIを整理し「より静かな(calmer)」体験にすること
  - 具体的変更として記載: 冷たい青系→**暖かみのあるグレー**への色調整、**アイコンの使用頻度削減・サイズ縮小・カラー背景廃止**、**ボーダーのコントラスト低減で視覚ノイズを削減**、角丸化、**垂直パディングの追加**

### A-03: Stripe — アクセシブルな色システム公式記事
- **出典**: https://stripe.com/blog/accessible-color-systems (WebFetchで取得・成功)
- **観察された事実**:
  - タイトル "Designing accessible color systems"(2019年10月15日)
  - 3つの目標: (1) WCAG基準(小テキスト4.5:1)を満たす**予測可能なコントラスト**、(2) 区別しやすい鮮やかな色相、(3) **一貫した視覚的重み**(同レベルの色が同じ強さに見える)
  - 知覚均等色空間(CIELAB)を使った独自ツールで色システムを全面再設計したと記載

### A-04: Airbnb — DLS(Design Language System)公式記事
- **出典**: https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e (WebFetchで取得・成功。airbnb.design本体は403のためMedium公式掲載版)
- **観察された事実**:
  - タイトル "Building a Visual Language"(著者: Karri Saarinen)
  - 4原則の記載: **Unified**(各要素はシステム全体の一部)、**Universal**(誰にでも親しみやすくアクセシブル)、**Iconic**(デザインと機能の焦点が明確)、**Conversational**(モーションによる対話)
  - コンポーネントを静的なルール集ではなく「進化するエコシステム」として扱うと記載

---

### V-06: Airbnb — ログイン/登録開始画面(iOSアプリ・スクリーンショット実物)【⓪実物画面層】
- **出典**: 運営者(Takumi)提供のスクリーンショット(2026-07-04受領、Google画像キャッシュ経由)。保存先: `screenshots/airbnb-login-2026-07-04.png`
- **観察された事実**(画像からの実測):
  - 左上に閉じる「×」、その下にAirbnbロゴ(ブランド色・単独)、見出し **"Welcome to Airbnb"**(太字・左寄せ・機能名でなくウェルカム文)
  - 入力は **「国/地域セレクタ+電話番号」が1つの角丸ボーダー枠に結合**された複合フィールド。フィールド内部に小さなラベル(Country/Region / Phone number)が値の上に常時表示(フローティングラベル型 — P-02の「常時可視」は満たす)
  - フィールド直下に小さなグレーのキャプション("We'll call or text you to confirm your number. Standard message and data rates apply.")
  - プライマリCTA **"Continue"**(ブランド色の赤・幅full・角丸・白文字)
  - 細い水平線+中央に小さく **"or"** のディバイダー
  - ソーシャルボタン3本(Apple / Facebook / Google): **白背景・細いダーク枠線・角丸・左端にブランドアイコン・ラベル中央揃え "Continue with ◯◯"**・全て同一サイズで縦積み
  - 最下部に **"Already have an account? Log in"**(Log inのみ下線)
- **V-01〜V-04との整合**: 1画面1タスク(洗練-01)・"Continue with"統一文言(洗練-02)・ウェルカム型見出し(洗練-03)を実物でも確認。**この画面がSign Up系お題の再現すべきアーキタイプ。**

## 帰納された「洗練」の要素(事実→解釈を明示)

※以下は上記の観察事実から**当方が帰納した解釈**であり、各社が明言したものではない(A-xxの記事内容を除く)。

### 洗練-01: 1画面1タスク(段階分割)
- **根拠となる観察**: V-01(Uberは連絡先1フィールドのみで開始)、V-02(Spotifyログインはメールのみ、パスワードは次段階)、V-03(Spotify登録はメール→次画面へ分割、CTA「次へ」)
- **解釈**: 1画面の意思決定を1つに絞ることで認知負荷が下がり、画面上の要素数が物理的に減る。要素が少ないほど余白が生まれ、レイアウトが崩れにくく「整って見える」。
- **Tempo Sign Up模範への適用案**: メールアドレス1フィールド+CTAだけの初期画面にし、パスワード設定・プロフィール入力は次ステップへ送る。CTA文言はSpotify同様「次へ/Continue」で継続を示す。

### 洗練-02: ソーシャルログインを第一級の選択肢として同格提示
- **根拠となる観察**: V-01(Google/Apple/Rakutenの3種)、V-02(Google/Facebook/Apple)、V-03(Google/Apple)、V-04(Vercelはむしろソーシャルのみを表示し、他手段は "Show other options" に折りたたみ)
- **解釈**: 4サービス全てで "Continue with ◯◯" という統一文言パターンが観察された。動詞を "Sign up" ではなく "Continue" にすることで心理的ハードルを下げ、同一の定型ボタンが縦に並ぶことでリズムのある整然としたレイアウトになる。
- **Tempo Sign Up模範への適用案**: 「Googleで続行」「Appleで続行」を同一幅・同一高さのボタンで縦積みし、文言テンプレートを「◯◯で続行」に統一。メール入力とは区切り線(or「または」)で分離する。

### 洗練-03: 見出しを「質問」または「価値提案」の1文にする
- **根拠となる観察**: V-01("What's your phone number or email?" — ユーザーへの質問文)、V-02("Welcome back" — 感情的な短文)、V-03(「登録してコンテンツを楽しもう」 — ベネフィット)、V-04("Your first deploy is just a sign-up away." — 価値提案)
- **解釈**: 「Sign Up」のような機能名ラベルではなく、次の行動か得られる価値を1文で語る見出しが共通。フォームが「手続き」ではなく「対話」に見え、Airbnbの原則 Conversational(A-04)とも整合する。
- **Tempo Sign Up模範への適用案**: 見出しを「Sign Up」ではなく「メールアドレスを入力してください」や「今日から◯◯を始めよう」型の1文にする。副次的な説明文は1行以内に抑える。

### 洗練-04: 視覚ノイズの計画的な削減(低コントラスト境界・アイコン削減・余白追加)
- **根拠となる観察**: A-02(Linearが公式に「ボーダーのコントラスト低減」「アイコンの削減・縮小・カラー背景廃止」「垂直パディング追加」を"calmer"の手段として記載)、V-01/V-02/V-03(いずれも初期画面の入力フィールドは1個で要素数が最小)
- **解釈**: 洗練とは装飾の追加ではなく、輪郭線・アイコン・色数を意図的に減らし、残った要素(見出し・入力欄・CTA)に視線を集中させる引き算である。
- **Tempo Sign Up模範への適用案**: 入力欄のボーダーは低コントラストのグレー、装飾アイコンは原則ゼロ(ソーシャルボタンのブランドロゴのみ例外)。要素間の垂直余白を「窮屈と感じない量+1段階」広く取る。

### 洗練-05: 色はシステムとして設計する(単色CTA+一貫した視覚的重み)
- **根拠となる観察**: A-03(Stripeは「予測可能なコントラスト」「一貫した視覚的重み」を目標に色システムを全面再設計)、A-02(Linearは青系→暖色グレーへ全体調整)、A-01(Uber Base Webはテーマで色・タイポグラフィを一元管理)
- **解釈**: 洗練された画面の色は個別に選ばれておらず、コントラスト基準と視覚的重みが揃うよう体系的に生成されている。CTA以外の色の主張が均一だからこそ、単色のプライマリCTAが唯一の焦点として際立つ。
- **Tempo Sign Up模範への適用案**: 画面内の有彩色はプライマリCTAの1色のみに制限。テキストはグレースケール3段階(見出し/本文/補足)で、本文テキストは4.5:1以上のコントラストを確保。色はトークン(変数)として定義し直接指定しない。

### 洗練-06: 一貫性はデザインシステム(コンポーネント再利用)で担保する
- **根拠となる観察**: A-01(Uber: 一貫性のためのコンポーネントライブラリ、ピクセルパーフェクトの回帰テスト)、A-04(Airbnb: Unified — 各要素はシステム全体の一部)
- **解釈**: 画面単位で「きれいに作る」のではなく、ボタン・入力欄・見出しを共通コンポーネント化して全画面で同一に保つことが、ユーザーが感じる「洗練」の土台になっている。
- **Tempo Sign Up模範への適用案**: Sign Up画面用に単発のスタイルを作らず、ボタン(primary/social)・テキストフィールド・見出しをコンポーネント定義し、ログイン画面・パスワードリセット画面と完全に共有する。

---

## 参考: 検索で確認したその他の一次ソース(未取得・リンクのみ)
- Linear "A design reset (part I)": https://linear.app/now/a-design-reset
- Linear "How we redesigned the Linear UI (part II)": https://linear.app/now/how-we-redesigned-the-linear-ui
- Uber Base design system(公式ドキュメント): https://base.uber.com/
