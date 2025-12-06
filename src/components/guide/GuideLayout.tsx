import React from "react";
import { cn } from "@/lib/utils";
import TrainingHeader from "../training/TrainingHeader";
import TrainingFooter from "../training/TrainingFooter";

interface GuideLayoutProps {
  children: React.ReactNode;
  className?: string;
  noPaddingTop?: boolean;
}

/**
 * ガイドページ共通レイアウト
 */
const GuideLayout = ({ children, className, noPaddingTop = false }: GuideLayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-[#F8F9F5]", className)}>
      <TrainingHeader />
      <main className={cn("flex-1", noPaddingTop ? "" : "pt-[88px]")}>
        {children}
      </main>
      <footer>
        <TrainingFooter />
      </footer>
    </div>
  );
};

export default GuideLayout;
