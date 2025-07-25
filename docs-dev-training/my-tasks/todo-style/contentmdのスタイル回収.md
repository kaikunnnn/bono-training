# content.md を使って表示する :taskSlug のページのスタイル改善

## やってほしいこと

- :taskSlug ページ全体のスタイルの改善修正をこのドキュメントでシェアするコードのレイアウトをもとに行ってほしい。
- ステップに分けてフロントを整えて欲しいです。
- content.md のデータをそのスタイルにも入れていく。なのでどこにどの情報を入れたらいいかわからない時は質問して下さい
- 実装は全体のレイアウト（幅など）、から始めて、上からブロックごとに 1 つずつやっていく

## 全体のコードは以下です

コードが長いので参考にできたらして欲しいけど、コンポーネント的にブロックを定義しているから参照するためにミニいいって欲しいです。

### コード（レイアウトスタイル面を見てください）

import svgPaths from "./svg-6gpsw8osri";

function ArrowRight() {
return (
<div className="relative size-5" data-name="Arrow Right">
<svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        role="presentation"
        viewBox="0 0 20 20"
      >
<g id="Arrow Right">
<path d={svgPaths.p8bfe380} fill="var(--fill-0, #0D221D)" />
<path d={svgPaths.p8bfe380} stroke="var(--stroke-0, #374151)" />
<path d={svgPaths.p37894d00} fill="var(--fill-0, white)" id="Union" />
</g>
</svg>
</div>
);
}

function Frame3467320() {
return (
<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="flex items-center justify-center relative shrink-0">
<div className="flex-none rotate-[180deg] scale-y-[-100%]">
<ArrowRight />
</div>
</div>
<button className="[white-space-collapse:collapse] block cursor-pointer font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(13,15,24,0.8)] text-left text-nowrap">
<p className="block leading-[24px] whitespace-pre">戻る</p>
</button>
</div>
);
}

function NumberoforderIndex() {
return (
<div
      className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-[5.818px] items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-[14px] text-center text-nowrap"
      data-name="numberoforder_index"
    >
<div className="relative shrink-0 tracking-[2px]">
<p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
TRAINING
</p>
</div>
<div className="relative shrink-0 tracking-[-1px]">
<p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
01
</p>
</div>
</div>
);
}

function Frame3467321() {
return (
<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 shrink-0" />
);
}

function Tableofcontents() {
return (
<div className="h-6 relative shrink-0 w-full" data-name="tableofcontents">
<div className="flex flex-row items-center overflow-clip relative size-full">
<div className="box-border content-stretch flex flex-row h-6 items-center justify-between px-10 py-0 relative w-full">
<Frame3467320 />
<NumberoforderIndex />
<Frame3467321 />
</div>
</div>
</div>
);
}

function Tags() {
return (
<div
      className="box-border content-stretch flex flex-row font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-normal gap-2 items-start justify-center leading-[0] p-0 relative shrink-0 text-[0px] text-left text-nowrap text-slate-400 tracking-[1px]"
      data-name="tags"
    >
<div
className="flex flex-col justify-center relative shrink-0"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p
className="adjustLetterSpacing block font-['Noto_Sans:Display_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[1.6] text-[12px] text-nowrap text-slate-400 tracking-[1px] whitespace-pre"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
課題解決
</p>
</div>
<div
className="flex flex-col justify-center relative shrink-0"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p
className="adjustLetterSpacing block font-['Noto_Sans:Display_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[1.6] text-[12px] text-nowrap text-slate-400 tracking-[1px] whitespace-pre"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
ポートフォリオ
</p>
</div>
</div>
);
}

function Block() {
return (
<div
      className="box-border content-stretch flex flex-row gap-4 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="block"
    >
<div
        className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="task-category"
      >
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">説明</p>
</div>
</div>
<Tags />
</div>
);
}

function Right() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2.5 items-end justify-center p-0 relative shrink-0 w-full"
      data-name="right"
    >
<div className="basis-0 font-['Rounded_Mplus_1c:Medium',_sans-serif] grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#0d0f18] text-[40px] text-center">
<p className="block leading-[1.28]">
社内本貸し出しシステムをデザインしよう
</p>
</div>
</div>
);
}

function Heading() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative shrink-0 w-[640px]"
      data-name="heading"
    >
<Right />
<div className="font-['Rounded_Mplus_1c:Medium',_sans-serif] leading-[0] not-italic relative shrink-0 text-[20px] text-[rgba(13,15,24,0.8)] text-center w-[477px]">
<p className="block leading-[1.69]">
ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です
</p>
</div>
</div>
);
}

function Button() {
return (
<div
      className="box-border content-stretch flex flex-row gap-5 items-start justify-start p-0 relative shrink-0"
      data-name="button"
    >
<button
        className="box-border content-stretch cursor-pointer flex flex-row gap-2.5 items-center justify-center overflow-visible px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
解答例へ
</p>
</div>
</button>
</div>
);
}

function Wrapper() {
return (
<div
      className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="wrapper"
    >
<Block />
<Heading />
<Button />
</div>
);
}

function Eyecatch() {
return (
<div
      className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-4 pt-5 px-0 relative shrink-0 w-[741px]"
      data-name="eyecatch"
    >
<Wrapper />
</div>
);
}

function BlockText() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#0d0f18] text-center tracking-[1px] w-full"
      data-name="block-Text"
    >
<div
className="flex flex-col font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[12px] w-full"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p className="block leading-[1.6]">(結論)</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[24px] w-full">
<p className="block leading-[1.6]">チャレンジ内容</p>
</div>
</div>
);
}

function Frame3466941() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
<BlockText />
</div>
);
}

function Component() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="###"
    >
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
社内で利用する本の貸し出しシステムをデザインしよう
</p>
</div>
</div>
);
}

function Block1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-###"
    >
<Component />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-left text-slate-900 w-full">
<p className="block mb-0">
🧑‍💼 会社の社内で利用する社員向け本棚の本貸し出しシステムをデザインします。
</p>
<p className="block mb-0">
本貸し出しをしているんだけど、期限が曖昧だったり、今どこにその本があるのかわからないからシステムにすることにしたのが背景です。
</p>
<p className="block mb-0">&nbsp;</p>
<p className="block">
社員の感想などもデータにして、知識での写真コミュニケーションが広が理、社内の意識を少しでも変えられると良いなと思っています。
</p>
</div>
</div>
);
}

function Component1() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="###"
    >
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
本を借りる側の体験をデザインしましょう
</p>
</div>
</div>
);
}

function Block2() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-###"
    >
<Component1 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
本を借りる側が「本を探す〜予約〜借りる」→「返却する」までの UI 体験をデザインしてください。
</span>
</li>
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
本管理側（本の登録など）の体験は考えなくて OK です。
</span>
</li>
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
社内なので本自体は物理本を想定しています。
</span>
</li>
<li className="ms-[27px]">
<span className="leading-[28px]">
物理本に付いている『QR』で、貸し出しと返却を照合できます。
</span>
</li>
</ul>
</div>
</div>
);
}

function Lists() {
return (
<div
      className="box-border content-stretch flex flex-col gap-6 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Block1 />
<Block2 />
</div>
);
}

function Component2() {
return (
<div
      className="bg-[#ffffff] relative rounded-[56px] shrink-0 w-full"
      data-name="##チャレンジ内容"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[56px]" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-[56px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466941 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 628 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="627"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists />
</div>
</div>
</div>
);
}

function BlockText1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#0d0f18] text-center tracking-[1px] w-full"
      data-name="block-Text"
    >
<div
className="flex flex-col font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[12px] w-full"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p className="block leading-[1.6]">(結論)</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[24px] w-full">
<p className="block leading-[1.6]">デザインするもの</p>
</div>
</div>
);
}

function Frame3466942() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
<BlockText1 />
</div>
);
}

function Frame3467294() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
要件から必要な情報を整理したもの
</p>
</div>
</div>
);
}

function Bottom() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-600 w-full">
<p className="block leading-[28px]">
ゴール定義と、なぜ今その状態に至れないないのか、の課題定義を通した顧客像の定義
</p>
</div>
</div>
);
}

function Frame3467295() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
必要なユーザーの行動の流れを整理したもの
</p>
</div>
</div>
);
}

function Bottom1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-600 w-full">
<p className="block leading-[28px]">
インタビューした結果をまとめましょう。
</p>
</div>
</div>
);
}

function Frame3467159() {
return (
<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom1 />
</div>
);
}

function Frame3467296() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
ユーザー行動を「UI の要件定義」にしたもの
</p>
</div>
</div>
);
}

function Frame3467297() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
UI の遷移がわかる触れるプロトタイプ
</p>
</div>
</div>
);
}

function Bottom4() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467294 />
<Bottom />
<Frame3467295 />
<Frame3467159 />
<Frame3467296 />
<Frame3467159 />
<Frame3467297 />
<Frame3467159 />
</div>
);
}

function Frame3467156() {
return (
<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom4 />
</div>
);
}

function Lists1() {
return (
<div
      className="box-border content-stretch flex flex-col items-start justify-center p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Frame3467156 />
</div>
);
}

function Wrap() {
return (
<div
      className="bg-[#ffffff] relative rounded-[56px] shrink-0 w-full"
      data-name="wrap"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[56px]" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-[56px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466942 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 628 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="627"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists1 />
</div>
</div>
</div>
);
}

function Frame3467292() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-[740px]">
<Component2 />
<Wrap />
</div>
);
}

function Frame3467293() {
return (
<div className="relative rounded-[66px] shrink-0 w-full">
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-8 items-center justify-start pb-24 pt-0 px-24 relative w-full">
<Eyecatch />
<Frame3467292 />
</div>
</div>
</div>
);
}

function Frame3467284() {
return (
<div className="box-border content-stretch flex flex-col gap-2 items-center justify-start leading-[0] px-0 py-9 relative shrink-0 text-nowrap w-full">
<div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold not-italic relative shrink-0 text-[14px] text-center text-slate-900">
<p className="block leading-[20px] text-nowrap whitespace-pre">🎯</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#0d0f18] text-[24px] text-left tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
デザイン解答例
</p>
</div>
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold not-italic relative shrink-0 text-[0px] text-left text-slate-900">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] text-nowrap whitespace-pre">
BONO でお題の解答例を公開しています
</p>
</div>
</div>
);
}

function Frame3467298() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-neutral-50 shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
「情報設計コース」で解答を解説中!
</p>
</div>
</div>
);
}

function BlockText2() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467298 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{ "--stroke-0": "rgba(221, 236, 232, 1)" } as React.CSSProperties
} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 576 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #DDECE8)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="575"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
<div
className="font-['Noto_Sans:SemiBold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] opacity-[0.72] relative shrink-0 text-[#ffffff] text-[16px] text-left w-full"
style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }} >
<ul className="css-ed5n1g">
<li className="list-disc ms-6">
<span className="leading-[1.68]">
「情報設計コース」の「ゼロからユーザー行動フロー」レッスンで、今回のお題を解説しています。デザインを行動フローを解説しながら解説しているので基礎も身につけたい方は BONO メンバーシップになって解答を確認してください。
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3466943() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText2 />
</div>
);
}

function Frame3467319() {
return <div className="h-[105px] shrink-0 w-[163px]" />;
}

function BlockText3() {
return (
<div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-left text-nowrap text-slate-900 tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
ゼロからユーザー行動フロー
</p>
</div>
</div>
);
}

function HeadingExplainBlock() {
return (
<div
      className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<BlockText3 />
</div>
);
}

function Frame3467315() {
return (
<div className="box-border content-stretch flex flex-col gap-1 h-[61px] items-start justify-start p-0 relative shrink-0 w-full">
<HeadingExplainBlock />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#171923] text-[16px] text-left w-full">
<p className="block leading-[1.68]">
進め方の基礎は BONO で詳細に学習・実践できます
</p>
</div>
</div>
);
}

function ArrowRight2() {
return (
<div className="relative shrink-0 size-5" data-name="Arrow Right">
<svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        role="presentation"
        viewBox="0 0 20 20"
      >
<g id="Arrow Right">
<path d={svgPaths.p8bfe380} fill="var(--fill-0, #0D221D)" />
<path d={svgPaths.p8bfe380} stroke="var(--stroke-0, #374151)" />
<path d={svgPaths.p37894d00} fill="var(--fill-0, white)" id="Union" />
</g>
</svg>
</div>
);
}

function ApplyButton() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-center px-0 py-1 relative rounded-[9999px] shrink-0"
      data-name="Apply Button"
    >
<div className="font-['Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[0] relative shrink-0 text-[12px] text-gray-900 text-left text-nowrap">
<p className="block leading-[16px] whitespace-pre">レッスン内容へ</p>
</div>
<ArrowRight2 />
</div>
);
}

function Footer() {
return (
<div
      className="box-border content-stretch flex flex-row items-center justify-start p-0 relative shrink-0"
      data-name="Footer"
    >
<ApplyButton />
</div>
);
}

function Frame3467314() {
return (
<div className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0">
<Frame3467315 />
<Footer />
</div>
);
}

function HeadingExplainBlock1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466943 />
<div
        className="bg-[#e1e7e6] relative rounded-3xl shrink-0 w-full"
        data-name="wrap"
      >
<div className="flex flex-row items-center overflow-clip relative size-full">
<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start px-8 py-4 relative w-full">
<Frame3467319 />
<Frame3467314 />
</div>
</div>
</div>
</div>
);
}

function Wrap1() {
return (
<div
      className="bg-[#000000] box-border content-stretch flex flex-col gap-2 items-center justify-start px-8 py-4 relative rounded-3xl shrink-0 w-[640px]"
      data-name="wrap"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<HeadingExplainBlock1 />
</div>
);
}

function Frame3467318() {
return (
<div className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-[768px]">
<Frame3467284 />
<Wrap1 />
</div>
);
}

function Component3() {
return (
<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center pb-24 pt-0 px-0 relative shrink-0 w-full"
      data-name="#デザイン解答例"
    >
<div className="absolute border-[0px_0px_1px] border-slate-400 border-solid inset-0 pointer-events-none" />
<Frame3467318 />
</div>
);
}

export default function Frame3467322() {
return (
<div className="box-border content-stretch flex flex-col items-start justify-start p-0 relative size-full">
<Tableofcontents />
<Frame3467293 />
<Component3 />
</div>
);
}

## ナビゲーション

新しく追加します

- 戻るは 前のページに戻るナビゲーション
- TRAINING 01 は「01」は order_number が表示。 training は固定です。

### 該当の参考コードコード

<div className="box-border content-stretch flex flex-row h-6 items-center justify-between px-10 py-0 relative w-full">
          <Frame3467320 />
          <NumberoforderIndex />
          <Frame3467321 />
        </div>

## アイキャッチ部分

タイトルやディスクリプションを表示します。
解答へボタンは、デザイン解答のセクションがあればボタンを表示します。

### 該当の参考コード

<div
      className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="wrapper"
    >
      <Block />
      <Heading />
      <Button />
    </div>

## チャレンジ内容＋デザインするもの

content.md の内容に沿って表示
content.md の ## から始まる見出しとその中の ###の見出しのブロックに連動して同じスタイルで表示されていくもの。マークダウンだけでわかりづらい場合は、div ＋ Class 名とかを使っても OK.

### 該当コード

function BlockText() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#ffffff] text-center tracking-[1px] w-full"
      data-name="block-Text"
    >
<div
className="flex flex-col font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[12px] w-full"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p className="block leading-[1.6]">(結論)</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[24px] w-full">
<p className="block leading-[1.6]">チャレンジ内容</p>
</div>
</div>
);
}

function Frame3466941() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
<BlockText />
</div>
);
}

function Component() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="###"
    >
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
社内で利用する本の貸し出しシステムをデザインしよう
</p>
</div>
</div>
);
}

function Block() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-###"
    >
<Component />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-left text-slate-900 w-full">
<p className="block mb-0">
🧑‍💼 会社の社内で利用する社員向け本棚の本貸し出しシステムをデザインします。
</p>
<p className="block mb-0">
本貸し出しをしているんだけど、期限が曖昧だったり、今どこにその本があるのかわからないからシステムにすることにしたのが背景です。
</p>
<p className="block mb-0">&nbsp;</p>
<p className="block">
社員の感想などもデータにして、知識での写真コミュニケーションが広が理、社内の意識を少しでも変えられると良いなと思っています。
</p>
</div>
</div>
);
}

function Component1() {
return (
<div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="###"
    >
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
本を借りる側の体験をデザインしましょう
</p>
</div>
</div>
);
}

function Block1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-###"
    >
<Component1 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
本を借りる側が「本を探す〜予約〜借りる」→「返却する」までの UI 体験をデザインしてください。
</span>
</li>
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
本管理側（本の登録など）の体験は考えなくて OK です。
</span>
</li>
<li className="mb-0 ms-[27px]">
<span className="leading-[28px]">
社内なので本自体は物理本を想定しています。
</span>
</li>
<li className="ms-[27px]">
<span className="leading-[28px]">
物理本に付いている『QR』で、貸し出しと返却を照合できます。
</span>
</li>
</ul>
</div>
</div>
);
}

function Lists() {
return (
<div
      className="box-border content-stretch flex flex-col gap-6 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Block />
<Block1 />
</div>
);
}

function Component2() {
return (
<div
      className="bg-[#ffffff] relative rounded-[56px] shrink-0 w-full"
      data-name="##チャレンジ内容"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[56px]" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-[56px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466941 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 628 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="627"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists />
</div>
</div>
</div>
);
}

function BlockText1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[#ffffff] text-center tracking-[1px] w-full"
      data-name="block-Text"
    >
<div
className="flex flex-col font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal justify-center relative shrink-0 text-[12px] w-full"
style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }} >
<p className="block leading-[1.6]">(結論)</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[24px] w-full">
<p className="block leading-[1.6]">デザインするもの</p>
</div>
</div>
);
}

function Frame3466942() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
<BlockText1 />
</div>
);
}

function Frame3467294() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
要件から必要な情報を整理したもの
</p>
</div>
</div>
);
}

function Bottom() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-600 w-full">
<p className="block leading-[28px]">
ゴール定義と、なぜ今その状態に至れないないのか、の課題定義を通した顧客像の定義
</p>
</div>
</div>
);
}

function Frame3467295() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
必要なユーザーの行動の流れを整理したもの
</p>
</div>
</div>
);
}

function Bottom1() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[18px] text-left text-slate-600 w-full">
<p className="block leading-[28px]">
インタビューした結果をまとめましょう。
</p>
</div>
</div>
);
}

function Frame3467159() {
return (
<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom1 />
</div>
);
}

function Frame3467296() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
ユーザー行動を「UI の要件定義」にしたもの
</p>
</div>
</div>
);
}

function Frame3467297() {
return (
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap">
<p className="block leading-[28px] whitespace-pre">
UI の遷移がわかる触れるプロトタイプ
</p>
</div>
</div>
);
}

function Bottom4() {
return (
<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467294 />
<Bottom />
<Frame3467295 />
<Frame3467159 />
<Frame3467296 />
<Frame3467159 />
<Frame3467297 />
<Frame3467159 />
</div>
);
}

function Frame3467156() {
return (
<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom4 />
</div>
);
}

function Lists1() {
return (
<div
      className="box-border content-stretch flex flex-col items-start justify-center p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Frame3467156 />
</div>
);
}

function Wrap() {
return (
<div
      className="bg-[#ffffff] relative rounded-[56px] shrink-0 w-full"
      data-name="wrap"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-[56px]" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-[56px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466942 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 628 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="627"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists1 />
</div>
</div>
</div>
);
}

export default function Frame3467292() {
return (
<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative size-full">
<Component2 />
<Wrap />
</div>
);
}

## デザイン解答例

"デザイン解答例" という ## がある場合に表示するブロック。
