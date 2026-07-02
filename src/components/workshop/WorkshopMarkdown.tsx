import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface WorkshopMarkdownProps {
  content: string;
  className?: string;
}

// GuideContent（/guide 詳細）と同じ書式スタイルを Markdown 要素にマッピングしている
const pStyle =
  "text-[18px] font-medium leading-[200%] tracking-[0.03em] text-text-secondary mb-6";
const liStyle =
  "text-[18px] leading-[200%] tracking-[0.03em] text-text-secondary mb-2";

export default function WorkshopMarkdown({
  content,
  className,
}: WorkshopMarkdownProps) {
  return (
    <div className={cn("w-full max-w-[648px] mx-auto font-line-seed-jp", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className={pStyle}>{children}</p>,
          h2: ({ children }) => (
            <h2 className="text-[24px] md:text-[26px] font-semibold leading-[2rem] tracking-[-0.02em] text-text-primary font-line-seed-jp mt-24 mb-12 first:mt-0 scroll-mt-20">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[20px] md:text-[22px] font-semibold leading-[1.75rem] tracking-[-0.02em] text-text-primary font-line-seed-jp mt-16 mb-8 scroll-mt-20">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[18px] md:text-[20px] font-semibold leading-[1.5rem] tracking-[-0.02em] text-text-primary font-line-seed-jp mt-6 mb-3 scroll-mt-20">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border-default bg-muted-custom pl-6 pr-6 py-4 my-6 text-[18px] leading-[200%] tracking-[0.03em] text-text-secondary [&_p]:mb-0">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong
              className="font-bold"
              style={{ background: "linear-gradient(transparent 60%, #FED7AA 60%)" }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className: codeClassName }) => {
            // ブロックコード（```）は <pre> 配下で language-xxx クラスが付く
            const isBlock = codeClassName?.includes("language-");
            if (isBlock) {
              return <code className={codeClassName}>{children}</code>;
            }
            return (
              <code className="px-1.5 py-0.5 bg-muted-custom rounded text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 rounded-lg bg-muted-custom border border-border-light p-4 overflow-x-auto text-[14px] leading-[180%] font-mono text-text-primary">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a
              href={href || "#"}
              target={href?.startsWith("/") ? undefined : "_blank"}
              rel={href?.startsWith("/") ? undefined : "noopener noreferrer"}
              className="text-text-link hover:text-text-link-hover underline underline-offset-2 transition-colors [overflow-wrap:anywhere]"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc mb-6 space-y-2" style={{ paddingLeft: "21.5px" }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal mb-6 space-y-2" style={{ paddingLeft: "21.5px" }}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className={liStyle}>{children}</li>,
          hr: () => <hr className="my-12 border-border-light" />,
          img: ({ src, alt }) => (
            // 外部/サイズ不明画像のため raw img（コンテンツ内画像）
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? src : undefined}
              alt={alt || ""}
              className="my-8 w-full rounded-lg"
            />
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border-light px-4 py-2 text-left font-semibold text-text-muted bg-muted-custom">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border-light px-4 py-2 text-text-primary">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
