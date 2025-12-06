import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github.css";

interface GuideContentProps {
  content: string;
  className?: string;
}

/**
 * ガイドコンテンツ（Markdown）レンダラー
 */
const GuideContent = ({ content, className }: GuideContentProps) => {
  return (
    <div className={cn("prose prose-lg max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 見出しのカスタマイズ
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2
              id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
              className="text-3xl font-bold mt-12 mb-4 text-gray-900 border-b border-gray-200 pb-2"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
              className="text-2xl font-bold mt-8 mb-3 text-gray-900"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-bold mt-6 mb-2 text-gray-900" {...props} />
          ),
          // 段落
          p: ({ node, ...props }) => (
            <p className="my-4 text-gray-700 leading-relaxed" {...props} />
          ),
          // リスト
          ul: ({ node, ...props }) => (
            <ul className="my-4 space-y-2 list-disc list-inside" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 space-y-2 list-decimal list-inside" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700" {...props} />
          ),
          // コードブロック
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={cn("block bg-gray-50 rounded-lg p-4 overflow-x-auto", className)}
                {...props}
              >
                {children}
              </code>
            );
          },
          // 画像
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg my-6 mx-auto shadow-md"
              loading="lazy"
              {...props}
            />
          ),
          // リンク
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // 引用
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700"
              {...props}
            />
          ),
          // テーブル
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 border" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm text-gray-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default GuideContent;
