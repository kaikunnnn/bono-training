/**
 * コンポーネント・カラーリファレンスページ
 * デザインシステムとコンポーネントライブラリのリファレンス
 */

import React from 'react';
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
          <p className="text-gray-600 mb-3">
            Design system and component library reference
          </p>
          <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded border border-yellow-200">
            ⚠️ This page is only available in development mode
          </div>
        </header>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="mb-8 w-full justify-start flex-wrap h-auto">
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
