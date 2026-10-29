# I2: パターン・カタログ — 主要デザインシステムのコンポーネント分類の棚卸し

取得日: 2026-07-06

## 取得ステータス / 取得失敗ソース一覧

| ソース | 取得方法 | 状態 |
|---|---|---|
| Apple HIG | 公式JSONエンドポイント(developer.apple.com/tutorials/data/design/human-interface-guidelines/*.json)を9本取得 | 取得成功 |
| Material Design 3 | m3.material.io/components 直接取得は失敗(JSレンダリング)→ r.jina.ai プロキシで取得 | 部分成功(下記注意) |
| GOV.UK Design System | /components/ 直接取得は2回タイムアウト → r.jina.ai プロキシで取得。/patterns/ は直接取得成功 | 取得成功 |
| Shopify Polaris | polaris-react.shopify.com/components 直接取得 | 取得成功 |
| GitHub Primer | primer.style/components 直接取得 | 取得成功(下記注意) |
| Uber Base Web | GitHub API(api.github.com/repos/uber/baseweb/contents/src)でディレクトリ一覧取得 | 取得成功 |

**未取得・注意事項(正直な記録)**:
- **M3のカテゴリ→コンポーネント対応は未取得**。プロキシ経由の抽出テキストにはカテゴリ見出し(Actions等)が含まれておらず、2回の取得で異なるグルーピングが返った(=要約モデルの推測と判断し不採用)。3回目に「見出しは原文に存在しない」ことを確認したため、本書ではM3は**フラットな36コンポーネントのリストのみ**を事実として記録する。
- **Primerの件数不一致**: 取得結果は「Main Components (70 total)」と記載しつつ、実際に列挙された名称は62個だった。本書は列挙された62個のみを事実として扱う。
- **GOV.UKコンポーネント一覧はプロキシ経由**(直接取得タイムアウトのため)。
- **Base WebはGitHubのsrc/ディレクトリ名**であり、公式ドキュメントの分類ページそのものではない(utils, test, themes 等の非コンポーネントディレクトリを含む)。

---

## 1. DS別の分類の実態(取得できた一覧の記録)

### 1-1. Apple HIG — 8カテゴリ / 計64コンポーネント

公式JSONの topicSections から取得。カテゴリ名と配下コンポーネント:

- **Content**(4): Charts / Image views / Text views / Web views
- **Layout and organization**(10): Boxes / Collections / Column views / Disclosure controls / Labels / Lists and tables / Lockups / Outline views / Split views / Tab views
- **Menus and actions**(12): Activity views / Buttons / Context menus / Dock menus / Edit menus / Home Screen quick actions / Menus / Ornaments / Pop-up buttons / Pull-down buttons / The menu bar / Toolbars
- **Navigation and search**(5): Path controls / Search fields / Sidebars / Tab bars / Token fields
- **Presentation**(8): Action sheets / Alerts / Page controls / Panels / Popovers / Scroll views / Sheets / Windows
- **Selection and input**(11): Color wells / Combo boxes / Digit entry views / Image wells / Pickers / Segmented controls / Sliders / Steppers / Text fields / Toggles / Virtual keyboards
- **Status**(4): Activity rings / Gauges / Progress indicators / Rating indicators
- **System experiences**(10): App Shortcuts / Complications / Controls / Live Activities / Notifications / Snippets / Status Bars / Top Shelf / Watch Faces / Widgets

### 1-2. Material Design 3 — 36コンポーネント(カテゴリ対応は未取得)

r.jina.ai プロキシ経由で取得したフラットリスト(ページ掲載順):

Button groups / Buttons / Extended FABs / FAB menu / Floating action buttons (FABs) / Icon buttons / Segmented buttons / Split buttons / Date pickers / Time pickers / Loading indicator / Progress indicators / Navigation bar / Navigation drawer / Navigation rail / Bottom sheets / Side sheets / App bars / Badges / Cards / Carousel / Checkbox / Chips / Dialogs / Divider / Lists / Menus / Radio button / Search / Sliders / Snackbar / Switch / Tabs / Text fields / Toolbars / Tooltips

※ 掲載順からボタン系→ピッカー系→ナビゲーション系…という並びの傾向は読み取れるが、カテゴリ見出しは抽出テキストに存在せず未確認。

### 1-3. GOV.UK Design System — Components 35個(分類なしのフラット一覧)+ Patterns 29個(3グループ)

**Components**(35、アルファベット順のフラット一覧):
Accordion / Back link / Breadcrumbs / Button / Character count / Checkboxes / Cookie banner / Date input / Details / Error message / Error summary / Exit this page / Fieldset / File upload / Generic header / GOV.UK footer / GOV.UK header / Inset text / Notification banner / Pagination / Panel / Password input / Phase banner / Radios / Select / Service navigation / Skip link / Summary list / Table / Tabs / Tag / Task list / Text input / Textarea / Warning text

**Patterns**(タスク単位の分類。ここが他DSと決定的に異なる):
- **Ask users for…**(10): Addresses / Bank details / Dates / Email addresses / Equality information / Names / National Insurance numbers / Passwords / Payment card details / Phone numbers
- **Help users to…**(12): Check a service is suitable / Check answers / Complete multiple tasks / Confirm a phone number / Confirm an email address / Contact a department or service team / Create a username / Create accounts / Exit a page quickly / Navigate a service / Recover from validation errors / Start using a service
- **Pages**(7): Confirmation pages / Cookies page / Page not found pages / Question pages / Service unavailable pages / Step by step navigation / There is a problem with the service pages

### 1-4. Shopify Polaris — 12カテゴリ / 現行68コンポーネント(+deprecated 24)

- **Actions**(3): Account connection / Button / Button group
- **Layout and structure**(15): Bleed / Block stack / Box / Callout card / Card / Divider / Empty state / Form layout / Grid / Inline grid / Inline stack / Layout / Media card / Page ほか
- **Selection and input**(16): Autocomplete / Checkbox / Choice list / Color picker / Combobox / Date picker / Drop zone / Filters / Form / Index filters / Inline error / Radio button / Range slider / Select / Tag / Text field
- **Images and icons**(5): Avatar / Icon / Keyboard key / Thumbnail / Video thumbnail
- **Feedback indicators**(10): Badge / Banner / Exception list / Progress bar / Skeleton系4種 / Skeleton tabs / Spinner
- **Typography**(1): Text
- **Tables**(2): Data table / Index table
- **Lists**(7): Action list / Description list / List / Listbox / Option list / Resource item / Resource list
- **Navigation**(4): Footer help / Link / Pagination / Tabs
- **Overlays**(2): Popover / Tooltip
- **Utilities**(3): App provider / Collapsible / Scrollable
- **Deprecated**: 24個(名称は未取得)。※現行一覧に Modal / Toast が無い点に注意(deprecated入りの可能性が高いが、一覧上では未確認)

### 1-5. GitHub Primer — フラット一覧(取得できた名称62個+Internal 18個)

カテゴリ分類なし(ページ側の言明:「formal category groupings は無い」)。

ActionBar / ActionList / ActionMenu / AnchoredOverlay / Autocomplete / Avatar / AvatarStack / Banner / Blankslate / BranchName / Breadcrumbs / Button / ButtonGroup / Card / Checkbox / CheckboxGroup / CircleBadge / ConfirmationDialog / CounterLabel / DataTable / Details / Dialog / FormControl / Heading / IconButton / InlineMessage / KeybindingHint / Label / LabelGroup / Link / NavList / Overlay / PageHeader / PageLayout / Pagination / Popover / ProgressBar / Radio / RadioGroup / RelativeTime / SegmentedControl / Select / SelectPanel / SkeletonAvatar / SkeletonBox / SkeletonText / Spinner / SplitPageLayout / Stack / StateLabel / Text / TextInput / TextInputWithTokens / Textarea / Timeline / ToggleSwitch / Token / Tooltip / TreeView / Truncate / UnderlineNav / UnderlinePanels

Internal(18): DatePicker / DragAndDrop / Filter / MarkdownEditor / ListView 等

### 1-6. Uber Base Web — src/ ディレクトリ約90(非コンポーネント含む)

GitHub API取得。コンポーネントに相当する主なもの:

accordion / app-nav-bar / avatar / badge / banner / bottom-navigation / breadcrumbs / button / button-group / card / checkbox / combobox / data-table / datepicker / dialog / divider / drawer / dnd-list / file-uploader / form-control / header-navigation / heading / icon / input / link / list / menu / message-card / modal / notification / pagination / payment-card / phone-input / pin-code / popover / progress-bar / progress-steps / radio / rating / segmented-control / select / sheet / side-navigation / skeleton / slider / snackbar / spinner / stepper / switch / table(+table-grid / table-semantic)/ tabs(+tabs-motion)/ tag / textarea / tile / timepicker / timezonepicker / toast / tooltip / tree-view / typography ほか

非コンポーネント(除外): a11y / block / helpers / layer / locale / styles / template-component / test / themes / tokens / types / utils

---

## 2. 共通コア・パターンの導出

**【事実】**は上記の取得済み一覧に名前が存在すること。**【解釈】**は名寄せ(同一パターンとみなす判断)。名寄せの主な判断:

- Button=Buttons=button(単純な表記揺れ)
- Text field=Text input=TextInput=input(単一行テキスト入力)
- Toggle(HIG)=Switch(M3/Base)=ToggleSwitch(Primer)→「スイッチ」に名寄せ
- Tab bars/Tab views(HIG)=Tabs(M3/GOV.UK/Polaris/Base)=UnderlineNav/UnderlinePanels(Primer)→「タブ」。ただしPrimerは名称が異なるため△扱いも併記
- Alerts/Action sheets/Sheets(HIG)=Dialogs(M3)=Dialog/ConfirmationDialog(Primer)=modal/dialog(Base)→「ダイアログ/モーダル」
- Disclosure controls(HIG)=Accordion/Details(GOV.UK)=Collapsible(Polaris)=Details(Primer)=accordion(Base)→「開閉(ディスクロージャ)」
- Pickers/Pop-up buttons(HIG)=Select(GOV.UK/Polaris/Primer/Base)→「セレクト」(HIGは△: 名称・形態が異なる)
- Page controls(HIG)=Pagination(GOV.UK/Polaris/Primer/Base)→「ページネーション」(HIGは△: ドット型で用途が異なる)
- Progress indicators(HIG/M3)=Progress bar(Polaris)=ProgressBar(Primer)=progress-bar(Base)→「進捗表示」
- Notification banner(GOV.UK)=Banner(Polaris/Primer)=banner/system-banner(Base)→「バナー」
- Badge(M3/Polaris/Base)とTag(GOV.UK/Polaris/Base)とLabel/CounterLabel/Token(Primer)は近縁だが、本書ではBadge系とTag系を分けてカウントし、注記で近縁と明示

### 層1: 5〜6DSに存在する共通コア(13パターン)

| パターン | HIG | M3 | GOV.UK | Polaris | Primer | Base | 数 |
|---|---|---|---|---|---|---|---|
| ボタン | Buttons | Buttons | Button | Button | Button | button | 6 |
| テキスト入力 | Text fields | Text fields | Text input | Text field | TextInput | input | 6 |
| メニュー(ドロップダウン) | Menus/Pull-down buttons | Menus | — | Action list+Popover(解釈) | ActionMenu | menu | 5〜6 |
| タブ | Tab bars/Tab views | Tabs | Tabs | Tabs | UnderlineNav(△名寄せ) | tabs | 5〜6 |
| リスト | Lists and tables | Lists | — | List/Resource list | ActionList/NavList | list | 5 |
| セレクト | Pickers(△) | — | Select | Select | Select | select | 4+△ |
| チェックボックス | —(※Togglesに包含の可能性、一覧上は無し) | Checkbox | Checkboxes | Checkbox | Checkbox | checkbox | 5 |
| ラジオボタン | — | Radio button | Radios | Radio button | Radio | radio | 5 |
| テーブル | Lists and tables | — | Table | Data table | DataTable | table | 5 |
| ページネーション | Page controls(△) | — | Pagination | Pagination | Pagination | pagination | 4+△ |
| 進捗表示 | Progress indicators | Progress indicators | — | Progress bar | ProgressBar | progress-bar | 5 |
| 開閉(アコーディオン/ディスクロージャ) | Disclosure controls | — | Accordion/Details | Collapsible | Details | accordion | 5 |
| ダイアログ/モーダル | Alerts/Sheets | Dialogs | — | —(現行一覧に無し・deprecated疑い) | Dialog | modal/dialog | 4〜5 |

### 層2: 3〜4DSに存在するもの(18パターン)

| パターン | 存在するDS | 数 |
|---|---|---|
| ツールチップ | M3 / Polaris / Primer / Base | 4 |
| カード | M3 / Polaris / Primer / Base(HIGのLockupsは近縁だが別名寄せ) | 4 |
| スイッチ/トグル | HIG(Toggles)/ M3(Switch)/ Primer(ToggleSwitch)/ Base(switch) | 4 |
| スライダー | HIG / M3 / Polaris(Range slider)/ Base | 4 |
| セグメンテッドコントロール | HIG / M3(Segmented buttons)/ Primer / Base | 4 |
| デートピッカー | M3 / GOV.UK(Date input)/ Polaris / Base(+Primer internal) | 4+△ |
| ポップオーバー | HIG / Polaris / Primer / Base | 4 |
| バナー(お知らせ帯) | GOV.UK / Polaris / Primer / Base | 4 |
| バッジ | M3 / Polaris / Primer(CircleBadge/CounterLabel△)/ Base | 3〜4 |
| リンク | GOV.UK(Back link/Skip link△)/ Polaris / Primer / Base | 3+△ |
| テキストエリア(複数行入力) | GOV.UK / Primer / Base(Polaris Text fieldの複数行は解釈) | 3 |
| スピナー(ローディング) | M3(Loading indicator)/ Polaris / Primer / Base | 4 |
| アバター | Polaris / Primer / Base | 3 |
| タグ/トークン | GOV.UK(Tag)/ Polaris(Tag)/ Primer(Token/Label)/ Base(tag)+ M3のChipsは近縁 | 4+△ |
| ディバイダー(区切り線) | M3 / Polaris / Base | 3 |
| スケルトン(ローディングプレースホルダ) | Polaris / Primer / Base | 3 |
| ブレッドクラム | GOV.UK / Primer / Base(HIGのPath controlsは近縁) | 3+△ |
| ファイルアップロード | GOV.UK / Polaris(Drop zone)/ Base(file-uploader) | 3 |
| フォームコントロール(ラベル+入力+エラーの束) | GOV.UK(Fieldset/Error message)/ Polaris(Form layout/Inline error)/ Primer(FormControl)/ Base(form-control) | 4 |
| 検索 | HIG(Search fields)/ M3(Search)/ Polaris(Filters/Autocomplete△) | 2+△ |
| ナビゲーション(サイド/バー) | HIG(Sidebars)/ M3(Navigation bar/drawer/rail)/ GOV.UK(Service navigation)/ Base(side-navigation等)/ Primer(NavList△) | 4〜5 |

※表は18行を超えて記載(境界的なものを含む)。

### 層3: 特定DS固有のもの(そのDSの思想を表す)

- **HIG固有(OS体験)**: Ornaments(visionOS)/ Complications・Watch Faces(watchOS)/ Top Shelf(tvOS)/ Live Activities / Widgets / Activity rings / Digit entry views / Color wells / Image wells / The menu bar / Dock menus
- **GOV.UK固有(行政サービス)**: Exit this page(DV被害者等向けの緊急離脱)/ Phase banner / Cookie banner / Warning text / Inset text / Character count / Summary list / Task list / Panel(申請完了)
- **Polaris固有(EC管理画面)**: Resource list・Resource item / Index table・Index filters / Account connection / App provider / Bleed・Box・Block stack(レイアウトプリミティブ群)
- **Primer固有(開発者ツール)**: BranchName / RelativeTime / Timeline / KeybindingHint / StateLabel(Issue/PR状態)/ MarkdownEditor(internal)
- **M3固有(モバイル)**: FAB系4種(FAB / Extended FAB / FAB menu / Split buttons)/ Carousel / Bottom sheets・Side sheets / Snackbar
- **Base Web固有(実務ドメイン)**: payment-card / phone-input / pin-code / rating / timezonepicker / map-marker / dnd-list

**【解釈】分類思想の違い(教材設計に効く発見)**:
1. **分類軸が3系統ある**: (a) 機能軸(HIG: Menus and actions / Polaris: Actions, Selection and input)、(b) フラット列挙(Primer, GOV.UK components, M3の抽出結果)、(c) **ユーザータスク軸(GOV.UK patterns: "Ask users for…" "Help users to…")**。GOV.UKだけが「コンポーネント(部品)」と「パターン(タスクの解き方)」を明確に2層に分けている。
2. HIGは「System experiences」というOSレベルのカテゴリを持ち、Webの DS には無い層(通知・ウィジェット・ステータスバー)をコンポーネントとして扱う。
3. Polarisはレイアウトプリミティブ(Box/Bleed/Stack)までコンポーネント化しており、粒度が最も細かい。
4. 同じ「進捗」でも、HIGはStatus、PolarisはFeedback indicators、M3は(位置づけ未確認)と、置き場所の思想が異なる。

---

## 3. 教材用の基礎パターン候補リスト(20個)

共通コア(層1・層2)から、初心者がUI基礎として学ぶべきパターンを選定。「定義があるDS」= 上記取得済み一覧に該当名(名寄せ含む)が存在するもの。

| # | パターン | 学ぶ理由(1行) | 定義があるDS |
|---|---|---|---|
| 1 | ボタン | 全DSに存在する唯一クラスの基本要素。階層(primary/secondary)の概念 | HIG / M3 / GOV.UK / Polaris / Primer / Base(6/6) |
| 2 | テキスト入力 | フォームの最小単位。ラベル・プレースホルダ・状態 | HIG / M3 / GOV.UK / Polaris / Primer / Base(6/6) |
| 3 | チェックボックス | 複数選択の標準。ON/OFFとの違い | M3 / GOV.UK / Polaris / Primer / Base(5/6) |
| 4 | ラジオボタン | 排他選択の標準。チェックボックスとの使い分け | M3 / GOV.UK / Polaris / Primer / Base(5/6) |
| 5 | セレクト | 選択肢が多い場合の排他選択。ラジオとのトレードオフ | GOV.UK / Polaris / Primer / Base(+HIG Pickers)(4+△) |
| 6 | スイッチ/トグル | 即時反映のON/OFF。チェックボックスとの違い | HIG / M3 / Primer / Base(4/6) |
| 7 | テキストエリア | 長文入力。文字数制限(GOV.UK Character count)との組合せ | GOV.UK / Primer / Base(3/6) |
| 8 | フォームレイアウト+エラー表示 | 入力→検証→エラー回復の一連(GOV.UK patternsの中核) | GOV.UK / Polaris / Primer / Base(4/6) |
| 9 | タブ | 同一階層のビュー切替 | HIG / M3 / GOV.UK / Polaris / Base(+Primer UnderlineNav)(5+△) |
| 10 | ナビゲーション(サイドバー/ナビバー) | 画面間移動の骨格。デバイスによる形態差(M3のbar/rail/drawer) | HIG / M3 / GOV.UK / Base(+Primer NavList)(4+△) |
| 11 | ブレッドクラム | 階層内の現在地表示 | GOV.UK / Primer / Base(+HIG Path controls)(3+△) |
| 12 | ページネーション | 大量データの分割ナビゲーション | GOV.UK / Polaris / Primer / Base(+HIG Page controls)(4+△) |
| 13 | 検索フィールド | 探索型ナビゲーションの入口 | HIG / M3(2/6 ※ただし両巨頭に定義あり) |
| 14 | リスト | コンテンツ表示の基本形。行の構造(アイコン/主文/補助) | HIG / M3 / Polaris / Primer / Base(5/6) |
| 15 | テーブル | 構造化データの表示。リストとの使い分け | HIG / GOV.UK / Polaris / Primer / Base(5/6) |
| 16 | カード | 情報のまとまりの器。リストとの使い分け | M3 / Polaris / Primer / Base(4/6) |
| 17 | ダイアログ/モーダル | フローの中断と確認。アラートとの違い(HIG Alerts/Action sheets) | HIG / M3 / Primer / Base(4/6) |
| 18 | メニュー(ドロップダウン) | アクションの格納。過剰使用の危険 | HIG / M3 / Primer / Base(+Polaris Action list)(4+△) |
| 19 | ツールチップ/ポップオーバー | 補足情報の非破壊的な提示 | Tooltip: M3 / Polaris / Primer / Base、Popover: HIG / Polaris / Primer / Base(4/6) |
| 20 | フィードバック表示(バナー/スナックバー/進捗/スピナー/スケルトン) | システム状態の可視化(ヒューリスティクス#1に直結) | 進捗: HIG / M3 / Polaris / Primer / Base(5/6)、バナー: GOV.UK / Polaris / Primer / Base(4/6)、スケルトン: Polaris / Primer / Base(3/6) |

**補足候補(21〜25、余裕があれば)**: バッジ/タグ(4+△)、アバター(3)、デートピッカー(4+△)、アコーディオン(5)、エンプティステート(Polaris Empty state / Primer Blankslate の2DSのみだが実務重要度が高い)。

**経典routingへの示唆【解釈】**: 部品の「かたち」はHIG/M3/Polarisが厚く、「タスクとしての使い方」(住所を聞く、エラーから回復させる等)はGOV.UK patternsが唯一の体系的経典。基礎パターン各項は「部品定義=HIG/M3」+「タスク文脈=GOV.UK」の2経典構成でrouting可能。
