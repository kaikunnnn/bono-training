# 設定画面の事実観察台帳

取得日: 2026-07-06
方針: WebFetch / WebSearch / curl で実際に取得・確認できた記述のみを記載。記憶からの補完は行っていない。取得失敗も実物層の限界の記録として残す。

## 取得失敗ソース一覧(未取得)

| ソース | URL | 結果 |
|---|---|---|
| Spotify アカウント概要 | https://www.spotify.com/jp/account/overview/ | 302 → accounts.spotify.com/login にリダイレクト。**認証の壁**で設定画面本体は未取得 |
| Slack 通知設定ヘルプ(既定URL) | https://slack.com/help/articles/201355156 | リダイレクトループ(Too many redirects)。en-gb 版で取得成功(OBS-03) |
| Slack Preferences 全体一覧 | https://slack.com/intl/en-gb/help/articles/360059928654 | 取得はできたがカテゴリ一覧・並び順の記載なし。**Preferences のタブ構成は未確認** |
| Discord 通知設定ヘルプ | https://support.discord.com/hc/en-us/articles/213313697 | HTTP 403 Forbidden。未取得 |
| X (Twitter) アカウント設定ヘルプ | https://help.x.com/en/managing-your-account/how-to-change-account-settings | HTTP 403 Forbidden。未取得 |
| Dropbox アカウント設定ヘルプ | https://help.dropbox.com/account-access/account-settings | HTTP 404。未取得 |
| Google アカウント設定ヘルプ | https://support.google.com/accounts/answer/7028997 | HTTP 404。未取得 |
| Apple iPhoneユーザガイド(通知) | https://support.apple.com/guide/iphone/iph7c3d96bab (en/ja両方) | WebFetchでは目次のみ取得され本文抽出に失敗。代替として support.apple.com の記事2本を curl で直接取得(OBS-05, OBS-06) |
| Android 設定アプリ全体構造 | https://support.google.com/android/answer/9083864 | 取得はできたがクイック設定のみの説明で、**設定アプリ本体のカテゴリ構成は未確認** |
| 設定画面リデザインの公式ケーススタディ(Spotify/Dropbox等) | WebSearch | ヒットはほぼ第三者(Medium等)の非公式リデザイン案のみ。公式一次情報として確認できたのは GitHub Changelog のみ(OBS-07) |

**限界の記録**: モバイルアプリ・ログイン後Web設定画面の「実物そのもの」は認証の壁でほぼ取得不可。確認できたのは (a) 認証不要のドキュメントページ、(b) 公式ヘルプに書かれたUIパス・項目名、の2層まで。iOS/Androidの設定アプリの**トップ階層全体の並び**は今回どのソースでも一次確認できなかった。

---

## 事実観察

### OBS-01: GitHub — アカウント設定ドキュメントの項目構成
- 出典: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings (直接取得・ヘルプ由来)
- 観察された事実:
  - 個人アカウント設定として「テーマ、ユーザー名、デフォルトブランチ、アクセシビリティ、セキュリティ設定」等の管理機能が列挙されている
  - ドキュメント上はリンク一覧形式で、セキュリティ/分析、タブサイズ表示、Cookie、アクセシビリティ等の個別ページに分岐する構造
  - ※これはドキュメントの構成であり、設定画面そのものの並びの直接証拠ではない点に注意

### OBS-02: GitHub — アカウント削除のUIパスと確認フロー
- 出典: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings/deleting-your-personal-account (直接取得・ヘルプ由来)
- 観察された事実:
  - UIパス: プロフィール画像 → **Settings** → 左サイドバー **Account**
  - 削除ボタン「Delete your account」は Account 設定ページの**下部**、「Delete account」セクションに配置
  - 削除は即実行されず、「Make sure you want to do this」ダイアログで (1) ユーザー名またはメールの入力、(2) 提示フレーズの入力、という**二重のタイプ確認**を要求

### OBS-03: Slack — 通知設定(Preferences > Notifications)の構成
- 出典: https://slack.com/intl/en-gb/help/articles/201355156-Configure-your-Slack-notifications (直接取得・ヘルプ由来)
- 観察された事実:
  - デスクトップのUIパス: サイドバーのプロフィール画像 → **Preferences**
  - 通知設定内のセクション名(記載順): 「How to notify you」「What to notify you about」「Also notify you about」「What to show in Activity」「Channel keywords」「Sound & appearance」「When I'm not active on desktop」
  - コントロールの使い分け: 通知手段のオン/オフは**チェックボックス**、通知範囲(Everything / Mentions and direct messages)は**ドロップダウン**、キーワードは**テキスト入力**
  - 保存ボタンについての記述はヘルプ手順に登場しない(手順が「選ぶ」で終わる)
  - モバイル版のパス: プロフィール画像 → **Notifications**。モバイルでは同種の項目が**トグル**で表現される

### OBS-04: Notion — アカウント設定の構成
- 出典: https://www.notion.com/help/account-settings (直接取得・ヘルプ由来)
- 観察された事実:
  - UIパス: サイドバーのワークスペース名横の矢印 → **Settings** → {ユーザー名} / **Preferences**
  - アカウントタブ: プロフィール写真・表示名・メールアドレス(最大5つ)・パスワード
  - セキュリティ系として「二段階認証」「パスキー」「**アカウント削除**」「**全デバイスからのログアウト**」が同じアカウント設定内に記載(削除・ログアウトがアカウント/セキュリティ文脈に置かれている)
  - Preferences 側: 外観(ライト/ダーク)、言語・タイムゾーン、週の開始日、デスクトップアプリ起動、プライバシー(ビュー履歴の表示、プロフィール発見可能性)
  - 「アカウント情報」と「環境設定(Preferences)」が別グループに分離されている

### OBS-05: Apple iOS — アプリ単位の通知オン/オフのUIパス
- 出典: https://support.apple.com/en-us/120681 (curlで本文を直接取得・ヘルプ由来。公開日 2026-04-07 表記)
- 観察された事実:
  - UIパス: **Settings app → Apps → (アプリ名) → Notifications → Allow Notifications をオン/オフ**
  - 「Notifications が表示されない場合、そのアプリは通知を送れない可能性がある」という条件分岐の記述あり
  - 「Allow Notifications」という**親トグル**をオンにすると、その配下でサウンド・配置・見た目のカスタマイズが可能になる(親トグルが子設定のゲートになる構造)

### OBS-06: Apple iOS — 通知設定画面(Settings > Notifications)の項目と文言
- 出典: https://support.apple.com/en-us/108781 (curlで本文を直接取得・ヘルプ由来)
- 観察された事実:
  - 「Settings → Notifications」配下に確認できたグループ/項目名: **Show Previews**(選択肢に Always)、**Display As**(選択肢: **Count / Stack / List**)、**Notification Style**(この見出しの下にアプリ一覧が並び、アプリを選んで個別設定)、**Summarize Notifications**(オン/オフ+アプリ別オン/オフ)、**Priority Notifications**(オン/オフ+アプリ別オフ)
  - アプリ個別画面には「Alerts」(通知スタイル選択)、「Sounds」がある
  - 手順はすべて「Turn X on or off」「choose」「select」で完結し、**保存ボタンへの言及は一切ない**(即時反映型の記述)
  - 通知一覧からのショートカット: 通知を左スワイプ → Options → 「Mute for 1 Hour / Mute for Today / View Settings / Turn Off」の4択

### OBS-07: GitHub — 設定ページ公式リデザイン(2022-02-02 Changelog)
- 出典: https://github.blog/changelog/2022-02-02-redesign-of-githubs-settings-pages/ (直接取得・公式一次情報)
- 観察された事実:
  - Primer の `NavigationList` コンポーネントを user / organization / repository / teams の設定ページに導入
  - 原文: "The new `NavigationList` component groups similar settings pages into sections for improved information architecture and discoverability."
  - つまり公式が明言したリデザインの目的は「**類似の設定ページをセクションにグループ化**して情報アーキテクチャと発見性を改善すること」

### OBS-08: Mozilla Firefox — 設定画面のパネル一覧と並び順
- 出典: https://support.mozilla.org/en-US/kb/firefox-options-preferences-and-settings (直接取得・ヘルプ由来)
- 観察された事実:
  - パネルの記載順: 1. Account and sync / 2. General / 3. Home / 4. Search / 5. Privacy and security / 6. Passwords and autofill / 7. Appearance / 8. Downloads / 9. Tabs and browsing / 10. Accessibility / 11. Languages / 12. AI Controls / 13. Permissions and data / 14. Firefox Labs / 15. About Firefox / 16. More from Mozilla
  - **アカウント(Account and sync)が最上位**、実験的機能(Firefox Labs)やバージョン情報(About)が末尾

---

## 帰納された傾向(事実→解釈を明示)

### 傾向-01: アカウント/プロフィール系は設定の入口・最上位に置かれる
- 根拠観察: OBS-02(GitHubはプロフィール画像がSettingsの入口)、OBS-03(Slackもプロフィール画像が入口)、OBS-04(Notionはアカウント情報が独立タブ)、OBS-08(Firefoxの第1パネルが Account and sync)
- 解釈: 「誰の設定か」を示すアカウントが階層の先頭・入口に来るのは複数サービスで一致。設定画面の教材でも第1セクションはアカウントにするのが実物準拠。

### 傾向-02: 破壊的操作(削除・全ログアウト)は最下部かつ多段確認
- 根拠観察: OBS-02(GitHubは Account ページ**下部**の Delete account セクション+タイプ入力2段の確認ダイアログ)、OBS-04(Notionはアカウント削除・全デバイスログアウトをアカウント/セキュリティ文脈に配置)
- 解釈: 破壊的操作は通常項目と同列に混ぜず、ページ末尾に隔離+実行前に能動的な入力を要求するのが確認できたパターン。ワンタップで完了させない。

### 傾向-03: 設定は「保存ボタン」ではなく即時反映で記述される
- 根拠観察: OBS-05・OBS-06(Appleの手順はすべて「Turn on/off」「select」で終わり保存操作が存在しない)、OBS-03(Slackもチェック/選択で手順終了、保存への言及なし)
- 解釈: 少なくとも確認できたヘルプ記述では、トグル/選択=即反映が前提。「保存ボタン」を要求する設定UIはこれらのソースには現れなかった。(注意: ヘルプが保存操作を省略している可能性は排除できないが、複数社で一貫して省略されている事実自体が傍証)

### 傾向-04: 親トグルが子設定のゲートになる(Allow → 詳細)
- 根拠観察: OBS-05(iOSは Allow Notifications をオンにして初めてサウンド・配置・見た目が調整可能)、OBS-06(Summarize Notifications も全体オン/オフ+アプリ別オン/オフの二層)
- 解釈: 「大きなオン/オフ」→「配下の詳細調整」という二層構造。教材のトグル設計では親トグルオフ時に子項目を無効化/非表示にするのが実物準拠。

### 傾向-05: 通知設定は「手段 → 範囲 → 例外/追加 → 見た目・音」の順で分解される
- 根拠観察: OBS-03(Slack: How to notify → What to notify about → Also notify about → Sound & appearance)、OBS-06(iOS: 表示方法 Display As / プレビュー → アプリ別スタイル → サウンド)
- 解釈: 通知はひとつのトグルではなく「どこに/何を/どう見せるか」に分解してグルーピングされる。セクション名も疑問文的・説明的な文言(「What to notify you about」)が実例として存在する。

### 傾向-06: グルーピング自体が公式に語られた設計目標である
- 根拠観察: OBS-07(GitHubが「類似の設定ページをセクションにグループ化して情報アーキテクチャと発見性を改善」と公式に明言)、OBS-08(Firefoxのパネル分割)
- 解釈: フラットな項目羅列ではなくセクション化は、観察者の解釈ではなく提供元自身がリデザイン目的として明言した一次証拠がある。

### 傾向-07: コントロールの型は値の性質で使い分けられる
- 根拠観察: OBS-03(Slack: 二値=チェックボックス/トグル、排他選択=ドロップダウン、自由入力=テキストフィールド)、OBS-06(iOS: 二値=トグル、3択の Display As=選択リスト)
- 解釈: 二値はトグル(モバイル)/チェックボックス(デスクトップ)、複数から1つは選択リスト、という対応が両者で一致。
