import React from "react";

interface SectionHeadingBlockProps {
  value: {
    number: string;
    label: string;
    title?: string;
  };
}

const SectionHeadingBlock = ({ value }: SectionHeadingBlockProps) => {
  return (
    <div className="pt-4 pb-2">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-muted-foreground/40 font-mono leading-none">
          {value.number}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
          — {value.label}
        </span>
      </div>
      {value.title && (
        <p className="mt-2 text-lg font-bold text-foreground leading-relaxed">
          {value.title}
        </p>
      )}
    </div>
  );
};

export default SectionHeadingBlock;
