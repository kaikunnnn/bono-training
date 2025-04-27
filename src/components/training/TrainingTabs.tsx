
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TrainingTabsProps {
  activeTab: 'challenge' | 'skill';
  onTabChange: (value: 'challenge' | 'skill') => void;
}

const TrainingTabs: React.FC<TrainingTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={(value: any) => onTabChange(value)} className="w-full max-w-[400px]">
      <TabsList className="w-full">
        <TabsTrigger value="challenge" className="w-1/2">
          チャレンジ
        </TabsTrigger>
        <TabsTrigger value="skill" className="w-1/2">
          スキル
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TrainingTabs;
