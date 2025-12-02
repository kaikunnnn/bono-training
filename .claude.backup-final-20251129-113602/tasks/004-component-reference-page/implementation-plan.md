# 実装計画: コンポーネント・カラーリファレンスページ

## フェーズ概要

- **フェーズ0**: 環境セットアップ (15分)
- **フェーズ1**: データ定義・型定義 (30分)
- **フェーズ2**: 基本ページ構造 (30分)
- **フェーズ3**: カラーパレット実装 (45分)
- **フェーズ4**: タイポグラフィ実装 (30分)
- **フェーズ5**: アニメーション実装 (30分)
- **フェーズ6**: UIコンポーネント実装 (60分)
- **フェーズ7**: カスタムコンポーネント実装 (45分)
- **フェーズ8**: テスト・調整 (30分)

**合計見積もり時間**: 約4.5時間

---

## フェーズ0: 環境セットアップ

### タスク

- [x] ディレクトリ作成
  - `src/pages/Dev/`
  - `src/pages/Dev/Components/`

### ファイル

なし（ディレクトリのみ）

---

## フェーズ1: データ定義・型定義

### タスク

- [ ] 型定義ファイル作成
- [ ] カラー定義ファイル作成
- [ ] アニメーション定義ファイル作成
- [ ] コンポーネントレジストリ作成（基本構造）

### ファイル

**1. src/types/dev.ts**
```typescript
// カラー定義型
export interface ColorDefinition {
  name: string;
  cssVar: string;
  value: string;
  category: 'theme' | 'custom';
  description?: string;
}

// アニメーション定義型
export interface AnimationDefinition {
  name: string;
  className: string;
  duration: string;
  easing?: string;
  description?: string;
}

// コンポーネント情報型
export interface ComponentInfo {
  name: string;
  category: string;
  description?: string;
  example: React.ReactNode;
  path?: string;
}
```

**2. src/lib/colorDefinitions.ts**
```typescript
import type { ColorDefinition } from '@/types/dev';

export const THEME_COLORS_LIGHT: ColorDefinition[] = [
  {
    name: 'background',
    cssVar: '--background',
    value: '0 0% 100%',
    category: 'theme',
    description: 'Default background color',
  },
  {
    name: 'foreground',
    cssVar: '--foreground',
    value: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Default text color',
  },
  // ... 全てのテーマカラー
];

export const THEME_COLORS_DARK: ColorDefinition[] = [
  // ... ダークモードカラー
];

export const CUSTOM_COLORS: ColorDefinition[] = [
  {
    name: 'training',
    cssVar: '',
    value: '#FF9900',
    category: 'custom',
    description: 'Primary training color',
  },
  {
    name: 'training-background',
    cssVar: '',
    value: '#FFF9F4',
    category: 'custom',
    description: 'Training background',
  },
  // ... その他カスタムカラー
];
```

**3. src/lib/animationDefinitions.ts**
```typescript
import type { AnimationDefinition } from '@/types/dev';

export const ANIMATIONS: AnimationDefinition[] = [
  {
    name: 'accordion-down',
    className: 'animate-accordion-down',
    duration: '0.2s',
    easing: 'ease-out',
    description: 'Accordion expand animation',
  },
  {
    name: 'accordion-up',
    className: 'animate-accordion-up',
    duration: '0.2s',
    easing: 'ease-out',
    description: 'Accordion collapse animation',
  },
  {
    name: 'fade-in',
    className: 'animate-fade-in',
    duration: '0.6s',
    easing: 'ease-out',
    description: 'Fade in with upward movement',
  },
  {
    name: 'gradient-fade-in',
    className: 'animate-gradient-fade-in',
    duration: '0.8s',
    easing: 'ease-out',
    description: 'Gradient fade in effect',
  },
  {
    name: 'gradient-slide',
    className: 'animate-gradient-slide',
    duration: '1.2s',
    easing: 'ease-out',
    description: 'Gradient slide animation',
  },
  {
    name: 'gradient-scale-slide',
    className: 'animate-gradient-scale-slide',
    duration: '2.0s',
    easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    description: 'Gradient scale and slide animation',
  },
];
```

---

## フェーズ2: 基本ページ構造

### タスク

- [ ] 環境チェックコンポーネント作成
- [ ] メインページレイアウト作成
- [ ] ルーティング設定

### ファイル

**1. src/pages/Dev/index.tsx**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';

interface DevRouteProps {
  children: React.ReactNode;
}

const DevRoute = ({ children }: DevRouteProps) => {
  // 開発環境でない場合はホームにリダイレクト
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DevRoute;
```

**2. src/pages/Dev/Components/index.tsx**
```typescript
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ComponentsReferencePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Component Reference</h1>
          <p className="text-gray-600">
            Design system and component library reference (Development only)
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
            ⚠️ This page is only available in development mode
          </div>
        </header>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="ui">UI Components</TabsTrigger>
            <TabsTrigger value="custom">Custom Components</TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <div className="text-gray-500">Color palette coming soon...</div>
          </TabsContent>

          <TabsContent value="typography">
            <div className="text-gray-500">Typography samples coming soon...</div>
          </TabsContent>

          <TabsContent value="animations">
            <div className="text-gray-500">Animations coming soon...</div>
          </TabsContent>

          <TabsContent value="ui">
            <div className="text-gray-500">UI components coming soon...</div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="text-gray-500">Custom components coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComponentsReferencePage;
```

**3. src/App.tsx の更新**
```typescript
// 追加インポート
import DevRoute from './pages/Dev';
import ComponentsReferencePage from './pages/Dev/Components';

// ルート追加
<Route
  path="/dev/components"
  element={
    <DevRoute>
      <ComponentsReferencePage />
    </DevRoute>
  }
/>
```

---

## フェーズ3: カラーパレット実装

### タスク

- [ ] HSL→HEX変換関数実装
- [ ] カラーカードコンポーネント作成
- [ ] テーマカラー表示
- [ ] カスタムカラー表示
- [ ] ダークモード切り替え（オプション）

### ファイル

**1. src/lib/colorUtils.ts**
```typescript
/**
 * HSL文字列をHEX形式に変換
 * @param hsl "222.2 84% 4.9%" のような文字列
 * @returns "#RRGGBB" 形式の文字列
 */
export function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));

  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (sDecimal === 0) {
    r = g = b = lDecimal;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lDecimal < 0.5
      ? lDecimal * (1 + sDecimal)
      : lDecimal + sDecimal - lDecimal * sDecimal;
    const p = 2 * lDecimal - q;

    r = hue2rgb(p, q, hDecimal + 1 / 3);
    g = hue2rgb(p, q, hDecimal);
    b = hue2rgb(p, q, hDecimal - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * HEX形式の色をRGBに変換
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
```

**2. src/pages/Dev/Components/ColorPalette.tsx**
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { THEME_COLORS_LIGHT, THEME_COLORS_DARK, CUSTOM_COLORS } from '@/lib/colorDefinitions';
import { hslToHex } from '@/lib/colorUtils';

const ColorCard = ({ color }: { color: ColorDefinition }) => {
  const isHsl = color.value.includes(' ');
  const displayColor = isHsl ? `hsl(${color.value})` : color.value;
  const hexColor = isHsl ? hslToHex(color.value) : color.value;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-mono">{color.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="w-full h-20 rounded border border-gray-200"
          style={{ backgroundColor: displayColor }}
        />
        <div className="text-xs space-y-1 font-mono">
          {color.cssVar && <p className="text-gray-600">var({color.cssVar})</p>}
          {isHsl && <p className="text-gray-700">HSL: {color.value}</p>}
          <p className="text-gray-700 font-semibold">{hexColor.toUpperCase()}</p>
        </div>
        {color.description && (
          <p className="text-xs text-gray-500">{color.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const ColorPalette = () => {
  return (
    <div className="space-y-12">
      {/* Theme Colors (Light) */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Theme Colors (Light Mode)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {THEME_COLORS_LIGHT.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </section>

      {/* Theme Colors (Dark) */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Theme Colors (Dark Mode)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {THEME_COLORS_DARK.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </section>

      {/* Custom Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Custom Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CUSTOM_COLORS.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ColorPalette;
```

**3. src/pages/Dev/Components/index.tsx の更新**
```typescript
import ColorPalette from './ColorPalette';

// TabsContent の更新
<TabsContent value="colors">
  <ColorPalette />
</TabsContent>
```

---

## フェーズ4: タイポグラフィ実装

### タスク

- [ ] フォントサンプル表示
- [ ] 見出しスタイル表示
- [ ] テキストスタイル表示

### ファイル

**1. src/pages/Dev/Components/Typography.tsx**
```typescript
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
    </div>
  );
};

export default Typography;
```

**2. src/pages/Dev/Components/index.tsx の更新**
```typescript
import Typography from './Typography';

<TabsContent value="typography">
  <Typography />
</TabsContent>
```

---

## フェーズ5: アニメーション実装

### タスク

- [ ] アニメーションカード作成
- [ ] 再生ボタン実装
- [ ] 全アニメーション表示

### ファイル

**1. src/pages/Dev/Components/Animations.tsx**
```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ANIMATIONS } from '@/lib/animationDefinitions';
import { RotateCcw } from 'lucide-react';

const AnimationCard = ({ animation }: { animation: AnimationDefinition }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAnimation = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), parseFloat(animation.duration) * 1000 + 500);
    }, 50);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{animation.name}</CardTitle>
        {animation.description && (
          <p className="text-sm text-gray-600">{animation.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-100 h-40 rounded flex items-center justify-center overflow-hidden">
          <div
            className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg ${
              isPlaying ? animation.className : ''
            }`}
          />
        </div>
        <div className="text-xs space-y-1 font-mono text-gray-600">
          <p>Class: {animation.className}</p>
          <p>Duration: {animation.duration}</p>
          {animation.easing && <p>Easing: {animation.easing}</p>}
        </div>
        <Button onClick={playAnimation} className="w-full" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Animation
        </Button>
      </CardContent>
    </Card>
  );
};

const Animations = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-6">Custom Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ANIMATIONS.map((anim) => (
            <AnimationCard key={anim.name} animation={anim} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Animations;
```

**2. src/pages/Dev/Components/index.tsx の更新**
```typescript
import Animations from './Animations';

<TabsContent value="animations">
  <Animations />
</TabsContent>
```

---

## フェーズ6: UIコンポーネント実装

### タスク

- [ ] shadcn/uiコンポーネント分類
- [ ] 各カテゴリの表示コンポーネント作成
- [ ] サンプル実装

### ファイル

**1. src/lib/uiComponentRegistry.tsx**
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
// ... その他のインポート

import type { ComponentInfo } from '@/types/dev';

export const UI_COMPONENTS: Record<string, ComponentInfo[]> = {
  Forms: [
    {
      name: 'Button',
      category: 'Forms',
      description: 'Displays a button or a component that looks like a button',
      example: (
        <div className="flex gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      ),
      path: '@/components/ui/button',
    },
    {
      name: 'Input',
      category: 'Forms',
      description: 'Text input field',
      example: <Input placeholder="Enter text..." />,
      path: '@/components/ui/input',
    },
    {
      name: 'Label',
      category: 'Forms',
      description: 'Renders an accessible label',
      example: (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="email@example.com" />
        </div>
      ),
      path: '@/components/ui/label',
    },
    {
      name: 'Checkbox',
      category: 'Forms',
      description: 'A control that allows the user to toggle between checked and not checked',
      example: (
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <label htmlFor="terms" className="text-sm">
            Accept terms and conditions
          </label>
        </div>
      ),
      path: '@/components/ui/checkbox',
    },
    {
      name: 'Switch',
      category: 'Forms',
      description: 'A control that allows the user to toggle between on and off',
      example: (
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
      ),
      path: '@/components/ui/switch',
    },
  ],

  Layout: [
    {
      name: 'Card',
      category: 'Layout',
      description: 'Displays a card with header, content, and footer',
      example: (
        <Card className="p-6 max-w-sm">
          <h3 className="font-bold mb-2">Card Title</h3>
          <p className="text-sm text-gray-600">Card content goes here.</p>
        </Card>
      ),
      path: '@/components/ui/card',
    },
    {
      name: 'Separator',
      category: 'Layout',
      description: 'Visually or semantically separates content',
      example: (
        <div className="w-full">
          <div className="py-2">Content above</div>
          <Separator />
          <div className="py-2">Content below</div>
        </div>
      ),
      path: '@/components/ui/separator',
    },
  ],

  'Data Display': [
    {
      name: 'Badge',
      category: 'Data Display',
      description: 'Displays a badge or a component that looks like a badge',
      example: (
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
      path: '@/components/ui/badge',
    },
    {
      name: 'Avatar',
      category: 'Data Display',
      description: 'An image element with a fallback for representing the user',
      example: (
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      path: '@/components/ui/avatar',
    },
  ],

  Feedback: [
    {
      name: 'Alert',
      category: 'Feedback',
      description: 'Displays a callout for user attention',
      example: (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      ),
      path: '@/components/ui/alert',
    },
    {
      name: 'Progress',
      category: 'Feedback',
      description: 'Displays an indicator showing the completion progress',
      example: <Progress value={60} className="w-full" />,
      path: '@/components/ui/progress',
    },
    {
      name: 'Skeleton',
      category: 'Feedback',
      description: 'Use to show a placeholder while content is loading',
      example: (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ),
      path: '@/components/ui/skeleton',
    },
  ],
};
```

**2. src/pages/Dev/Components/UIComponents.tsx**
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UI_COMPONENTS } from '@/lib/uiComponentRegistry';

const UIComponents = () => {
  return (
    <div className="space-y-12">
      {Object.entries(UI_COMPONENTS).map(([category, components]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((comp) => (
              <Card key={comp.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  {comp.description && (
                    <p className="text-sm text-gray-600">{comp.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded flex items-center justify-center min-h-[100px]">
                    {comp.example}
                  </div>
                  {comp.path && (
                    <p className="text-xs font-mono text-gray-500">{comp.path}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default UIComponents;
```

**3. src/pages/Dev/Components/index.tsx の更新**
```typescript
import UIComponents from './UIComponents';

<TabsContent value="ui">
  <UIComponents />
</TabsContent>
```

---

## フェーズ7: カスタムコンポーネント実装

### タスク

- [ ] カスタムコンポーネントレジストリ作成
- [ ] カテゴリ別表示
- [ ] 主要コンポーネントのサンプル実装

### ファイル

**1. src/lib/customComponentRegistry.tsx**
```typescript
import React from 'react';
import IconBlock from '@/components/training/IconBlock';
import CategoryTag from '@/components/training/CategoryTag';
import DottedSeparator from '@/components/common/DottedSeparator';
import CategoryBadge from '@/components/guide/CategoryBadge';
import type { ComponentInfo } from '@/types/dev';

export const CUSTOM_COMPONENTS: Record<string, ComponentInfo[]> = {
  Common: [
    {
      name: 'DottedSeparator',
      category: 'Common',
      description: 'Dotted line separator',
      example: <DottedSeparator />,
      path: '@/components/common/DottedSeparator',
    },
  ],

  Training: [
    {
      name: 'IconBlock',
      category: 'Training',
      description: 'Icon block with background',
      example: <IconBlock icon="rocket" size="md" />,
      path: '@/components/training/IconBlock',
    },
    {
      name: 'CategoryTag',
      category: 'Training',
      description: 'Category tag badge',
      example: <CategoryTag category="UI/UX" />,
      path: '@/components/training/CategoryTag',
    },
  ],

  Guide: [
    {
      name: 'CategoryBadge',
      category: 'Guide',
      description: 'Guide category badge',
      example: (
        <div className="flex gap-2">
          <CategoryBadge category="career" />
          <CategoryBadge category="learning" />
          <CategoryBadge category="industry" />
        </div>
      ),
      path: '@/components/guide/CategoryBadge',
    },
  ],
};
```

**2. src/pages/Dev/Components/CustomComponents.tsx**
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CUSTOM_COMPONENTS } from '@/lib/customComponentRegistry';

const CustomComponents = () => {
  return (
    <div className="space-y-12">
      {Object.entries(CUSTOM_COMPONENTS).map(([category, components]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((comp) => (
              <Card key={comp.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  {comp.description && (
                    <p className="text-sm text-gray-600">{comp.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded flex items-center justify-center min-h-[100px]">
                    {comp.example}
                  </div>
                  {comp.path && (
                    <p className="text-xs font-mono text-gray-500">{comp.path}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Note:</strong> This is a curated selection of custom components.
          For a complete list, browse the <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components</code> directory.
        </p>
      </div>
    </div>
  );
};

export default CustomComponents;
```

**3. src/pages/Dev/Components/index.tsx の更新**
```typescript
import CustomComponents from './CustomComponents';

<TabsContent value="custom">
  <CustomComponents />
</TabsContent>
```

---

## フェーズ8: テスト・調整

### タスク

- [ ] 開発サーバーで動作確認
- [ ] 全タブの表示確認
- [ ] レスポンシブデザイン確認
- [ ] 本番ビルドで404リダイレクト確認
- [ ] コード整理・最適化

### チェックリスト

- [ ] `/dev/components` にアクセスできる（開発モード）
- [ ] Colors タブが正しく表示される
- [ ] Typography タブが正しく表示される
- [ ] Animations タブが正しく表示され、アニメーションが再生できる
- [ ] UI Components タブが正しく表示される
- [ ] Custom Components タブが正しく表示される
- [ ] モバイル・タブレット・デスクトップで正しく表示される
- [ ] 本番ビルド時に `/dev/*` がアクセス不可または404になる

### テストコマンド

```bash
# 開発モードで起動
npm run dev

# ブラウザで確認
# http://localhost:5173/dev/components

# 本番ビルド
npm run build
npm run preview

# 本番プレビューで /dev/components にアクセスし、リダイレクトを確認
```

---

## 完了条件

- [x] フェーズ0: 環境セットアップ
- [ ] フェーズ1: データ定義・型定義
- [ ] フェーズ2: 基本ページ構造
- [ ] フェーズ3: カラーパレット実装
- [ ] フェーズ4: タイポグラフィ実装
- [ ] フェーズ5: アニメーション実装
- [ ] フェーズ6: UIコンポーネント実装
- [ ] フェーズ7: カスタムコンポーネント実装
- [ ] フェーズ8: テスト・調整

## 総見積もり時間

約4.5時間

## 備考

- 各フェーズは順次実装
- 必要に応じてコンポーネント追加・調整
- ユーザーフィードバックを反映して改善
