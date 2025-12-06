// src/pages/blog/components/ResponsiveContainer.tsx
import { ReactNode, useState } from 'react';
import { Button } from "@/components/ui/button";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

const screenSizes = {
  mobile: { width: '375px', label: 'Mobile' },
  tablet: { width: '768px', label: 'Tablet' },
  desktop: { width: '100%', label: 'Desktop' }
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = ""
}) => {
  const [currentSize, setCurrentSize] = useState<ScreenSize>('desktop');

  return (
    <div className={className}>
      {/* Screen Size Toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 flex items-center mr-2">
          画面サイズ:
        </span>
        {Object.entries(screenSizes).map(([key, config]) => (
          <Button
            key={key}
            variant={currentSize === key ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSize(key as ScreenSize)}
            className="text-xs"
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Responsive Preview Container */}
      <div className="border rounded-lg overflow-hidden">
        <div
          className="transition-all duration-300 mx-auto bg-white"
          style={{
            width: screenSizes[currentSize].width,
            minHeight: currentSize === 'mobile' ? '300px' : '200px'
          }}
        >
          {children}
        </div>
      </div>

      {/* Size Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        現在の表示: {screenSizes[currentSize].label} ({screenSizes[currentSize].width})
      </div>
    </div>
  );
};

export default ResponsiveContainer;