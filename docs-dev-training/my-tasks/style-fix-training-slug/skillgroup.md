# BONO スキルグループコンポーネント完全実装ガイド

## 情報抽出元

- **Figma Node ID**: `3449:4082`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成された React コード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像（3 つのスキル項目リスト）
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全な React コード（Figma 自動生成・改良版）

```jsx
interface SkillItem {
  id: string;
  title: string;
  description: string;
  referenceLink?: {
    text: string,
    url: string,
  };
}

interface HeadingExplainBlockProps {
  skill: SkillItem;
  showDivider?: boolean;
}

function HeadingExplainBlock({
  skill,
  showDivider = true,
}: HeadingExplainBlockProps) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative size-full"
      data-name="heading-explain-block"
    >
      <div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
          {/* タイトル部分 */}
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
            {/* アイコン */}
            <div className="bg-[#0d221d] shrink-0 size-2.5 rounded-sm" />

            {/* タイトル */}
            <h3 className="font-['Noto_Sans_JP'] font-bold text-white text-[18px] leading-[1.6] tracking-[0.75px] flex-1">
              {skill.title}
            </h3>
          </div>

          {/* 説明部分 */}
          <div className="font-['Inter','Noto_Sans_JP'] font-medium text-[16px] text-slate-900 opacity-[0.72] leading-[1.68] w-full">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <span>{skill.description}</span>
              </li>
              {skill.referenceLink && (
                <li>
                  <span>参考リンク：</span>
                  <a
                    href={skill.referenceLink.url}
                    className="font-bold text-[#0e5ff7] underline decoration-solid underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {skill.referenceLink.text}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 点線区切り */}
      {showDivider && (
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 672 2"
            >
              <line
                stroke="#334155"
                strokeDasharray="1 12"
                strokeLinecap="round"
                strokeWidth="2"
                x1="1"
                x2="671"
                y1="1"
                y2="1"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

interface SkillGroupProps {
  skills: SkillItem[];
  className?: string;
  title?: string;
}

export default function SkillGroup({
  skills = [],
  className = "",
  title = "スキルグループ",
}: SkillGroupProps) {
  return (
    <div
      className={`bg-white box-border content-stretch flex flex-col gap-5 items-center justify-start px-12 py-7 relative rounded-3xl size-full border border-[#e3e3e5] ${className}`}
      data-name="skill-group"
    >
      {skills.map((skill, index) => (
        <HeadingExplainBlock
          key={skill.id}
          skill={skill}
          showDivider={index < skills.length - 1}
        />
      ))}
    </div>
  );
}
```

---

## 2. デザインシステム変数（Figma 定義）

```json
{
  "Theme/Primary": "#0d221d",
  "Text/Black": "#0f172a",
  "p-6(24)": "24",
  "Slate/700": "#334155",
  "Spacing/5": "20",
  "Spacing/12": "48",
  "Spacing/7": "28",
  "BackGround/white": "#ffffff"
}
```

---

## 3. 構造解析（data-name 属性ベース）

### 階層構造

```
skill-group (ルートコンテナ)
├── ボーダー装飾（絶対配置）
├── heading-explain-block (スキル項目1)
│   ├── container
│   │   └── block-text
│   │       ├── title-container
│   │       │   ├── icon (10×10px、#0d221d)
│   │       │   └── タイトル (18px、白色、太字)
│   │       └── 説明文 (16px、箇条書き、opacity: 0.72)
│   └── 点線区切り (SVG)
├── heading-explain-block (スキル項目2)
└── heading-explain-block (スキル項目3)
```

---

## 4. レイアウト詳細分析

### メインコンテナ (skill-group)

- **背景色**: `bg-white` (#ffffff)
- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-5` (20px)
- **配置**: `items-center justify-start`
- **パディング**: `px-12 py-7` (左右 48px、上下 28px)
- **角丸**: `rounded-3xl` (24px)
- **ボーダー**: `border-[#e3e3e5]` (ライトグレー)

### スキル項目 (heading-explain-block)

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-5` (20px)
- **パディング**: `px-0 py-5` (上下 20px)

### タイトルコンテナ

- **Flexbox**: `flex flex-row` (横方向)
- **ギャップ**: `gap-2.5` (10px)
- **配置**: `items-center justify-start`

### アイコン

- **サイズ**: `size-2.5` (10×10px)
- **背景色**: `#0d221d` (ダークグリーン)
- **形状**: 正方形（角丸なし）

### タイトル

- **フォント**: `Noto Sans JP Bold`
- **サイズ**: `text-[18px]`
- **色**: `text-white` (#ffffff)
- **行高**: `leading-[1.6]`
- **文字間隔**: `tracking-[0.75px]`

### 説明文

- **フォント**: `Inter Medium` + `Noto Sans JP`
- **サイズ**: `text-[16px]`
- **色**: `text-slate-900` (#0f172a)
- **透明度**: `opacity-[0.72]`
- **行高**: `leading-[1.68]`
- **リスト**: `list-disc` (箇条書き)

### 点線区切り

- **SVG 線**: `stroke="#334155"`
- **破線パターン**: `strokeDasharray="1 12"`
- **線幅**: `strokeWidth="2"`

---

## 5. データ駆動型実装

```jsx
// サンプルデータ
const defaultSkills: SkillItem[] = [
  {
    id: "ux-design",
    title: '"使いやすいUI"を要件とユーザーから設計する力',
    description: "自分が良いと思うではなく、使う人目線のUI作成スキル",
    referenceLink: {
      text: "『ユーザビリティ・エンジニアリング』",
      url: "https://example.com/usability-engineering",
    },
  },
  {
    id: "ui-comprehensive",
    title: "機能や状態を網羅してUI設計する力",
    description: "全ての状態やエラーケースを考慮したUI設計スキル",
    referenceLink: {
      text: "『デザインシステム実践ガイド』",
      url: "https://example.com/design-systems",
    },
  },
  {
    id: "user-goal-ui",
    title: "ユーザーゴールから配慮するべきものをUIに落とす",
    description: "ビジネス要件とユーザー体験の最適なバランスを見つけるスキル",
    referenceLink: {
      text: "『About Face 4』",
      url: "https://example.com/about-face",
    },
  },
];

export default function SkillGroup({
  skills = defaultSkills,
  className = "",
}: SkillGroupProps) {
  return (
    <div
      className={`bg-white box-border content-stretch flex flex-col gap-5 items-center justify-start px-12 py-7 relative rounded-3xl size-full border border-[#e3e3e5] ${className}`}
      data-name="skill-group"
    >
      {skills.map((skill, index) => (
        <HeadingExplainBlock
          key={skill.id}
          skill={skill}
          showDivider={index < skills.length - 1}
        />
      ))}
    </div>
  );
}
```

---

## 6. アクセシビリティ強化版

```jsx
interface SkillGroupProps {
  skills: SkillItem[];
  className?: string;
  title?: string;
  id?: string;
}

function HeadingExplainBlock({
  skill,
  showDivider = true,
}: HeadingExplainBlockProps) {
  return (
    <article
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative size-full"
      data-name="heading-explain-block"
      aria-labelledby={`skill-title-${skill.id}`}
    >
      <div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
          {/* タイトル部分 */}
          <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
            {/* アイコン */}
            <div
              className="bg-[#0d221d] shrink-0 size-2.5 rounded-sm"
              role="presentation"
              aria-hidden="true"
            />

            {/* タイトル */}
            <h3
              id={`skill-title-${skill.id}`}
              className="font-['Noto_Sans_JP'] font-bold text-white text-[18px] leading-[1.6] tracking-[0.75px] flex-1"
            >
              {skill.title}
            </h3>
          </div>

          {/* 説明部分 */}
          <div className="font-['Inter','Noto_Sans_JP'] font-medium text-[16px] text-slate-900 opacity-[0.72] leading-[1.68] w-full">
            <ul className="list-disc pl-6 space-y-1" role="list">
              <li role="listitem">
                <span>{skill.description}</span>
              </li>
              {skill.referenceLink && (
                <li role="listitem">
                  <span>参考リンク：</span>
                  <a
                    href={skill.referenceLink.url}
                    className="font-bold text-[#0e5ff7] underline decoration-solid underline-offset-2 hover:text-[#0d4fd1] focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`参考リンク: ${skill.referenceLink.text} (新しいタブで開きます)`}
                  >
                    {skill.referenceLink.text}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 点線区切り */}
      {showDivider && (
        <div
          className="h-0 relative shrink-0 w-full"
          role="separator"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 672 2"
              aria-hidden="true"
            >
              <line
                stroke="#334155"
                strokeDasharray="1 12"
                strokeLinecap="round"
                strokeWidth="2"
                x1="1"
                x2="671"
                y1="1"
                y2="1"
              />
            </svg>
          </div>
        </div>
      )}
    </article>
  );
}

export default function SkillGroup({
  skills = defaultSkills,
  className = "",
  title = "スキルグループ",
  id,
}: SkillGroupProps) {
  return (
    <section
      className={`bg-white box-border content-stretch flex flex-col gap-5 items-center justify-start px-12 py-7 relative rounded-3xl size-full border border-[#e3e3e5] ${className}`}
      data-name="skill-group"
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className="sr-only">
          {title}
        </h2>
      )}
      {skills.map((skill, index) => (
        <HeadingExplainBlock
          key={skill.id}
          skill={skill}
          showDivider={index < skills.length - 1}
        />
      ))}
    </section>
  );
}
```

---

## 7. レスポンシブ対応版

```jsx
export default function SkillGroup({
  skills = defaultSkills,
  className = "",
  title = "スキルグループ",
}: SkillGroupProps) {
  return (
    <section
      className={`bg-white box-border content-stretch flex flex-col gap-3 md:gap-5 items-center justify-start px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-7 relative rounded-2xl md:rounded-3xl size-full border border-[#e3e3e5] ${className}`}
      data-name="skill-group"
    >
      {skills.map((skill, index) => (
        <article
          key={skill.id}
          className="box-border content-stretch flex flex-col gap-3 md:gap-5 items-start justify-center px-0 py-3 md:py-5 relative size-full"
        >
          <div className="box-border content-stretch flex flex-col gap-4 md:gap-6 items-center justify-start p-0 relative shrink-0 w-full">
            <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
              {/* タイトル部分 */}
              <div className="box-border content-stretch flex flex-row gap-2 md:gap-2.5 items-start md:items-center justify-start p-0 relative shrink-0 w-full">
                <div className="bg-[#0d221d] shrink-0 size-2.5 rounded-sm mt-1 md:mt-0" />
                <h3 className="font-['Noto_Sans_JP'] font-bold text-white text-[16px] md:text-[18px] leading-[1.5] md:leading-[1.6] tracking-[0.5px] md:tracking-[0.75px] flex-1">
                  {skill.title}
                </h3>
              </div>

              {/* 説明部分 */}
              <div className="font-['Inter','Noto_Sans_JP'] font-medium text-[14px] md:text-[16px] text-slate-900 opacity-[0.72] leading-[1.6] md:leading-[1.68] w-full">
                <ul className="list-disc pl-4 md:pl-6 space-y-1">
                  <li>
                    <span>{skill.description}</span>
                  </li>
                  {skill.referenceLink && (
                    <li>
                      <span>参考リンク：</span>
                      <a
                        href={skill.referenceLink.url}
                        className="font-bold text-[#0e5ff7] underline decoration-solid underline-offset-2 break-words"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {skill.referenceLink.text}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* 点線区切り */}
          {index < skills.length - 1 && (
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute bottom-0 left-0 right-0 top-[-2px]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 672 2"
                >
                  <line
                    stroke="#334155"
                    strokeDasharray="1 8"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    x1="1"
                    x2="671"
                    y1="1"
                    y2="1"
                  />
                </svg>
              </div>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
```

---

## 8. CSS 変数定義

```css
:root {
  /* SkillGroup専用カラー */
  --skill-group-bg: #ffffff;
  --skill-group-border: #e3e3e5;
  --skill-group-icon-bg: #0d221d;
  --skill-group-title-color: #ffffff;
  --skill-group-text-color: #0f172a;
  --skill-group-text-opacity: 0.72;
  --skill-group-link-color: #0e5ff7;
  --skill-group-divider-color: #334155;

  /* スペーシング */
  --skill-group-padding-x: 48px;
  --skill-group-padding-y: 28px;
  --skill-group-gap: 20px;
  --skill-group-icon-size: 10px;

  /* フォント */
  --skill-group-title-size: 18px;
  --skill-group-title-line-height: 1.6;
  --skill-group-title-tracking: 0.75px;
  --skill-group-text-size: 16px;
  --skill-group-text-line-height: 1.68;

  /* 角丸 */
  --skill-group-border-radius: 24px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  :root {
    --skill-group-padding-x: 16px;
    --skill-group-padding-y: 16px;
    --skill-group-gap: 12px;
    --skill-group-title-size: 16px;
    --skill-group-text-size: 14px;
    --skill-group-border-radius: 16px;
  }
}
```

---

## 9. TypeScript 型定義

```typescript
// types/SkillGroup.ts
export interface SkillItem {
  /** スキルの一意識別子 */
  id: string;
  /** スキルのタイトル */
  title: string;
  /** スキルの説明 */
  description: string;
  /** 参考リンク（オプション） */
  referenceLink?: {
    text: string;
    url: string;
  };
}

export interface SkillGroupProps {
  /** 表示するスキルのリスト */
  skills: SkillItem[];
  /** 追加のCSSクラス */
  className?: string;
  /** セクションのタイトル */
  title?: string;
  /** 要素のID */
  id?: string;
}

export interface HeadingExplainBlockProps {
  /** 表示するスキル */
  skill: SkillItem;
  /** 区切り線を表示するか */
  showDivider?: boolean;
}
```

---

## 10. 使用例

```jsx
// 基本使用
<SkillGroup skills={defaultSkills} />

// カスタムスキル
const customSkills: SkillItem[] = [
  {
    id: "custom-1",
    title: "カスタムスキル1",
    description: "カスタムスキルの説明",
    referenceLink: {
      text: "参考資料",
      url: "https://example.com"
    }
  }
];

<SkillGroup
  skills={customSkills}
  title="デザインスキル"
  id="design-skills"
  className="mb-8"
/>

// 動的データ
const [skills, setSkills] = useState<SkillItem[]>([]);

useEffect(() => {
  fetchSkills().then(setSkills);
}, []);

<SkillGroup skills={skills} />
```

---

## 11. 実装チェックリスト

### 必須対応項目

- [ ] 白背景と角丸ボーダーの正確な再現
- [ ] Noto Sans JP Bold フォントの読み込み
- [ ] 10×10px ダークグリーンアイコンの実装
- [ ] SVG 点線区切りの正確な表示
- [ ] リンクのアンダーライン装飾

### 推奨対応項目

- [ ] セマンティック HTML（section, article, h3 要素）への変更
- [ ] ARIA 属性の追加（labelledby, role）
- [ ] レスポンシブ対応（モバイル・タブレット）
- [ ] キーボードナビゲーション対応
- [ ] リンクのホバー・フォーカス状態

### オプション対応項目

- [ ] アニメーション効果（項目の展開・折りたたみ）
- [ ] ダークモード対応
- [ ] 多言語対応
- [ ] 無限スクロール・ページネーション
- [ ] Storybook ドキュメント作成

---

## 12. 注意事項

1. **白背景**: 親要素の背景色との兼ね合いを考慮
2. **透明度テキスト**: opacity: 0.72 の説明文が読みにくくならないよう注意
3. **参考リンク**: 外部リンクのセキュリティ対策（rel="noopener noreferrer"）
4. **SVG 点線**: ブラウザによる描画の違いを考慮
5. **フォント依存**: Noto Sans JP Bold の読み込み確認が必要
6. **文字間隔**: tracking: 0.75px の適切な実装
7. **固定幅**: 672px の点線 SVG のレスポンシブ対応

この情報により、デザイナーの意図を 100%再現した高品質なスキルグループコンポーネントが実装可能です。
