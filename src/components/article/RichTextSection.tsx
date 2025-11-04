import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import ContentPreviewOverlay from '@/components/premium/ContentPreviewOverlay';

interface RichTextSectionProps {
  content: PortableTextBlock[];
  isPremium?: boolean;
  previewBlockCount?: number; // プレビューで表示するブロック数（デフォルト: 3）
}

/**
 * RichTextSection コンポーネント
 * Sanity Portable Text を HTML にレンダリング
 *
 * 対応書式（最小限）:
 * - H2 (Heading 2): Inter 20px Bold #101828
 * - H3 (Heading 3): Inter 16px SemiBold #101828
 * - 段落 (Paragraph): Inter 16px Regular #364153
 * - 箇条書きリスト (Unordered List): 21.5px インデント
 *
 * スペーシング:
 * - セクション間: 48px
 * - セクション内: 24px-32px
 *
 * プレミアム機能:
 * - isPremium=true かつ未契約の場合、最初のpreviewBlockCountブロックのみ表示
 * - それ以降はContentPreviewOverlayでロック
 */
const RichTextSection = ({ content, isPremium = false, previewBlockCount = 3 }: RichTextSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();
  const hasAccess = canAccessContent(isPremium);

  // プレミアムコンテンツで未契約の場合、最初のブロックのみ表示
  const displayContent = isPremium && !hasAccess
    ? content.slice(0, previewBlockCount)
    : content;
  const components: PortableTextComponents = {
    block: {
      // Heading 2
      h2: ({ children }) => (
        <h2
          className="text-[20px] font-bold leading-8 text-[#101828] mt-12 mb-6 first:mt-0"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.3515625%" }}
        >
          {children}
        </h2>
      ),
      // Heading 3
      h3: ({ children }) => (
        <h3
          className="text-base font-semibold leading-7 text-[#101828] mt-8 mb-4"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-2.8076171875%" }}
        >
          {children}
        </h3>
      ),
      // 通常の段落
      normal: ({ children }) => (
        <p
          className="text-base leading-[26px] text-[#364153] mb-4"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}
        >
          {children}
        </p>
      ),
    },
    list: {
      // 箇条書きリスト
      bullet: ({ children }) => (
        <ul className="list-disc mb-4 space-y-2" style={{ paddingLeft: "21.5px" }}>
          {children}
        </ul>
      ),
      // 番号付きリスト（サポート外だが一応定義）
      number: ({ children }) => (
        <ol className="list-decimal mb-4 space-y-2" style={{ paddingLeft: "21.5px" }}>
          {children}
        </ol>
      ),
    },
    listItem: {
      // リストアイテム
      bullet: ({ children }) => (
        <li
          className="text-base leading-[26px] text-[#364153]"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}
        >
          {children}
        </li>
      ),
      number: ({ children }) => (
        <li
          className="text-base leading-[26px] text-[#364153]"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}
        >
          {children}
        </li>
      ),
    },
    marks: {
      // 太字（今後対応予定）
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      // 斜体（今後対応予定）
      em: ({ children }) => <em className="italic">{children}</em>,
      // コード（今後対応予定）
      code: ({ children }) => (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ),
    },
  };

  return (
    <div className="w-full py-6">
      <div className="prose prose-lg max-w-none">
        <PortableText value={displayContent} components={components} />
      </div>

      {/* プレミアムコンテンツで未契約の場合、オーバーレイを表示 */}
      {isPremium && !hasAccess && <ContentPreviewOverlay />}
    </div>
  );
};

export default RichTextSection;
