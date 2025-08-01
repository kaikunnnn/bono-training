
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
        <div className="mx-auto w-[92%] sm:w-[85%] lg:w-[70.2%] max-w-[1480px]">
          {children}
        </div>
      </main>
      <footer>
        <TrainingFooter />
      </footer>
    </div>
  );
};

export default TrainingLayout;
