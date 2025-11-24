# 技術仕様書: コンポーネント・カラーリファレンスページ

## アーキテクチャ概要

```
/dev/components (メインページ)
├── ColorPalette (カラーパレット)
├── Typography (タイポグラフィ)
├── Animations (アニメーション)
├── UIComponents (shadcn/ui)
└── CustomComponents (カスタムコンポーネント)
```

## ディレクトリ構成

```
src/
├── pages/
│   └── Dev/
│       ├── Components/
│       │   ├── index.tsx (メインページ)
│       │   ├── ColorPalette.tsx
│       │   ├── Typography.tsx
│       │   ├── Animations.tsx
│       │   ├── UIComponents.tsx
│       │   └── CustomComponents.tsx
│       └── index.tsx (Devルート、環境チェック)
├── lib/
│   └── componentRegistry.ts (コンポーネント一覧定義)
└── types/
    └── dev.ts (Dev用型定義)
```

## データ構造

### カラーパレット

```typescript
// src/types/dev.ts

export interface ColorDefinition {
  name: string;
  cssVar: string;
  hslValue: string;
  category: 'theme' | 'custom';
  description?: string;
}

export interface ColorPalette {
  light: ColorDefinition[];
  dark: ColorDefinition[];
}
```

### コンポーネントレジストリ

```typescript
// src/types/dev.ts

export interface ComponentInfo {
  name: string;
  category: string;
  description?: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  example?: React.ReactNode;
}

export interface ComponentRegistry {
  shadcnUI: ComponentInfo[];
  custom: ComponentInfo[];
}
```

### アニメーション定義

```typescript
// src/types/dev.ts

export interface AnimationDefinition {
  name: string;
  className: string;
  duration: string;
  easing?: string;
  description?: string;
}
```

## コンポーネント設計

### 1. メインページ (src/pages/Dev/Components/index.tsx)

```typescript
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColorPalette from './ColorPalette';
import Typography from './Typography';
import Animations from './Animations';
import UIComponents from './UIComponents';
import CustomComponents from './CustomComponents';

const ComponentsReferencePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Component Reference</h1>
          <p className="text-gray-600">
            Design system and component library reference (Dev only)
          </p>
        </header>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="ui">UI Components</TabsTrigger>
            <TabsTrigger value="custom">Custom Components</TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <ColorPalette />
          </TabsContent>

          <TabsContent value="typography">
            <Typography />
          </TabsContent>

          <TabsContent value="animations">
            <Animations />
          </TabsContent>

          <TabsContent value="ui">
            <UIComponents />
          </TabsContent>

          <TabsContent value="custom">
            <CustomComponents />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComponentsReferencePage;
```

### 2. 環境チェック (src/pages/Dev/index.tsx)

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';

const DevRoute = ({ children }: { children: React.ReactNode }) => {
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DevRoute;
```

### 3. カラーパレット (src/pages/Dev/Components/ColorPalette.tsx)

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/lib/colorDefinitions';

const ColorPalette = () => {
  const hslToHex = (hsl: string): string => {
    // HSL to HEX conversion logic
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Theme Colors (Light)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLORS.light.map((color) => (
            <Card key={color.name}>
              <CardHeader>
                <CardTitle className="text-sm">{color.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-20 rounded mb-2"
                  style={{ backgroundColor: `hsl(${color.hslValue})` }}
                />
                <div className="text-xs space-y-1">
                  <p>CSS Var: {color.cssVar}</p>
                  <p>HSL: {color.hslValue}</p>
                  <p>HEX: {hslToHex(color.hslValue)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Custom Colors</h2>
        {/* Training colors, etc. */}
      </section>
    </div>
  );
};

export default ColorPalette;
```

### 4. タイポグラフィ (src/pages/Dev/Components/Typography.tsx)

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';

const Typography = () => {
  const fonts = [
    { name: 'Futura', className: 'font-futura' },
    { name: 'Inter', className: 'font-inter' },
    { name: 'Noto Sans JP', className: 'font-noto-sans-jp' },
    { name: 'M PLUS Rounded 1c', className: 'font-rounded-mplus' },
    { name: 'DotGothic16', className: 'font-dot' },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Font Families</h2>
        {fonts.map((font) => (
          <Card key={font.name} className="p-6 mb-4">
            <h3 className="text-lg font-bold mb-2">{font.name}</h3>
            <p className={`${font.className} text-3xl mb-2`}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className={`${font.className} text-3xl`}>
              いろはにほへと ちりぬるを 0123456789
            </p>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Heading Styles</h2>
        <Card className="p-6">
          <h1 className="mb-2">Heading 1</h1>
          <h2 className="mb-2">Heading 2</h2>
          <h3 className="mb-2">Heading 3</h3>
          <h4 className="mb-2">Heading 4</h4>
          <h5 className="mb-2">Heading 5</h5>
          <h6 className="mb-2">Heading 6</h6>
          <p className="mb-2">Paragraph text</p>
          <small>Small text</small>
        </Card>
      </section>
    </div>
  );
};

export default Typography;
```

### 5. アニメーション (src/pages/Dev/Components/Animations.tsx)

```typescript
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ANIMATIONS } from '@/lib/animationDefinitions';

const Animations = () => {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ANIMATIONS.map((anim) => (
        <Card key={anim.name} className="p-6">
          <h3 className="text-lg font-bold mb-2">{anim.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{anim.description}</p>
          <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-4">
            <div
              className={`w-20 h-20 bg-blue-500 rounded ${
                activeAnimation === anim.name ? anim.className : ''
              }`}
            />
          </div>
          <Button
            onClick={() => {
              setActiveAnimation(null);
              setTimeout(() => setActiveAnimation(anim.name), 10);
            }}
          >
            Play Animation
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default Animations;
```

### 6. UIコンポーネント (src/pages/Dev/Components/UIComponents.tsx)

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ... other imports

const UIComponents = () => {
  const categories = {
    Forms: [
      { name: 'Button', component: <Button>Click me</Button> },
      { name: 'Input', component: <Input placeholder="Enter text" /> },
      // ...
    ],
    Layout: [
      { name: 'Card', component: <Card className="p-4">Card content</Card> },
      // ...
    ],
    // ...
  };

  return (
    <div className="space-y-12">
      {Object.entries(categories).map(([category, components]) => (
        <section key={category}>
          <h2 className="text-2xl font-bold mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((comp) => (
              <Card key={comp.name} className="p-6">
                <h3 className="text-lg font-bold mb-4">{comp.name}</h3>
                <div className="flex items-center justify-center">
                  {comp.component}
                </div>
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

## ルーティング

```typescript
// src/App.tsx に追加

import DevRoute from './pages/Dev';
import ComponentsReferencePage from './pages/Dev/Components';

// Routes:
<Route
  path="/dev/components"
  element={
    <DevRoute>
      <ComponentsReferencePage />
    </DevRoute>
  }
/>
```

## データファイル

### カラー定義 (src/lib/colorDefinitions.ts)

```typescript
import type { ColorDefinition } from '@/types/dev';

export const THEME_COLORS_LIGHT: ColorDefinition[] = [
  {
    name: 'background',
    cssVar: '--background',
    hslValue: '0 0% 100%',
    category: 'theme',
    description: 'Default background color',
  },
  {
    name: 'foreground',
    cssVar: '--foreground',
    hslValue: '222.2 84% 4.9%',
    category: 'theme',
    description: 'Default foreground color',
  },
  // ... all colors from index.css
];

export const THEME_COLORS_DARK: ColorDefinition[] = [
  // ... dark mode colors
];

export const CUSTOM_COLORS: ColorDefinition[] = [
  {
    name: 'training',
    cssVar: '--',
    hslValue: '#FF9900',
    category: 'custom',
  },
  // ...
];
```

### アニメーション定義 (src/lib/animationDefinitions.ts)

```typescript
import type { AnimationDefinition } from '@/types/dev';

export const ANIMATIONS: AnimationDefinition[] = [
  {
    name: 'accordion-down',
    className: 'animate-accordion-down',
    duration: '0.2s',
    easing: 'ease-out',
  },
  {
    name: 'fade-in',
    className: 'animate-fade-in',
    duration: '0.6s',
    easing: 'ease-out',
    description: 'Fade in with upward movement',
  },
  // ... all animations
];
```

## 環境変数チェック

```typescript
// 開発環境チェック
if (import.meta.env.DEV) {
  // Dev only code
}

// 本番環境での404リダイレクト
if (import.meta.env.PROD && location.pathname.startsWith('/dev')) {
  navigate('/');
}
```

## スタイリング

- Tailwind CSS を使用
- 既存のデザインシステムを踏襲
- Card, Tabs などの既存コンポーネントを活用
