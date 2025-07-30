# BONO フッターコンポーネント完全実装ガイド

## 情報抽出元

- **Figma Node ID**: `3491:4101`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成された React コード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全な React コード（Figma 自動生成）

```jsx
export default function Footer() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-3.5 items-center justify-start p-0 relative size-full"
      data-name="footer"
      id="node-3491_4101"
    >
      <div
        className="box-border content-stretch flex flex-col gap-3.5 items-center justify-start p-0 relative shrink-0 w-[1280px]"
        data-name="wrapper"
        id="node-3491_4102"
      >
        <div
          className="box-border content-stretch flex flex-row items-start justify-between px-0 py-12 relative shrink-0 w-full"
          data-name="footer-main-block"
          id="node-3491_4090"
        >
          <div className="absolute border-[0px_0px_1px] border-solid border-zinc-300 inset-0 pointer-events-none" />
          <div
            className="box-border content-stretch flex flex-row gap-[15px] items-start justify-start p-0 relative shrink-0"
            data-name="left"
            id="node-3491_4089"
          >
            <div
              className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-[178px]"
              data-name="content-block"
              id="node-3491_4079"
            >
              <div
                className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#ffffff] text-[14px] text-left w-full"
                id="node-3491_4080"
              >
                <p className="block leading-[20px]">SNS</p>
              </div>
              <div
                className="box-border content-stretch flex flex-col font-['Noto_Sans:Display_Regular',_sans-serif] font-normal gap-1.5 items-start justify-start leading-[0] p-0 relative shrink-0 text-[14px] text-left text-slate-600 tracking-[1px] w-full"
                data-name="lists"
                id="node-3491_4094"
              >
                <div
                  className="relative shrink-0 w-full"
                  id="node-3491_4081"
                  style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}
                >
                  <p className="block leading-[1.6]">YouTube</p>
                </div>
                <div
                  className="relative shrink-0 w-full"
                  id="node-3491_4082"
                  style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}
                >
                  <p className="block leading-[1.6]">X(Twitter)</p>
                </div>
              </div>
            </div>
            <div
              className="box-border content-stretch flex flex-col gap-4 items-start justify-start leading-[0] p-0 relative shrink-0 text-[14px] text-left w-[239px]"
              data-name="content-block"
              id="node-3491_4083"
            >
              <div
                className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium min-w-full relative shrink-0 text-[#ffffff]"
                id="node-3491_4084"
                style={{ width: "min-content" }}
              >
                <p className="block leading-[20px]">ボノトレについて</p>
              </div>
              <div
                className="font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal relative shrink-0 text-slate-600 tracking-[1px] w-[239px]"
                id="node-3491_4085"
                style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}
              >
                <p className="adjustLetterSpacing block leading-[1.6]">
                  BONOを運営するカイクンが実験的に作成した。デザイントレーニングのサイトです。作るを前提に基礎を磨くお題を用意してアウトプットでつながることを画策中です。
                </p>
              </div>
            </div>
          </div>
          <div
            className="box-border content-stretch flex flex-col gap-4 h-36 items-center justify-center p-0 relative shrink-0"
            data-name="logo"
            id="node-3491_4073"
          >
            <div
              className="h-[57.206px] relative shrink-0 w-36"
              data-name="Component 1"
              id="node-3491_4074"
            >
              <div
                className="absolute bottom-[44.828%] left-0 right-0 top-0"
                data-name="logo"
                id="node-I3491_4074-78_1381"
              >
                <div
                  className="absolute flex flex-col font-['Futura:Bold',_sans-serif] inset-0 justify-center leading-[0] not-italic text-[39.45px] text-center text-nowrap text-slate-900 tracking-[1px]"
                  id="node-I3491_4074-78_1382"
                >
                  <p className="adjustLetterSpacing block leading-[31.562px] whitespace-pre">
                    BONO
                  </p>
                </div>
              </div>
              <div
                className="absolute bottom-0 flex flex-col font-['Futura:Bold',_sans-serif] justify-center leading-[0] left-[15.068%] not-italic right-[15.068%] text-[15.78px] text-center text-nowrap text-slate-600 top-[72.414%] tracking-[1px]"
                id="node-I3491_4074-78_1380"
              >
                <p className="adjustLetterSpacing block leading-none whitespace-pre">
                  TRAINING
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[10px] relative shrink-0 w-full"
          data-name="message"
          id="node-3491_4100"
        >
          <div
            className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[1.6] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-slate-600 tracking-[4px] whitespace-pre"
            id="node-3491_4095"
          >
            <p className="adjustLetterSpacing block mb-0">
              "机上の空論ではなく人に響く体験を
            </p>
            <p className="adjustLetterSpacing block">
              クリエイションしていこう"
            </p>
          </div>
        </div>
        <div
          className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full"
          data-name="footer-bottom-section"
          id="node-3491_4099"
        >
          <div
            className="box-border content-stretch flex flex-row font-['Doto:Bold',_sans-serif] gap-[5px] items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[12px] text-center text-nowrap text-slate-600 tracking-[1.9726px]"
            data-name="copyright"
            id="node-3491_4093"
          >
            <div
              className="flex flex-col justify-center relative shrink-0"
              id="node-3491_4091"
            >
              <p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
                COPYRIGHT
              </p>
            </div>
            <div
              className="flex flex-col justify-center relative shrink-0"
              id="node-3491_4092"
            >
              <p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
                ©BONO
              </p>
            </div>
          </div>
          <div
            className="box-border content-stretch flex flex-row font-['Doto:Bold',_sans-serif] gap-[5px] items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[12px] text-center text-nowrap text-slate-600 tracking-[1.9726px]"
            data-name="version"
            id="node-3491_4096"
          >
            <div
              className="flex flex-col justify-center relative shrink-0"
              id="node-3491_4097"
            >
              <p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
                STATSU:
              </p>
            </div>
            <div
              className="flex flex-col justify-center relative shrink-0"
              id="node-3491_4098"
            >
              <p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
                alpha test
              </p>
            </div>
          </div>
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
  "Text/Black": "#0f172a",
  "text-sm/font-medium": "Font(family: \"Noto Sans JP\", style: Medium, size: 14, weight: 500, lineHeight: 20)",
  "Text/LightBlack": "#475569",
  "JP/Body/Sub-body-text": "Font(family: \"Noto Sans\", style: Display Regular, size: 14, weight: 400, lineHeight: 1.600000023841858)",
  "Spacing/4": "16",
  "Spacing/12": "48",
  "Border/light": "#d4d4d8",
  "Spacing/2․5": "10",
  "Screens/xl": "1280",
  "Spacing/3․5": "14"
}
```

---

## 3. 構造解析（data-name 属性ベース）

### 階層構造

```
footer (ルートコンテナ)
└── wrapper (1280px固定幅ラッパー)
    ├── footer-main-block (メインコンテンツエリア)
    │   ├── left (左側コンテンツ群)
    │   │   ├── content-block (SNSセクション)
    │   │   │   └── lists (SNSリンク一覧)
    │   │   └── content-block (ボノトレについてセクション)
    │   └── logo (ロゴエリア)
    ├── message (メッセージセクション)
    └── footer-bottom-section (フッター下部)
        ├── copyright (著作権表示)
        └── version (バージョン表示)
```

---

## 4. レイアウト詳細分析

### メインコンテナ

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-3.5` (14px)
- **配置**: `items-center justify-start`
- **幅**: `size-full` (100%)

### ラッパー

- **固定幅**: `w-[1280px]` (1280px)
- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-3.5` (14px)

### メインブロック

- **Flexbox**: `flex flex-row` (横方向)
- **配置**: `items-start justify-between` (上揃え、両端配置)
- **パディング**: `px-0 py-12` (上下 48px、左右 0px)
- **ボーダー**: 上部 1px (#d4d4d8)

### 左側コンテンツ

- **Flexbox**: `flex flex-row` (横方向)
- **ギャップ**: `gap-[15px]` (15px)
- **SNS ブロック幅**: `w-[178px]` (178px 固定)
- **ボノトレブロック幅**: `w-[239px]` (239px 固定)

### ロゴエリア

- **サイズ**: `h-36 w-36` (144×144px)
- **配置**: `items-center justify-center`
- **ロゴメイン**: 39.45px、line-height: 31.562px
- **ロゴサブ**: 15.78px、line-height: 1

---

## 5. フォント定義

### 必要フォント

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400&display=swap");
/* Futura, Rounded Mplus 1c Bold, Doto は別途設定が必要 */
```

### カスタム CSS

```css
.adjustLetterSpacing {
  /* 適切な文字間隔調整を実装 */
}

/* フォント変数設定 */
:root {
  --font-noto-jp: "Noto Sans JP", sans-serif;
  --font-noto: "Noto Sans", sans-serif;
  --font-futura: "Futura", sans-serif;
  --font-rounded-mplus: "Rounded Mplus 1c Bold", sans-serif;
  --font-doto: "Doto", sans-serif;
}
```

---

## 6. 実装チェックリスト

### 必須対応項目

- [ ] Tailwind CSS 設定確認
- [ ] 必要フォントの読み込み設定
- [ ] `adjustLetterSpacing`クラスの実装
- [ ] レスポンシブ対応（1280px 以下の調整）
- [ ] フォント読み込み失敗時のフォールバック設定

### 推奨対応項目

- [ ] アクセシビリティ対応（ARIA 属性など）
- [ ] SEO 対応（適切な HTML 構造）
- [ ] パフォーマンス最適化（フォント最適化など）
- [ ] ダークモード対応検討

---

## 7. 注意事項

1. **コンポーネント名**: 正しい英単語に修正済み（Footer）
2. **フォント依存**: 商用フォント（Futura 等）のライセンス確認が必要
3. **1280px 固定**: レスポンシブ対応時は適切な調整が必要
4. **文字間隔**: `adjustLetterSpacing`クラスの具体的実装が必要
5. **ボーダー色**: `border-zinc-300`と変数の`Border/light: #d4d4d8`に差異あり

この情報により、デザイナーの意図を 100%再現した実装が可能です。

// {
// "$comment": "This is structural design data exported by the Figma Raw plugin. It is formatted to help LLMs (Large Language Models) understand design structures and components from Figma designs.",
// "name": "fotter",
// "type": "FRAME",
// "width": 1676,
// "height": 347,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": {
// "name": "Spacing/3\u20245",
// "fullName": "Spacing/3\u20245",
// "actualValue": 14
// },
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "wrapper",
// "type": "FRAME",
// "width": {
// "name": "Screens/xl",
// "fullName": "Screens/xl"
// },
// "height": 347,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": 14,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "width": {
// "name": "Screens/xl",
// "fullName": "Screens/xl"
// }
// },
// "children": [
// {
// "name": "fotter-main-block",
// "type": "FRAME",
// "width": 1280,
// "height": 242,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "FIXED",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "SPACE_BETWEEN",
// "counterAxisAlignItems": "MIN",
// "paddingTop": {
// "name": "Spacing/12",
// "fullName": "Spacing/12",
// "actualValue": 48
// },
// "paddingBottom": {
// "name": "Spacing/12",
// "fullName": "Spacing/12",
// "actualValue": 48
// },
// "itemSpacing": 662,
// "strokes": [
// {
// "name": "Border/light",
// "fullName": "Border/light",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.8313725590705872,
// "g": 0.8313725590705872,
// "b": 0.8470588326454163,
// "a": 1,
// "hex": "#d4d4d8"
// }
// }
// }
// ],
// "strokeWeight": "Symbol(figma.mixed)",
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "paddingTop": {
// "name": "Spacing/12",
// "fullName": "Spacing/12",
// "actualValue": 48
// },
// "paddingBottom": {
// "name": "Spacing/12",
// "fullName": "Spacing/12",
// "actualValue": 48
// },
// "strokes": [
// {
// "name": "Border/light",
// "fullName": "Border/light",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.8313725590705872,
// "g": 0.8313725590705872,
// "b": 0.8470588326454163,
// "a": 1,
// "hex": "#d4d4d8"
// }
// }
// }
// ]
// },
// "children": [
// {
// "name": "left",
// "type": "FRAME",
// "width": 432,
// "height": 146,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "MIN",
// "itemSpacing": 15,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "content-block",
// "type": "FRAME",
// "width": 178,
// "height": 86,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "MIN",
// "itemSpacing": {
// "name": "Spacing/4",
// "fullName": "Spacing/4",
// "actualValue": 16
// },
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "itemSpacing": {
// "name": "Spacing/4",
// "fullName": "Spacing/4",
// "actualValue": 16
// }
// },
// "children": [
// {
// "name": "SNS",
// "type": "TEXT",
// "width": 178,
// "height": 20,
// "fills": [
// {
// "name": "Text/Black",
// "fullName": "Text/Black",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.051510415971279144,
// "g": 0.05889757350087166,
// "b": 0.09583333134651184,
// "a": 1,
// "hex": "#0d0f18"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "textStyle": {
// "name": "text-sm/font-medium",
// "fullName": "[Library] text-sm/font-medium",
// "description": "",
// "remote": true
// },
// "variables": {
// "fills": [
// {
// "name": "Text/Black",
// "fullName": "Text/Black",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.051510415971279144,
// "g": 0.05889757350087166,
// "b": 0.09583333134651184,
// "a": 1,
// "hex": "#0d0f18"
// }
// }
// }
// ]
// },
// "characters": "SNS",
// "fontSize": 14,
// "fontName": {
// "family": "Noto Sans JP",
// "style": "Medium"
// },
// "fontWeight": 500,
// "letterSpacing": {
// "unit": "PERCENT",
// "value": 0
// },
// "lineHeight": {
// "unit": "PIXELS",
// "value": 20
// },
// "textAlignHorizontal": "LEFT",
// "textAlignVertical": "TOP",
// "textAutoResize": "HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE",
// "textStyleName": "Text Style ce59fb85..."
// },
// {
// "name": "lists",
// "type": "FRAME",
// "width": 178,
// "height": 50,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "MIN",
// "itemSpacing": 6,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER"
// }
// ]
// },
// {
// "name": "content-block",
// "type": "FRAME",
// "width": 239,
// "height": 146,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "MIN",
// "itemSpacing": {
// "name": "Spacing/4",
// "fullName": "Spacing/4",
// "actualValue": 16
// },
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "itemSpacing": {
// "name": "Spacing/4",
// "fullName": "Spacing/4",
// "actualValue": 16
// }
// },
// "children": [
// {
// "name": "\u30dc\u30ce\u30c8\u30ec\u306b\u3064\u3044\u3066",
// "type": "TEXT",
// "width": 239,
// "height": 20,
// "fills": [
// {
// "name": "Text/Black",
// "fullName": "Text/Black",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.051510415971279144,
// "g": 0.05889757350087166,
// "b": 0.09583333134651184,
// "a": 1,
// "hex": "#0d0f18"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "textStyle": {
// "name": "text-sm/font-medium",
// "fullName": "[Library] text-sm/font-medium",
// "description": "",
// "remote": true
// },
// "variables": {
// "fills": [
// {
// "name": "Text/Black",
// "fullName": "Text/Black",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.051510415971279144,
// "g": 0.05889757350087166,
// "b": 0.09583333134651184,
// "a": 1,
// "hex": "#0d0f18"
// }
// }
// }
// ]
// },
// "characters": "\u30dc\u30ce\u30c8\u30ec\u306b\u3064\u3044\u3066",
// "fontSize": 14,
// "fontName": {
// "family": "Noto Sans JP",
// "style": "Medium"
// },
// "fontWeight": 500,
// "letterSpacing": {
// "unit": "PERCENT",
// "value": 0
// },
// "lineHeight": {
// "unit": "PIXELS",
// "value": 20
// },
// "textAlignHorizontal": "LEFT",
// "textAlignVertical": "TOP",
// "textAutoResize": "HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE",
// "textStyleName": "Text Style ce59fb85..."
// },
// {
// "name": "contents",
// "type": "TEXT",
// "width": 239,
// "height": 110,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "textStyle": {
// "name": "JP/Body/Sub-body-text",
// "fullName": "[Library] JP/Body/Sub-body-text",
// "description": "",
// "remote": true
// },
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "BONO\u3092\u904b\u55b6\u3059\u308b\u30ab\u30a4\u30af\u30f3\u304c\u5b9f\u9a13\u7684\u306b\u4f5c\u6210\u3057\u305f\u3002\u30c7\u30b6\u30a4\u30f3\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0\u306e\u30b5\u30a4\u30c8\u3067\u3059\u3002\u4f5c\u308b\u3092\u524d\u63d0\u306b\u57fa\u790e\u3092\u78e8\u304f\u304a\u984c\u3092\u7528\u610f\u3057\u3066\u30a2\u30a6\u30c8\u30d7\u30c3\u30c8\u3067\u3064\u306a\u304c\u308b\u3053\u3068\u3092\u753b\u7b56\u4e2d\u3067\u3059\u3002",
// "fontSize": 14,
// "fontName": {
// "family": "Noto Sans",
// "style": "Display Regular"
// },
// "fontWeight": 400,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 1
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "LEFT",
// "textAlignVertical": "TOP",
// "textAutoResize": "HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE",
// "textStyleName": "Text Style a1a3eeef..."
// },
// {
// "name": "\u30b0\u30e9\u30d5\u30a3\u30c3\u30af\u30c7\u30b6\u30a4\u30f3\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0",
// "type": "TEXT",
// "skippedByOptimize": true
// },
// {
// "name": "UX\u30c7\u30b6\u30a4\u30f3\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0",
// "type": "TEXT",
// "skippedByOptimize": true
// }
// ]
// }
// ]
// },
// {
// "name": "logo",
// "type": "FRAME",
// "width": 144,
// "height": 144,
// "layoutMode": "VERTICAL",
// "primaryAxisSizingMode": "FIXED",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "CENTER",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": 16,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "Component 1",
// "type": "INSTANCE",
// "width": 143.99998474121094,
// "height": 57.205474853515625,
// "layoutMode": "NONE",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "FIXED",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "MIN",
// "fills": [
// {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 1,
// "g": 1,
// "b": 1,
// "a": 1,
// "hex": "#ffffff"
// }
// }
// ],
// "strokeWeight": 1.9726026058197021,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "mainComponent": {
// "name": "Component 1"
// }
// }
// ]
// }
// ]
// },
// {
// "name": "message",
// "type": "FRAME",
// "width": 1280,
// "height": 58,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "FIXED",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "CENTER",
// "counterAxisAlignItems": "CENTER",
// "paddingLeft": 10,
// "paddingRight": 10,
// "paddingTop": {
// "name": "Spacing/2\u20245",
// "fullName": "Spacing/2\u20245",
// "actualValue": 10
// },
// "paddingBottom": {
// "name": "Spacing/2\u20245",
// "fullName": "Spacing/2\u20245",
// "actualValue": 10
// },
// "itemSpacing": 10,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "paddingTop": {
// "name": "Spacing/2\u20245",
// "fullName": "Spacing/2\u20245",
// "actualValue": 10
// },
// "paddingBottom": {
// "name": "Spacing/2\u20245",
// "fullName": "Spacing/2\u20245",
// "actualValue": 10
// }
// },
// "children": [
// {
// "name": "m",
// "type": "TEXT",
// "width": 262,
// "height": 38,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "\u201c\u673a\u4e0a\u306e\u7a7a\u8ad6\u3067\u306f\u306a\u304f\u4eba\u306b\u97ff\u304f\u4f53\u9a13\u3092\n\u30af\u30ea\u30a8\u30a4\u30b7\u30e7\u30f3\u3057\u3066\u3044\u3053\u3046\u201d",
// "fontSize": 12,
// "fontName": {
// "family": "Rounded Mplus 1c Bold",
// "style": "Bold"
// },
// "fontWeight": 700,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 4
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "CENTER",
// "textAlignVertical": "TOP",
// "textAutoResize": "WIDTH_AND_HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE"
// }
// ]
// },
// {
// "name": "footer-bottom-section",
// "type": "FRAME",
// "width": 1280,
// "height": 19,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "FIXED",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "SPACE_BETWEEN",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": 949,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "copyright",
// "type": "FRAME",
// "width": 130,
// "height": 19,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": 5,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "COPYRIGHT",
// "type": "TEXT",
// "width": 81,
// "height": 19,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "COPYRIGHT",
// "fontSize": 12,
// "fontName": {
// "family": "Doto",
// "style": "Bold"
// },
// "fontWeight": 700,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 1.9726026058197021
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "CENTER",
// "textAlignVertical": "CENTER",
// "textAutoResize": "WIDTH_AND_HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE"
// },
// {
// "name": "\u00a9BONO",
// "type": "TEXT",
// "width": 44,
// "height": 19,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "\u00a9BONO",
// "fontSize": 12,
// "fontName": {
// "family": "Doto",
// "style": "Bold"
// },
// "fontWeight": 700,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 1.9726026058197021
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "CENTER",
// "textAlignVertical": "CENTER",
// "textAutoResize": "WIDTH_AND_HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE"
// }
// ]
// },
// {
// "name": "version",
// "type": "FRAME",
// "width": 158,
// "height": 19,
// "layoutMode": "HORIZONTAL",
// "primaryAxisSizingMode": "AUTO",
// "counterAxisSizingMode": "AUTO",
// "primaryAxisAlignItems": "MIN",
// "counterAxisAlignItems": "CENTER",
// "itemSpacing": 5,
// "strokeWeight": 1,
// "strokeAlign": "INSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "children": [
// {
// "name": "STATSU:",
// "type": "TEXT",
// "width": 63,
// "height": 19,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "STATSU:",
// "fontSize": 12,
// "fontName": {
// "family": "Doto",
// "style": "Bold"
// },
// "fontWeight": 700,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 1.9726026058197021
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "CENTER",
// "textAlignVertical": "CENTER",
// "textAutoResize": "WIDTH_AND_HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE"
// },
// {
// "name": "alpha test",
// "type": "TEXT",
// "width": 90,
// "height": 19,
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ],
// "strokeWeight": 1,
// "strokeAlign": "OUTSIDE",
// "strokeCap": "NONE",
// "strokeJoin": "MITER",
// "variables": {
// "fills": [
// {
// "name": "Text/LightBlack",
// "fullName": "Text/LightBlack",
// "actualValue": {
// "type": "SOLID",
// "opacity": 1,
// "color": {
// "r": 0.27843138575553894,
// "g": 0.3333333432674408,
// "b": 0.4117647111415863,
// "a": 1,
// "hex": "#475569"
// }
// }
// }
// ]
// },
// "characters": "alpha test",
// "fontSize": 12,
// "fontName": {
// "family": "Doto",
// "style": "Bold"
// },
// "fontWeight": 700,
// "letterSpacing": {
// "unit": "PIXELS",
// "value": 1.9726026058197021
// },
// "lineHeight": {
// "unit": "PERCENT",
// "value": 160.0000023841858
// },
// "textAlignHorizontal": "CENTER",
// "textAlignVertical": "CENTER",
// "textAutoResize": "WIDTH_AND_HEIGHT",
// "textCase": "ORIGINAL",
// "textDecoration": "NONE"
// }
// ]
// }
// ]
// }
// ]
// }
// ],
// "textContent": [
// {
// "name": "SNS",
// "text": "SNS",
// "path": "fotter/wrapper/fotter-main-block/left/content-block/SNS",
// "nodeType": "TEXT"
// },
// {
// "name": "YouTube",
// "text": "YouTube",
// "path": "fotter/wrapper/fotter-main-block/left/content-block/lists/YouTube",
// "nodeType": "TEXT"
// },
// {
// "name": "X(Twitter)",
// "text": "X(Twitter)",
// "path": "fotter/wrapper/fotter-main-block/left/content-block/lists/X(Twitter)",
// "nodeType": "TEXT"
// },
// {
// "name": "\u30dc\u30ce\u30c8\u30ec\u306b\u3064\u3044\u3066",
// "text": "\u30dc\u30ce\u30c8\u30ec\u306b\u3064\u3044\u3066",
// "path": "fotter/wrapper/fotter-main-block/left/content-block/\u30dc\u30ce\u30c8\u30ec\u306b\u3064\u3044\u3066",
// "nodeType": "TEXT"
// },
// {
// "name": "contents",
// "text": "BONO\u3092\u904b\u55b6\u3059\u308b\u30ab\u30a4\u30af\u30f3\u304c\u5b9f\u9a13\u7684\u306b\u4f5c\u6210\u3057\u305f\u3002\u30c7\u30b6\u30a4\u30f3\u30c8\u30ec\u30fc\u30cb\u30f3\u30b0\u306e\u30b5\u30a4\u30c8\u3067\u3059\u3002\u4f5c\u308b\u3092\u524d\u63d0\u306b\u57fa\u790e\u3092\u78e8\u304f\u304a\u984c\u3092\u7528\u610f\u3057\u3066\u30a2\u30a6\u30c8\u30d7\u30c3\u30c8\u3067\u3064\u306a\u304c\u308b\u3053\u3068\u3092\u753b\u7b56\u4e2d\u3067\u3059\u3002",
// "path": "fotter/wrapper/fotter-main-block/left/content-block/contents",
// "nodeType": "TEXT"
// },
// {
// "name": "m",
// "text": "\u201c\u673a\u4e0a\u306e\u7a7a\u8ad6\u3067\u306f\u306a\u304f\u4eba\u306b\u97ff\u304f\u4f53\u9a13\u3092\n\u30af\u30ea\u30a8\u30a4\u30b7\u30e7\u30f3\u3057\u3066\u3044\u3053\u3046\u201d",
// "path": "fotter/wrapper/message/m",
// "nodeType": "TEXT"
// },
// {
// "name": "COPYRIGHT",
// "text": "COPYRIGHT",
// "path": "fotter/wrapper/footer-bottom-section/copyright/COPYRIGHT",
// "nodeType": "TEXT"
// },
// {
// "name": "\u00a9BONO",
// "text": "\u00a9BONO",
// "path": "fotter/wrapper/footer-bottom-section/copyright/\u00a9BONO",
// "nodeType": "TEXT"
// },
// {
// "name": "STATSU:",
// "text": "STATSU:",
// "path": "fotter/wrapper/footer-bottom-section/version/STATSU:",
// "nodeType": "TEXT"
// },
// {
// "name": "alpha test",
// "text": "alpha test",
// "path": "fotter/wrapper/footer-bottom-section/version/alpha test",
// "nodeType": "TEXT"
// }
// ]
// }
