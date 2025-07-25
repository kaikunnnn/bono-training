# index.md のスタイルを共有するコードのスタイルとレイアウトをもとに回収しつつ、index.md の情報をそのデザインに反映できるようにする

## やりたいこと

- 対象になるページの例 http://localhost:8080/training/info-odai-book-rental (この仕組みで表示されるページ)
- いかに共有するレイアウト ✖️ コードの全体像をもとに :trainingSlug のページのスタイルを改善して欲しいです。
- かつ、index.md の中のデータをページにしっかり反映できるようにしたいです。
- トレーニング一覧は :taskSlug の一覧でもあるので、その情報をしっかり出せるようにして欲しいです。

## コードの全体像

スタイルはこれをもとにやって欲しいです。内容がとても長いのでもし全体を読み取れない場合かなりやばいので、教えてください。

### ページ全体のスタイルの理想に近いコード

import svgPaths from "./svg-3cjf8n7wbl";
import img from "figma:asset/99caa15a502e2bad15fe5610082d7087d3d30138.png";
import imgImageLessonThumbnail from "figma:asset/2918b9505bd16fcbfd5015fa8134baafee5d2457.png";

function Component1() {
return (

<div className="relative size-full" data-name="Component 1">
<div
        className="absolute bottom-[44.828%] left-0 right-0 top-0"
        data-name="logo"
      >
<div className="absolute flex flex-col font-['Futura:Bold',_sans-serif] inset-0 justify-center leading-[0] not-italic text-[#000000] text-[20px] text-center text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[16px] whitespace-pre">
BONO
</p>
</div>
</div>
<div className="absolute bottom-0 flex flex-col font-['Futura:Bold',_sans-serif] justify-center leading-[0] left-[15.068%] not-italic right-[15.068%] text-[#666666] text-[8px] text-center text-nowrap top-[72.414%] tracking-[1px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
TRAINING
</p>
</div>
</div>
);
}

interface ComponentProps {
property1?: "Default" | "Variant2";
}

function Component({ property1 = "Default" }: ComponentProps) {
if (property1 === "Variant2") {
return (

<div className="relative size-full" data-name="Property 1=Variant2">
<div
          className="absolute h-3.5 left-[-21px] top-[308px] w-[1695px]"
          data-name="line-wave"
        >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1695 14"
          >
<g clipPath="url(#clip0_3_4644)" id="line-wave" opacity="0.14">
<path
                d={svgPaths.p1c674c40}
                id="Vector"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p10972080}
                id="Vector_2"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p307d4c00}
                id="Vector_3"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p997dc00}
                id="Vector_4"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p1c061a00}
                id="Vector_5"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p17cdfa00}
                id="Vector_6"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p3d7f5880}
                id="Vector_7"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p2b25c780}
                id="Vector_8"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
<path
                d={svgPaths.p23fe8680}
                id="Vector_9"
                stroke="var(--stroke-0, #3B0764)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.75"
              />
</g>
<defs>
<clipPath id="clip0_3_4644">
<rect fill="white" height="14" width="1695" />
</clipPath>
</defs>
</svg>
</div>
</div>
);
}
return (
<div className="relative size-full" data-name="Property 1=Default">
<div
        className="absolute h-3.5 left-[-21px] top-[308px] w-[1695px]"
        data-name="line-wave"
      >
<svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1695 14"
        >
<g clipPath="url(#clip0_3_4644)" id="line-wave" opacity="0.14">
<path
              d={svgPaths.p1c674c40}
              id="Vector"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p10972080}
              id="Vector_2"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p307d4c00}
              id="Vector_3"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p997dc00}
              id="Vector_4"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p1c061a00}
              id="Vector_5"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p17cdfa00}
              id="Vector_6"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p3d7f5880}
              id="Vector_7"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p2b25c780}
              id="Vector_8"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
<path
              d={svgPaths.p23fe8680}
              id="Vector_9"
              stroke="var(--stroke-0, #3B0764)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.75"
            />
</g>
<defs>
<clipPath id="clip0_3_4644">
<rect fill="white" height="14" width="1695" />
</clipPath>
</defs>
</svg>
</div>
</div>
);
}

interface Component4Props {
property1?:
| "tag-info"
| "tag-layout"
| "tag-strategy"
| "tag-visual"
| "explain";
}

function Component4({ property1 = "tag-visual" }: Component4Props) {
const element = (

<p className="block leading-[16px] whitespace-pre">ビジュアル</p>
);
if (property1 === "tag-layout") {
return (
<div
        className="bg-[rgba(0,135,14,0.12)] relative rounded size-full"
        data-name="Property 1=tag-layout"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#00870e] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">レイアウト</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "tag-info") {
return (
<div
        className="bg-[rgba(184,4,85,0.12)] relative rounded size-full"
        data-name="Property 1=tag-info"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#b80455] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">情報設計</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "tag-strategy") {
return (
<div
        className="bg-[rgba(186,24,255,0.12)] relative rounded size-full"
        data-name="Property 1=tag-strategy"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#9c0bdb] text-[0px] text-center text-nowrap">
<p className="leading-[16px] text-[12px] whitespace-pre">
要
<span className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium tracking-[-2.4px]">
件
</span>
<span className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium tracking-[-2.28px]">
・
</span>
戦略
</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "explain") {
return (
<div
        className="bg-[rgba(184,163,4,0.12)] relative rounded size-full"
        data-name="Property 1=explain"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
{element}
</div>
</div>
</div>
</div>
);
}
return (
<div
      className="bg-[rgba(24,81,255,0.12)] relative rounded size-full"
      data-name="Property 1=tag-visual"
    >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#1851ff] text-[12px] text-center text-nowrap">
{element}
</div>
</div>
</div>
</div>
);
}

function Frame625086() {
return (

<div className="bg-[#0d0f18] box-border content-stretch flex flex-row gap-1 items-center justify-start pl-3 pr-2 py-1 relative rounded-bl-[10px] rounded-br-[10px] shrink-0">
<div className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-br-[10px]" />
<div className="flex flex-col font-['Futura:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[10.5px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[12px] whitespace-pre">
BONO
</p>
</div>
<div
        className="overflow-clip relative shrink-0 size-4"
        data-name="icon/arrow/ohterpage"
      >
<div
          className="absolute bottom-[16.667%] left-[16.667%] right-[20.833%] top-[20.833%]"
          data-name="Vector"
        >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 10 10"
          >
<path
              d={svgPaths.p19435d00}
              fill="var(--fill-0, white)"
              id="Vector"
            />
</svg>
</div>
</div>
</div>
);
}

function Frame3466892() {
return (

<div className="relative shrink-0 w-full">
<div className="flex flex-col items-end relative size-full">
<div className="box-border content-stretch flex flex-col gap-2.5 items-end justify-start px-6 py-0 relative w-full">
<Frame625086 />
</div>
</div>
</div>
);
}

function HeaderMenuitem() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-start px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
トレーニング
</p>
</div>
</div>
</div>
);
}

function HeaderMenuitem1() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-start px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
デザインお題
</p>
</div>
</div>
</div>
);
}

function HeaderMenuitem2() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-start px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
遊び方
</p>
</div>
</div>
</div>
);
}

function Menu() {
return (

<div
      className="box-border content-stretch flex flex-row items-start justify-start p-0 relative shrink-0 w-[480px]"
      data-name="menu"
    >
<HeaderMenuitem />
<HeaderMenuitem1 />
<HeaderMenuitem2 />
</div>
);
}

function HeaderMenuitem3() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-start px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
ログイン
</p>
</div>
</div>
</div>
);
}

function HeaderMenuitem4() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-start px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
はじめる
</p>
</div>
</div>
</div>
);
}

function HeaderMenuitem5() {
return (

<div
      className="box-border content-stretch flex flex-row gap-1 h-16 items-center justify-end px-2 py-0 relative shrink-0"
      data-name="header-menuitem"
    >
<div className="absolute border-0 border-[#eda789] border-solid inset-0 pointer-events-none" />
<HeaderMenuitem3 />
<HeaderMenuitem4 />
</div>
);
}

function RightWrap() {
return (

<div
      className="box-border content-stretch flex flex-row items-center justify-end p-0 relative shrink-0 w-[480px]"
      data-name="right-wrap"
    >
<HeaderMenuitem5 />
</div>
);
}

function Header() {
return (

<div className="relative shrink-0 w-full" data-name="Header">
<div className="flex flex-row items-center relative size-full">
<div className="box-border content-stretch flex flex-row items-center justify-between px-5 py-0 relative w-full">
<Menu />
<div
            className="h-[29px] relative shrink-0 w-[243px]"
            data-name="Component 1"
          >
<Component1 />
</div>
<RightWrap />
</div>
</div>
</div>
);
}

function Header1() {
return (

<div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-[1442px]"
      data-name="HEADER"
    >
<Frame3466892 />
<Header />
</div>
);
}

function HeaderBg() {
return (

<div
      className="absolute h-[1147px] left-[3.5px] overflow-clip top-[-987px] w-[1452px]"
      data-name="header-bg"
    >
<div
        className="absolute h-[399px] left-[-214px] overflow-clip top-[888px] w-[1920px]"
        data-name="表紙"
      >
<Component property1="Variant2" />
</div>
</div>
);
}

function Frame3467260() {
return (

<div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-[15px] items-center justify-center p-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] shrink-0 size-[120px]">
<div className="absolute border-[1.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px]" />
<div className="relative shrink-0 size-[68px]" data-name="Component 3">
<div
className="absolute bg-center bg-cover bg-no-repeat inset-0"
data-name="Image"
style={{ backgroundImage: `url('${img}')` }}
/>
</div>
</div>
);
}

function Category() {
return (

<div
      className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0"
      data-name="category"
    >
<div
        className="bg-[rgba(184,4,85,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="Component 4"
      >
<Component4 property1="tag-info" />
</div>
</div>
);
}

function Frame3467309() {
return (

<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0">
<div
        className="box-border content-stretch flex flex-row gap-1 items-center justify-start p-0 relative shrink-0"
        data-name="type"
      >
<div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0"
          data-name="Component 2"
        >
<div className="bg-gradient-to-b from-[#0618e3] rounded-[1000px] shrink-0 size-2 to-[#3cf5fc]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
ポートフォリオお題
</p>
</div>
</div>
</div>
<Category />
</div>
);
}

function Frame3467259() {
return (

<div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full">
<Frame3467309 />
<div
className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[#0d221d] text-[32px] text-center tracking-[0.75px]"
style={{ width: "min-content" }} >
<p className="block leading-[1.49]">
社内で使う本貸し出しシステムのデザイン
</p>
</div>
<div
className="font-['Rounded_Mplus_1c:Regular',_sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[#0d221d] text-[16px] text-center tracking-[1px]"
style={{ width: "min-content" }} >
<p className="block leading-[1.6]">
設定された「社内本貸し出しシステム」の内容をもとにサービスのデザインをゼロから行いましょう。期限が曖昧だったり、今どこにその本があるのかわからない、という現状を解決するサービスを作ろう。
</p>
</div>
</div>
);
}

function ButtonContainer() {
return (

<div
      className="box-border content-stretch flex flex-row gap-4 items-center justify-center p-0 relative shrink-0 w-full"
      data-name="Button Container"
    >
<div
        className="bg-[#0d221d] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border border-[rgba(13,15,24,0.81)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
はじめる
</p>
</div>
</div>
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
進め方をみる
</p>
</div>
</div>
</div>
);
}

function Frame3466936() {
return (

<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-6 pt-2 px-0 relative shrink-0 w-[766px]">
<Frame3467260 />
<div
        className="absolute left-[1053.5px] size-[150px] top-[294px]"
        data-name="Placeholder Frame"
      />
<Frame3467259 />
<ButtonContainer />
</div>
);
}

function Frame3467268() {
return (

<div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-[10px] relative shrink-0 w-[1440px]">
<div className="absolute border-[0px_0px_1px] border-slate-200 border-solid inset-0 pointer-events-none" />
<Frame3466936 />
</div>
);
}

function HowToPlay() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start mb-[-140px] p-0 relative shrink-0"
      data-name="HowToPlay"
    >
<Frame3467268 />
</div>
);
}

function SectionEyecatch() {
return (

<div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[140px] pt-0 px-0 relative shrink-0"
      data-name="section-eyecatch"
    >
<div
        className="absolute h-[140px] left-0 top-5 w-[1440px]"
        data-name="halfcircle-object"
      >
<div className="absolute bottom-[-1.429%] left-[-0.278%] right-[-0.278%] top-[-4.286%]">
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1448 148"
          >
<g filter="url(#filter0_d_3_4634)" id="halfcircle-object">
<path d={svgPaths.p1c2be800} fill="var(--fill-0, #F7F7F7)" />
</g>
<defs>
<filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="148"
                id="filter0_d_3_4634"
                width="1448"
                x="0"
                y="0"
              >
<feFlood floodOpacity="0" result="BackgroundImageFix" />
<feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
<feOffset dy="-2" />
<feGaussianBlur stdDeviation="2" />
<feComposite in2="hardAlpha" operator="out" />
<feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
                />
<feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_3_4634"
                />
<feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_3_4634"
                  mode="normal"
                  result="shape"
                />
</filter>
</defs>
</svg>
</div>
</div>
<HowToPlay />
</div>
);
}

function Frame3467262() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame18() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame18 />
</div>
</div>
</div>
);
}

function Arrow() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467279() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
”使いやすい UI”を要件とユーザーから設計する力
</p>
</div>
<Arrow />
</div>
);
}

function Frame3467264() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467262 />
<Frame3467279 />
</div>
);
}

function Frame3467263() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame19() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow1() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame19 />
</div>
</div>
</div>
);
}

function Arrow1() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow1 />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467280() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d221d] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
機能や状態を網羅して UI 設計する力
</p>
</div>
<Arrow1 />
</div>
);
}

function Frame3467270() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467263 />
<Frame3467280 />
</div>
);
}

function Frame3467265() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame20() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow2() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame20 />
</div>
</div>
</div>
);
}

function Arrow2() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow2 />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467281() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d221d] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
ユーザーゴールから配慮するべきものを UI に落とす
</p>
</div>
<Arrow2 />
</div>
);
}

function Frame3467269() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467265 />
<Frame3467281 />
</div>
);
}

function List() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0"
      data-name="list"
    >
<Frame3467264 />
<Frame3467270 />
<Frame3467269 />
</div>
);
}

function Contents() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Contents"
    >
<List />
</div>
);
}

function BlockText() {
return (

<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
チャレンジで身につくこと
</p>
</div>
<Contents />
</div>
);
}

function ChallengeMerit() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-8 pt-6 px-0 relative shrink-0 w-[768px]"
      data-name="challenge-merit"
    >
<div className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none" />
<BlockText />
</div>
);
}

function BlockText1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
トレーニング内容
</p>
</div>
</div>
);
}

function Frame3466941() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full">
<BlockText1 />
</div>
);
}

function HeadingExplainBlock() {
return (

<div
      className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466941 />
</div>
);
}

function Wrap() {
return (

<div
      className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-0 relative shrink-0 w-[768px]"
      data-name="wrap"
    >
<HeadingExplainBlock />
</div>
);
}

function Frame3467267() {
return <div className="bg-[#0d221d] rounded-[40px] shrink-0 size-2" />;
}

function Frame3467282() {
return (

<div className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-2 items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-center text-nowrap">
<div className="relative shrink-0 text-[12px]">
<p className="block leading-none text-nowrap whitespace-pre">
CHALLENGE
</p>
</div>
<div className="relative shrink-0 text-[16px]">
<p className="block leading-none text-nowrap whitespace-pre">01</p>
</div>
</div>
);
}

function Frame3467271() {
return (

<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0">
<Frame3467267 />
<Frame3467282 />
</div>
);
}

function Test() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start leading-[0] p-0 relative shrink-0 text-left w-full"
      data-name="Test"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#0d0f18] text-[18px] tracking-[0.75px] w-full">
<p className="block leading-[1.6]">
社内本貸し出しシステムをデザインしよう
</p>
</div>
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium not-italic relative shrink-0 text-[14px] text-slate-900 w-full">
<p className="block leading-[1.85]">
ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です
</p>
</div>
</div>
);
}

function Frame3467266() {
return (

<div className="box-border content-stretch flex flex-row font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-normal gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[0px] text-left text-nowrap text-slate-400 tracking-[1px] w-full">
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

function Left() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="left"
    >
<div
        className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="tag"
      >
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">説明</p>
</div>
</div>
<Test />
<Frame3467266 />
</div>
);
}

function Frame21() {
return (

<div className="relative size-[13.333px]">
<div className="absolute flex h-[19.689px] items-center justify-center right-[0.196px] top-0 w-[19.689px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[13.934px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-6.495%] left-[-6.495%] right-[-4.593%] top-[-4.593%]"
style={
{
"--fill-0": "rgba(255, 255, 255, 1)",
"--stroke-0": "rgba(255, 255, 255, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 8 8"
                >
<path
                    d={svgPaths.p1a0cce00}
                    fill="var(--fill-0, white)"
                    id="Vector"
                    stroke="var(--stroke-0, white)"
                    strokeWidth="0.266667"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function Arrow3() {
return (

<div
      className="bg-[#238cf0] relative rounded-[666.667px] shrink-0"
      data-name="arrow"
    >
<div className="box-border content-stretch flex flex-row gap-[6.667px] items-start justify-start overflow-clip p-[8px] relative">
<div
          className="box-border content-stretch flex flex-row gap-[1.203px] items-center justify-center p-[1.203px] relative rounded-[41.803px] shrink-0 size-4"
          data-name="icon/arrow/longarrow"
        >
<div className="flex h-[13.328px] items-center justify-center relative shrink-0 w-[13.328px]">
<div className="flex-none rotate-[270deg]">
<Frame21 />
</div>
</div>
</div>
</div>
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[666.667px]" />
</div>
);
}

function BlockText2() {
return (

<div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Left />
<Arrow3 />
</div>
);
}

function Wrap1() {
return (

<div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl shrink-0"
      data-name="wrap"
    >
<div className="flex flex-col items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-center p-[32px] relative w-full">
<BlockText2 />
</div>
</div>
</div>
);
}

function Frame3467275() {
return (

<div className="box-border content-stretch flex flex-row gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
<div className="flex h-[153px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[153px]">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{
"--stroke-0": "rgba(148, 163, 184, 1)",
} as React.CSSProperties
} >
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 153 2"
              >
<line
                  id="Line 8"
                  stroke="var(--stroke-0, #94A3B8)"
                  strokeDasharray="6 4"
                  strokeWidth="2"
                  x2="153"
                  y1="1"
                  y2="1"
                />
</svg>
</div>
</div>
</div>
</div>
<Wrap1 />
</div>
);
}

function Frame3467276() {
return (

<div className="box-border content-stretch flex flex-col gap-[11px] items-start justify-start p-0 relative shrink-0 w-full">
<Frame3467271 />
<Frame3467275 />
</div>
);
}

function Frame3467277() {
return (

<div className="box-border content-stretch flex flex-col gap-[35px] items-start justify-start p-0 relative shrink-0 w-full">
<Wrap />
<Frame3467276 />
</div>
);
}

function TaskCollectionBlock() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-16 pt-6 px-0 relative shrink-0 w-[768px]"
      data-name="task-collection-block"
    >
<Frame3467277 />
</div>
);
}

function SectionOveriview() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="section-overiview"
    >
<ChallengeMerit />
<TaskCollectionBlock />
</div>
);
}

function Frame3467284() {
return (

<div className="box-border content-stretch flex flex-col gap-3 items-center justify-start leading-[0] p-0 relative shrink-0 w-full">
<div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold not-italic relative shrink-0 text-[14px] text-center text-slate-900 w-[472px]">
<p className="block leading-[20px]">💪</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#0d0f18] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
このチャレンジで伸ばせる力
</p>
</div>
<div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal not-italic relative shrink-0 text-[16px] text-center text-slate-900 w-[472px]">
<p className="block leading-[1.88]">
トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。
</p>
</div>
</div>
);
}

function BlockText3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-start justify-start px-0 py-6 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467284 />
</div>
);
}

function Frame3467294() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
”使いやすい UI”を要件とユーザーから設計する力
</p>
</div>
</div>
);
}

function BlockText4() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467294 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の UI 作成スキル
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-skip-ink:none] [text-decoration-style:solid] [text-underline-position:from-font] font-['Inter:Bold',_'Noto_Sans_JP:Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-bold not-italic text-[#0e5ff7]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3466942() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText4 />
</div>
);
}

function HeadingExplainBlock1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466942 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Frame3467295() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
機能や状態を網羅して UI 設計する力
</p>
</div>
</div>
);
}

function BlockText5() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467295 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g">
<li className="list-disc ms-6">
<span className="leading-[1.68]">
要件を満たす情報や機能や状態のパターンを UI で網羅
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
<BlockText5 />
</div>
);
}

function HeadingExplainBlock2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466943 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Frame3467296() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
ユーザーゴールから配慮するべきものを UI に落とす
</p>
</div>
</div>
);
}

function BlockText6() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467296 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g">
<li className="list-disc ms-6">
<span className="leading-[1.68]">
ただ機能を作るのではなく、”使いやすさ”を考えた UI の配慮を設計する
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3466944() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText6 />
</div>
);
}

function HeadingExplainBlock3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466944 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Wrap2() {
return (

<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-start px-12 py-4 relative rounded-3xl shrink-0 w-[640px]"
      data-name="wrap"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<HeadingExplainBlock1 />
<HeadingExplainBlock2 />
<HeadingExplainBlock3 />
</div>
);
}

function SkillGroup() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="skill-group"
    >
<Wrap2 />
</div>
);
}

function Wrapper() {
return (

<div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-[640px]"
      data-name="wrapper"
    >
<BlockText3 />
<SkillGroup />
</div>
);
}

function SectionChallengeMerit() {
return (

<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center pb-16 pt-8 px-0 relative shrink-0 w-[1440px]"
      data-name="section-challenge-merit"
    >
<div className="absolute border-[0px_0px_1px] border-slate-400 border-solid inset-0 pointer-events-none" />
<Wrapper />
</div>
);
}

function Frame3467285() {
return (

<div className="box-border content-stretch flex flex-col gap-3 items-start justify-start leading-[0] p-0 relative shrink-0 text-nowrap">
<div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold not-italic relative shrink-0 text-[14px] text-center text-slate-900">
<p className="block leading-[20px] text-nowrap whitespace-pre">💪</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#0d0f18] text-[24px] text-left tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] text-nowrap whitespace-pre">
進め方ガイド
</p>
</div>
<div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-normal font-semibold leading-[24px] not-italic relative shrink-0 text-[0px] text-[16px] text-left text-slate-900 whitespace-pre">
<p className="block mb-0">
デザイン基礎を身につけながらデザインするための
</p>
<p className="block">やり方の流れを説明します。</p>
</div>
</div>
);
}

function BlockText7() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-start justify-start px-0 py-9 relative shrink-0 w-[730px]"
      data-name="block-Text"
    >
<Frame3467285 />
</div>
);
}

function Lefblock() {
return (

<div
      className="bg-[#ced3d2] h-[105px] relative rounded-2xl shrink-0 w-[163px]"
      data-name="lefblock"
    >
<div
className="absolute bg-center bg-cover bg-no-repeat h-[87px] left-[53px] rounded-br-[4px] rounded-tr-[4px] top-[9px] w-[58px]"
data-name="image-lesson-thumbnail"
style={{ backgroundImage: `url('${imgImageLessonThumbnail}')` }}
/>
</div>
);
}

function BlockText8() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
ゼロからはじめる情報設計
</p>
</div>
</div>
);
}

function HeadingExplainBlock4() {
return (

<div
      className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<BlockText8 />
</div>
);
}

function Frame3467315() {
return (

<div className="box-border content-stretch flex flex-col gap-1 h-[61px] items-start justify-start p-0 relative shrink-0 w-full">
<HeadingExplainBlock4 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#171923] text-[16px] text-left w-full">
<p className="block leading-[1.68]">
進め方の基礎は BONO で詳細に学習・実践できます
</p>
</div>
</div>
);
}

function ArrowRight() {
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
<ArrowRight />
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

function Rightblock() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="rightblock"
    >
<Frame3467315 />
<Footer />
</div>
);
}

function Lesson() {
return (

<div
      className="bg-[#e1e7e6] relative rounded-3xl shrink-0 w-full"
      data-name="lesson"
    >
<div className="flex flex-row items-center overflow-clip relative size-full">
<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start px-8 py-6 relative w-full">
<Lefblock />
<Rightblock />
</div>
</div>
</div>
);
}

function Lesson1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lesson"
    >
<div className="font-['Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[0] relative shrink-0 text-[#000000] text-[12px] text-left w-full">
<p className="block leading-[16px]">レッスンで身につける</p>
</div>
<Lesson />
</div>
);
}

function BlockText9() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[18px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-[27px]">
<span className="leading-[1.6]">
要件からユーザーが達成するべき目的を整理
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466945() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText9 />
</div>
);
}

function Bottom() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467156() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom />
</div>
);
}

function Bottom1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467156 />
</div>
);
}

function Lists() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom1 />
</div>
);
}

function DivClassStep() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466945 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
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

function BlockText10() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
目的(ゴール)までに必要なユーザーの行動を流れに
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466946() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText10 />
</div>
);
}

function Bottom2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467157() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom2 />
</div>
);
}

function Bottom3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467157 />
</div>
);
}

function Lists1() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom3 />
</div>
);
}

function DivClassStep1() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466946 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
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

function BlockText11() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
行動の流れから UI に必要な情報を洗い出そう
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466947() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText11 />
</div>
);
}

function Bottom4() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467158() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom4 />
</div>
);
}

function Bottom5() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467158 />
</div>
);
}

function Lists2() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom5 />
</div>
);
}

function DivClassStep2() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466947 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists2 />
</div>
</div>
</div>
);
}

function BlockText12() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
Low-Fi プロトでページの情報や遷移アイデアを出す
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466948() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText12 />
</div>
);
}

function Bottom6() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467159() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom6 />
</div>
);
}

function Bottom7() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467159 />
</div>
);
}

function Lists3() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom7 />
</div>
);
}

function DivClassStep3() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466948 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists3 />
</div>
</div>
</div>
);
}

function BlockText13() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#0d0f18] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
UI の精度を高めて完成まで進めよう
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466949() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText13 />
</div>
);
}

function Bottom8() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467160() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom8 />
</div>
);
}

function Bottom9() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467160 />
</div>
);
}

function Lists4() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom9 />
</div>
);
}

function DivClassStep4() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466949 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists4 />
</div>
</div>
</div>
);
}

function CollectionSteps() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[13px] items-center justify-start p-0 relative shrink-0 w-full"
      data-name="collection-steps"
    >
<DivClassStep />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep1 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep2 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep3 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep4 />
</div>
);
}

function SectionStepCollection() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="section-step-collection"
    >
<div className="font-['Noto_Sans_JP:Bold',_sans-serif] font-bold h-[27px] leading-[0] relative shrink-0 text-[#000000] text-[12px] text-left w-[640px]">
<p className="block leading-[16px]">進め方</p>
</div>
<CollectionSteps />
</div>
);
}

function Listofcard() {
return (

<div
      className="box-border content-stretch flex flex-col gap-7 items-center justify-start p-0 relative shrink-0 w-[730px]"
      data-name="listofcard"
    >
<Lesson1 />
<SectionStepCollection />
</div>
);
}

function Section() {
return (

<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center pb-24 pt-0 px-0 relative shrink-0 w-[1440px]"
      data-name="section-進め方ガイド"
    >
<div className="absolute border-[0px_0px_1px] border-slate-400 border-solid inset-0 pointer-events-none" />
<BlockText7 />
<Listofcard />
</div>
);
}

function Traingslug() {
return (

<div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[49px] pt-0 px-[201px] relative rounded-tl-[1000px] rounded-tr-[1000px] shrink-0 w-[1449px]"
      data-name="traingslug"
    >
<HeaderBg />
<SectionEyecatch />
<SectionOveriview />
<SectionChallengeMerit />
<Section />
</div>
);
}

export default function IndexMd() {
return (

<div
      className="bg-[#f7f7f7] box-border content-stretch flex flex-col items-center justify-start p-0 relative size-full"
      data-name="index.md"
    >
<Header1 />
<Traingslug />
</div>
);
}

## セクション：section-eyecatch

- index.md の title や description などが表示されます
- ボタンは今のリンクの仕組みを維持しっつ、スタイルのみ変更して。コンポーネントを使っている場合はそれを優先してください

#### コード

import svgPaths from "./svg-5l021cuciy";
import img from "figma:asset/99caa15a502e2bad15fe5610082d7087d3d30138.png";

interface Component4Props {
property1?:
| "tag-info"
| "tag-layout"
| "tag-strategy"
| "tag-visual"
| "explain";
}

function Component4({ property1 = "tag-visual" }: Component4Props) {
const element = (

<p className="block leading-[16px] whitespace-pre">ビジュアル</p>
);
if (property1 === "tag-layout") {
return (
<div
        className="bg-[rgba(0,135,14,0.12)] relative rounded size-full"
        data-name="Property 1=tag-layout"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#00870e] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">レイアウト</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "tag-info") {
return (
<div
        className="bg-[rgba(184,4,85,0.12)] relative rounded size-full"
        data-name="Property 1=tag-info"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#b80455] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">情報設計</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "tag-strategy") {
return (
<div
        className="bg-[rgba(186,24,255,0.12)] relative rounded size-full"
        data-name="Property 1=tag-strategy"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#9c0bdb] text-[0px] text-center text-nowrap">
<p className="leading-[16px] text-[12px] whitespace-pre">
要
<span className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium tracking-[-2.4px]">
件
</span>
<span className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium tracking-[-2.28px]">
・
</span>
戦略
</p>
</div>
</div>
</div>
</div>
);
}
if (property1 === "explain") {
return (
<div
        className="bg-[rgba(184,163,4,0.12)] relative rounded size-full"
        data-name="Property 1=explain"
      >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
{element}
</div>
</div>
</div>
</div>
);
}
return (
<div
      className="bg-[rgba(24,81,255,0.12)] relative rounded size-full"
      data-name="Property 1=tag-visual"
    >
<div className="flex flex-row items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-0.5 relative size-full">
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#1851ff] text-[12px] text-center text-nowrap">
{element}
</div>
</div>
</div>
</div>
);
}

function Frame3467260() {
return (

<div className="bg-[#ffffff] box-border content-stretch flex flex-row gap-[15px] items-center justify-center p-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] shrink-0 size-[120px]">
<div className="absolute border-[1.5px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px]" />
<div className="relative shrink-0 size-[68px]" data-name="Component 3">
<div
className="absolute bg-center bg-cover bg-no-repeat inset-0"
data-name="Image"
style={{ backgroundImage: `url('${img}')` }}
/>
</div>
</div>
);
}

function Category() {
return (

<div
      className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0"
      data-name="category"
    >
<div
        className="bg-[rgba(184,4,85,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="Component 4"
      >
<Component4 property1="tag-info" />
</div>
</div>
);
}

function Frame3467309() {
return (

<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0">
<div
        className="box-border content-stretch flex flex-row gap-1 items-center justify-start p-0 relative shrink-0"
        data-name="type"
      >
<div
          className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0"
          data-name="Component 2"
        >
<div className="bg-gradient-to-b from-[#0618e3] rounded-[1000px] shrink-0 size-2 to-[#3cf5fc]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
ポートフォリオお題
</p>
</div>
</div>
</div>
<Category />
</div>
);
}

function Frame3467259() {
return (

<div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full">
<Frame3467309 />
<div
className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[#0d221d] text-[32px] text-center tracking-[0.75px]"
style={{ width: "min-content" }} >
<p className="block leading-[1.49]">
社内で使う本貸し出しシステムのデザイン
</p>
</div>
<div
className="font-['Rounded_Mplus_1c:Regular',_sans-serif] leading-[0] min-w-full not-italic relative shrink-0 text-[#0d221d] text-[16px] text-center tracking-[1px]"
style={{ width: "min-content" }} >
<p className="block leading-[1.6]">
設定された「社内本貸し出しシステム」の内容をもとにサービスのデザインをゼロから行いましょう。期限が曖昧だったり、今どこにその本があるのかわからない、という現状を解決するサービスを作ろう。
</p>
</div>
</div>
);
}

function ButtonContainer() {
return (

<div
      className="box-border content-stretch flex flex-row gap-4 items-center justify-center p-0 relative shrink-0 w-full"
      data-name="Button Container"
    >
<div
        className="bg-[#0d221d] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border border-[rgba(255,255,255,0.81)] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
はじめる
</p>
</div>
</div>
<div
        className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-4 py-3 relative rounded-[1000px] shrink-0"
        data-name="button"
      >
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[1000px]" />
<div className="font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-none whitespace-pre">
進め方をみる
</p>
</div>
</div>
</div>
);
}

function Frame3466936() {
return (

<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start pb-6 pt-2 px-0 relative shrink-0 w-[766px]">
<Frame3467260 />
<div
        className="absolute left-[1053.5px] size-[150px] top-[294px]"
        data-name="Placeholder Frame"
      />
<Frame3467259 />
<ButtonContainer />
</div>
);
}

function Frame3467268() {
return (

<div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-[10px] relative shrink-0 w-[1440px]">
<div className="absolute border-[0px_0px_1px] border-slate-200 border-solid inset-0 pointer-events-none" />
<Frame3466936 />
</div>
);
}

function HowToPlay() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start mb-[-140px] p-0 relative shrink-0"
      data-name="HowToPlay"
    >
<Frame3467268 />
</div>
);
}

export default function SectionEyecatch() {
return (

<div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[140px] pt-0 px-0 relative size-full"
      data-name="section-eyecatch"
    >
<div
        className="absolute h-[140px] left-0 top-5 w-[1440px]"
        data-name="halfcircle-object"
      >
<div className="absolute bottom-[-1.429%] left-[-0.278%] right-[-0.278%] top-[-4.286%]">
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1448 148"
          >
<g filter="url(#filter0_d_3_4634)" id="halfcircle-object">
<path d={svgPaths.p1c2be800} fill="var(--fill-0, #F7F7F7)" />
</g>
<defs>
<filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="148"
                id="filter0_d_3_4634"
                width="1448"
                x="0"
                y="0"
              >
<feFlood floodOpacity="0" result="BackgroundImageFix" />
<feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
<feOffset dy="-2" />
<feGaussianBlur stdDeviation="2" />
<feComposite in2="hardAlpha" operator="out" />
<feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
                />
<feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_3_4634"
                />
<feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_3_4634"
                  mode="normal"
                  result="shape"
                />
</filter>
</defs>
</svg>
</div>
</div>
<HowToPlay />
</div>
);
}

## セクション：section-overiview

### challenge-merit

- 「このチャレンジで伸ばせる力」の見出しを使うセクションの項目と同じものをデータで表示したいです。
- それぞれの項目にリンクを貼って、「このチャレンジで伸ばせる力」のセクションのそれぞれの同じ項目にリンクを繋げて欲しいです。

#### コード

import svgPaths from "./svg-mm250qebf9";

function Frame3467262() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame18() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame18 />
</div>
</div>
</div>
);
}

function Arrow() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467279() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d0f18] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
”使いやすい UI”を要件とユーザーから設計する力
</p>
</div>
<Arrow />
</div>
);
}

function Frame3467264() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467262 />
<Frame3467279 />
</div>
);
}

function Frame3467263() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame19() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow1() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame19 />
</div>
</div>
</div>
);
}

function Arrow1() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow1 />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467280() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d221d] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
機能や状態を網羅して UI 設計する力
</p>
</div>
<Arrow1 />
</div>
);
}

function Frame3467268() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467263 />
<Frame3467280 />
</div>
);
}

function Frame3467265() {
return (

<div className="bg-neutral-50 relative rounded shrink-0 size-2.5">
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded" />
</div>
);
}

function Frame20() {
return (

<div className="relative size-[11.2px]">
<div className="absolute flex h-[11.026px] items-center justify-center right-[0.165px] top-0 w-[11.026px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[7.803px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-2.441%] left-[-2.441%] right-[-1.726%] top-[-1.726%]"
style={
{
"--fill-0": "rgba(35, 140, 240, 1)",
"--stroke-0": "rgba(35, 140, 240, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 6 6"
                >
<path
                    d={svgPaths.pbb45880}
                    fill="var(--fill-0, #238CF0)"
                    id="Vector"
                    stroke="var(--stroke-0, #238CF0)"
                    strokeWidth="0.0841918"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function IconArrowLongarrow2() {
return (

<div
      className="box-border content-stretch flex flex-row gap-[0.601px] items-center justify-center p-[0.601px] relative rounded-[13.934px] size-2"
      data-name="icon/arrow/longarrow"
    >
<div className="flex h-[11.188px] items-center justify-center relative shrink-0 w-[11.188px]">
<div className="flex-none rotate-[270deg]">
<Frame20 />
</div>
</div>
</div>
);
}

function Arrow2() {
return (

<div className="relative rounded-[416.667px] shrink-0" data-name="arrow">
<div className="box-border content-stretch flex flex-row gap-[4.167px] items-start justify-start overflow-clip p-[5px] relative">
<div className="flex h-[8px] items-center justify-center relative shrink-0 w-[8px]">
<div className="flex-none rotate-[90deg]">
<IconArrowLongarrow2 />
</div>
</div>
</div>
<div className="absolute border border-[#238cf0] border-solid inset-0 pointer-events-none rounded-[416.667px]" />
</div>
);
}

function Frame3467281() {
return (

<div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0">
<div className="font-['Inter:Semi_Bold',_'Noto_Sans_JP:Regular',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#0d221d] text-[0px] text-left text-nowrap">
<p className="block font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[24px] text-[16px] whitespace-pre">
ユーザーゴールから配慮するべきものを UI に落とす
</p>
</div>
<Arrow2 />
</div>
);
}

function Frame3467269() {
return (

<div className="box-border content-stretch flex flex-row gap-3 items-center justify-start p-0 relative shrink-0">
<Frame3467265 />
<Frame3467281 />
</div>
);
}

function List() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0"
      data-name="list"
    >
<Frame3467264 />
<Frame3467268 />
<Frame3467269 />
</div>
);
}

function Contents() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Contents"
    >
<List />
</div>
);
}

function BlockText() {
return (

<div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
チャレンジで身につくこと
</p>
</div>
<Contents />
</div>
);
}

export default function ChallengeMerit() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-8 pt-6 px-0 relative size-full"
      data-name="challenge-merit"
    >
<div className="absolute border-[0px_0px_1px] border-[rgba(0,0,0,0.08)] border-solid inset-0 pointer-events-none" />
<BlockText />
</div>
);
}

### task-collection-block

- :taskSlug の一覧が表示されます。:trainginSlug に紐づいているものです。
- challenge 01 　の部分、 challenge は固定で、数字は task の order_number になります。表示の順番も order_number が若い順に上から表示されます
- task ページのリンクを設定してください。

#### コード

import svgPaths from "./svg-aky7y76rkg";

function BlockText() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
トレーニング内容
</p>
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

function HeadingExplainBlock() {
return (

<div
      className="box-border content-stretch flex flex-col gap-8 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466941 />
</div>
);
}

function Wrap() {
return (

<div
      className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-0 relative shrink-0 w-[768px]"
      data-name="wrap"
    >
<HeadingExplainBlock />
</div>
);
}

function Frame3467262() {
return <div className="bg-[#0d221d] rounded-[40px] shrink-0 size-2" />;
}

function Frame3467279() {
return (

<div className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-2 items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-center text-nowrap">
<div className="relative shrink-0 text-[12px]">
<p className="block leading-none text-nowrap whitespace-pre">
CHALLENGE
</p>
</div>
<div className="relative shrink-0 text-[16px]">
<p className="block leading-none text-nowrap whitespace-pre">01</p>
</div>
</div>
);
}

function Frame3467264() {
return (

<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0">
<Frame3467262 />
<Frame3467279 />
</div>
);
}

function Test() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start leading-[0] p-0 relative shrink-0 text-left w-full"
      data-name="Test"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#ffffff] text-[18px] tracking-[0.75px] w-full">
<p className="block leading-[1.6]">
社内本貸し出しシステムをデザインしよう
</p>
</div>
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium not-italic relative shrink-0 text-[14px] text-slate-900 w-full">
<p className="block leading-[1.85]">
ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です
</p>
</div>
</div>
);
}

function Frame3467266() {
return (

<div className="box-border content-stretch flex flex-row font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-normal gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[0px] text-left text-nowrap text-slate-400 tracking-[1px] w-full">
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

function Left() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="left"
    >
<div
        className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="tag"
      >
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">説明</p>
</div>
</div>
<Test />
<Frame3467266 />
</div>
);
}

function Frame18() {
return (

<div className="relative size-[13.333px]">
<div className="absolute flex h-[19.689px] items-center justify-center right-[0.196px] top-0 w-[19.689px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[13.934px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-6.495%] left-[-6.495%] right-[-4.593%] top-[-4.593%]"
style={
{
"--fill-0": "rgba(255, 255, 255, 1)",
"--stroke-0": "rgba(255, 255, 255, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 8 8"
                >
<path
                    d={svgPaths.p1a0cce00}
                    fill="var(--fill-0, white)"
                    id="Vector"
                    stroke="var(--stroke-0, white)"
                    strokeWidth="0.266667"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function Arrow() {
return (

<div
      className="bg-[#238cf0] relative rounded-[666.667px] shrink-0"
      data-name="arrow"
    >
<div className="box-border content-stretch flex flex-row gap-[6.667px] items-start justify-start overflow-clip p-[8px] relative">
<div
          className="box-border content-stretch flex flex-row gap-[1.203px] items-center justify-center p-[1.203px] relative rounded-[41.803px] shrink-0 size-4"
          data-name="icon/arrow/longarrow"
        >
<div className="flex h-[13.328px] items-center justify-center relative shrink-0 w-[13.328px]">
<div className="flex-none rotate-[270deg]">
<Frame18 />
</div>
</div>
</div>
</div>
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[666.667px]" />
</div>
);
}

function BlockText1() {
return (

<div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Left />
<Arrow />
</div>
);
}

function Wrap1() {
return (

<div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl shrink-0"
      data-name="wrap"
    >
<div className="flex flex-col items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-center p-[32px] relative w-full">
<BlockText1 />
</div>
</div>
</div>
);
}

function Frame3467275() {
return (

<div className="box-border content-stretch flex flex-row gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
<div className="flex h-[153px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[153px]">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{
"--stroke-0": "rgba(148, 163, 184, 1)",
} as React.CSSProperties
} >
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 153 2"
              >
<line
                  id="Line 8"
                  stroke="var(--stroke-0, #94A3B8)"
                  strokeDasharray="6 4"
                  strokeWidth="2"
                  x2="153"
                  y1="1"
                  y2="1"
                />
</svg>
</div>
</div>
</div>
</div>
<Wrap1 />
</div>
);
}

function Task01() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[11px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="task01"
    >
<Frame3467264 />
<Frame3467275 />
</div>
);
}

function Frame3467263() {
return <div className="bg-[#0d221d] rounded-[40px] shrink-0 size-2" />;
}

function Frame3467280() {
return (

<div className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-2 items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-center text-nowrap">
<div className="relative shrink-0 text-[12px]">
<p className="block leading-none text-nowrap whitespace-pre">
CHALLENGE
</p>
</div>
<div className="relative shrink-0 text-[16px]">
<p className="block leading-none text-nowrap whitespace-pre">02</p>
</div>
</div>
);
}

function Frame3467265() {
return (

<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0">
<Frame3467263 />
<Frame3467280 />
</div>
);
}

function Test1() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start leading-[0] p-0 relative shrink-0 text-left w-full"
      data-name="Test"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#ffffff] text-[18px] tracking-[0.75px] w-full">
<p className="block leading-[1.6]">
社内本貸し出しシステムをデザインしよう
</p>
</div>
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium not-italic relative shrink-0 text-[14px] text-slate-900 w-full">
<p className="block leading-[1.85]">
ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインするお題です
</p>
</div>
</div>
);
}

function Frame3467267() {
return (

<div className="box-border content-stretch flex flex-row font-['Noto_Sans:Display_Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-normal gap-2 items-start justify-start leading-[0] p-0 relative shrink-0 text-[0px] text-left text-nowrap text-slate-400 tracking-[1px] w-full">
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

function Left1() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-col gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="left"
    >
<div
        className="bg-[rgba(184,163,4,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0"
        data-name="tag"
      >
<div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#5e4700] text-[12px] text-center text-nowrap">
<p className="block leading-[16px] whitespace-pre">説明</p>
</div>
</div>
<Test1 />
<Frame3467267 />
</div>
);
}

function Frame19() {
return (

<div className="relative size-[13.333px]">
<div className="absolute flex h-[19.689px] items-center justify-center right-[0.196px] top-0 w-[19.689px]">
<div className="flex-none rotate-[135deg]">
<div
            className="overflow-clip relative size-[13.934px]"
            data-name="north_east"
          >
<div className="absolute inset-[18.75%]" data-name="Vector">
<div
className="absolute bottom-[-6.495%] left-[-6.495%] right-[-4.593%] top-[-4.593%]"
style={
{
"--fill-0": "rgba(255, 255, 255, 1)",
"--stroke-0": "rgba(255, 255, 255, 1)",
} as React.CSSProperties
} >
<svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  role="presentation"
                  viewBox="0 0 8 8"
                >
<path
                    d={svgPaths.p1a0cce00}
                    fill="var(--fill-0, white)"
                    id="Vector"
                    stroke="var(--stroke-0, white)"
                    strokeWidth="0.266667"
                  />
</svg>
</div>
</div>
</div>
</div>
</div>
</div>
);
}

function Arrow1() {
return (

<div
      className="bg-[#238cf0] relative rounded-[666.667px] shrink-0"
      data-name="arrow"
    >
<div className="box-border content-stretch flex flex-row gap-[6.667px] items-start justify-start overflow-clip p-[8px] relative">
<div
          className="box-border content-stretch flex flex-row gap-[1.203px] items-center justify-center p-[1.203px] relative rounded-[41.803px] shrink-0 size-4"
          data-name="icon/arrow/longarrow"
        >
<div className="flex h-[13.328px] items-center justify-center relative shrink-0 w-[13.328px]">
<div className="flex-none rotate-[270deg]">
<Frame19 />
</div>
</div>
</div>
</div>
<div className="absolute border-2 border-[#0d221d] border-solid inset-0 pointer-events-none rounded-[666.667px]" />
</div>
);
}

function BlockText2() {
return (

<div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Left1 />
<Arrow1 />
</div>
);
}

function Wrap2() {
return (

<div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl shrink-0"
      data-name="wrap"
    >
<div className="flex flex-col items-center justify-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-center p-[32px] relative w-full">
<BlockText2 />
</div>
</div>
</div>
);
}

function Frame3467276() {
return (

<div className="box-border content-stretch flex flex-row gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
<div className="flex h-[153px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[153px]">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={
{
"--stroke-0": "rgba(148, 163, 184, 1)",
} as React.CSSProperties
} >
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 153 2"
              >
<line
                  id="Line 8"
                  stroke="var(--stroke-0, #94A3B8)"
                  strokeDasharray="6 4"
                  strokeWidth="2"
                  x2="153"
                  y1="1"
                  y2="1"
                />
</svg>
</div>
</div>
</div>
</div>
<Wrap2 />
</div>
);
}

function Task02() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[11px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="task02"
    >
<Frame3467265 />
<Frame3467276 />
</div>
);
}

function CollectionTasks() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[35px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="collection-tasks"
    >
<Task01 />
<Task02 />
</div>
);
}

function Frame3467277() {
return (

<div className="box-border content-stretch flex flex-col gap-[35px] items-start justify-start p-0 relative shrink-0 w-full">
<Wrap />
<CollectionTasks />
</div>
);
}

export default function TaskCollectionBlock() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-center justify-start pb-16 pt-6 px-0 relative size-full"
      data-name="task-collection-block"
    >
<Frame3467277 />
</div>
);
}

## セクション：section-challenge-merit

- 「このチャレンジで伸ばせる力」の情報を表示するものです。
- 現在のデザインとほぼ一緒なので、細部が違うところがあれば調整して下さい

#### コード

function Frame3467284() {
return (

<div className="box-border content-stretch flex flex-col gap-3 items-center justify-start leading-[0] p-0 relative shrink-0 w-full">
<div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold not-italic relative shrink-0 text-[14px] text-center text-slate-900 w-[472px]">
<p className="block leading-[20px]">💪</p>
</div>
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center relative shrink-0 text-[#ffffff] text-[24px] text-left text-nowrap tracking-[1px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
このチャレンジで伸ばせる力
</p>
</div>
<div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal not-italic relative shrink-0 text-[16px] text-center text-slate-900 w-[472px]">
<p className="block leading-[1.88]">
トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。
</p>
</div>
</div>
);
}

function BlockText() {
return (

<div
      className="box-border content-stretch flex flex-col gap-9 items-start justify-start px-0 py-6 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467284 />
</div>
);
}

function Frame3467294() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
”使いやすい UI”を要件とユーザーから設計する力
</p>
</div>
</div>
);
}

function BlockText1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467294 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の UI 作成スキル
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-skip-ink:none] [text-decoration-style:solid] [text-underline-position:from-font] font-['Inter:Bold',_'Noto_Sans_JP:Regular',_'Noto_Sans_JP:Bold',_sans-serif] font-bold not-italic text-[#0e5ff7]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3466941() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText1 />
</div>
);
}

function HeadingExplainBlock() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466941 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Frame3467295() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
機能や状態を網羅して UI 設計する力
</p>
</div>
</div>
);
}

function BlockText2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467295 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g">
<li className="list-disc ms-6">
<span className="leading-[1.68]">
要件を満たす情報や機能や状態のパターンを UI で網羅
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3466942() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText2 />
</div>
);
}

function HeadingExplainBlock1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466942 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Frame3467296() {
return (

<div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-full">
<div className="bg-[#0d221d] shrink-0 size-2.5" />
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
ユーザーゴールから配慮するべきものを UI に落とす
</p>
</div>
</div>
);
}

function BlockText3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<Frame3467296 />
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic opacity-[0.72] relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g">
<li className="list-disc ms-6">
<span className="leading-[1.68]">
ただ機能を作るのではなく、”使いやすさ”を考えた UI の配慮を設計する
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
<BlockText3 />
</div>
);
}

function HeadingExplainBlock2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center px-0 py-5 relative shrink-0 w-full"
      data-name="Heading-explainBlock"
    >
<Frame3466943 />
<div className="h-0 relative shrink-0 w-full">
<div
className="absolute bottom-0 left-0 right-0 top-[-2px]"
style={{ "--stroke-0": "rgba(51, 65, 85, 1)" } as React.CSSProperties} >
<svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            role="presentation"
            viewBox="0 0 544 2"
          >
<line
              id="Line 5"
              stroke="var(--stroke-0, #334155)"
              strokeDasharray="1 12"
              strokeLinecap="round"
              strokeWidth="2"
              x1="1"
              x2="543"
              y1="1"
              y2="1"
            />
</svg>
</div>
</div>
</div>
);
}

function Wrap() {
return (

<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-start px-12 py-4 relative rounded-3xl shrink-0 w-[640px]"
      data-name="wrap"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<HeadingExplainBlock />
<HeadingExplainBlock1 />
<HeadingExplainBlock2 />
</div>
);
}

function SkillGroup() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="skill-group"
    >
<Wrap />
</div>
);
}

function Wrapper() {
return (

<div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-[640px]"
      data-name="wrapper"
    >
<BlockText />
<SkillGroup />
</div>
);
}

export default function SectionChallengeMerit() {
return (

<div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center pb-16 pt-8 px-0 relative size-full"
      data-name="section-challenge-merit"
    >
<div className="absolute border-[0px_0px_1px] border-slate-400 border-solid inset-0 pointer-events-none" />
<Wrapper />
</div>
);
}

## セクション：section-進め方ガイド

### listofcard - lesson

- ここは index.md に情報があれば表示するセクションです。
- 既存の index.md に情報がないので、このスタイルをうまく表示するコンテンツマークダウンのやり方をまとめてください

#### コード

import svgPaths from "./svg-93qi4k8ss0";
import imgImageLessonThumbnail from "figma:asset/2918b9505bd16fcbfd5015fa8134baafee5d2457.png";

function Lefblock() {
return (

<div
      className="bg-[#ced3d2] h-[105px] relative rounded-2xl shrink-0 w-[163px]"
      data-name="lefblock"
    >
<div
className="absolute bg-center bg-cover bg-no-repeat h-[87px] left-[53px] rounded-br-[4px] rounded-tr-[4px] top-[9px] w-[58px]"
data-name="image-lesson-thumbnail"
style={{ backgroundImage: `url('${imgImageLessonThumbnail}')` }}
/>
</div>
);
}

function BlockText() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left text-nowrap tracking-[0.75px]">
<p className="adjustLetterSpacing block leading-[1.6] whitespace-pre">
ゼロからはじめる情報設計
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
<BlockText />
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

function ArrowRight() {
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
<ArrowRight />
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

function Rightblock() {
return (

<div
      className="basis-0 box-border content-stretch flex flex-col gap-1 grow items-start justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="rightblock"
    >
<Frame3467315 />
<Footer />
</div>
);
}

function Lesson() {
return (

<div
      className="bg-[#e1e7e6] relative rounded-3xl shrink-0 w-full"
      data-name="lesson"
    >
<div className="flex flex-row items-center overflow-clip relative size-full">
<div className="box-border content-stretch flex flex-row gap-5 items-center justify-start px-8 py-6 relative w-full">
<Lefblock />
<Rightblock />
</div>
</div>
</div>
);
}

export default function Lesson1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative size-full"
      data-name="lesson"
    >
<div className="font-['Noto_Sans_JP:Bold',_sans-serif] font-bold leading-[0] relative shrink-0 text-[#000000] text-[12px] text-left w-full">
<p className="block leading-[16px]">レッスンで身につける</p>
</div>
<Lesson />
</div>
);
}

### listofcard - section-step-collection

- index.md の#### 進め方、<div class="step">で囲われたセクションです。
- ステップの間には矢印を配置して欲しいです。ただ、複雑ですが 1 番最後に矢印は必要ないです。つまり 1 個しかない時は矢印は表示されないし、3 つの時は 3 つ目の下に矢印は表示されません

#### コード

import svgPaths from "./svg-s3kun8u576";

function BlockText() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[18px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-[27px]">
<span className="leading-[1.6]">
要件からユーザーが達成するべき目的を整理
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466941() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText />
</div>
);
}

function Bottom() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467156() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom />
</div>
);
}

function Bottom1() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467156 />
</div>
);
}

function Lists() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom1 />
</div>
);
}

function DivClassStep() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
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
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
目的(ゴール)までに必要なユーザーの行動を流れに
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466942() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText1 />
</div>
);
}

function Bottom2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467157() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom2 />
</div>
);
}

function Bottom3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467157 />
</div>
);
}

function Lists1() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom3 />
</div>
);
}

function DivClassStep1() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
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

function BlockText2() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
行動の流れから UI に必要な情報を洗い出そう
</span>
</li>
</ol>
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

function Bottom4() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467158() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom4 />
</div>
);
}

function Bottom5() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467158 />
</div>
);
}

function Lists2() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom5 />
</div>
);
}

function DivClassStep2() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466943 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists2 />
</div>
</div>
</div>
);
}

function BlockText3() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
Low-Fi プロトでページの情報や遷移アイデアを出す
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466944() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText3 />
</div>
);
}

function Bottom6() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467159() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom6 />
</div>
);
}

function Bottom7() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467159 />
</div>
);
}

function Lists3() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom7 />
</div>
);
}

function DivClassStep3() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466944 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists3 />
</div>
</div>
</div>
);
}

function BlockText4() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="block-Text"
    >
<div className="flex flex-col font-['Noto_Sans_JP:Bold',_sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[16px] text-left tracking-[0.75px] w-full">
<ol className="list-decimal" start="1">
<li className="ms-6">
<span className="leading-[1.6]">
UI の精度を高めて完成まで進めよう
</span>
</li>
</ol>
</div>
</div>
);
}

function Frame3466945() {
return (

<div className="box-border content-stretch flex flex-col gap-6 items-center justify-start p-0 relative shrink-0 w-full">
<BlockText4 />
</div>
);
}

function Bottom8() {
return (

<div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<div className="font-['Inter:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-left text-slate-900 w-full">
<ul className="css-ed5n1g list-disc">
<li className="mb-0 ms-6">
<span className="leading-[1.68]">
自分が良いと思うではなく、使う人目線の条件を達成する UI 作成能力をトレーニングするお題です。
</span>
</li>
<li className="leading-[1.68] ms-6">
参考リンク：
<span className="[text-decoration-line:underline] [text-decoration-style:solid] [text-underline-position:from-font] text-[#6b9fff]">
『〜〜〜〜〜〜〜〜〜〜〜〜』
</span>
</li>
</ul>
</div>
</div>
);
}

function Frame3467160() {
return (

<div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full">
<Bottom8 />
</div>
);
}

function Bottom9() {
return (

<div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="bottom"
    >
<Frame3467160 />
</div>
);
}

function Lists4() {
return (

<div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="lists"
    >
<Bottom9 />
</div>
);
}

function DivClassStep4() {
return (

<div
      className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full"
      data-name="<div class='step'>"
    >
<div className="absolute border-2 border-[#000000] border-solid inset-0 pointer-events-none rounded-3xl" />
<div className="flex flex-col items-center relative size-full">
<div className="box-border content-stretch flex flex-col gap-5 items-center justify-start p-[48px] relative w-full">
<div
            className="box-border content-stretch flex flex-col gap-5 items-start justify-center p-0 relative shrink-0 w-full"
            data-name="Heading-explainBlock"
          >
<Frame3466945 />
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
                  viewBox="0 0 634 2"
                >
<line
                    id="Line 5"
                    stroke="var(--stroke-0, #334155)"
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    strokeWidth="2"
                    x1="1"
                    x2="633"
                    y1="1"
                    y2="1"
                  />
</svg>
</div>
</div>
</div>
<Lists4 />
</div>
</div>
</div>
);
}

function CollectionSteps() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[13px] items-center justify-start p-0 relative shrink-0 w-full"
      data-name="collection-steps"
    >
<DivClassStep />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep1 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep2 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep3 />
<div className="flex h-[15px] items-center justify-center relative shrink-0 w-[0px]">
<div className="flex-none rotate-[90deg]">
<div className="h-0 relative w-[15px]" data-name="arrow">
<div className="absolute bottom-[-7.364px] left-0 right-[-6.667%] top-[-7.364px]">
<svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 16 16"
              >
<path
                  d={svgPaths.p1e05bd00}
                  fill="var(--stroke-0, black)"
                  id="arrow"
                />
</svg>
</div>
</div>
</div>
</div>
<DivClassStep4 />
</div>
);
}

export default function SectionStepCollection() {
return (

<div
      className="box-border content-stretch flex flex-col gap-[13px] items-start justify-start p-0 relative size-full"
      data-name="section-step-collection"
    >
<div className="font-['Noto_Sans_JP:Bold',_sans-serif] font-bold h-[27px] leading-[0] relative shrink-0 text-[#000000] text-[12px] text-left w-[640px]">
<p className="block leading-[16px]">進め方</p>
</div>
<CollectionSteps />
</div>
);
}
