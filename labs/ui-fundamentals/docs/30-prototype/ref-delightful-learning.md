# 参考調査: 学習サービスの「魅力的で温度のある体験」設計

取得日: 2026-07-07
調査方法: WebSearch / WebFetch による実取得のみ。記憶からの記述なし。取得できなかったものは「未取得」と明記。

## 取得失敗ソース一覧
- `design.duolingo.com`(Duolingo公式ブランドガイドライン): ページ自体は存在するが JS レンダリングのためフェッチでは本文を取得できず。**未取得**(トップページ・/illustration/characters とも本文取得失敗)
- Duolingo 公式ブログの「初回オンボーディング/最初のレッスン設計」を直接扱う一次記事: 検索でヒットせず。**未取得**(ヒットしたのは Appcues / UserGuiding 等の第三者分析のみ → DL-08 で二次情報と明記して扱う)
- Calm のデザイン公式記事: 一次情報を確認できず。**未調査/未取得**
- Khanmigo の「人格設計プロセス」を語る Khan Academy 公式ブログ記事: 検索でヒットしたのは第三者記事が中心。公式サイト khanmigo.ai の記述のみ一次情報として採用(DL-06)

---

## 事実観察

### DL-01: Duolingo — キャラクター群の設計意図(公式ブログ「Building character」)
- 出典: https://blog.duolingo.com/building-character/ (取得成功)
- 観察された事実:
  - 学習者を動機づけるためのキャラクターセットを18ヶ月かけて開発。Greg Hartman の言: "One of our main goals at Duolingo is to make it easier for our learners to spend time within our product"
  - 方針は「現代的な人間だが quirky(風変わり)な個性を持つ」こと。ブランドは "The Duolingo brand continually walks the line between authentic and outrageous" と表現される
  - 全キャラクターはマスコット Duo の視覚言語(幾何学的シンプルさ・大きな目・独特な体型)を共有し、同一の世界観を構築
  - レッスンへの統合: キャラクターが翻訳対象の文を「話す」役で登場/**正解するとキャラクター固有の祝いアニメーションが再生**/連続正解時の "mid-lesson animations" で途中報酬を演出
- パターン2への示唆: ガイドキャラは「装飾」ではなく、正解時の反応・レッスン内の登場という**行動レベルでの接点**として設計されている。人格は"quirky"に振ることで愛着の対象になる。

### DL-02: Duolingo — ストリーク・マイルストーン演出(公式ブログ「Animating the Duolingo Streak」)
- 出典: https://blog.duolingo.com/streak-milestone-design-animation/ (取得成功)
- 観察された事実:
  - 旧デザイン(Duoが数字の風船を持つ)は「かわいいが祝祭感が足りない」ため刷新。「ビデオゲームのパワーアップのように Duo が変身する」案からフェニックスを採用
  - フェニックス採用の理由は普遍性: 「炎に包まれる」表現が万国共通でなく、"one of our most popular features to be as universally understood as possible" を目指した
  - アニメーションは複数回のラフを重ね、タイミング・「リズムとエネルギー」を重視して調整
  - 効果測定: この演出を見た**新規学習者の7日後残存率が +1.7%**。"more people are keeping their streaks alive, celebrating their milestones"。アプリを離れず達成を共有できるシェアカードも追加
- パターン2への示唆: 祝福演出は「かわいい」だけでは不十分で、**祝祭感(celebratory)の強度**が数値効果を持つ。演出はリテンション施策として A/B 検証されている。

### DL-03: Duolingo — ストリークと習慣科学・柔軟性(公式ブログ)
- 出典: https://blog.duolingo.com/how-duolingo-streak-builds-habit/ (取得成功)
- 観察された事実:
  - ストリークは行動心理学(同じ環境で繰り返すと行動が自動化する)に基づく設計
  - 感情の段階設計: 2日→3日は「50%の増加」で大きな達成感、200日→201日は0.5%なので別の動機(損失回避)が働く。段階により演出・動機づけを変えている
  - 挫折への配慮: ペンシルベニア大学と UCLA の研究(厳格なルールより適度な柔軟性が動機になる)を根拠に Streak Freeze を提供。上限を2つに増やした結果 DAU +0.38%
- パターン2への示唆: 祝福は「初期ほど頻繁に・大げさに」、継続後は「失いたくない資産」へと役割を変える。**失敗時の救済(Freeze相当)をセットで設計**することが継続の鍵。

### DL-04: Duolingo — ミスへのキャラクター反応と低プレッシャー設計(公式ブログ「Adventures」)
- 出典: https://blog.duolingo.com/adventures/ (取得成功)
- 観察された事実:
  - Adventures では採点方式ではなく、キャラクターが現実の会話のように反応する: ミスをすると "Oh, did you mean…?" と言って少し困った表情をする
  - 設計思想: "Every action is an opportunity to learn without the fear of making mistakes"(ミスを恐れず学べる機会としてすべての行動を扱う)
  - キャラクター(Junior、Zari、Lily 等)として実世界シナリオに没入し、文脈の中で語彙を習得
- パターン2への示唆: エラーフィードバックを「不正解の宣告」ではなく**人格を持った相手の自然な聞き返し**に変換すると、ミスの心理コストが下がる。

### DL-05: Duolingo — キャラクターの造形原則(公式ブログ・インターン記事)
- 出典: https://blog.duolingo.com/designing-new-characters-internship/ (取得成功)
- 観察された事実:
  - "Duolingo characters are constructed of simple geometric building blocks"(単純な幾何学ブロックの組み合わせで構築)
  - 色は主役が空間で目立つよう選定: "the colors could not clash with Vikram himself so that he would stand out in the space"
  - 背景キャラは "They had to be interesting, but not too wild as to distract from the main cast"(面白く、しかし主役の邪魔をしない)
  - キャラクターの生活背景(住まい等)を視覚化することで感情的つながり(emotional connection)を作る
- パターン2への示唆: 「親しみ」は幾何学的シンプルさ+抑制された脇役、という**視覚のヒエラルキー管理**から生まれる。ガイドキャラには生活感・背景設定を与えると愛着が増す。

### DL-06: Khan Academy — Khanmigo の人格・振る舞い(公式サイト)
- 出典: https://www.khanmigo.ai/ (取得成功)
- 観察された事実:
  - 答えを渡さない: "it guides learners to find the answer themselves"
  - 忍耐: "with limitless patience, it guides learners"
  - トーン: 保護者向け説明に "Like a good tutor, Khanmigo gently guides your child"(良い家庭教師のように優しく導く)
  - "ethically designed with safety and learning as a top priority"
- パターン2への示唆: AI ガイドの人格は「答えない・急かさない・優しく導く」の3点で規定される。**「無限の忍耐」は人間の教師に対する明確な差別化価値**として打ち出されている。
- 補足(二次情報): 検索結果上では「ソクラテス式(質問で考えさせる)を明示的にペルソナ設計の参照にした」という記述が複数の第三者記事(Freethink 等)にあるが、Khan Academy の一次記事としては未取得。

### DL-07: Brilliant — マスコット「Koji」の設計(公式ブログ+VP of Design 本人の記事)
- 出典1: https://blog.brilliant.org/a-world-class-tutor-in-every-home/ (取得成功・公式)
- 出典2: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486 (取得成功・著者は Brilliant VP of Design の Peter Cho 本人)
- 観察された事実:
  - 設計意図: "we wanted a new mascot who could help lower the stakes for learners and act as a natural cheerleader"(学習者の心理的な賭け金を下げ、自然な応援団になる)
  - 設定: "a sentient particle born from the Big Bang, and your guide to the Brilliant universe"(ビッグバンから生まれた知覚を持つ粒子)
  - チューターとしての行動規範: "Koji asks instead of tells, builds confidence instead of dependency, and never, ever just hands you the answer."
  - Koji はレッスン画面の内容を「見る」ことができ、グラフへの注釈や中間問題の挿入など**テキストではなくビジュアルで**支援する(公式は「世界初の graphical tutor」と表現)
  - 音声は当初オプション想定だったが、テストで必須と判明。助けを求める心理的ハードルを下げるため。ユーザーの声: "It doesn't feel as lonely when I get stuck."(詰まっても孤独に感じない)
  - ジェネリックなヘルプボタンではなく Koji という人格を介すことで、ユーザーは失敗や質問により積極的になった
  - ビジュアル: ワードマークは "composed of rounds and squared off corners, echoing the shapes of our illustration style"。CTA には "a new pear color spectrum" を導入。ブランド全体で "fun, vitality, and levity"(楽しさ・生命力・軽やかさ)を体現
- パターン2への示唆: **同じヘルプ機能でも「人格を通すこと自体」が行動を変える**(質問・失敗への抵抗が下がる)。「詰まったときに孤独でない」は学習体験の温度の核心。角丸・軽い色は人格と連動したシステム全体の言語。

### DL-08: Duolingo — 初回オンボーディング(※公式一次情報は未取得・二次情報)
- 出典: 検索結果より https://goodux.appcues.com/blog/duolingo-user-onboarding 、https://userguiding.com/blog/duolingo-onboarding-ux 等(第三者分析。公式ブログ記事は**未取得**)
- 観察された事実(二次情報として):
  - サインアップ前に最初のレッスンを実際に体験させる(「学び方を説明する」のではなく「学ばせる」)構成が第三者分析で繰り返し報告されている
  - 「初めて学ぶ」か「少し知っている」かを最初に尋ね、後者にのみ配置テストを提示する分岐が報告されている
  - 「Don't worry, mistakes are part of learning.」という共感メッセージの存在が第三者記事で言及されている(公式一次ソースでの確認は未取得)
- パターン2への示唆: **一次情報で裏取りできていない**ため、採用する場合は自分たちで実アプリを触って確認するべき項目。方向性(説明より体験を先に/テスト感の除去)は複数ソースで一致。

### DL-09: Headspace — 温かさのデザイン哲学(Apple Developer 公式「Behind the Design」)
- 出典: https://developer.apple.com/news/?id=fkfnhq8u (取得成功。Apple 公式による Headspace SVP へのインタビュー)
- 観察された事実:
  - 核概念は「非神秘化」: "Demystification is a word we use a lot. Mindfulness and mental health can seem complex, perhaps mystical, maybe even inaccessible. So how do we make it approachable and friendly?"(Jeff Birkeland, SVP)
  - "I think the root of our success from the very beginning was creating a warm feel and brand."(成功の根源は最初から温かい感触とブランドを作ったこと)。黄色い花のイラスト、オレンジ背景など視覚的な温かさ
  - 複雑さの隠蔽: "There's still simplicity at the surface. But there's an incredible depth of content underneath."(表面はシンプル、下に深さ)。Today タブは時間帯に応じた1タップアクセス、Explore タブに膨大なライブラリ
  - 記事の結論的記述: "An app that feels warm, friendly, and easy to use can provide approachable support for tough issues."
- パターン2への示唆: 扱うテーマが難しい/不安を伴うほど、UIは温かく単純にする。**「温かさ」は装飾でなく、難しいテーマへの入口を開くための機能**。深さは隠して段階的に見せる。

---

## 帰納された「魅力」の設計原則(事実→解釈を明示)

### 魅力-01: ガイドは「機能」ではなく「一緒にいる存在」として設計する
- 根拠観察: DL-07(Koji: 人格を介すと質問・失敗への抵抗が下がる/"It doesn't feel as lonely when I get stuck.")、DL-06(Khanmigo: gently guides / limitless patience)、DL-01(Duoたち: 学習者が愛着を持つ対象として18ヶ月かけ開発)
- 解釈: 3サービスとも、ヘルプやフィードバックを匿名のUIでなく一貫した人格に担わせている。効果の中心は「情報の伝達」ではなく「孤独の解消」と「賭け金(stakes)の引き下げ」。
- 我々への適用案: ガイドキャラに (1)名前と簡単な背景設定、(2)行動規範(答えを渡さない/急かさない/まず共感する)、(3)詰まった時に最初に出てくる役、の3点を定義する。ヘルプボタンをキャラの発話に置き換える。

### 魅力-02: 祝福は「頻度は初期に厚く、強度はマイルストーンに集中」
- 根拠観察: DL-02(マイルストーン演出刷新で新規7日残存 +1.7%。「かわいい」から「祝祭的」へ)、DL-03(2日→3日は50%増の達成感、後期は損失回避へ役割転換)、DL-01(正解ごとのキャラ固有アニメ+mid-lesson animations)
- 解釈: Duolingoは祝福を3層で運用している — ①毎問の小さな反応(キャラアニメ)、②レッスン途中の連続正解演出、③節目のフルスクリーン祝祭。全部を派手にせず、希少性で強度を管理している。
- 我々への適用案: 「正解時の小反応/セクション完了の中演出/コース節目の大演出」の3層を定義。大演出はラフを複数回作り「リズムとエネルギー」を磨く(静止画の流用にしない)。初回〜3回目の完了は特に厚く祝う。

### 魅力-03: ミスの心理コストを「人格の反応」で下げる
- 根拠観察: DL-04(キャラが "Oh, did you mean…?" と困った顔で聞き返す/"without the fear of making mistakes")、DL-07(Koji が builds confidence instead of dependency)、DL-08(「mistakes are part of learning」系メッセージ・二次情報)
- 解釈: 不正解の扱いを「×判定」から「会話相手の自然な聞き返し」へ変換するのが共通パターン。評価者ではなく対話相手として振る舞わせることで、テスト感を除去している。
- 我々への適用案: 誤答フィードバックの文言をガイドキャラの一人称セリフで書く(「違います」→「ん、こういうこと?もう一回見てみよう」)。初回体験の冒頭で「これはテストではない」ことをキャラ自身に宣言させる。※初回メッセージングの具体は一次情報未取得のため、実アプリ観察で裏取りしてから確定する。

### 魅力-04: 失敗への「救済装置」を祝福とセットで用意する
- 根拠観察: DL-03(Streak Freeze。「厳格さより柔軟性が動機になる」研究を根拠に導入、上限拡大で DAU +0.38%)
- 解釈: 継続演出を強くするほど、途切れた時の挫折も大きくなる。Duolingoは祝福(資産化)と救済(保険)を必ず対で設計している。
- 我々への適用案: 連続学習の演出を入れるなら、途切れても1回は無条件で復元できる仕組み(または「途切れ」を責めないコピー)を同時に実装する。

### 魅力-05: 温かさの視覚言語 = 幾何学的シンプル+角丸+明るく軽い色、そして「主役を立てる抑制」
- 根拠観察: DL-05(幾何学ブロック構成/主役が目立つ配色/脇役は控えめに)、DL-07(rounds and squared off corners、pear color、fun/vitality/levity)、DL-09(黄色い花・オレンジ背景の warm feel、表面のシンプルさ)
- 解釈: 3社に共通するのは「丸み・単純な形・明るい色」だが、それ以上に一貫しているのは**視覚的抑制**(表面はシンプルに、賑やかさは主役=学習コンテンツやキャラを立てるために管理する)という規律。
- 我々への適用案: 角丸・イラストを足す前に「この画面の主役は何か」を決め、装飾は主役とクラッシュしない色に制限する。深いコンテンツは Headspace 式に「表面1タップ・奥に深さ」で隠す。

### 魅力-06: テーマが不安を伴うほど、入口は「非神秘化」する
- 根拠観察: DL-09(Demystification: 難解に見えるテーマを approachable and friendly にする)、DL-07(lower the stakes for learners)
- 解釈: 学習・メンタルヘルスのような「自分にできるか不安」な領域では、温かいトーンと単純な入口が「不安の先回り」として機能する。専門性の誇示は逆効果。
- 我々への適用案: 初回画面で専門用語・全体マップ・評価要素を見せない。「今日はこれだけ」を1タップで提示し、キャラが平易な言葉で案内する。

---

## 最終報告(要約)
- 確認できたサービス: 4(Duolingo、Brilliant、Khan Academy/Khanmigo、Headspace)。一次情報として取得成功したソース: 9本
- 最重要の発見: (1) Brilliant 公式が「ジェネリックなボタンでなく人格を介すこと自体が、質問・失敗への抵抗を下げる」と明言("It doesn't feel as lonely when I get stuck.")。(2) Duolingo は祝福演出の強度を A/B 検証しており、マイルストーン演出の刷新だけで新規7日残存 +1.7% という数値根拠を公開している
- 取得失敗: design.duolingo.com(JSレンダリングで本文未取得)、Duolingo 初回オンボーディング設計の公式一次記事(存在を確認できず。DL-08 は二次情報と明記)、Calm(未調査)
