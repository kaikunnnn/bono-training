# /training のトレーニングトップページのお題のコンポーネントスタイルについて

## コンポーネントの構造

※横幅は固定幅だがレスポンシブで実装したい
training_content (328×346px)
├── background-image-gradation (328×94px)
│ └── 表紙 (571×328px) - グラデーション背景 → ブロックとして確保して画像 orCSS でグラデーションを表現できるようにしたい
└── wrap (328×322px)
├── Rectangle 7 (328×50px) - 白背景
└── hover (328×272px) - メインコンテンツエリア
├── icon (72×72px)
│ └── Component 3 (49.5×49.5px)
└── Frame 3467245 (260×198px)
├── Image (260×102px)
│ ├── Component 5 (148×14px) - タグ
│ └── Heading (260×80px) - テキストエリア
├── Line 14 (260×0px) - 区切り線
└── Frame 3467304 (260×28px) - フッター
├── Component 4 (60×20px) - 情報タグ
└── Footer (126×28px) - ボタンエリア

## スタイル : 選択されたブロック（w-[260px] h-[102px] flex flex-col gap-2）について

### Component 5 スタイル（タグ部分 148×14px）

#### HTML 構造

```html
<div style="width: 148px; height: 14px; position: relative">
  <div
    style="left: 0px; top: 0px; position: absolute; color: #9B5CF0; font-size: 12px; font-family: Inter; font-weight: 500; word-wrap: break-word"
  >
    portfolio
  </div>
  <svg
    width="148"
    height="14"
    viewBox="0 0 148 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_34090_3051)">
      <path
        d="M0 14V0H6.14062C7.01562 0 7.75781 0.109375 8.36719 0.328125C8.97656 0.542969 9.4375 0.859375 9.75 1.27734C10.0625 1.69531 10.2188 2.19922 10.2188 2.78906C10.2188 3.28906 10.1328 3.70703 9.96094 4.04297C9.79297 4.375 9.58203 4.63281 9.32812 4.81641C9.07422 5 8.80859 5.125 8.53125 5.1875V5.23438C8.89062 5.26562 9.22266 5.375 9.52734 5.5625C9.83203 5.75 10.0742 6.01172 10.2539 6.34766C10.4375 6.68359 10.5293 7.08594 10.5293 7.55469C10.5293 8.20312 10.3555 8.75781 10.0078 9.21875C9.66406 9.67969 9.17578 10.0312 8.54297 10.2734C7.91406 10.5156 7.17188 10.6367 6.31641 10.6367H0V14ZM2.17188 8.96484H5.88281C6.38281 8.96484 6.77734 8.85156 7.06641 8.625C7.35547 8.39453 7.5 8.06641 7.5 7.64062C7.5 7.35156 7.42969 7.10547 7.28906 6.90234C7.15234 6.69922 6.95703 6.54297 6.70312 6.43359C6.44922 6.32422 6.15234 6.26953 5.8125 6.26953H2.17188V8.96484ZM2.17188 4.60156H5.67188C5.95312 4.60156 6.20703 4.55859 6.43359 4.47266C6.66016 4.38281 6.83984 4.25 6.97266 4.07422C7.10547 3.89844 7.17188 3.67969 7.17188 3.41797C7.17188 3.01953 7.04297 2.71094 6.78516 2.49219C6.52734 2.27344 6.14844 2.16406 5.64844 2.16406H2.17188V4.60156Z"
        fill="#9B5CF0"
      />
      <!-- 残りのSVGパス省略 -->
    </g>
    <defs>
      <clipPath id="clip0_34090_3051">
        <rect width="148" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
</div>
```

#### CSS プロパティ（Figma スタイル）

- **コンテナサイズ**: 148px × 14px
- **ポジション**: relative
- **テキストスタイル**:
  - color: #9B5CF0 (紫色)
  - font-size: 12px
  - font-family: Inter
  - font-weight: 500
  - position: absolute
  - left: 0px, top: 0px
  - word-wrap: break-word

#### 実装ガイド（Tailwind CSS）

```jsx
// CategoryTag コンポーネントでの実装例
<div className="w-[148px] h-[14px] relative">
  <div className="absolute left-0 top-0 text-purple-500 text-xs font-medium">
    portfolio
  </div>
  {/* SVG アイコン */}
</div>
```

### Heading 部分（260×80px）

#### HTML 構造

```html
<div
  style="display:flex; flex-direction:column; align-items:flex-start; gap:4px; align-self:stretch; position:relative"
>
  <div
    style="align-self:stretch; color:#020617; font-family:'Rounded Mplus 1c Bold'; font-size:20px; font-style:normal; font-weight:700; line-height:149%; letter-spacing:0.75px; position:relative"
  >
    <span>出張申請サービスを作ろう</span>
  </div>
  <div
    style="width:260px; color:#1D283D; font-family:'Noto Sans JP'; font-size:14px; font-style:normal; font-weight:500; line-height:166%; position:relative"
  >
    <span>UI デザインをベースにタイポグラフィの使い方の基本を学ぶ</span>
  </div>
</div>
```

#### CSS プロパティ（Figma スタイル）

**コンテナ**:

- display: flex
- flex-direction: column
- align-items: flex-start
- gap: 4px
- align-self: stretch
- position: relative

**タイトル**:

- color: #020617 (ダークグレー)
- font-family: 'Rounded Mplus 1c Bold'
- font-size: 20px
- font-weight: 700
- line-height: 149% (29.8px)
- letter-spacing: 0.75px

**説明文**:

- width: 260px
- color: #1D283D (グレー)
- font-family: 'Noto Sans JP'
- font-size: 14px
- font-weight: 500
- line-height: 166% (23.24px)

#### 実装ガイド（Tailwind CSS）

```jsx
// ヘディングセクションの実装例
<div className="flex flex-col items-start gap-1 w-full">
  <h3 className="w-full text-slate-900 font-bold text-xl leading-[1.49] tracking-wider">
    出張申請サービスを作ろう
  </h3>
  <p className="w-[260px] text-slate-700 text-sm font-medium leading-[1.66]">
    UI デザインをベースにタイポグラフィの使い方の基本を学ぶ
  </p>
</div>
```

### 全体レイアウトの実装メモ

- コンテンツブロック全体: 260×102px
- タグ部分: 148×14px (上部)
- テキストエリア: 260×80px (下部)
- gap-2 (8px) でタグとテキストエリアを分離
- flex flex-col でレイアウト構造を作成
