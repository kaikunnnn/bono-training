import React from "react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/utils";

type ContainerType = "tip" | "info" | "warning" | "danger" | "note";

interface CustomContainerBlockProps {
  value: {
    containerType: ContainerType;
    title?: string;
    content: PortableTextBlock[];
  };
}

const containerStyles: Record<
  ContainerType,
  { icon: string; label: string; border: string; bg: string }
> = {
  tip: {
    icon: "💡",
    label: "ヒント",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  info: {
    icon: "ℹ️",
    label: "情報",
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  warning: {
    icon: "⚠️",
    label: "警告",
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  danger: {
    icon: "🚨",
    label: "危険",
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
  },
  note: {
    icon: "📝",
    label: "ノート",
    border: "border-l-gray-400",
    bg: "bg-muted/50",
  },
};

const innerComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-[14px] leading-[24px] text-foreground/80">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="px-1 py-0.5 bg-muted text-pink-600 rounded text-xs font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline underline-offset-2"
      >
        {children}
      </a>
    ),
  },
};

const CustomContainerBlock = ({ value }: CustomContainerBlockProps) => {
  const style = containerStyles[value.containerType] || containerStyles.note;
  const title = value.title || style.label;

  return (
    <div className={cn("border-l-4 rounded-r-lg px-4 py-3.5", style.border, style.bg)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{style.icon}</span>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {value.content && (
        <div className="[&>*+*]:mt-2">
          <PortableText value={value.content} components={innerComponents} />
        </div>
      )}
    </div>
  );
};

export default CustomContainerBlock;
