// src/components/blog/TableOfContents.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className }) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // contentからh2, h3タグを抽出して目次を生成
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const tocItems: TocItem[] = Array.from(headings).map((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id; // IDを設定（実際のDOMではないので、実装時は別途処理が必要）

      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });

    setToc(tocItems);
  }, [content]);

  // スクロール監視
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = toc.map(item =>
        document.getElementById(item.id)
      ).filter(Boolean);

      const scrollPosition = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(toc[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初期位置を設定

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toc]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // ヘッダーの高さ分オフセット
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader>
        <CardTitle className="text-lg">目次</CardTitle>
      </CardHeader>
      <CardContent>
        <nav>
          <ul className="space-y-2">
            {toc.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "border-l-2 transition-all",
                  item.level === 3 && "ml-4",
                  activeId === item.id
                    ? "border-blue-500 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400"
                )}
              >
                <button
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    "block w-full text-left px-3 py-1 text-sm transition-colors",
                    activeId === item.id && "font-semibold"
                  )}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};

export default TableOfContents;