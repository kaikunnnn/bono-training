/**
 * UIコンポーネント表示コンポーネント
 * shadcn/uiコンポーネントのサンプル一覧
 */

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
                  <div className="bg-gray-50 p-4 rounded flex items-center justify-center min-h-[120px]">
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
          💡 <strong>Note:</strong> This is a curated selection of commonly used shadcn/ui components.
          The project includes 47 shadcn/ui components in total. For the complete list, check{' '}
          <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/ui</code> directory.
        </p>
      </div>
    </div>
  );
};

export default UIComponents;
