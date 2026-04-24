import React from "react";

interface DividerBlockProps {
  value: {
    label?: string;
  };
}

const DividerBlock = ({ value }: DividerBlockProps) => {
  if (value.label) {
    return (
      <div className="flex items-center gap-4 my-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest shrink-0">
          {value.label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <hr className="border-t border-border my-2" />;
};

export default DividerBlock;
