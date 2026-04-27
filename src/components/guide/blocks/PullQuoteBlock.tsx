import React from "react";

interface PullQuoteBlockProps {
  value: {
    text: string;
    attribution?: string;
    variant?: "default" | "highlight";
  };
}

const PullQuoteBlock = ({ value }: PullQuoteBlockProps) => {
  const isHighlight = value.variant === "highlight";

  if (isHighlight) {
    return (
      <div className="rounded-xl bg-muted/60 px-6 py-5">
        <p className="text-base font-medium leading-relaxed text-foreground">
          {value.text}
        </p>
        {value.attribution && (
          <p className="mt-3 text-sm text-muted-foreground">
            — {value.attribution}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-l-[3px] border-foreground/20 pl-5 py-1">
      <p className="text-[17px] leading-[1.7] text-foreground/80 italic">
        {value.text}
      </p>
      {value.attribution && (
        <p className="mt-2 text-sm text-muted-foreground">
          — {value.attribution}
        </p>
      )}
    </div>
  );
};

export default PullQuoteBlock;
