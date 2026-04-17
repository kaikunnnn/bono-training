import React from "react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/utils";

interface GuideContentProps {
  content: PortableTextBlock[];
  className?: string;
}

const portableTextComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="text-[15px] leading-[26px] text-foreground/80">{children}</p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-bold leading-8 text-foreground border-b border-border pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-bold text-foreground">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-sm font-bold text-foreground">{children}</h4>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-border pl-4 py-1 text-foreground/70 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="px-1.5 py-0.5 bg-muted text-pink-600 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside pl-5 space-y-1.5">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside pl-5 space-y-1.5">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-[15px] leading-6 text-foreground/80">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="text-[15px] leading-6 text-foreground/80">{children}</li>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const url = value?.asset?.url;
      if (!url) return null;
      return (
        <figure>
          <img
            src={url}
            alt={value.alt || ""}
            className="rounded-lg w-full object-cover shadow-sm"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-xs text-center text-muted-foreground mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

/**
 * ガイドコンテンツ（Portable Text）レンダラー
 */
const GuideContent = ({ content, className }: GuideContentProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-[640px] mx-auto [&>*+*]:mt-[30px]",
        className
      )}
    >
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
};

export default GuideContent;
