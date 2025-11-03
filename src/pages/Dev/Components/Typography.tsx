/**
 * タイポグラフィ表示コンポーネント
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fonts = [
  { name: 'Futura', className: 'font-futura', weights: ['400', '700'] },
  { name: 'Inter', className: 'font-inter', weights: ['400', '500', '600', '700'] },
  { name: 'Noto Sans JP', className: 'font-noto-sans-jp', weights: ['400', '500', '700'] },
  { name: 'M PLUS Rounded 1c', className: 'font-rounded-mplus', weights: ['400', '700'] },
  { name: 'DotGothic16', className: 'font-dot', weights: ['400'] },
];

const Typography = () => {
  return (
    <div className="space-y-8">
      {/* Font Families */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Font Families</h2>
        <div className="space-y-6">
          {fonts.map((font) => (
            <Card key={font.name}>
              <CardHeader>
                <CardTitle>{font.name}</CardTitle>
                <p className="text-sm text-gray-500">Class: {font.className}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={font.className}>
                  <p className="text-3xl mb-2">
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-3xl mb-2">
                    いろはにほへと ちりぬるを 0123456789
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Weights:</p>
                  <div className="flex flex-wrap gap-4">
                    {font.weights.map((weight) => (
                      <span
                        key={weight}
                        className={`${font.className} text-lg`}
                        style={{ fontWeight: weight }}
                      >
                        Weight {weight}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Heading Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Heading Styles</h2>
        <Card className="p-6 space-y-4">
          <h1 className="text-4xl font-bold">Heading 1 - 見出し1</h1>
          <h2 className="text-3xl font-bold">Heading 2 - 見出し2</h2>
          <h3 className="text-2xl font-bold">Heading 3 - 見出し3</h3>
          <h4 className="text-xl font-bold">Heading 4 - 見出し4</h4>
          <h5 className="text-lg font-bold">Heading 5 - 見出し5</h5>
          <h6 className="text-base font-bold">Heading 6 - 見出し6</h6>
        </Card>
      </section>

      {/* Text Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Text Styles</h2>
        <Card className="p-6 space-y-4">
          <p className="text-base">
            Paragraph - これは段落テキストのサンプルです。Normal weight text.
          </p>
          <p className="text-sm">
            Small text - 小さめのテキスト。Smaller text size.
          </p>
          <p className="text-lg">
            Large text - 大きめのテキスト。Larger text size.
          </p>
          <p className="text-base font-semibold">
            Semibold text - セミボールド。Medium weight.
          </p>
          <p className="text-base font-bold">
            Bold text - ボールド。Heavy weight.
          </p>
          <p className="text-base text-gray-500">
            Muted text - グレーのテキスト。Dimmed appearance.
          </p>
          <code className="px-2 py-1 bg-gray-100 text-pink-600 rounded text-sm font-mono">
            Inline code - インラインコード
          </code>
        </Card>
      </section>

      {/* Special Typography Classes */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Special Typography Classes</h2>
        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">adjustLetterSpacing</p>
            <p className="text-2xl adjustLetterSpacing">
              Letter spacing adjustment - レタースペーシング調整
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-gray-600 mb-2">font-rounded-mplus-force</p>
            <p className="text-2xl font-rounded-mplus-force">
              Forced M PLUS Rounded - 強制適用されたフォント
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-gray-600 mb-2">font-rounded-mplus-bold</p>
            <p className="text-2xl font-rounded-mplus-bold">
              M PLUS Rounded Bold - ボールド適用
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Typography;
