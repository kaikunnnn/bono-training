# リファレンス調査: AIガイダンスUIにおける「根拠・出典」の見せ方

取得日: 2026-07-06
調査方法: WebSearch / WebFetch(URL直接取得)。**記憶からの記述はなし。** 各項目に取得可否を明記。

## 取得失敗ソース一覧

| URL | 結果 | 備考 |
|---|---|---|
| https://help.openai.com/en/articles/9237897-chatgpt-search | 403 Forbidden | ChatGPT公式ヘルプ。検索結果の要約と二次ソース(typescape.ai)で代替 |
| https://openai.com/index/introducing-chatgpt-search/ | 403 Forbidden | 同上 |
| https://www.perplexity.ai/hub/blog/getting-started-with-perplexity | 403 Forbidden | docs.perplexity.ai(取得成功)と二次ソースで代替 |
| https://www.perplexity.ai/help-center/en/articles/10354775-what-is-a-thread | 403 Forbidden | 未取得 |
| https://www.notion.com/help/notion-ai-search | 404 Not Found | 未取得 |
| https://support.claude.com/en/articles/10968357(旧URL) | 404 | 別記事(10684626)の取得に成功し代替 |

注意: 403で取れなかったChatGPT/Perplexityの一部は**二次ソース(ブログ)由来**であり、一次ソース確認済みの項目と信頼度が異なる。各観察に「一次/二次」を明記した。

---

## 事実観察(プロダクト別)

### G-01: Grammarly — 修正提案カードと「なぜ」の説明
- 出典: https://support.grammarly.com/hc/en-us/articles/360003474732-Grammarly-Editor-user-guide(WebFetch成功・一次)、https://www.grammarly.com/blog/engineering/how-suggestions-work-grammarly-editor/(WebFetch成功・一次だがUI詳細は薄い)
- 観察された事実:
  - 本文中の問題箇所は**赤・青・緑・紫の下線**で示され(スタイルガイド設定時は灰色も)、提案カードは**画面右側**に一覧表示。カードをクリックすると本文の該当下線部がハイライトされる(インラインとサイドの双方向リンク)。
  - カード上の操作は **Accept(自動適用)/ Dismiss(無視)**。加えて「More Actions」から誤り報告や「Turn off suggestions like this」(この種の提案を止める)が可能。
  - **「なぜ」の詳細説明はカードに常時表示されず、「Learn more」をクリックした人にだけ展開される**(iPadでは「⋯」→「Show details」)。つまり根拠は折りたたみ・オンデマンド。
  - エンジニアリングブログでは提案が単語〜段落単位で、ユーザーは「カードのリストを1つずつ適用/無視していく」と記述。
- 我々への示唆: 「提案そのもの(短い)」と「根拠の詳細(長い)」を分離し、詳細は開かせる二層構造。修正は1件=1カードの粒度で、受諾/却下を必ずペアで付ける。

### G-02: ChatGPT — web検索回答の出典表示
- 出典: https://typescape.ai/blog/chatgpt-citations-explained/(WebFetch成功・**二次ソース**)、help.openai.com は403で未取得(WebSearch結果の要約のみ)
- 観察された事実(二次ソース由来):
  - 検索を使った回答には**インライン引用**が付き、デスクトップでは**ホバーでソースのプレビュー**、クリックで原典へ遷移。モバイルにはホバープレビューがなくクリックで確認。
  - 回答末尾に **「Sources」ボタン**があり、クリックすると引用リンク一覧のパネルが開く(=末尾まとめ+インラインの併用)。
  - Sourcesボタンが**無い**ことが「検索していない(=引用風テキストは検証されていない)」ことのシグナルになる、という指摘あり。
- 我々への示唆: インライン(文単位)+末尾まとめ(Sourcesパネル)の**二段構え**。「根拠が付いているモード」であること自体をUIで明示するのが信頼の担保になる。※一次ソース未確認のため、教材で引用する際は再検証すること。

### G-03: Claude — web検索回答の出典と引用スニペット
- 出典: https://claude.com/blog/web-search(WebFetch成功・一次)、https://support.claude.com/en/articles/10684626-enable-and-use-web-search(WebFetch成功・一次)、https://platform.claude.com/docs/en/build-with-claude/citations(WebFetch成功・一次)
- 観察された事実:
  - ブログ: "When Claude incorporates information from the web into its responses, it provides direct citations so you can easily fact check sources." — 会話形式の回答に直接引用を付け、ファクトチェック可能にする方針を明言。
  - ヘルプ: 回答には「Direct citations to sources」「Source links for further reading」「Relevant quotes when appropriate(適切な場合は原文からの引用)」が含まれる。画像検索でも**画像ごとに出典リンク**。ユーザーに「Cross-reference cited sources(出典を突き合わせて確認せよ)」と推奨。
  - APIドキュメント(citations機能): "Citations return the **exact passages** that support each claim, so you can verify answers and surface sources to your users." — 引用は**主張(claim)単位**に紐づき、根拠となる**原文の該当パッセージそのもの**を返す設計。
- 我々への示唆: 「主張ごとに、原文の該当箇所(exact passage)を紐づける」がClaudeの根拠設計の核。我々の「主張→(根拠: デザインシステムの該当ページ)」と構造が同型。URLだけでなく**該当箇所の引用文**を持たせると検証可能性が上がる。

### G-04: Perplexity — 番号付きインライン引用 [1][2]
- 出典: https://docs.perplexity.ai/docs/cookbook/articles/streaming-citations/README(WebFetch成功・一次)、https://www.unusual.ai/blog/perplexity-platform-guide-design-for-citation-forward-answers(WebFetch成功・**二次**)
- 観察された事実:
  - 一次(APIドキュメント): 回答テキスト内に "numbered references like `[1]`, `[2]`" が埋め込まれ、各検索結果の数値 `id` が本文の `[N]` に**1対1で対応**する。"Never generate your own URLs"(モデル生成URLはハルシネーションの恐れがあるため、検索結果のURLのみ使う)という設計原則が明記。
  - 二次: UIは "answer-then-sources" ではなく **「Sourcesを前景に出す」**設計("the UI foregrounds sources")。番号付き引用+Sourcesパネルで、ユーザーは引用リンクを新規タブで開いて検証する行動が多い。
- 我々への示唆: 番号 `[N]` は「本文を汚さず、文単位で根拠に飛べる」最小コストの表現。かつ「出典は実在リストからのみ参照可(捏造URL禁止)」という制約は、我々の「実在デザインシステムのページのみ根拠にする」方針と同じ問題への同じ解。

### G-05: Notion AI — ワークスペースQ&Aの出典リンク
- 出典: https://www.notion.com/help/notion-ai-faqs(WebFetch成功・一次)、https://www.notion.com/help/guides/get-answers-about-content-faster-with-q-and-a(WebFetch成功・一次だが引用UIの詳細記載なし)。引用表示の詳細は一次ソースで**未確認**(WebSearch要約では「回答にインライン引用が付き元ページへリンクする」とされるが二次情報)
- 観察された事実(一次で確認できた範囲):
  - Notion AIがコンテンツを作成・編集した場合、**accept(受け入れ)/ discard(破棄)/ try again(再試行)** の3操作が提示される。
  - Q&Aは「構築した情報ライブラリから正確な回答を返す」と説明されるが、出典の**表示形式**(番号かリンクか)は取得したページには明記なし → **未取得**扱い。
- 我々への示唆: 生成系AIの標準操作セットは「受諾/破棄/やり直し」の3つ。却下だけでなく**「もう一度」**があることが心理的コストを下げる。引用UI詳細は実機確認が必要。

### G-06: Khan Academy Khanmigo — 答えを与えないチューター発話
- 出典: https://www.khanmigo.ai/learners(WebFetch成功・一次)
- 観察された事実:
  - "unlike ChatGPT, Khanmigo never gives you the answer. It's built to help you learn"、"it gently guides you to find the answers yourself" — **答えを直接出さず、質問で学習者自身に到達させる**方針を製品ページで明言。
  - 音声入力("You talk, Khanmigo types")、AIの回答読み上げ、コードのリアルタイム評価に対応。チャットUIの詳細な見た目・1発話の長さは記載なし(**未取得**)。
- 我々への示唆: チューター型は「正解を渡す」のではなく「次の一歩を問いで渡す」= 1発話が短くなる構造的理由。我々のガイドも「やってみて→確認」の対話粒度に分割する根拠になる。

### G-07: Duolingo Max — Explain My Answer(なぜ間違いかの説明)
- 出典: https://blog.duolingo.com/duolingo-max/(WebFetch成功・一次)
- 観察された事実:
  - 「Explain My Answer」は画像キャプションで "Explain My Answer chat about the plural possessive" とあり、**チャット形式**で回答の理由を説明することが示唆される(操作フローの詳細は記事に明記なし)。
  - Roleplayでは、会話終了後に "an avatar pops up and analyzes the learner's conversation" — **演習が終わってから**アバターがポップアップし、フィードバックと提案を与える(=リアルタイム割り込みではなく事後まとめ)。
- 我々への示唆: 「なぜ」の説明は**ユーザーが求めたときにチャットで開く**(常時押し付けない)、フィードバックは**作業を止めずに事後にまとめて**渡す、という2つのタイミング設計。

### G-08: GitHub Copilot — インライン提案(ゴーストテキスト)
- 出典: https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-code-suggestions-in-your-editor(WebFetch成功・一次)
- 観察された事実:
  - 提案は入力中に**灰色テキスト(grayed text)としてインライン表示**。**Tabで受諾、Escで却下**。
  - **部分受諾**が可能("accept the next word or the next line of a suggestion")。
  - マウスオーバーでコントロールが出現し、矢印ボタンで**複数候補を切り替え**。Ctrl+Enterで候補一覧をタブ表示。
  - このUIには「なぜこの提案か」の根拠表示は存在しない(ドキュメント上に記載なし)。
- 我々への示唆: 根拠ゼロ・摩擦ゼロの極(Tab一発)。根拠を出すほど摩擦が増えるトレードオフの片端として位置づけられる。「単語/行単位の部分受諾」は提案粒度設計の参考。

### G-09: Figma — First Draft(AIによるデザイン生成)
- 出典: https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI(WebFetch成功・一次)
- 観察された事実:
  - プロンプト入力→「Make it」で生成。生成後は**プロンプト下のサムネイルで別テーマをプレビュー**して比較できる。
  - 「Make changes」でプロンプトによる修正、またはスタイルコントロール(色・角丸・間隔・タイポグラフィ)で調整。満足したら**アクションメニューを閉じる=確定**。
  - 根拠・出典の表示は存在しない(記載なし)。
- 我々への示唆: 「受け入れる」が明示ボタンでなく「メニューを閉じる」である例。生成物の比較(サムネイル)はあるが根拠はない — 我々は逆に根拠が主役なので、この形式はとらない。

---

## 帰納: 引用・根拠の表示設計(事実→解釈)

### 引用-01: 根拠は「インラインの軽いマーカー+開くと原文」の二層が主流
- 根拠観察: G-02(インライン引用+ホバープレビュー+Sourcesボタン)、G-04(本文内[N]→Sourcesパネル)、G-01(カードは短く、詳細はLearn moreで展開)、G-03(主張単位でexact passageを紐づけ)
- 解釈: 確認できた全プロダクトが「本文を読む流れを止めない軽い印」を常時見せ、「原文・詳細な理由」はホバー/クリックで開かせている。根拠を**全文インラインで常時展開しているプロダクトは今回1つも確認できなかった**。
- 我々の3案への反映: **折りたたみチップ案が最有力**。全文インライン案は前例が確認できず読み流れを阻害するリスク、末尾まとめ単独案は「どの主張の根拠か」の対応が切れる(G-03/G-04はいずれも主張↔出典の1対1対応を核にしている)。チップには (a) 出典名, (b) クリックで原典URLへ, (c) 開くと該当箇所の引用文、の3点を持たせる。

### 引用-02: 主張と出典は1対1対応させ、出典は実在リストからのみ引く
- 根拠観察: G-04(検索結果idと[N]の1対1対応、"Never generate your own URLs")、G-03("exact passages that support each claim")
- 解釈: 根拠提示を売りにする両プロダクトとも「文/主張ごとに特定の出典」+「出典は取得済みの実在ソースに限定(捏造防止)」を設計原則にしている。「末尾に参考文献をまとめて置く」形式は主張との対応が失われるため採っていない。
- 我々の3案への反映: 毎ステップの「主張→(根拠)」は**ステップ内の主張ごと**に付ける。教材側で「参照可能なデザインシステムページの許可リスト」を持ち、AIはそこからしか引けない構造にする(Perplexityと同型の捏造対策)。

### 引用-03: 原典への遷移は「1クリック(新タブ)」+可能ならプレビューを挟む
- 根拠観察: G-02(ホバープレビュー→クリックで原典)、G-04(引用リンクを新規タブで開く行動)、G-03(Source links for further reading、画像にも個別出典リンク)
- 解釈: 検証行動は「まずその場で軽く見る(プレビュー/スニペット)→必要なら原典へ」の2段階。スニペット(引用文)があると原典に飛ばなくても検証が済む場合が多い。
- 我々の3案への反映: チップ展開時に**該当ページのスクショまたは引用文**を出し、「デザインシステムで見る→」リンクで原典URLへ新タブ遷移。教材の文脈を失わせないため同タブ遷移は避ける。

### 引用-04: ガイド発話は短く、詳細は求められたときに
- 根拠観察: G-06(答えを与えず質問で導く)、G-07(説明はユーザーが開くチャット、フィードバックは事後まとめ)、G-01(カードは要点のみ、詳細はLearn more)
- 解釈: 教育系・提案系とも「1メッセージ=1つの要点+次のアクション」に絞り、長い説明は(1)ユーザーが要求したとき、(2)作業の区切り、のどちらかに退避させている。
- 我々の3案への反映: ガイド発話は「主張1文+根拠チップ1個+促し1文」程度を上限の目安にする。深い解説(なぜこの原則がデザインシステムにあるか等)は「もっと詳しく」で展開。ステップ完了時に根拠一覧を**末尾まとめとして再掲**するのは、インラインチップとの併用なら有効(G-02のSourcesパネルと同型)。

### 引用-05: 受諾/却下は常にペアで、「やり直す」「この種の提案を止める」を添える
- 根拠観察: G-01(Accept/Dismiss+Turn off suggestions like this)、G-05(accept/discard/try again)、G-08(Tab/Esc+部分受諾)
- 解釈: 提案型UIの共通文法は「受諾と却下が同格で並ぶ」こと。加えて成熟したものは「再試行」「同種の提案の抑制」「部分受諾」で、拒否をゼロイチにしない。
- 我々の3案への反映: 各ステップの提案に「やってみる/スキップ」をペアで置き、スキップ時も根拠チップは残す(却下=根拠を読まない、ではない)。「この説明は不要」系の濃度調整オプションは将来課題として記録。

---

## 結論(要約)

- **確認できたプロダクト: 9**(一次ソースで確認: Grammarly, Claude, Perplexity(API docs), Notion AI(操作のみ), Khanmigo, Duolingo Max, GitHub Copilot, Figma / 二次ソース依存: ChatGPT, PerplexityのUI外観)
- **最有力案: 折りたたみチップ**(本文に主張ごとの軽いマーカー、開くと出典名+該当箇所の引用+原典リンク)+ステップ末尾のまとめ再掲の併用。全文インライン常時表示の前例は確認できなかった。
- **主要な取得失敗**: OpenAIヘルプ/ブログ(403)、Perplexity公式ハブ/ヘルプ(403)、Notion AI検索ヘルプ(404)。ChatGPTの出典UIとNotion AIの引用表示形式は一次未確認のため、教材で引用する前に実機で再検証が必要。
