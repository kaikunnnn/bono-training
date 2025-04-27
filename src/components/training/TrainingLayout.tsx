
import React from "react";
import { cn } from "@/lib/utils";

interface TrainingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const TrainingLayout = ({ children, className }: TrainingLayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <main className="flex-1">
        <div className="mx-auto max-w-[1670px] w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TrainingLayout;
