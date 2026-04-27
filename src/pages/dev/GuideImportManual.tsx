/**
 * ガイド記事インポート マニュアル
 *
 * マークダウンからSanityへガイド記事を入稿する仕組みの解説ページ。
 * importGuide.ts スクリプトが対応する全構文を網羅。
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ── コードブロック表示用 ──

function Code({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 my-4">
      {title && (
        <div className="bg-gray-100 px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-200">
          {title}
        </div>
      )}
      <pre className="bg-gray-50 px-4 py-3 overflow-x-auto text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-gray-100 text-[13px] px-1.5 py-0.5 rounded font-mono text-pink-600">
      {children}
    </code>
  );
}

// ── セクション ──

function Section({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-bold text-gray-400 tracking-widest">
          {number}
        </span>
        <span className="text-xs font-bold text-gray-400 tracking-widest">
          {label}
        </span>
      </div>
      {title && (
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      )}
      <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-gray-800 mt-8 mb-3">{children}</h3>
  );
}

// ── メインコンポーネント ──

const GuideImportManual: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* ヘッダー */}
        <Link
          to="/dev"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dev Home
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Guide Import Manual
          </h1>
          <p className="text-gray-500 text-lg">
            マークダウンで書いた記事を Sanity に入稿する仕組みと構文リファレンス
          </p>
        </header>

        {/* 01 — 概要 */}
        <Section number="01" label="OVERVIEW" title="仕組みの概要">
          <p>
            ガイド記事は、<strong>マークダウンファイル</strong>を書き、
            <InlineCode>importGuide.ts</InlineCode>{" "}
            スクリプトを実行することで Sanity に入稿できます。
          </p>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-base">
                1
              </span>
              <span>マークダウンを書く（フロントマター + 本文）</span>
            </div>
            <div className="w-px h-4 bg-gray-300 ml-4" />
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-base">
                2
              </span>
              <span>スクリプトを実行</span>
            </div>
            <div className="w-px h-4 bg-gray-300 ml-4" />
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-base">
                3
              </span>
              <span>
                Sanity に Portable Text として保存 →{" "}
                <InlineCode>/guide/slug</InlineCode> で表示
              </span>
            </div>
          </div>
          <p>
            同じ <InlineCode>slug</InlineCode>{" "}
            のドキュメントが既にあれば<strong>上書き更新</strong>
            、なければ<strong>新規作成</strong>されます。
          </p>
        </Section>

        {/* 02 — 実行方法 */}
        <Section number="02" label="COMMAND" title="実行方法">
          <Code title="ターミナル">{`cd sanity-studio
npx tsx scripts/importGuide.ts <マークダウンファイルパス>`}</Code>
          <p>例:</p>
          <Code>{`npx tsx scripts/importGuide.ts ../content/guides/my-article.md`}</Code>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>必要な環境変数</strong>（<InlineCode>.env.local</InlineCode>
            ）:
            <InlineCode>SANITY_STUDIO_PROJECT_ID</InlineCode>、
            <InlineCode>SANITY_STUDIO_DATASET</InlineCode>、
            <InlineCode>SANITY_AUTH_TOKEN</InlineCode>
          </div>
        </Section>

        {/* 03 — フロントマター */}
        <Section number="03" label="FRONTMATTER" title="フロントマター（必須）">
          <p>
            ファイルの先頭に <InlineCode>---</InlineCode>{" "}
            で囲んだメタデータを記述します。
          </p>
          <Code title="フロントマター形式">{`---
title: 記事タイトル
slug: article-slug
category: career
description: 一覧ページに表示される説明文（1〜2文）
tags: [デザイン, キャリア, 初心者向け]
author: BONO
readingTime: 10分
isPremium: false
---`}</Code>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                    フィールド
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                    必須
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                    値
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>title</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    記事タイトル
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>slug</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    URL用スラッグ（英数字・ハイフン）
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>category</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>career</InlineCode> |{" "}
                    <InlineCode>learning</InlineCode> |{" "}
                    <InlineCode>industry</InlineCode> |{" "}
                    <InlineCode>tools</InlineCode>
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>description</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    一覧用の説明文
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>tags</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    配列形式 <InlineCode>[tag1, tag2]</InlineCode>
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>author</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    デフォルト: BONO
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>readingTime</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    例: <InlineCode>10分</InlineCode>
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>isPremium</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>true</InlineCode> |{" "}
                    <InlineCode>false</InlineCode>（デフォルト: false）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 04 — 標準マークダウン */}
        <Section
          number="04"
          label="MARKDOWN"
          title="標準マークダウン構文"
        >
          <p>通常のマークダウン構文がそのまま使えます。</p>

          <SubHeading>見出し</SubHeading>
          <Code>{`## H2 見出し
### H3 見出し
#### H4 見出し`}</Code>

          <SubHeading>テキスト装飾</SubHeading>
          <Code>{`**太字テキスト**
*斜体テキスト*
\`インラインコード\`
[リンクテキスト](https://example.com)`}</Code>

          <SubHeading>リスト</SubHeading>
          <Code>{`- 箇条書きリスト
- アイテム2
- アイテム3

1. 番号付きリスト
2. アイテム2
3. アイテム3`}</Code>

          <SubHeading>引用</SubHeading>
          <Code>{`> これは引用ブロックです。
> 複数行も書けます。`}</Code>

          <SubHeading>テーブル</SubHeading>
          <Code>{`| 項目 | 説明 | 備考 |
|------|------|------|
| A    | 説明A | メモ |
| B    | 説明B | メモ |`}</Code>
          <p className="text-sm text-gray-500">
            tableBlock として変換され、ヘッダー行＋ゼブラストライプで表示されます。
          </p>
        </Section>

        {/* 05 — カスタムブロック */}
        <Section
          number="05"
          label="CUSTOM BLOCKS"
          title="カスタムブロック構文"
        >
          <p>
            HTMLコメント（
            <InlineCode>{"<!-- ... -->"}</InlineCode>）や独自記法でリッチなブロックを挿入できます。
          </p>

          {/* customContainer */}
          <SubHeading>カスタムコンテナ（コールアウト）</SubHeading>
          <p>
            Notion 風の情報ボックス。5 タイプ:
            <InlineCode>tip</InlineCode>（緑）、
            <InlineCode>info</InlineCode>（青）、
            <InlineCode>warning</InlineCode>（黄）、
            <InlineCode>danger</InlineCode>（赤）、
            <InlineCode>note</InlineCode>（グレー）
          </p>
          <Code title="構文">{`:::tip ここにタイトル
コンテナの本文を書きます。
**太字**や[リンク](https://example.com)も使えます。
:::`}</Code>
          <Code title="例: 警告ボックス">{`:::warning 注意
この操作は取り消せません。慎重に行ってください。
:::`}</Code>

          {/* sectionHeading */}
          <SubHeading>セクション見出し</SubHeading>
          <p>番号付きの大きなセクション区切り。</p>
          <Code title="構文">{`<!-- sectionHeading number="01" label="PROBLEM" -->
<!-- sectionHeading number="02" label="GOAL/KPI" title="ゴールと指標を定義する" -->`}</Code>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border border-gray-200">
                    属性
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    必須
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    説明
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>number</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    セクション番号（例: 01, 02）
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>label</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    セクションラベル（例: PROBLEM, WHY）
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>title</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    ラベル下の補足テキスト
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* cardGrid */}
          <SubHeading>カードグリッド</SubHeading>
          <p>
            複数カードを並べて表示。4 バリアント:
            <InlineCode>info</InlineCode>（情報）、
            <InlineCode>stat</InlineCode>（統計）、
            <InlineCode>feature</InlineCode>（機能）、
            <InlineCode>persona</InlineCode>（ペルソナ）
          </p>
          <Code title="情報カード">{`<!-- cardGrid variant="info" columns="3" -->
<!-- card icon="🎯" title="目標設定" description="明確なゴールを定義する" -->
<!-- card icon="📊" title="データ分析" description="定量的にユーザーを理解する" -->
<!-- card icon="🔍" title="ユーザー調査" description="定性的な深掘り" -->
<!-- end -->`}</Code>
          <Code title="統計カード">{`<!-- cardGrid variant="stat" columns="3" -->
<!-- card title="月間アクティブユーザー" value="3.2M" unit="人" -->
<!-- card title="コンバージョン率" value="4.8" unit="%" -->
<!-- card title="NPS" value="72" unit="pt" -->
<!-- end -->`}</Code>
          <Code title="ペルソナカード">{`<!-- cardGrid variant="persona" columns="2" -->
<!-- card title="田中太郎" description="28歳・Webデザイナー歴3年" tags="Figma,UI設計,プロトタイプ" -->
<!-- card title="鈴木花子" description="25歳・未経験から転職を目指す" tags="学習中,ポートフォリオ作成" -->
<!-- end -->`}</Code>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border border-gray-200">
                    属性
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    対象
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    説明
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>variant</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    cardGrid
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    info / stat / feature / persona
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>columns</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    cardGrid
                  </td>
                  <td className="px-3 py-2 border border-gray-200">
                    1 / 2 / 3（デフォルト: 3）
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>icon</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">card</td>
                  <td className="px-3 py-2 border border-gray-200">
                    絵文字アイコン
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>title</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">card</td>
                  <td className="px-3 py-2 border border-gray-200">
                    カードタイトル
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>description</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">card</td>
                  <td className="px-3 py-2 border border-gray-200">説明文</td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>value</InlineCode> /{" "}
                    <InlineCode>unit</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">card</td>
                  <td className="px-3 py-2 border border-gray-200">
                    stat バリアント用の数値と単位
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>tags</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">card</td>
                  <td className="px-3 py-2 border border-gray-200">
                    カンマ区切りのタグ（persona 用）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* pullQuote */}
          <SubHeading>プルクオート</SubHeading>
          <p>
            大きな強調引用。2 バリアント:
            <InlineCode>default</InlineCode>（左ボーダー）、
            <InlineCode>highlight</InlineCode>（背景色付き）
          </p>
          <Code title="構文">{`<!-- pullQuote text="デザインとは、見た目だけではなく、どう機能するかである。" attribution="Steve Jobs" variant="highlight" -->`}</Code>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border border-gray-200">
                    属性
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    必須
                  </th>
                  <th className="text-left px-3 py-2 border border-gray-200">
                    説明
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>text</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">必須</td>
                  <td className="px-3 py-2 border border-gray-200">
                    引用テキスト
                  </td>
                </tr>
                <tr className="bg-gray-50/50">
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>attribution</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    出典・人物名
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-gray-200">
                    <InlineCode>variant</InlineCode>
                  </td>
                  <td className="px-3 py-2 border border-gray-200">任意</td>
                  <td className="px-3 py-2 border border-gray-200">
                    default / highlight
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* stepFlow */}
          <SubHeading>ステップフロー</SubHeading>
          <p>番号付きのプロセスフロー。ステップを接続線で繋いで表示します。</p>
          <Code title="構文">{`<!-- stepFlow title="デザインプロセス" -->
<!-- step title="リサーチ" description="ユーザーと市場を調査する" -->
<!-- step title="定義" description="課題とゴールを明確にする" -->
<!-- step title="設計" description="ソリューションをデザインする" -->
<!-- step title="検証" description="ユーザーテストで確認する" -->
<!-- end -->`}</Code>

          {/* divider */}
          <SubHeading>区切り線</SubHeading>
          <p>セクション間のビジュアル区切り。ラベル付きも可。</p>
          <Code title="構文">{`<!-- divider -->
<!-- divider label="次のステップへ" -->`}</Code>

          {/* linkCard - importGuide.tsでは未対応だが、Sanity側にはある */}
          <SubHeading>リンクカード</SubHeading>
          <p className="text-sm text-gray-500">
            OGP プレビュー風のリンクカード。Sanity Studio
            から直接追加できます（importGuide.ts
            のマークダウン構文では未対応）。
          </p>
        </Section>

        {/* 06 — 完全な例 */}
        <Section
          number="06"
          label="FULL EXAMPLE"
          title="マークダウン完全例"
        >
          <p>
            以下をコピーして <InlineCode>.md</InlineCode>{" "}
            ファイルとして保存し、スクリプトで入稿できます。
          </p>
          <Code title="example-guide.md">{`---
title: UIデザイナーのキャリアパス完全ガイド
slug: ui-designer-career-path
category: career
description: 未経験からシニアデザイナーまで、UIデザイナーのキャリアステップを徹底解説します。
tags: [キャリア, UIデザイン, 転職, ロードマップ]
author: BONO
readingTime: 15分
isPremium: false
---

<!-- sectionHeading number="01" label="WHY" title="なぜキャリアパスを知ることが重要か" -->

## UIデザイナーという職業

UIデザイナーは、プロダクトの**ユーザーインターフェース**を設計する専門職です。
見た目の美しさだけでなく、使いやすさと機能性を両立させることが求められます。

:::tip ポイント
キャリアパスを理解しておくことで、
今やるべきことが明確になります。
:::

<!-- sectionHeading number="02" label="CAREER STEPS" -->

## キャリアのステップ

<!-- stepFlow title="UIデザイナーのキャリアパス" -->
<!-- step title="ジュニア（0-2年）" description="基礎スキルの習得。Figma操作、UIパターンの理解" -->
<!-- step title="ミドル（2-5年）" description="プロジェクトリード。デザインシステムの構築" -->
<!-- step title="シニア（5年〜）" description="戦略的デザイン。チームマネジメント" -->
<!-- end -->

## 各ステージで必要なスキル

<!-- cardGrid variant="info" columns="3" -->
<!-- card icon="🎨" title="ビジュアル" description="色彩、タイポグラフィ、レイアウトの基礎" -->
<!-- card icon="🧠" title="情報設計" description="IA、ナビゲーション、ユーザーフロー" -->
<!-- card icon="🔬" title="リサーチ" description="ユーザーテスト、データ分析、仮説検証" -->
<!-- end -->

<!-- pullQuote text="良いデザイナーはスキルだけでなく、課題を見つける力が求められる。" attribution="BONO" variant="highlight" -->

<!-- divider label="まとめ" -->

## まとめ

| ステージ | 期間 | 重点スキル |
|---------|------|-----------|
| ジュニア | 0-2年 | ツール操作、UIパターン |
| ミドル | 2-5年 | 設計力、コミュニケーション |
| シニア | 5年〜 | 戦略思考、マネジメント |

:::info 次のアクション
まずは自分が今どのステージにいるかを確認し、
次のステップに必要なスキルを洗い出してみましょう。
:::`}</Code>
        </Section>

        {/* 07 — 注意事項 */}
        <Section number="07" label="NOTES" title="注意事項">
          <ul className="list-disc list-inside space-y-2">
            <li>
              HTMLコメント内の属性値は必ず
              <InlineCode>{`"ダブルクオート"`}</InlineCode>で囲む
            </li>
            <li>
              <InlineCode>{"<!-- cardGrid -->"}</InlineCode> と{" "}
              <InlineCode>{"<!-- end -->"}</InlineCode>{" "}
              の間に子要素（card / step）を記述
            </li>
            <li>
              <InlineCode>{":::"}</InlineCode>{" "}
              コンテナは行頭に置く（インデントしない）
            </li>
            <li>
              画像はマークダウンの{" "}
              <InlineCode>{"![alt](url)"}</InlineCode>{" "}
              で挿入可能（外部URL参照）
            </li>
            <li>
              <InlineCode>linkCard</InlineCode>{" "}
              はマークダウン構文未対応 → Sanity Studio から追加
            </li>
            <li>
              入稿後に Sanity Studio で微調整（画像アップロード、リンクカード追加など）が可能
            </li>
          </ul>
        </Section>

        {/* テスト用リンク */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-400 mb-3">関連ページ</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="/guide/block-system-test"
              className="text-sm text-blue-600 hover:underline"
            >
              Block System Test（実際の表示確認）
            </a>
            <a
              href="/dev/search-results"
              className="text-sm text-blue-600 hover:underline"
            >
              Search Results Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideImportManual;
