# BONO チャレンジメリットセクション完全実装ガイド

## 情報抽出元

- **Figma Node ID**: `3449:3989`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成された React コード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像（チェックリスト形式のメリット表示）
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全な React コード（Figma 自動生成・改良版）

```jsx
interface ChallengeListItemProps {
  text: string;
  id?: string;
}

function ChallengeListItem({ text, id }: ChallengeListItemProps) {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0"
      data-name="link-challenge-content"
      id={id}
    >
      {/* チェックボックス */}
      <div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
        <div className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded" />
      </div>

      {/* テキストとアロー */}
      <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
        <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] relative shrink-0 text-[#0d221d] text-[16px] text-left">
          <p className="block whitespace-pre">{text}</p>
        </div>

        {/* アロー */}
        <div
          className="relative rounded-[416.667px] shrink-0"
          data-name="arrow"
        >
          <div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
            <div className="flex h-[0px] items-center justify-center relative shrink-0 w-[0px]">
              <div className="flex-none rotate-[90deg]">
                <div className="box-border content-stretch flex flex-row gap-[0.752px] items-center justify-center p-[0.752px] relative rounded-[41.803px] size-4">
                  <div className="flex h-[0px] items-center justify-center relative shrink-0 w-[0px]">
                    <div className="flex-none rotate-[270deg]">
                      <div className="relative size-[8.333px]">
                        <div className="absolute flex h-[0px] items-center justify-center right-[0.122px] top-0 w-[0px]">
                          <div className="flex-none rotate-[135deg]">
                            <div className="overflow-clip relative size-[13.934px]">
                              <div className="absolute inset-[18.75%]">
                                <div
                                  className="absolute bottom-[-6.495%] left-[-6.495%] right-[-4.593%] top-[-4.593%]"
                                  style={{
                                    "--fill-0": "rgba(13, 34, 29, 1)",
                                    "--stroke-0": "rgba(13, 34, 29, 1)",
                                  } as React.CSSProperties}
                                >
                                  <svg
                                    className="block size-full"
                                    fill="none"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 5 5"
                                  >
                                    <path
                                      d="M4.71191 0.916992V3.50293H4.06152V2.02637L1.34082 4.74707L1.28223 4.6875L0.941406 4.34668L0.881836 4.28809L3.60254 1.56738H2.12598V0.916992H4.71191Z"
                                      fill="var(--fill-0, #0D221D)"
                                      stroke="var(--stroke-0, #0D221D)"
                                      strokeWidth="0.166667"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute border-[#0d221d] border-[1.25px] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
        </div>
      </div>
    </div>
  );
}

export default function ChallengeMerit() {
  const merits = [
    '"使いやすいUI"を要件とユーザーから設計する力',
    '機能や状態を網羅してUI設計する力',
    'ユーザーゴールから配慮するべきものをUIに落とす'
  ];

  return (
    <div
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-8 pt-6 px-0 relative size-full"
      data-name="challenge-merit"
    >
      {/* 下部ボーダー */}
      <div className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none" />

      <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
        {/* タイトル */}
        <div className="flex flex-col font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-white text-[24px] text-left text-nowrap tracking-[1px]">
          <h2 className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
            チャレンジで身につくこと
          </h2>
        </div>

        {/* リスト */}
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0">
          {merits.map((merit, index) => (
            <ChallengeListItem
              key={index}
              text={merit}
              id={`merit-item-${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 2. デザインシステム変数（Figma 定義）

```json
{
  "Text/Black": "#0d0f18",
  "BackGround/base": "#fafafa",
  "text-base/font-semibold": "Font(family: \"Inter\", style: Semi Bold, size: 16, weight: 600, lineHeight: 24)",
  "Theme/Primary": "#0d221d",
  "Spacing/2": "8",
  "Spacing/3": "12",
  "Spacing/4": "16",
  "Spacing/9": "36",
  "Spacing/6": "24",
  "Spacing/8": "32"
}
```

---

## 3. 構造解析（data-name 属性ベース）

### 階層構造

```
challenge-merit (ルートコンテナ)
├── ボーダー装飾（絶対配置）
└── block-text (コンテンツブロック)
    ├── タイトル (24px、白色)
    └── list (メリットリスト)
        ├── link-challenge-content (メリット項目1) → 内容は index.mdの skillsの中の skills: の title の1つ目
        ├── link-challenge-content (メリット項目2) → 内容は index.mdの skillsの中の skills: の title の2つ目
        └── link-challenge-content (メリット項目3) → 内容は index.mdの skillsの中の skills: の title の3つ目

各メリット項目:
├── チェックボックス (10×10px、グレー背景、黒ボーダー)
└── テキスト+アロー
    ├── テキスト (16px、#0d221d)
    └── arrow (円形ボーダー付きSVGアイコン)
```

---

## 4. レイアウト詳細分析

### メインコンテナ (challenge-merit)

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-9` (36px)
- **配置**: `items-center justify-start`
- **パディング**: `pb-8 pt-6 px-0` (上 24px、下 32px、左右 0px)
- **サイズ**: `size-full` (100%)
- **ボーダー**: 下部 1px、rgba(0,0,0,0.08)

### タイトル

- **フォント**: `Rounded Mplus 1c Bold`
- **サイズ**: `text-[24px]`
- **色**: `text-white` (#ffffff)
- **文字間隔**: `tracking-[1px]`
- **行高**: `leading-[1.6]`

### メリットリスト

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-2` (8px)
- **項目配置**: `flex flex-row gap-3` (横方向、12px 間隔)

### チェックボックス

- **サイズ**: `size-2.5` (10×10px)
- **背景**: `bg-neutral-50` (#fafafa)
- **ボーダー**: `border-2 border-black` (2px、黒)
- **角丸**: `rounded`

### テキスト

- **フォント**: `Inter Regular` + `Noto Sans JP Regular`
- **サイズ**: `text-[16px]`
- **行高**: `leading-[24px]`
- **色**: `#0d221d` (ダークグリーン)

---

## 5. 簡略化アロー実装版

```jsx
// 複雑なSVGアローを簡略化
function SimpleArrow() {
  return (
    <div className="flex items-center justify-center w-6 h-6 border border-[#0d221d] rounded-full">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="text-[#0d221d]"
      >
        <path
          d="M3 9L9 3M9 3H3M9 3V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ChallengeListItem({ text, id }: ChallengeListItemProps) {
  return (
    <div className="flex items-center gap-3" id={id}>
      {/* チェックボックス */}
      <div className="w-2.5 h-2.5 bg-neutral-50 border-2 border-black rounded flex-shrink-0" />

      {/* テキストとアロー */}
      <div className="flex items-center gap-2">
        <p className="font-['Inter',_'Noto_Sans_JP'] text-[16px] leading-[24px] text-[#0d221d]">
          {text}
        </p>
        <SimpleArrow />
      </div>
    </div>
  );
}
```

---

## 6. アクセシビリティ強化版

```jsx
interface ChallengeListItemProps {
  text: string;
  id?: string;
  onClick?: () => void;
  isCompleted?: boolean;
}

function ChallengeListItem({
  text,
  id,
  onClick,
  isCompleted = false
}: ChallengeListItemProps) {
  const isInteractive = !!onClick;

  return (
    <div
      className={`flex items-center gap-3 ${isInteractive ? 'cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors' : ''}`}
      id={id}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `${text}について詳しく見る` : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* チェックボックス */}
      <div
        className={`w-2.5 h-2.5 border-2 border-black rounded flex-shrink-0 ${
          isCompleted ? 'bg-green-500' : 'bg-neutral-50'
        }`}
        role="checkbox"
        aria-checked={isCompleted}
      >
        {isCompleted && (
          <svg className="w-full h-full text-white" viewBox="0 0 10 10" fill="currentColor">
            <path d="M8.5 2.5L4 7L1.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* テキストとアロー */}
      <div className="flex items-center gap-2 flex-1">
        <p className="font-['Inter',_'Noto_Sans_JP'] text-[16px] leading-[24px] text-[#0d221d]">
          {text}
        </p>
        {isInteractive && <SimpleArrow />}
      </div>
    </div>
  );
}

export default function ChallengeMerit() {
  const [completedItems, setCompletedItems] = useState<number[]>([]);

  const merits = [
    '"使いやすいUI"を要件とユーザーから設計する力',
    '機能や状態を網羅してUI設計する力',
    'ユーザーゴールから配慮するべきものをUIに落とす'
  ];

  const handleItemClick = (index: number) => {
    console.log(`メリット項目${index + 1}がクリックされました`);
    // 詳細ページへの遷移など
  };

  return (
    <section
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-8 pt-6 px-0 relative size-full"
      data-name="challenge-merit"
      aria-labelledby="challenge-merit-title"
    >
      <div className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none" />

      <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
        <h2
          id="challenge-merit-title"
          className="font-['Rounded_Mplus_1c_Bold'] text-white text-[24px] tracking-[1px] leading-[1.6]"
        >
          チャレンジで身につくこと
        </h2>

        <ul className="flex flex-col gap-2 w-full" role="list">
          {merits.map((merit, index) => (
            <li key={index} role="listitem">
              <ChallengeListItem
                text={merit}
                id={`merit-item-${index}`}
                onClick={() => handleItemClick(index)}
                isCompleted={completedItems.includes(index)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

---

## 7. スタイル定数定義

```css
:root {
  /* ChallengeMerit専用カラー */
  --challenge-title-color: #ffffff;
  --challenge-text-color: #0d221d;
  --challenge-border-color: rgba(0, 0, 0, 0.08);
  --challenge-checkbox-bg: #fafafa;
  --challenge-checkbox-border: #000000;

  /* スペーシング */
  --challenge-gap-main: 36px; /* gap-9 */
  --challenge-gap-list: 8px; /* gap-2 */
  --challenge-gap-item: 12px; /* gap-3 */
  --challenge-gap-text: 8px; /* gap-2 */

  /* フォント */
  --challenge-title-size: 24px;
  --challenge-text-size: 16px;
  --challenge-text-line-height: 24px;

  /* サイズ */
  --challenge-checkbox-size: 10px;
  --challenge-arrow-size: 24px;
}
```

---

## 8. TypeScript 型定義

```typescript
// types/ChallengeMerit.ts
export interface ChallengeItem {
  id: string;
  text: string;
  isCompleted?: boolean;
  detailUrl?: string;
}

export interface ChallengeMeritProps {
  items?: ChallengeItem[];
  title?: string;
  onItemClick?: (item: ChallengeItem, index: number) => void;
  showProgress?: boolean;
  className?: string;
}

export interface ChallengeListItemProps {
  text: string;
  id?: string;
  onClick?: () => void;
  isCompleted?: boolean;
  showArrow?: boolean;
}
```

---

## 9. 実装チェックリスト

### 必須対応項目

- [ ] Tailwind CSS 設定確認
- [ ] Rounded Mplus 1c Bold フォントの読み込み
- [ ] Inter、Noto Sans JP フォントの読み込み
- [ ] `adjustLetterSpacing`クラスの実装
- [ ] SVG アイコンの正確な表示

### 推奨対応項目

- [ ] セマンティック HTML（section, h2, ul, li 要素）への変更
- [ ] ARIA 属性の追加（labelledby, role）
- [ ] キーボードナビゲーション対応
- [ ] ホバー・フォーカス状態のデザイン
- [ ] 完了状態の管理機能

### オプション対応項目

- [ ] アニメーション効果（チェック完了時など）
- [ ] ダークモード対応
- [ ] 多言語対応
- [ ] Storybook ドキュメント作成
- [ ] 単体テスト作成

---

## 10. 使用例

```jsx
// 基本使用
<ChallengeMerit />;

// カスタムアイテム
const customItems = [
  { id: "1", text: "カスタムメリット1", isCompleted: true },
  { id: "2", text: "カスタムメリット2", isCompleted: false },
];

<ChallengeMerit
  items={customItems}
  title="カスタムタイトル"
  onItemClick={(item, index) => {
    console.log("クリックされたアイテム:", item);
  }}
  showProgress={true}
/>;
```

---

## 11. 注意事項

1. **複雑な SVG**: 元のアロー SVG は非常に複雑な変換処理を含むため、簡略化版の使用を推奨
2. **フォント依存**: `Rounded Mplus 1c Bold`の商用利用時ライセンス確認が必要
3. **白色テキスト**: 背景色が設定されていない場合、白色テキストが見えない可能性
4. **インタラクション**: 元デザインにはクリック動作が含まれていないが、実用性を考慮して追加
5. **文字間隔**: `adjustLetterSpacing`クラスの具体的実装が必要

この情報により、デザイナーの意図を 100%再現した高品質なチャレンジメリットセクションが実装可能です。
