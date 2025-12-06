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
 * 対応書式:
 * - H2 (Heading 2): Inter 20px Bold #101828
 * - H3 (Heading 3): Inter 16px SemiBold #101828
 * - H4 (Heading 4): Inter 15px SemiBold #101828
 * - Blockquote (引用): 左ボーダー、薄いグレー背景、インデント
 * - 段落 (Paragraph): Inter 16px Regular #364153
 * - 箇条書きリスト (Bullet List): ● マーカー、21.5px インデント
 * - 番号付きリスト (Numbered List): 1. マーカー、21.5px インデント
 * - 太字 (Strong)、斜体 (Em)、コード (Code)
 * - リンク (Link): 青色、アンダーライン、新規タブで開く
 * - 画像 (Image): レスポンシブ、キャプション対応
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
      // Heading 4
      h4: ({ children }) => (
        <h4
          className="text-[15px] font-semibold leading-6 text-[#101828] mt-6 mb-3"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-2.8076171875%" }}
        >
          {children}
        </h4>
      ),
      // Blockquote (引用)
      blockquote: ({ children }) => (
        <blockquote
          className="border-l-4 border-[#D0D5DD] bg-[#F9FAFB] py-4 px-6 my-6 text-base leading-[26px] text-[#364153]"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-1.953125%" }}
        >
          {children}
        </blockquote>
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
      // 太字
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      // 斜体
      em: ({ children }) => <em className="italic">{children}</em>,
      // コード
      code: ({ children }) => (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ),
      // リンク
      link: ({ children, value }) => {
        const href = value?.href || '#';
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] underline hover:text-[#1D4ED8] transition-colors"
          >
            {children}
          </a>
        );
      },
    },
    types: {
      // 画像
      image: ({ value }) => {
        if (!value?.asset) return null;

        return (
          <figure className="my-8">
            <img
              src={value.asset.url}
              alt={value.alt || ''}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
            {value.caption && (
              <figcaption className="mt-2 text-sm text-[#6B7280] text-center italic">
                {value.caption}
              </figcaption>
            )}
          </figure>
        );
      },
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
