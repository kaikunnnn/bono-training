"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function LessonTabsStaticHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-gray-200 mb-[32px] !text-black">
      <span className="font-noto-sans-jp font-extrabold text-sm md:text-base px-4 md:px-6 py-2 md:py-3 inline-block border-b-2 !border-black !text-black">
        {label}
      </span>
    </div>
  );
}

interface LessonTabsProps {
  contentTab: React.ReactNode;
  overviewTab?: React.ReactNode;
  activeTab?: "content" | "overview";
  onTabChange?: (tab: "content" | "overview") => void;
  showOverviewTab?: boolean;
}

export default function LessonTabs({
  contentTab,
  overviewTab,
  activeTab,
  onTabChange,
  showOverviewTab = true,
}: LessonTabsProps) {
  if (!showOverviewTab) {
    return (
      <div className="w-full text-gray-900">
        <LessonTabsStaticHeader label="コンテンツ" />
        <div className="text-gray-900">
          {contentTab}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs
        defaultValue="content"
        value={activeTab}
        onValueChange={(value) => onTabChange?.(value as "content" | "overview")}
        className="w-full"
      >
        <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0 mb-[32px]">
          <TabsTrigger
            value="content"
            className="font-noto-sans-jp font-bold text-sm md:text-base px-4 md:px-6 py-2 md:py-3 rounded-none border-b-2 border-transparent !text-black data-[state=active]:border-black data-[state=active]:!text-black data-[state=active]:bg-transparent data-[state=inactive]:!text-black bg-transparent shadow-none"
          >
            コンテンツ
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="font-noto-sans-jp font-bold text-sm md:text-base px-4 md:px-6 py-2 md:py-3 rounded-none border-b-2 border-transparent !text-black data-[state=active]:border-black data-[state=active]:!text-black data-[state=active]:bg-transparent data-[state=inactive]:!text-black bg-transparent shadow-none"
          >
            概要・目的
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-0 text-gray-900">
          {contentTab}
        </TabsContent>

        <TabsContent value="overview" className="mt-0 text-gray-900">
          {overviewTab}
        </TabsContent>
      </Tabs>
    </div>
  );
}
