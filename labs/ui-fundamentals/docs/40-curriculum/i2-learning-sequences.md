# I2: 学習順序の実例調査(UI/UX教育カリキュラム)

取得日: 2026-07-06
調査方法: WebFetch / WebSearch による実取得のみ。記憶からの記述なし。

## 取得失敗ソース一覧
- `freecodecamp.org/learn` および `/learn/2022/responsive-web-design/`(JSレンダリングのためページ本文が未取得)→ 代替として freeCodeCamp 公式ニュース記事(カリキュラム発表記事)から目次を取得
- `uxcel.com/courses/ux-design-foundations`(404)→ 正しいURL `uxcel.com/courses/design-foundations` で取得成功
- Refactoring UI は書籍実物の目次ページではなく `refactoringui.com` 掲載の目次を取得(公式サイト掲載内容)

---

## 事実観察(カリキュラム別)

### SEQ-01: Uxcel — コースカタログの並び(レベル別)
- 出典: https://uxcel.com/courses(取得成功)
- 観察された構成(難易度ラベルによる並び):
  - **Beginner**: UX Design Foundations / Color Psychology for UX/UI Design / Design Terminology / Introduction to Figma / Introduction to Design Systems
  - **Intermediate**: Common UX/UI Design Patterns & Flows / UX Writing / Mobile Design / Advanced UI Components / Core UI Components / Wireframing / Typography
  - **Advanced**: Accessibility Foundations / Design Composition / User Psychology / Product Discovery
- 注目点: **UIパターン(Common UX/UI Design Patterns & Flows)とUIコンポーネント(Core/Advanced UI Components)は Intermediate に配置**。Beginner は用語・色・ツール入門。

### SEQ-02: Uxcel — UX Design Foundations(入門コースの内部順序)
- 出典: https://uxcel.com/courses/design-foundations(取得成功)
- 観察された構成(Level 1〜6、各Level末にテスト):
  1. Level 1 Getting Started: What is UX Design? → UX Design Principles → **Intro to Color Theory → Intro to Typography**
  2. Level 2 Elements of Design I: Elements of UI Design → Color Properties → Image Terminology/Properties
  3. Level 3 Elements of Design II: Animation Theory & Motion → Icon Terminology → Intro to Shadows → Typographic Terms
  4. Level 4 Design Principles & Practices: 13 Core Visual Design Principles → Atomic Design(Brad Frost)→ 10 Usability Heuristics(Nielsen)
  5. Level 5 Devices & Layouts: **Intro to Design Layouts → Intro to Design Grids** → Devices & Screen Sizes
  6. Level 6 Working in UX/UI: Designer Roles → Deliverables → Intro to UX Copy → UX Processes & Research Methods → Intro to Information Architecture
- 注目点: **色・タイポが最初(Level 1)、レイアウト・グリッドは後半(Level 5)**。ビジュアル要素→原則→レイアウトの順。

### SEQ-03: Refactoring UI — 書籍の章構成
- 出典: https://www.refactoringui.com/(取得成功)
- 観察された構成(章の順):
  1. Starting from Scratch(「レイアウトではなく機能から始める」「ディテールは後回し」「選択肢を制限する」)
  2. **Hierarchy is Everything**(階層がすべて)
  3. **Layout and Spacing**(余白から始める・スペーシングシステム)
  4. Designing Text(タイプスケール・行長・行間)
  5. Working with Color(HSL・シェード定義)
  6. Creating Depth(光源・影・エレベーション)
  7. Working with Images
  8. Finishing Touches(空状態・アクセントボーダー等の仕上げ)
  9. Leveling Up
- 注目点: **階層→レイアウト/余白が先、色は5章と後**。Uxcelと逆で「構造が先、ビジュアルが後」。

### SEQ-04: Designlab — UX Academy Foundations(8ユニット)+ 本編
- 出典: https://designlab.com/foundations(取得成功)
- 観察された構成(Foundations、4〜8週):
  1. Visual Design Basics
  2. UI Fundamentals
  3. Images, Icons, & Elements
  4. Color & Typography
  5. Interaction and Input
  6. Responsive Design
  7. Final Design Challenge(プロジェクト)
  8. Intro to UX Design(オプション)
- 本編 UX Academy Phase 1: Design is... → User Research → Ideation → Information Architecture → Interaction Design → **User Interface Design(6番目)** → Prototyping and Testing(プロジェクト)→ Mobile First Page(プロジェクト)
- Phase 2(UIスキル強化): **Copywork Exercises(模写)→ Creative Design Challenges → Design Concepts → Real-World Applications**
- 注目点: Foundationsでは**ビジュアル基礎→UI基礎→色タイポ→インタラクション→レスポンシブ**の順で、プロジェクトは最終ユニット。UI強化フェーズの最初が「模写」。

### SEQ-05: Google UX Design Certificate(Coursera、7コース)
- 出典: https://www.coursera.org/professional-certificates/google-ux-design(取得成功)
- 観察された構成:
  1. Foundations of User Experience (UX) Design
  2. Start the UX Design Process: Empathize, Define, and Ideate
  3. **Build Wireframes and Low-Fidelity Prototypes**
  4. Conduct UX Research and Test Early Concepts
  5. **Create High-Fidelity Designs and Prototypes in Figma**(モックアップ・デザインシステム)
  6. Build Dynamic User Interfaces (UI) for Websites(情報設計・レイアウト・ポートフォリオプロジェクト)
  7. Design a User Experience for Social Good & Prepare for Jobs(プロジェクト+就職準備)
- 注目点: **ローファイ(ワイヤーフレーム)→テスト→ハイファイ(ビジュアル)**の順。ビジュアルデザインはコース5まで登場しない。プロジェクトはコース6・7。

### SEQ-06: Interaction Design Foundation — 初心者向けコースの並び
- 出典: https://ixdf.org/courses および https://ixdf.org/courses/user-experience-the-beginner-s-guide(いずれも取得成功。interaction-design.org は ixdf.org へ301リダイレクト)
- 観察された構成(初心者向けコース群): User Experience: The Beginner's Guide(64レッスン)→ Mobile UX Design: The Beginner's Guide → Game UX Design → Object-Oriented UI Design → AI for Designers
- Beginner's Guide 内部: Lesson 1 What is UX Design? → Lesson 2 How to Think Like a UX Designer → Lesson 3 UX Methods and Tools — **The Problem Space** → Lesson 4 — **The Solution Space** → Lesson 5 How to Design in the Real World
- 注目点: 「問題空間→解決空間」の順序を明示的にレッスン構造に採用。UIパターンやビジュアルは入門コースにほぼ登場しない。

### SEQ-07: CareerFoundry — UX Design Program(3フェーズ)
- 出典: https://careerfoundry.com/en/courses/become-a-ux-designer/(取得成功)
- 観察された構成:
  - Phase 1 UX Fundamentals: Intro to UX & Design Thinking → User Research → Personas → Information Architecture → Wireframing & Prototyping → Usability Testing → Presenting(8タスク+最終デザインプロジェクト)
  - Phase 2 UX Immersion(6つのAchievement、各ポートフォリオプロジェクト付き):
    1. Thinking like a UXer
    2. Understanding the User(リサーチ・ペルソナ・ジャーニーマップ・IA・カードソート)
    3. **Prototyping & UI Fundamentals**(ナビゲーションパターン→デザインパターン→ヒューリスティクス→ビジュアル原則→ローファイスケッチ→グリッド→ミッドファイ→デザインシステム→ハイファイ)
    4. Usability Testing
    5. Refining a Design for Handoff(アクセシビリティ・レスポンシブ・ドキュメント)
    6. End-to-End Design(ポートフォリオ)
  - Phase 3 専門化の選択肢B「UI for UX Designers」: Achievement 1 が **Composition & Visual Design(レイアウト・グリッド・階層・スペーシング→タイポ→色→画像)**、Achievement 2 が Advanced UI & Handoff
- 注目点: **UIパターン(ナビ・デザインパターン)はAchievement 3の冒頭**、つまりリサーチとIAの後・プロトタイピングの直前に登場。UI専門コースでも**レイアウト/グリッド/階層が先、色は後**。

### SEQ-08: freeCodeCamp — Responsive Web Design(20プロジェクト構成)
- 出典: https://www.freecodecamp.org/news/responsive-web-design-certification-redesigned/(取得成功。/learn 直下ページは未取得)
- 観察された構成(プロジェクト駆動、順番どおり):
  1. Learn HTML by Building a Cat Photo App
  2. Learn Basic CSS by Building a Cafe Menu
  3. Learn About CSS Colors by Creating a Marker Set
  4. **Learn HTML Forms by Building a Registration Form**(フォームが4番目)
  5. Certification Project: Build a Survey Form
  6. Learn the CSS Box Model by Building a Rothko Painting
  7. Learn CSS Flexbox by Building a Photo Gallery
  8. Learn Typography by Building a Nutrition Label
  9. Learn Accessibility by Building a Quiz
  10. Certification Project: Build a Tribute Page
  11〜16. Pseudo Selectors → Intermediate CSS → Responsive(Piano)→ 認定PJ(Technical Documentation)→ CSS Variables → **CSS Grid(Magazine、16番目)**
  17. Certification Project: Build a Product Landing Page
  18〜19. CSS Transforms(Penguin)→ CSS Animations(Ferris Wheel)
  20. Certification Project: Build a Personal Portfolio Webpage
- 注目点: 全項目がプロジェクト形式(「作りながら学ぶ」)。色は3番目と早く、Grid(レイアウト)は16番目と遅い。認定プロジェクトが約4項目ごとに挟まる。

---

## 帰納された順序の傾向(事実→解釈を明示)

### 順序-01: ローファイ→ハイファイ(忠実度の階段)
- 根拠観察: SEQ-05(ワイヤーフレーム=コース3、ハイファイ=コース5)、SEQ-07(ローファイスケッチ→ミッドファイ→デザインシステム→ハイファイの明示的順序)、SEQ-04(Prototyping前にIA・Interaction Design)
- 解釈: UX系総合カリキュラムで最も一貫した順序。ビジュアルの磨き込みは「構造とフローが検証された後」に置かれる。8件中、総合UXプログラム(Google・CareerFoundry・Designlab本編)すべてが採用。

### 順序-02: UIパターン(ナビ・フォーム・カード)は「中盤」に登場
- 根拠観察: SEQ-01(Patterns & Flows は Intermediate)、SEQ-07(ナビ/デザインパターンは6 Achievementsのうち3番目の冒頭)、SEQ-08(フォームは20項目中4番目=例外的に早いが、これはHTML実装文脈)
- 解釈: デザイン教育ではUIパターンは「基礎用語・原則の後、ハイファイ制作の前」の中盤に置かれる。例外はfreeCodeCampで、実装(コード)主導だとフォームが最初期に来る——「作る対象」としてのパターンは早く、「設計判断」としてのパターンは中盤、という使い分けが読み取れる。

### 順序-03: 「構造が先」派と「ビジュアルが先」派の分岐
- 根拠観察:
  - 構造(階層・レイアウト・余白)が先: SEQ-03(Refactoring UI: 階層2章・レイアウト3章、色5章)、SEQ-07 UI専門コース(レイアウト→グリッド→階層→スペーシング→タイポ→色)
  - ビジュアル(色・タイポ)が先: SEQ-02(Uxcel: 色・タイポがLevel 1、レイアウト・グリッドがLevel 5)、SEQ-04 Foundations(Visual Design Basics→Color & Typographyが前半、Responsiveが後半)
- 解釈: 「実務でUIの質を上げる」系(Refactoring UI、CareerFoundryのUI専門)は構造優先。「用語と目を鍛える入門」系(Uxcel、Designlab Foundations)はビジュアル優先。教材の目的(判断力強化 vs 語彙獲得)で順序が反転している。

### 順序-04: プロジェクト/実践課題の挿入位置は2型
- 根拠観察:
  - 末尾集中型: SEQ-04 Foundations(Final Design Challengeが7/8ユニット目)、SEQ-05(ポートフォリオPJはコース6・7)、SEQ-06(Real Worldが最終レッスン)
  - 定期挿入型: SEQ-08(約4項目ごとに認定プロジェクト)、SEQ-07(各Achievementにポートフォリオプロジェクト付随)
- 解釈: 短期入門は「学んでから最後に作る」、長期プログラムとコード系は「章ごとに作る」。模写(Copywork、SEQ-04 Phase 2の最初)がUIスキル強化の入口に置かれる例もある。

### 順序-05: 最初の3トピックは「定義・原則・用語」で始まる
- 根拠観察: SEQ-02(What is UX → Principles → Color Theory)、SEQ-05(Foundations → Empathize/Define → Wireframes)、SEQ-06(What is UX → How to Think → Problem Space)、SEQ-07(Intro to UX & Design Thinking → User Research → Personas)
- 解釈: 8件中、書籍(Refactoring UI「機能から始めろ」)とfreeCodeCamp(いきなり構築)を除く全てが「概念定義→考え方→手法」で開始。逆に実践特化型ほど冒頭から手を動かさせる。

### 順序-06: アクセシビリティ・レスポンシブは「後半の仕上げ」枠
- 根拠観察: SEQ-01(Accessibility FoundationsはAdvanced)、SEQ-07(アクセシビリティ・レスポンシブはAchievement 5「Handoff前の洗練」)、SEQ-04(Responsive Designは6/8ユニット目)、SEQ-08(Accessibilityは9番目=中盤)
- 解釈: 例外(Google Certはコース1でアクセシビリティに言及、freeCodeCampは中盤)はあるが、多数派は制作スキル習得後の「品質向上」段階に配置。
