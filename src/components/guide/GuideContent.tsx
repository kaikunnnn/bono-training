import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity";

interface GuideContentProps {
  content: PortableTextBlock[];
  className?: string;
}

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-[15px] leading-[26px] text-foreground/80">
        {children}
      </p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-bold leading-8 text-foreground border-b border-border pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-bold text-foreground">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-sm font-bold text-foreground">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-border pl-4 py-1 text-foreground/70 italic">
        {children}
      </blockquote>
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
      <code className="px-1.5 py-0.5 bg-muted text-pink-600 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({
      value,
      children,
    }: {
      value?: { href?: string };
      children?: React.ReactNode;
    }) => (
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
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-outside pl-5 space-y-1.5">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-outside pl-5 space-y-1.5">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-[15px] leading-6 text-foreground/80">{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-[15px] leading-6 text-foreground/80">{children}</li>
    ),
  },
  types: {
    image: ({
      value,
    }: {
      value: { alt?: string; caption?: string; asset?: { _ref?: string; url?: string } };
    }) => {
      const url = value?.asset?.url || (value?.asset?._ref ? urlFor(value).width(640).url() : null);
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
 * feature/bon-116-guide のデザインを移植
 */
export default function GuideContent({ content, className }: GuideContentProps) {
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
}
