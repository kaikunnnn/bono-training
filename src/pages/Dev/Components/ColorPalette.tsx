/**
 * カラーパレット表示コンポーネント
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  THEME_COLORS_LIGHT,
  THEME_COLORS_DARK,
  CUSTOM_COLORS,
} from '@/lib/colorDefinitions';
import { hslToHex } from '@/lib/colorUtils';
import type { ColorDefinition } from '@/types/dev';

interface ColorCardProps {
  color: ColorDefinition;
}

const ColorCard = ({ color }: ColorCardProps) => {
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
          {color.cssVar && (
            <p className="text-gray-600">var({color.cssVar})</p>
          )}
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
