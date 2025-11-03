import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LessonTabsProps {
  contentTab: React.ReactNode;
  overviewTab: React.ReactNode;
}

export default function LessonTabs({ contentTab, overviewTab }: LessonTabsProps) {
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="content" className="w-full max-w-3xl mx-auto">
        <TabsList className="w-full border-b border-lesson-tab-border bg-transparent rounded-none h-auto p-0 mb-8">
          <TabsTrigger
            value="content"
            className="font-geist font-medium text-base px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-lesson-tab-active data-[state=active]:text-lesson-tab-active data-[state=inactive]:text-lesson-tab-inactive bg-transparent shadow-none"
          >
            コンテンツ
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="font-geist font-medium text-base px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-lesson-tab-active data-[state=active]:text-lesson-tab-active data-[state=inactive]:text-lesson-tab-inactive bg-transparent shadow-none"
          >
            概要・目的
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-0">
          {contentTab}
        </TabsContent>

        <TabsContent value="overview" className="mt-0">
          {overviewTab}
        </TabsContent>
      </Tabs>
    </div>
  );
}
