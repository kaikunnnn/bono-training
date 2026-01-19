import { useMemo } from 'react';
import { PortableTextBlock } from '@portabletext/types';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: PortableTextBlock[];
  title?: string;
  maxDepth?: number; // 1=H2のみ, 2=H2+H3, 3=H2+H3+H4
}

/**
 * 目次自動生成コンポーネント
 *
 * Sanity Portable Textから見出し（H2, H3, H4）を抽出し、
 * VitePress風の目次を自動生成
 *
 * 機能:
 * - H2, H3, H4の見出しを自動抽出
 * - アンカーリンクによるページ内ナビゲーション
 * - 階層的なインデント表示
 */
const TableOfContents = ({ content, title = '目次', maxDepth = 2 }: TableOfContentsProps) => {
  const tocItems = useMemo(() => {
    if (!content) return [];

    const items: TocItem[] = [];

    // maxDepthに基づいて許可する見出しレベルを決定
    const allowedStyles: string[] = ['h2'];
    if (maxDepth >= 2) allowedStyles.push('h3');
    if (maxDepth >= 3) allowedStyles.push('h4');

    // 見出しのみのインデックス（RichTextSectionのheadingIndexと一致させる）
    let headingIndex = 0;

    content.forEach((block) => {
      if (block._type !== 'block') return;

      const style = block.style;
      // 見出しでないブロックはスキップ
      if (style !== 'h2' && style !== 'h3' && style !== 'h4') return;

      // テキストを抽出
      const text = block.children
        ?.filter((child: { _type: string }) => child._type === 'span')
        .map((span: { text?: string }) => span.text || '')
        .join('') || '';

      if (!text) {
        headingIndex++;
        return;
      }

      // IDを生成（日本語対応）- RichTextSectionと同じロジック
      const id = `heading-${headingIndex}-${text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, '')}`;

      const level = style === 'h2' ? 2 : style === 'h3' ? 3 : 4;

      // maxDepthに基づいてフィルタリング
      if (allowedStyles.includes(style)) {
        items.push({ id, text, level });
      }

      headingIndex++;
    });

    return items;
  }, [content]);

  if (tocItems.length === 0) {
    return null;
  }

  // 番号を生成するための関数
  const generateNumbers = () => {
    const numbers: string[] = [];
    let h2Count = 0;
    let h3Count = 0;
    let h4Count = 0;

    tocItems.forEach((item) => {
      if (item.level === 2) {
        h2Count++;
        h3Count = 0;
        h4Count = 0;
        numbers.push(`${h2Count}.`);
      } else if (item.level === 3) {
        h3Count++;
        h4Count = 0;
        numbers.push(`${h2Count}-${h3Count}`);
      } else if (item.level === 4) {
        h4Count++;
        numbers.push(`${h2Count}-${h3Count}-${h4Count}`);
      }
    });

    return numbers;
  };

  const numbers = generateNumbers();

  return (
    <nav className="my-8 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
      <h2 className="text-[16px] md:text-[18px] font-semibold text-[#101828] mb-4 font-rounded-mplus">
        {title}
      </h2>
      <ul className="space-y-2">
        {tocItems.map((item, index) => (
          <li
            key={item.id}
            className={`
              ${item.level === 2 ? 'ml-0' : ''}
              ${item.level === 3 ? 'ml-4' : ''}
              ${item.level === 4 ? 'ml-8' : ''}
            `}
          >
            <a
              href={`#${item.id}`}
              className="text-[14px] md:text-[16px] text-[#3B82F6] hover:text-[#1D4ED8] hover:underline transition-colors font-noto-sans-jp leading-relaxed"
            >
              <span className="text-[#6B7280] mr-2">{numbers[index]}</span>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
