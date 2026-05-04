import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface GuideContentProps {
  content: string;
  className?: string;
}

/**
 * ガイドコンテンツ（Markdown）レンダラー
 * mainのPortable Textスタイルに合わせたタイポグラフィ
 */
export default function GuideContent({ content, className }: GuideContentProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[640px] mx-auto [&>*+*]:mt-[30px]",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold leading-8 text-foreground border-b border-border pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-foreground">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold text-foreground">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] leading-[26px] text-foreground/80">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-6 text-foreground/80">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 py-1 text-foreground/70 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-muted text-pink-600 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {children}
              </code>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <figure>
              <img
                src={src}
                alt={alt || ""}
                className="rounded-lg w-full object-cover shadow-sm"
                loading="lazy"
              />
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
