import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

/**
 * 目次コンポーネント
 * Markdownコンテンツから見出しを抽出して目次を生成
 */
const TableOfContents = ({ content, className }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const extractHeadings = () => {
      const lines = content.split("\n");
      const extracted: Heading[] = [];

      lines.forEach((line) => {
        const h2Match = line.match(/^##\s+(.+)$/);
        const h3Match = line.match(/^###\s+(.+)$/);

        if (h2Match) {
          const text = h2Match[1].trim();
          const id = text.toLowerCase().replace(/\s+/g, '-');
          extracted.push({ id, text, level: 2 });
        } else if (h3Match) {
          const text = h3Match[1].trim();
          const id = text.toLowerCase().replace(/\s+/g, '-');
          extracted.push({ id, text, level: 3 });
        }
      });

      setHeadings(extracted);
    };

    extractHeadings();
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => ({
        id: h.id,
        element: document.getElementById(h.id),
      }));

      let currentId = "";
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i].element;
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentId = headingElements[i].id;
            break;
          }
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={cn("sticky top-24", className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">目次</h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "text-left text-sm transition-colors w-full",
                  heading.level === 2 && "font-medium",
                  heading.level === 3 && "pl-4 text-gray-600",
                  activeId === heading.id
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-600"
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;
