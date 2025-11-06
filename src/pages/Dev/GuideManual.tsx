/**
 * ガイド記事執筆マニュアル（Dev環境専用）
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Copy, Check, ArrowLeft, FileText, Image, Code, FolderTree, Tag, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GuideManual = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const templateContent = `---
# 基本情報
title: "{{タイトル}}"
description: "{{説明文}}"
slug: "{{slug}}"

# 分類
category: "{{career|learning|industry|tools}}"
tags:
  - "{{タグ1}}"
  - "{{タグ2}}"
  - "{{タグ3}}"

# 表示設定
thumbnail: "/assets/guide/{{slug}}/hero.jpg"
icon: "/assets/emoji/{{icon}}.svg"
order_index: 1

# メタ情報
author: "BONO"
publishedAt: "{{YYYY-MM-DD}}"
updatedAt: "{{YYYY-MM-DD}}"
readingTime: "{{X}}分"

# 関連記事（slug で指定）
relatedGuides:
  - "{{関連記事1のslug}}"
  - "{{関連記事2のslug}}"
  - "{{関連記事3のslug}}"
---

# {{タイトル}}

記事の導入文をここに書きます。この記事で何を学べるか、誰のための記事かを明確に。

## セクション1

セクション1の内容...

### サブセクション1.1

詳細な内容...

## セクション2

セクション2の内容...

### 画像の追加例

![画像の説明](/assets/guide/{{slug}}/image-name.jpg)

### コードの追加例

\`\`\`javascript
const example = () => {
  console.log('コード例');
};
\`\`\`

### リストの例

- 項目1
- 項目2
- 項目3

## まとめ

記事の要点をまとめます。
`;

  const frontmatterExample = `---
title: "良い勉強法・悪い勉強法：デザインスキルを効率的に伸ばす"
description: "デザインを学ぶ上で効果的な勉強法と、避けるべき非効率な方法を解説します"
slug: "good-bad-study-methods"
category: "learning"
tags:
  - "学習方法"
  - "スキルアップ"
  - "効率化"
thumbnail: "/assets/guide/good-bad-study-methods/hero.jpg"
icon: "/assets/emoji/book.svg"
order_index: 1
author: "BONO"
publishedAt: "2025-01-20"
updatedAt: "2025-01-20"
readingTime: "8分"
relatedGuides:
  - "job-change-roadmap"
  - "ai-and-designers"
---`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dev Home に戻る
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold">ガイド記事執筆マニュアル</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            /guideセクションで記事を書くための完全ガイド
          </p>
          <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg border border-yellow-200">
            ⚠️ このページは開発環境でのみ利用可能です
          </div>
        </header>

        {/* 目次 */}
        <nav className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">目次</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#overview" className="text-blue-600 hover:underline">概要</a></li>
            <li><a href="#structure" className="text-blue-600 hover:underline">ディレクトリ構造</a></li>
            <li><a href="#frontmatter" className="text-blue-600 hover:underline">Frontmatter リファレンス</a></li>
            <li><a href="#content" className="text-blue-600 hover:underline">コンテンツの書き方</a></li>
            <li><a href="#images" className="text-blue-600 hover:underline">画像の追加</a></li>
            <li><a href="#categories" className="text-blue-600 hover:underline">カテゴリの管理</a></li>
            <li><a href="#template" className="text-blue-600 hover:underline">テンプレート</a></li>
            <li><a href="#checklist" className="text-blue-600 hover:underline">公開前チェックリスト</a></li>
          </ul>
        </nav>

        {/* 概要 */}
        <section id="overview" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            概要
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              このマニュアルでは、BONOの/guideセクションで記事を執筆・公開するための手順を説明します。
            </p>
            <h3 className="text-xl font-bold mt-6 mb-3">前提知識</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>基本的なMarkdown記法の理解</li>
              <li>Gitの基本操作（ブランチ作成、コミット、プッシュ）</li>
              <li>YAMLフォーマットの基礎知識</li>
            </ul>
            <h3 className="text-xl font-bold mt-6 mb-3">記事執筆の流れ</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>新しいブランチを作成</li>
              <li>記事用のディレクトリとファイルを作成</li>
              <li>Frontmatterを記述</li>
              <li>Markdownで本文を執筆</li>
              <li>画像を配置</li>
              <li>ローカルでプレビュー確認</li>
              <li>コミット・プッシュしてPR作成</li>
              <li>レビュー後にマージして公開</li>
            </ol>
          </div>
        </section>

        {/* ディレクトリ構造 */}
        <section id="structure" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <FolderTree className="w-8 h-8 text-blue-600" />
            ディレクトリ構造
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              ガイド記事は以下のディレクトリ構造で管理されます：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`content/guide/
├── _templates/
│   └── article-template.md
├── career/              # キャリア関連
│   └── job-change-roadmap/
│       └── index.md
├── learning/            # 学習方法
│   └── good-bad-study-methods/
│       └── index.md
├── industry/            # 業界動向
│   └── ai-and-designers/
│       └── index.md
└── tools/               # ツール・技術
    └── figma-basics/
        └── index.md

public/assets/guide/
├── job-change-roadmap/
│   ├── hero.jpg
│   └── step1.jpg
├── good-bad-study-methods/
│   ├── hero.jpg
│   └── example.jpg
└── ...`}</pre>
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">ファイル配置ルール</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>記事ファイル:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">/content/guide/&#123;category&#125;/&#123;slug&#125;/index.md</code></li>
              <li><strong>画像ファイル:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">/public/assets/guide/&#123;slug&#125;/</code></li>
              <li><strong>slug:</strong> 記事のURLになる一意な識別子（英数字とハイフンのみ）</li>
              <li><strong>category:</strong> career, learning, industry, tools のいずれか</li>
            </ul>
          </div>
        </section>

        {/* Frontmatter リファレンス */}
        <section id="frontmatter" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-8 h-8 text-blue-600" />
            Frontmatter リファレンス
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              記事の先頭に記述するメタデータです。<code className="bg-gray-100 px-2 py-1 rounded text-sm">---</code>で囲んで記述します。
            </p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Frontmatter 例</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(frontmatterExample, 'frontmatter')}
                  className="flex items-center gap-2"
                >
                  {copiedSection === 'frontmatter' ? (
                    <>
                      <Check className="w-4 h-4" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{frontmatterExample}</pre>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">必須フィールド</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">title</h4>
                <p className="text-gray-700">記事のタイトル。検索結果やカード表示に使用されます。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">title: "良い勉強法・悪い勉強法：デザインスキルを効率的に伸ばす"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">description</h4>
                <p className="text-gray-700">記事の概要。カード表示やSEOに使用されます。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">description: "デザインを学ぶ上で効果的な勉強法と、避けるべき非効率な方法を解説します"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">slug</h4>
                <p className="text-gray-700">記事のURL識別子。英数字とハイフンのみ使用可能。他の記事と重複しないこと。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">slug: "good-bad-study-methods"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">category</h4>
                <p className="text-gray-700">記事のカテゴリ。career, learning, industry, tools のいずれか。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">category: "learning"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">publishedAt</h4>
                <p className="text-gray-700">公開日。YYYY-MM-DD形式で記述。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">publishedAt: "2025-01-20"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">updatedAt</h4>
                <p className="text-gray-700">更新日。YYYY-MM-DD形式で記述。初回公開時はpublishedAtと同じ日付を設定。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">updatedAt: "2025-01-20"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">readingTime</h4>
                <p className="text-gray-700">読了時間の目安。「X分」形式で記述。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">readingTime: "8分"</code>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold text-lg">order_index</h4>
                <p className="text-gray-700">記事の表示順序。小さい数字ほど先に表示されます。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">order_index: 1</code>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">オプションフィールド</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-bold text-lg">tags</h4>
                <p className="text-gray-700">記事に関連するタグ。配列形式で記述。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">tags: ["学習方法", "スキルアップ", "効率化"]</code>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-bold text-lg">thumbnail</h4>
                <p className="text-gray-700">サムネイル画像のパス。カード表示に使用。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">thumbnail: "/assets/guide/good-bad-study-methods/hero.jpg"</code>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-bold text-lg">icon</h4>
                <p className="text-gray-700">アイコン画像のパス。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">icon: "/assets/emoji/book.svg"</code>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-bold text-lg">author</h4>
                <p className="text-gray-700">著者名。デフォルトは「BONO」。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">author: "BONO"</code>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h4 className="font-bold text-lg">relatedGuides</h4>
                <p className="text-gray-700">関連記事のslugを配列で指定。記事詳細ページの下部に表示されます。</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm block mt-2">relatedGuides: ["job-change-roadmap", "ai-and-designers"]</code>
              </div>
            </div>
          </div>
        </section>

        {/* コンテンツの書き方 */}
        <section id="content" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            コンテンツの書き方
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              記事本文はMarkdown形式で記述します。以下の記法が使用できます。
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">見出し</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`# 見出し1（記事タイトル）
## 見出し2（セクション）
### 見出し3（サブセクション）
#### 見出し4`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">段落とテキスト装飾</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`通常の段落テキスト。

**太字テキスト**
*イタリック体*
\`インラインコード\``}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">リスト</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`- 箇条書き項目1
- 箇条書き項目2
- 箇条書き項目3

1. 番号付きリスト1
2. 番号付きリスト2
3. 番号付きリスト3`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">コードブロック</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`\`\`\`javascript
const example = () => {
  console.log('コード例');
};
\`\`\`

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\``}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">リンク</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`[リンクテキスト](https://example.com)`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">引用</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`> 引用文をここに書きます。
> 複数行にわたる引用も可能です。`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">テーブル</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`| 列1 | 列2 | 列3 |
|------|------|------|
| データ1 | データ2 | データ3 |
| データ4 | データ5 | データ6 |`}</pre>
            </div>
          </div>
        </section>

        {/* 画像の追加 */}
        <section id="images" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Image className="w-8 h-8 text-blue-600" />
            画像の追加
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              画像は以下の手順で追加します：
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">1. 画像ファイルの配置</h3>
            <p className="text-gray-700 mb-2">
              画像ファイルを <code className="bg-gray-100 px-2 py-1 rounded text-sm">/public/assets/guide/&#123;slug&#125;/</code> ディレクトリに配置します。
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`public/assets/guide/
└── good-bad-study-methods/
    ├── hero.jpg          # サムネイル画像
    ├── example1.jpg      # 本文中の画像1
    └── example2.png      # 本文中の画像2`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">2. Markdownで画像を参照</h3>
            <p className="text-gray-700 mb-2">
              記事本文で画像を参照する際は、絶対パスで記述します：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`![画像の説明](/assets/guide/good-bad-study-methods/example1.jpg)`}</pre>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">画像のガイドライン</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>ファイル形式:</strong> JPG, PNG, WebP推奨</li>
              <li><strong>ファイルサイズ:</strong> 1MB以下を推奨（大きい画像は圧縮してください）</li>
              <li><strong>サムネイル画像:</strong> 推奨サイズ 1200x630px（OGP対応）</li>
              <li><strong>ファイル名:</strong> 英数字とハイフンのみ使用（日本語不可）</li>
              <li><strong>alt属性:</strong> 画像の説明を必ず記述（アクセシビリティ対応）</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 font-bold mb-2">⚠️ 注意事項</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                <li>相対パス（./image.jpg）は使用できません。必ず絶対パス（/assets/guide/...）を使用してください。</li>
                <li>slugを変更する場合は、画像ディレクトリ名も合わせて変更してください。</li>
                <li>著作権に注意し、使用許可のある画像のみを使用してください。</li>
              </ul>
            </div>
          </div>
        </section>

        {/* カテゴリの管理 */}
        <section id="categories" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-8 h-8 text-blue-600" />
            カテゴリの管理
          </h2>
          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-bold mb-3">現在のカテゴリ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">career（キャリア）</h4>
                <p className="text-gray-600 text-sm">転職やキャリアパスに関するガイド</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">learning（学習方法）</h4>
                <p className="text-gray-600 text-sm">効果的な学習方法とスキルアップのコツ</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">industry（業界動向）</h4>
                <p className="text-gray-600 text-sm">デザイン業界のトレンドと未来</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-2">tools（ツール・技術）</h4>
                <p className="text-gray-600 text-sm">デザインツールの使い方と選び方</p>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3">新しいカテゴリの追加方法</h3>
            <p className="text-gray-700 mb-4">
              新しいカテゴリを追加する場合は、以下の2つのファイルを更新する必要があります：
            </p>

            <h4 className="font-bold text-lg mt-4 mb-2">1. 型定義の更新</h4>
            <p className="text-gray-700 mb-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/types/guide.ts</code> を編集：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`export type GuideCategory = "career" | "learning" | "industry" | "tools" | "new-category";`}</pre>
            </div>

            <h4 className="font-bold text-lg mt-4 mb-2">2. カテゴリ情報の追加</h4>
            <p className="text-gray-700 mb-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/lib/guideCategories.ts</code> を編集：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`export const GUIDE_CATEGORIES: GuideCategoryInfo[] = [
  {
    id: "new-category",
    label: "新カテゴリ",
    description: "新カテゴリの説明",
    icon: "icon-name", // lucide-reactのアイコン名
  },
];`}</pre>
            </div>

            <h4 className="font-bold text-lg mt-4 mb-2">3. ディレクトリの作成</h4>
            <p className="text-gray-700 mb-2">
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">content/guide/</code> 配下に新しいカテゴリディレクトリを作成：
            </p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>{`mkdir content/guide/new-category`}</pre>
            </div>
          </div>
        </section>

        {/* テンプレート */}
        <section id="template" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            テンプレート
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              新しい記事を作成する際は、以下のテンプレートをコピーして使用してください。
            </p>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">記事テンプレート</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(templateContent, 'template')}
                  className="flex items-center gap-2"
                >
                  {copiedSection === 'template' ? (
                    <>
                      <Check className="w-4 h-4" />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コピー
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96">
                <pre>{templateContent}</pre>
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              テンプレートファイルは <code className="bg-gray-100 px-2 py-1 rounded text-sm">/content/guide/_templates/article-template.md</code> にもあります。
            </p>
          </div>
        </section>

        {/* 公開前チェックリスト */}
        <section id="checklist" className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-8 h-8 text-blue-600" />
            公開前チェックリスト
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              記事を公開する前に、以下の項目を確認してください：
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">ファイルとディレクトリ</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">記事ファイルが正しいパスに配置されている（/content/guide/&#123;category&#125;/&#123;slug&#125;/index.md）</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">画像ファイルが正しいパスに配置されている（/public/assets/guide/&#123;slug&#125;/）</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">slugが他の記事と重複していない</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">Frontmatter</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">必須フィールドがすべて記入されている</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">categoryが正しい値（career/learning/industry/tools）</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">publishedAtとupdatedAtが正しい日付形式（YYYY-MM-DD）</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">thumbnailとiconのパスが正しい</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">relatedGuidesのslugが実在する記事を指している</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">コンテンツ</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">誤字脱字がない</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">画像のパスが正しく、表示される</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">画像にalt属性（説明文）が設定されている</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">コードブロックが正しく表示される</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">リンクが正しく機能する</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">プレビュー確認</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">ローカル環境で <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run dev</code> を実行</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">/guide ページで記事カードが表示される</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">/guide/&#123;slug&#125; ページで記事が正しく表示される</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">カテゴリフィルターが正しく機能する</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">関連記事が正しく表示される</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">Git とPR</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">適切なブランチ名で作業している</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">コミットメッセージが明確</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">PRの説明が記載されている</span>
              </li>
              <li className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" disabled />
                <span className="text-gray-700">CIチェックがパスしている</span>
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 font-bold mb-2">💡 ヒント</p>
              <p className="text-blue-800 text-sm">
                記事を更新する場合は、updatedAtフィールドを現在の日付に更新することを忘れずに！
              </p>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="text-center text-gray-600 text-sm mt-12 pt-8 border-t border-gray-200">
          <p>質問や不明点がある場合は、開発チームにお問い合わせください。</p>
          <Link
            to="/dev"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Dev Home に戻る
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default GuideManual;
