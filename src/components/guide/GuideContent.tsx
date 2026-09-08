import { PortableText, PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity";

interface GuideContentProps {
  content: PortableTextBlock[];
  className?: string;
}

/**
 * 見出しテキストからIDを生成
 */
const generateHeadingId = (
  children: React.ReactNode,
  index: number
): string => {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children
          .map((child) =>
            typeof child === "string"
              ? child
              : (child as { props?: { text?: string } })?.props?.text || ""
          )
          .join("")
      : "";

  return `heading-${index}-${text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "")}`;
};

// 段落の共通スタイル
const pStyle = "text-[18px] font-medium leading-[200%] tracking-[0.03em] text-text-secondary mb-6";
const liStyle = "text-[18px] leading-[200%] tracking-[0.03em] text-text-secondary mb-2";

let headingIndex = 0;

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={pStyle}>{children}</p>,
    p: ({ children }) => <p className={pStyle}>{children}</p>,
    h2: ({ children }) => {
      const id = generateHeadingId(children, headingIndex++);
      return (
        <h2
          id={id}
          className="text-[24px] md:text-[26px] font-semibold leading-[2rem] tracking-[-0.02em] text-text-primary font-rounded-mplus mt-24 mb-12 first:mt-0 scroll-mt-20"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = generateHeadingId(children, headingIndex++);
      return (
        <h3
          id={id}
          className="text-[20px] md:text-[22px] font-semibold leading-[1.75rem] tracking-[-0.02em] text-text-primary font-rounded-mplus mt-16 mb-8 scroll-mt-20"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = generateHeadingId(children, headingIndex++);
      return (
        <h4
          id={id}
          className="text-[18px] md:text-[20px] font-semibold leading-[1.5rem] tracking-[-0.02em] text-text-primary font-rounded-mplus mt-6 mb-3 scroll-mt-20"
        >
          {children}
        </h4>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-border-default bg-muted-custom pl-6 pr-6 py-4 my-6 text-[18px] leading-[200%] tracking-[0.03em] text-text-secondary">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong
        className="font-bold"
        style={{ background: "linear-gradient(transparent 60%, #FED7AA 60%)" }}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 bg-muted-custom rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href || "#";
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-link hover:text-text-link-hover underline underline-offset-2 transition-colors [overflow-wrap:anywhere]"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc mb-6 space-y-2" style={{ paddingLeft: "21.5px" }}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal mb-6 space-y-2" style={{ paddingLeft: "21.5px" }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className={liStyle}>{children}</li>,
    number: ({ children }) => <li className={liStyle}>{children}</li>,
  },
  types: {
    // 画像
    image: ({ value }) => {
      const url =
        value?.asset?.url ||
        (value?.asset?._ref ? urlFor(value).width(648).url() : null);
      if (!url) return null;
      return (
        <figure className="my-8 w-full">
          <div className="relative w-full aspect-video">
            <Image
              src={url}
              alt={value.alt || ""}
              fill
              className="rounded-lg object-contain"
              unoptimized
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-text-muted text-center italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    // テーブル
    tableBlock: ({ value }) => {
      if (!value?.rows || value.rows.length === 0) return null;
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            {value.caption && (
              <caption className="text-left text-[14px] text-text-muted mb-2 italic">
                {value.caption}
              </caption>
            )}
            <tbody>
              {value.rows.map(
                (
                  row: { isHeader?: boolean; cells?: string[] },
                  rowIndex: number
                ) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-t border-border-light transition-colors",
                      row.isHeader
                        ? "bg-muted-custom"
                        : rowIndex % 2 === 0
                        ? "bg-muted-custom"
                        : "bg-surface"
                    )}
                  >
                    {row.cells?.map((cell: string, cellIndex: number) =>
                      row.isHeader ? (
                        <th
                          key={cellIndex}
                          className="border border-border-light px-4 py-2 text-left font-semibold text-text-muted bg-muted-custom"
                        >
                          {cell}
                        </th>
                      ) : (
                        <td
                          key={cellIndex}
                          className="border border-border-light px-4 py-2 text-text-primary"
                        >
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    },
    // カスタムコンテナ（tip/info/warning/danger/note）
    customContainer: ({ value }) => {
      if (!value?.content) return null;
      const type = value.containerType || "info";
      const styles: Record<string, { bg: string; border: string; icon: string }> = {
        tip:     { bg: "bg-[#ECFDF5]", border: "border-[#10B981]", icon: "💡" },
        info:    { bg: "bg-[#EFF6FF]", border: "border-[#3B82F6]", icon: "ℹ️" },
        warning: { bg: "bg-[#FFFBEB]", border: "border-[#F59E0B]", icon: "⚠️" },
        danger:  { bg: "bg-[#FEF2F2]", border: "border-[#EF4444]", icon: "🚨" },
        note:    { bg: "bg-muted-custom", border: "border-text-muted", icon: "📝" },
      };
      const s = styles[type] || styles.info;
      const defaultTitles: Record<string, string> = { tip: "ヒント", info: "情報", warning: "注意", danger: "危険", note: "ノート" };
      const title = value.title || defaultTitles[type] || "情報";
      return (
        <div className={`my-6 rounded-lg border-l-4 ${s.border} ${s.bg} p-4`}>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base">
              {s.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary mb-2 text-[16px] md:text-[18px] font-noto-sans-jp">
                {title}
              </p>
              <div className="text-[14px] md:text-[16px] leading-[180%] text-text-primary font-noto-sans-jp [&>p]:mb-2 [&>p:last-child]:mb-0">
                <PortableText value={value.content} components={portableTextComponents} />
              </div>
            </div>
          </div>
        </div>
      );
    },
    // リンクカード（OGP風プレビュー）
    linkCard: ({ value }) => {
      if (!value?.url || !value?.title) return null;
      const imageUrl = value.image?.asset?.url || value.imageUrl;
      let domain = "";
      try {
        domain = new URL(value.url).hostname.replace("www.", "");
      } catch {
        domain = value.url;
      }
      return (
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-6 block rounded-lg border border-border-light overflow-hidden hover:border-text-link hover:shadow-md transition-all duration-200 no-underline"
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-4 min-w-0">
              <h3 className="text-[16px] md:text-[18px] font-semibold text-text-primary mb-2 line-clamp-2 font-noto-sans-jp">
                {value.title}
              </h3>
              {value.description && (
                <p className="text-[14px] text-text-muted line-clamp-2 mb-3 font-noto-sans-jp">
                  {value.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-[12px] text-text-disabled">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>{domain}</span>
              </div>
            </div>
            {imageUrl && (
              <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                <Image src={imageUrl} alt={value.title} fill className="object-cover" unoptimized />
              </div>
            )}
          </div>
        </a>
      );
    },
  },
};

/**
 * ガイドコンテンツ（Portable Text）レンダラー
 * article の RichTextSection と同等の書式変換機能を持つ
 */
export default function GuideContent({ content, className }: GuideContentProps) {
  headingIndex = 0;
  return (
    <div
      className={cn(
        "w-full max-w-[648px] mx-auto font-noto-sans-jp",
        className
      )}
    >
      <PortableText value={content} components={portableTextComponents} />
    </div>
  );
}
