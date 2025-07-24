/**
 * ReactMarkdownでのHTMLクラス処理テスト
 * Phase 1: ReactMarkdownでの基本的なHTMLクラス処理テスト
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// rehype-rawは未インストールのため、まずは基本機能でテスト

const testContent = `
### このチャレンジで伸ばせる力

<div class="skill-group">

### ■ "使いやすい UI"を要件とユーザーから設計する力

- 自分が良いと思うではなく、使う人目線の UI 作成スキル
- 参考リンク：『[デザイン基礎講座](https://example.com)』

![スキル解説画像](http://i.imgur.com/Jjwsc.jpg "サンプル")

### ■ 機能や状態を網羅して UI 設計する力

- 例外を考えて実装や検証や状況のパターンを UI で網羅
- より詳細な状態管理の考え方

</div>

## 進め方ガイド

<div class="lesson">
![画像](http://i.imgur.com/Jjwsc.jpg "サンプル")
##### ゼロからはじめる情報設計
進め方の基礎はBONOで詳細に学習・実践できます
</div>

<div class="step">

##### ステップ 1: 摸写したいアプリを選ぶ

- なんでも良いですが、なるべく単一機能を提供しているアプリが良いと思います。

</div>
`;

interface ReactMarkdownTestProps {
  className?: string;
}

const ReactMarkdownTest: React.FC<ReactMarkdownTestProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">ReactMarkdown HTMLクラステスト</h2>
      
      <div className="border p-4 rounded-lg bg-gray-50">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // rehype-rawなしで基本的なHTML処理をテスト
          components={{
            // divコンポーネントをカスタマイズしてクラス名を表示
            div: ({ className, children, ...props }) => {
              console.log('div className:', className);
              
              // 仮のスタイリング（後でFigmaから抽出したスタイルに置き換え）
              const classMap: Record<string, string> = {
                'skill-group': 'bg-blue-50 border-l-4 border-blue-300 p-4 my-4',
                'lesson': 'bg-green-50 border border-green-200 p-4 my-4 rounded',
                'step': 'bg-yellow-50 border border-yellow-200 p-4 my-4 rounded-lg'
              };
              
              const finalClassName = className ? 
                (classMap[className] || className) : 
                undefined;
                
              return (
                <div className={finalClassName} {...props}>
                  {className && (
                    <div className="text-xs text-gray-500 mb-2">
                      クラス: {className}
                    </div>
                  )}
                  {children}
                </div>
              );
            },
            
            // 他の要素のテスト用スタイリング
            h3: ({ children, ...props }) => (
              <h3 className="text-lg font-semibold text-gray-800 mb-2" {...props}>
                {children}
              </h3>
            ),
            
            h5: ({ children, ...props }) => (
              <h5 className="text-base font-medium text-gray-700 mb-2" {...props}>
                {children}
              </h5>
            ),
            
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside space-y-1 ml-4" {...props}>
                {children}
              </ul>
            ),
            
            li: ({ children, ...props }) => (
              <li className="text-gray-600" {...props}>
                {children}
              </li>
            ),
            
            img: ({ src, alt, ...props }) => (
              <img 
                src={src} 
                alt={alt}
                className="max-w-full h-auto rounded border my-2" 
                {...props} 
              />
            ),
            
            a: ({ href, children, ...props }) => (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            )
          }}
        >
          {testContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ReactMarkdownTest;