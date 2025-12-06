// src/pages/blog/components/PreviewSection.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from 'react';

interface PreviewSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  title,
  description,
  children,
  className = ""
}) => {
  return (
    <Card className={`mb-16 ${className}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <p className="text-gray-600 mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default PreviewSection;