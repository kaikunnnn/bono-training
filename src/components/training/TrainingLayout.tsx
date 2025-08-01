
import React from "react";
import { cn } from "@/lib/utils";
import TrainingHeader from "./TrainingHeader";
import TrainingFooter from "./TrainingFooter";

interface TrainingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const TrainingLayout = ({ children, className }: TrainingLayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col bg-[#F8F9F5]", className)}>
      <TrainingHeader />
      <main className="flex-1 pt-[88px]">
        {children}
      </main>
      <footer>
        <TrainingFooter />
      </footer>
    </div>
  );
};

export default TrainingLayout;
