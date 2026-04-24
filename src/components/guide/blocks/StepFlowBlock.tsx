import React from "react";
import { cn } from "@/lib/utils";

interface StepItem {
  _key: string;
  title: string;
  description?: string;
}

interface StepFlowBlockProps {
  value: {
    title?: string;
    steps: StepItem[];
  };
}

const StepFlowBlock = ({ value }: StepFlowBlockProps) => {
  const { steps } = value;
  if (!steps?.length) return null;

  return (
    <div>
      {value.title && (
        <p className="text-sm font-bold text-foreground mb-4">{value.title}</p>
      )}
      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={step._key} className="flex gap-4 relative">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-border min-h-[20px]" />
                )}
              </div>
              <div className={cn(isLast ? "pb-0" : "pb-5")}>
                <p className="text-[15px] font-bold text-foreground leading-7">
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepFlowBlock;
