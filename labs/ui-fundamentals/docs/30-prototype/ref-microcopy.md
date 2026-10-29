# ref-microcopy: 公開ライティングガイド調査 — 「初心者に分かりやすく、温度のある言葉」

取得日: 2026-07-07
調査方法: WebFetch / WebSearch による一次情報の取得のみ。記憶からの記述はなし。取得失敗はその旨を明記。

## 取得失敗ソース一覧

| ソース | URL | 状態 |
|---|---|---|
| GOV.UK 旧URL | gov.uk/guidance/content-design/writing-for-gov-uk | 301リダイレクト → guidance.publishing.service.gov.uk 配下に移転（移転先は取得成功） |
| Shopify Polaris 旧URL | polaris.shopify.com/content/voice-and-tone | 301リダイレクト → polaris-react.shopify.com（移転先は取得成功） |
| Atlassian（直接取得） | atlassian.design/content/voice-and-tone-principles/ | 直接WebFetchでは本文空（JSレンダリング）。**r.jina.ai プロキシ経由で取得成功** |
| Apple HIG（直接取得） | developer.apple.com/design/human-interface-guidelines/writing | 直接WebFetchではタイトルのみ（JSレンダリング）。**公式JSON（/tutorials/data/design/human-interface-guidelines/writing.json）で取得成功** |
| Material Design 3（直接取得想定） | m3.material.io 配下 | **r.jina.ai プロキシ経由で取得成功**（直接取得は試行せずプロキシを使用） |
| SmartHR ライティングガイドライン旧URL | smarthr.design/products/contents/writing-guideline/ | 404 未取得 |
| SmartHR エラーメッセージ（推測URL 2件） | .../ui-text/error-message/, .../idiomatic-usage/error-message/ | 404 未取得（正URL /error-messages/overview/ は取得成功） |
| GOV.UK "use clear language"（推測URL） | .../writing-guidelines/use-clear-language/ | 404（正URL /clear-language/ は取得成功） |

注意: 取得は要約抽出モデルを介しているため、引用は取得結果に含まれていた文言をそのまま転記したもの。一言一句の照合が必要な場合は原典を再確認すること。

---

## 事実観察(ガイド別)

### MC-01: Mailchimp Content Style Guide — Voice and Tone
- 出典: https://styleguide.mailchimp.com/voice-and-tone/ （取得成功）
- 観察された事実:
  - Voice と Tone の区別: "You have the same voice all the time, but your tone changes."（声は常に同じだが、トーンは状況で変わる。友人と上司で話し方が変わる比喩）
  - 自らを "experienced and compassionate business partner"（経験豊かで思いやりのあるビジネスパートナー）と位置づける。
  - 平明さ最優先: "We strip all that away and value clarity above all."
  - 温かさ: "We relate to customers' challenges and passions and speak to them in a familiar, warm, and accessible way."（顧客の課題と情熱に共感し、親しみやすく温かい言葉で話す）
  - 専門家の翻訳者: "Only experts can make what's difficult look easy, and it's our job to demystify B2B-speak."
  - ユーモア: "Our sense of humor is straight-faced, subtle, and a touch eccentric."（乾いた、控えめなユーモア）。ただし "Feel free to be funny when it's appropriate and when it comes naturally to you." かつ "forced humor can be worse than none at all."（無理なユーモアは無いより悪い）
  - 読者の心理状態への配慮: "Consider the reader's state of mind."（キャンペーンを終えて安堵しているのか、混乱して助けを求めているのか）
  - 励まし: "every word we say informs and encourages. We impart our expertise with clarity, empathy, and wit."
- 我々への示唆: 「声」は固定し、学習者の感情状態（初挑戦の不安/完了の達成感）ごとにトーンを設計する。ユーモアは自然に出るときだけ。

### GOV-01: GOV.UK Writing to GOV.UK standards — Use clear language
- 出典: https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ （取得成功。旧URL gov.uk/guidance/content-design/writing-for-gov-uk からの移転先）
- 観察された事実:
  - "Plain English is mandatory for all of GOV.UK"（平易な英語は全ページで必須）。イングランドの成人の6人に1人が読み書きに大きな困難を抱えることが根拠。
  - 文の長さ: "Try to split up sentences that are over 25 words long."（25語を超える文は分割）。段落は5文以内。
  - 専門用語: 使う場合は "you just need to explain what they mean the first time you use them"（初出時に必ず説明）。
  - 語彙: 'buy' > 'purchase'、'help' > 'assist'、'about' > 'approximately' のように簡単な語を選ぶ。"-ion" "-ment" で終わる名詞化語は避ける。否定の短縮形（can't, don't）は読みにくいので避ける。
  - 高リテラシー層も平易な言葉を好む（速く理解できるため）。
  - "must" は法的義務、"need" は手続き上の必要、"can" は任意の行動に使い分ける。
- 我々への示唆: 「読みやすさは初心者だけのためではない」が実証ベースで明言されている。文長の数値基準（25語≒日本語なら概ね50〜60字目安）を持つ。

### GOV-02: GOV.UK — Use the right tone
- 出典: https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/right-tone/ （取得成功）
- 観察された事実:
  - "Address the user as 'you' where possible."（可能な限り「あなた」と直接呼びかける。例: "Pay your car tax"）
  - "incisive (friendliness can lead to a lack of precision and unnecessary words) – but remain human (not a faceless machine)"（切れ味よく——馴れ馴れしさは正確さを損なう——しかし顔のない機械にはならない）
  - "Write conversationally. Picture your audience and write as if you were talking to them one-to-one, but with the authority of someone who can actively help."（1対1で話すように、ただし実際に助けられる者の権威をもって書く）
  - "There's usually no need to say 'please' or 'please note'"（過剰な丁寧語は不要）
  - ブロック大文字は「叫んでいる」ように読めるので避ける。受動態を避け能動態を使う。
- 我々への示唆: 「温度」とは装飾的なフレンドリーさではなく、「1対1で話す + 実際に助けられる確かさ」の組み合わせ。

### PL-01: Shopify Polaris — Voice and tone
- 出典: https://polaris-react.shopify.com/content/voice-and-tone （取得成功。polaris.shopify.com からの移転先）
- 観察された事実:
  - "Use plain language"。短縮形を使う（"don't" not "do not"）。読解レベルの目安として7th-grade reading level（米国基準で12〜13歳相当）が挙げられていた。
  - "Start sentences with verbs so they feel like actionable instructions"（動詞から始めて行動可能な指示にする。"you can add apps" ではなく "add apps"）
  - リーンな文章: 明瞭さに必要な情報だけを載せ、繰り返しを容赦なく削る。
  - 人間らしさの検証法: "Read it out loud. Does it sound like something a human would say?"（声に出して読んで、人が言いそうか確かめる）
- 我々への示唆: 「声に出して読むテスト」は日本語コピーにもそのまま使える実践的チェック。

### PL-02: Shopify Polaris — Error messages
- 出典: https://polaris-react.shopify.com/content/error-messages （取得成功）
- 観察された事実:
  - "Explain what's wrong and what the merchant needs to do"（何が起きたか+何をすべきかを説明）
  - "Don't overapologize or bring 'us'/'we' into the conversation unless Shopify caused the problem."（過剰に謝らない。自社起因でない限り「私たち」を持ち込まない）
  - "Avoid error jargon like 'invalid.'"（"invalid" のようなエラー専門語を避ける）
  - 具体性: "There are 2 errors on this page" ではなく "To save this product, make 2 changes" のように解決に向けた表現にする。
  - 構成: 見出し（エラーの影響を明示・任意）+ 本文（問題と解決経路）+ CTA（任意）。エラーは問題のフィールドの近くに表示。
  - "Help merchants avoid mistakes in the first place."（そもそもミスを防ぐ設計を優先）
- 我々への示唆: エラー文は「謝罪」でも「診断」でもなく「次の一歩の提示」。

### AT-01: Atlassian Design System — Voice and tone principles
- 出典: https://atlassian.design/content/voice-and-tone-principles/ （直接取得失敗 → r.jina.ai プロキシ経由で取得成功）＋ 検索結果スニペット（WebSearch）
- 観察された事実:
  - 声の3特性: **Bold**（"motivating teams with the right amount of support at the right time"）、**Optimistic**、**Practical, with a wink**（実用的、ただし少しの遊び心）。
  - 検索結果より: 声の位置づけは「チームの一員」— "that friend or colleague who is always up on new trends and wants to be helpful"。書き方の姿勢は "as if you are explaining to your friend how to travel somewhere you've visited regularly."（自分が何度も行った場所への行き方を友人に説明するように）
  - ユーザーの感情状態でトーンを変える: 混乱・フラストレーション時（新規ユーザー、エラー時）は「大胆さを抑え、より手順的（prescriptive）に」。圧倒・ストレス時（締切、エラーでブロック）は実用性重視で "Be on the lookout for opportunities where we can offer a helping hand."
  - エラー時: "Write as a knowledgable member of the team. Show up at the right time and be open, humble, and warm."（開かれて、謙虚で、温かく）
  - Delight（喜び）の扱い: "Delight means little flourishes, not humor or being cheeky"（喜び=小さな彩りであって、ユーモアや軽口ではない）。信頼を築いた後にのみ。祝福は成功や進捗を祝う形で。グローバルな読者の理解可能性と、繰り返し表示される頻度を考慮せよ。
- 我々への示唆: 初心者向けトーン設計の核心。「混乱している人には手順を細かく」「祝福は小さな彩りで、ジョークにしない」。

### AP-01: Apple Human Interface Guidelines — Writing
- 出典: https://developer.apple.com/design/human-interface-guidelines/writing （直接取得失敗 → 公式JSON https://developer.apple.com/tutorials/data/design/human-interface-guidelines/writing.json で取得成功）
- 観察された事実:
  - 平易さ: "Choose words that are easily understood... If you can use fewer words, do so." / "Write for everyone... Choose simple, plain language and write with accessibility and localization in mind, avoiding jargon"
  - 所有代名詞は控えめに: "'Favorites' conveys the same message as 'Your Favorites,' and is more succinct."
  - "we" を避ける: "Avoid using 'we' altogether... 'We're having trouble loading this content.' Something like 'Unable to load content' is much clearer."
  - トーンは状況で変える: "vary your tone based on the situation."（転倒検出は率直に、Activity達成は "You set a personal record for your longest daily Move streak, 35 days!" と祝福調に）
  - エラー: "display it as close to the problem as possible, avoid blame, and be clear about what someone can do to fix it. For example, 'That password is too short' isn't as helpful as 'Choose a password with at least 8 characters.'"（責めず、直し方を示す。「短すぎる」より「8文字以上にしてください」）
  - エラーでのユーモア禁止: "Interjections like 'oops!' or 'uh-oh' are typically unnecessary and can sound insincere."（"おっと!" は不誠実に響く）
  - 肯定形で書く: "Use only letters for your name" is better than "Don't use numbers or symbols."
  - ボタンは動詞で、気取らない: "just saying 'Send' often works better than 'Let's do it!'" / リンクに "Click here" を使わない。
- 我々への示唆: 「祝福は具体的な事実（記録35日!）で行う」「エラーは否定形でなく、やるべきことの肯定形で書く」が最も転用しやすい。

### MD-01: Material Design 3 — UX writing best practices
- 出典: https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices （r.jina.ai プロキシ経由で取得成功）
- 観察された事実:
  - "UI text should be understandable by anyone, anywhere."
  - 結果を先に伝える: "Tell users what will happen if they take an action and how they can undo it."（操作の結果と取り消し方法を伝える）
  - "Emphasize the results of the user's potential action in neutral, direct language. Avoid cautions or warnings that might sound alarming, intimidating, or condescending."（威圧的・見下すような警告文を避ける）
  - 走査性: "Use headings and subheads to prioritize and group information"
  - "Use sentence-style capitalization"（文頭のみ大文字）
  - 略語を避ける: "Spell out words whenever possible. Shortened forms of words can be difficult for people to understand and screen readers to read."
  - 取得内容にはユーモアと詳細なエラー文の項目は含まれず（未確認）。
- 我々への示唆: 「脅さない・見下さない」中立で直接的な言葉、という警告文の基準。

### SH-01: SmartHR Design System — ライティングスタイル(基本的な考え方)
- 出典: https://smarthr.design/products/contents/writing-style/ （取得成功。日本語一次情報）
- 観察された事実:
  - 冗長表現の回避: 「ユーザーに簡潔明瞭に伝えるため、『することができる』などの冗長な表現は極力避けましょう」（「削除を行う」より「削除する」）
  - 敬語の抑制: 「敬語表現を多用して、情報が伝わりづらくならないように配慮しましょう」（「◯◯をご確認いただけますようお願いいたします」より「◯◯を確認してください」）
  - ひらがなの活用: 「漢字より平仮名にしたほうが読みやすい場合は平仮名を用いて」。SmartHRのパーソナリティ「誠実・ポジティブ・わかりやすい・親しみやすい」の表現手段。ただし「平仮名にしすぎないように注意」。
  - カタカナ語: 「安易に使用しないようにしましょう」。理由は「ユーザーごとに慣れ・不慣れだけでなく、意味の定義の振れ幅が漢字語以上に大きい」ため。
  - 一般的な語彙: 「辞書に載っている一般的な言葉を使いましょう」（社内用語・専門用語を避ける）
  - 表現の統一: 「同じ意味のものを別の単語や言い回しで表現するのは避け」
  - 格助詞を省略しない: 「『が』『の』『を』『に』など格助詞は省略せずに記載しましょう」（「項目名変更します」ではなく「項目名を変更します」）
- 我々への示唆: 日本語UIでの「温度と平易さ」の具体技術。敬語の重ねすぎはむしろ分かりにくさ（=不親切）になる、という転倒が重要。

### SH-02: SmartHR Design System — エラーメッセージの基本的な考え方
- 出典: https://smarthr.design/products/contents/error-messages/overview/ （取得成功）
- 観察された事実:
  - 目的: 「ユーザーがメッセージを見て問題を解決でき、次の操作に進める状態にすることです。」メッセージがユーザーを混乱させたり不安にさせないことが重要。
  - 必須3要素: **事象**（ユーザー視点で何が起きたか）・**原因**（なぜ発生したか）・**対処**（どう解消するか）。
  - スペースが限られる場合の優先順位: **原因 > 対処 > 事象**（ユーザーの最終目標は「操作完了」であるため）。
- 我々への示唆: エラー文を書くときのチェックリスト（事象・原因・対処が揃っているか）としてそのまま使える。

### SH-03: SmartHR Design System — UIテキスト
- 出典: https://smarthr.design/products/contents/ui-text/app-writing/ （取得成功）
- 観察された事実:
  - 「ディスクリプションは敬体（です、ます調）を用いて、動詞まで書く」（体言止めにしない）
  - ボタンラベルは動詞の終止形。サ変動詞は「する」を省略（「追加する」ではなく「追加」）。
  - テキストリンクに「こちら」を使わず、遷移先が分かる具体的な言葉にする。
  - ツールチップは簡潔に。1文なら句点あり、単語のみなら句点なし。
- 我々への示唆: 説明文は「です・ます+動詞まで書く」、操作要素は簡潔な動詞、という粒度の使い分け。

---

## 帰納: 初心者向けライティング原則(事実→解釈を明示)

### 言葉-01: 声は一つ、トーンは相手の感情に合わせる
- 根拠観察: MC-01（"your tone changes" / 読者の心理状態を考える）、AT-01（混乱時は手順的に、ストレス時は helping hand）、AP-01（"vary your tone based on the situation"）
- 我々のスタイルガイドへの反映: プロダクトの人格定義は1つに固定。その上で「初挑戦(不安)/作業中(集中)/完了(達成感)/エラー(混乱)」の4状態ごとにトーン指針を書き分ける。特に初心者が混乱している場面では、励ましより先に**手順を細かく具体的に**示す（Atlassianの「大胆さを抑え prescriptive に」）。

### 言葉-02: 平易さには数値基準を持つ(1文の長さ・語彙・カタカナ語)
- 根拠観察: GOV-01（25語超は分割、段落5文以内、簡単な語を選ぶ、高リテラシー層も平易を好む）、PL-01（7th-grade相当、plain language）、SH-01（冗長表現・カタカナ語・敬語過多の回避、一般的な語彙）
- 我々のスタイルガイドへの反映: 「1文は短く（目安: 読点2つ以内/50〜60字以内)」「『することができる』禁止 → 『できます』」「カタカナ語・デザイン専門用語は初出時に必ず一言説明」を明文化。「上級者にも平易な文のほうが速い」（GOV.UK）を根拠として添え、"幼稚になるのでは"という社内の懸念に答える。

### 言葉-03: 「あなた」に1対1で、ただし助けられる者の確かさで話す
- 根拠観察: GOV-02（"Address the user as 'you'" / "talking to them one-to-one, but with the authority of someone who can actively help"）、AT-01（友人に道案内するように）、AP-01（所有代名詞は控えめに・"we"を避ける）
- 我々のスタイルガイドへの反映: 学習者への呼びかけは二人称の直接話法（「〜してみましょう」「あなたのデザイン」）。ただし日本語UIでは「あなたの」の多用は冗長になりうるため、Appleの「'Favorites'で足りるなら'Your Favorites'にしない」に倣い必要な時だけ。運営主語の「私たち」はエラー文では使わない。

### 言葉-04: エラーは「責めない+謝りすぎない+次の一歩」で書く
- 根拠観察: AP-01（"avoid blame" / 「8文字以上にしてください」の肯定形）、PL-02（"Don't overapologize" / "invalid"禁止 / "To save this product, make 2 changes"）、SH-02（事象・原因・対処の3要素、優先は原因>対処>事象）、MD-01（威圧的・見下す警告を避ける）
- 我々のスタイルガイドへの反映: エラー文テンプレートを「何が起きた(事象)+なぜ(原因)+どうすれば直る(対処)」で定義。禁止語: 「無効」「不正」「エラーが発生しました」だけで終わる文。否定形（「〜しないでください」）より肯定形（「〜してください」）。謝罪はこちらの障害のときだけ。

### 言葉-05: 祝福は「具体的な事実」で、小さく本気で
- 根拠観察: AP-01（"You set a personal record for your longest daily Move streak, 35 days!" — 数字入りの具体的祝福）、AT-01（"Delight means little flourishes, not humor or being cheeky" / 信頼構築後にのみ）、MC-01（"every word we say informs and encourages"）
- 我々のスタイルガイドへの反映: 課題完了時の祝福コピーは「すごい!」のような抽象的称賛ではなく、「最初のオブジェクトを配置できました」「3日連続で提出しています」のように**達成した事実を名指しする**。装飾は絵文字1つ程度の小さな彩りに留める。

### 言葉-06: ユーモアは自然に出たときだけ。エラー時は禁止
- 根拠観察: MC-01（"forced humor can be worse than none at all"）、AP-01（"oops!" は不誠実に響く / "Send" > "Let's do it!"）、AT-01（wink は慎重に。繰り返し見る文言・グローバル読者を考慮）
- 我々のスタイルガイドへの反映: ユーモア可の場面（オンボーディングの挨拶、完了画面）と禁止の場面（エラー、ローディング失敗、締切・提出まわり、何度も表示される文言）を表で定義。「おっと!」系の間投詞は全面禁止。

### 言葉-07: ボタンは動詞、説明は「です・ます」で動詞まで書く(日本語の型)
- 根拠観察: PL-01（"Start sentences with verbs" / 声に出して読むテスト）、AP-01（ボタンはほぼ常に動詞・"Click here"禁止）、SH-03（ボタン=動詞終止形・サ変は「する」省略、説明文=敬体で動詞まで、リンクに「こちら」禁止）、SH-01（格助詞を省略しない）
- 我々のスタイルガイドへの反映: UI要素ごとの文体マトリクスを作る — ボタン:「保存」「提出する」型 / 説明文: です・ます+体言止め禁止 / リンク: 遷移先が分かる語（「こちら」禁止）。仕上げチェックは「声に出して読んで、人が言いそうか」（Polaris）。

### 言葉-08: 脅さない・見下さない。結果と取り消し方を先に伝える
- 根拠観察: MD-01（"Avoid cautions or warnings that might sound alarming, intimidating, or condescending" / 操作の結果とundo方法を伝える）、GOV-02（過剰な「please note」不要、ブロック大文字=叫び）
- 我々のスタイルガイドへの反映: 破壊的操作（削除・リセット）の確認文は、危険を煽る言葉ではなく「何が起き、戻せるか/戻せないか」を中立に記述。初心者向け教材では特に「間違えても大丈夫」を構造（undo可能性の明示）で伝える。
