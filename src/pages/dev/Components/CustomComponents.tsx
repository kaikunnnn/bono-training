/**
 * カスタムコンポーネント表示コンポーネント
 */

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
          💡 <strong>Note:</strong> This is a curated selection of custom components used throughout the project.
          For a complete list of components, browse the following directories:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/common</code> - Common utilities</li>
          <li>• <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/training</code> - Training components (30+)</li>
          <li>• <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/guide</code> - Guide components</li>
          <li>• <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/layout</code> - Layout components</li>
          <li>• <code className="px-1 py-0.5 bg-blue-100 rounded">/src/components/subscription</code> - Subscription components</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomComponents;
