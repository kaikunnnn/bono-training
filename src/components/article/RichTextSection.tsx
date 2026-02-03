import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import ContentPreviewOverlay from "@/components/premium/ContentPreviewOverlay";
import TableOfContents from "@/components/article/TableOfContents";

interface RichTextSectionProps {
  content: PortableTextBlock[];
  isPremium?: boolean;
  previewBlockCount?: number; // プレビューで表示するブロック数（デフォルト: 3）
  afterContent?: React.ReactNode;
}

/**
 * 見出しテキストからIDを生成するヘルパー関数
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

/**
 * RichTextSection コンポーネント
 * Sanity Portable Text を HTML にレンダリング
 *
 * 対応書式（VitePress準拠 + note.comレスポンシブ）:
 * - H2: 24px(desktop) / 22px(mobile), SemiBold, lh:32px, #101828, font:M PLUS Rounded 1c
 * - H3: 20px(desktop) / 18px(mobile), SemiBold, lh:28px, #101828, font:M PLUS Rounded 1c
 * - H4: 18px(desktop) / 16px(mobile), SemiBold, lh:24px, #101828, font:M PLUS Rounded 1c
 * - 段落 (Paragraph): 18px(desktop) / 16px(mobile), lh:200%, letter-spacing:3%, #364153, font:Noto Sans JP
 * - Blockquote (引用): 18px(desktop) / 16px(mobile), lh:200%, 左ボーダー、薄いグレー背景, font:Noto Sans JP
 * - リストアイテム: 18px(desktop) / 16px(mobile), lh:200%, letter-spacing:3%, font:Noto Sans JP
 * - 箇条書きリスト (Bullet List): ● マーカー、21.5px インデント
 * - 番号付きリスト (Numbered List): 1. マーカー、21.5px インデント
 * - 太字 (Strong)、斜体 (Em)、コード (Code)
 * - リンク (Link): 青色、アンダーライン、新規タブで開く
 * - 画像 (Image): レスポンシブ、キャプション対応
 *
 * レスポンシブ:
 * - ブレークポイント: 768px (md)
 * - デスクトップ→モバイル: 全要素 -2px (note.com準拠)
 *
 * 余白（VitePress + 読みやすさ調整）:
 * - H2: 48px 0 24px
 * - H3: 32px 0 16px
 * - H4: 24px 0 12px
 * - p, ul, ol, blockquote: 24px 0
 *
 * プレミアム機能:
 * - isPremium=true かつ未契約の場合、最初のpreviewBlockCountブロックのみ表示
 * - それ以降はContentPreviewOverlayでロック
 */
const RichTextSection = ({
  content,
  isPremium = false,
  previewBlockCount = 3,
  afterContent,
}: RichTextSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();
  const hasAccess = canAccessContent(isPremium);
  const textContainerClassName = "w-full max-w-[60ch] md:max-w-[66ch]";

  // プレミアムコンテンツで未契約の場合、最初のブロックのみ表示
  const displayContent =
    isPremium && !hasAccess ? content.slice(0, previewBlockCount) : content;
  // 見出しのインデックスを追跡するためのカウンター
  let headingIndex = 0;

  const components: PortableTextComponents = {
    block: {
      // Heading 2: 24px(desktop) / 20px(mobile), semibold, lh:32px
      // font: M PLUS Rounded 1c (rounded-mplus)
      // margin: 48px 0 24px (VitePress + 読みやすさ調整)
      h2: ({ children, value }) => {
        const id = generateHeadingId(children, headingIndex++);
        return (
          <h2
            id={id}
            className={`!text-[20px] md:!text-[24px] !font-semibold !leading-[32px] !text-[#101828] !mt-[96px] !mb-[48px] first:!mt-0 !font-rounded-mplus scroll-mt-20 ${textContainerClassName}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            {children}
          </h2>
        );
      },
      // Heading 3: 20px(desktop) / 18px(mobile), semibold, lh:28px
      // font: M PLUS Rounded 1c (rounded-mplus)
      // margin: 32px 0 16px (VitePress + 読みやすさ調整)
      h3: ({ children, value }) => {
        const id = generateHeadingId(children, headingIndex++);
        return (
          <h3
            id={id}
            className={`!text-[18px] md:!text-[20px] !font-semibold !leading-[28px] !text-[#101828] !mt-[64px] !mb-[32px] !font-rounded-mplus scroll-mt-20 ${textContainerClassName}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            {children}
          </h3>
        );
      },
      // Heading 4: 18px(desktop) / 16px(mobile), semibold, lh:24px
      // font: M PLUS Rounded 1c (rounded-mplus)
      // margin: 24px 0 12px (VitePress + 読みやすさ調整)
      h4: ({ children, value }) => {
        const id = generateHeadingId(children, headingIndex++);
        return (
          <h4
            id={id}
            className={`!text-[16px] md:!text-[18px] !font-semibold !leading-[24px] !text-[#101828] !mt-6 !mb-3 !font-rounded-mplus scroll-mt-20 ${textContainerClassName}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            {children}
          </h4>
        );
      },
      // Blockquote (引用): 18px(desktop) / 16px(mobile), lh:200%, letter-spacing:3%
      // font: Noto Sans JP (noto-sans-jp)
      blockquote: ({ children }) => (
        <blockquote
          className={`!border-l-4 !border-[#D0D5DD] !bg-[#F9FAFB] !py-4 !px-6 !my-6 !text-[16px] md:!text-[18px] !leading-[200%] !text-[#182033] !font-noto-sans-jp ${textContainerClassName}`}
          style={{ letterSpacing: "0.03em" }}
        >
          {children}
        </blockquote>
      ),
      // 通常の段落: 18px(desktop) / 16px(mobile), lh:200%, letter-spacing:3%
      // font: Noto Sans JP (noto-sans-jp)
      // margin 24px 0 (VitePress + 読みやすさ調整)
      normal: ({ children }) => (
        <p
          className={`!text-[16px] md:!text-[18px] !leading-[200%] !text-[#182033] !mb-6 !font-noto-sans-jp ${textContainerClassName}`}
          style={{ letterSpacing: "0.03em" }}
        >
          {children}
        </p>
      ),
    },
    list: {
      // 箇条書きリスト: margin 24px 0 (VitePress + 読みやすさ調整)
      bullet: ({ children }) => (
        <ul
          className={`!list-disc !mb-6 !space-y-2 ${textContainerClassName}`}
          style={{ paddingLeft: "21.5px" }}
        >
          {children}
        </ul>
      ),
      // 番号付きリスト: margin 24px 0 (VitePress + 読みやすさ調整)
      number: ({ children }) => (
        <ol
          className={`!list-decimal !mb-6 !space-y-2 ${textContainerClassName}`}
          style={{ paddingLeft: "21.5px" }}
        >
          {children}
        </ol>
      ),
    },
    listItem: {
      // リストアイテム: 18px(desktop) / 16px(mobile), lh:200%, letter-spacing:3%
      // font: Noto Sans JP (noto-sans-jp)
      bullet: ({ children }) => (
        <li
          className="!text-[16px] md:!text-[18px] !leading-[200%] !text-[#182033] !font-noto-sans-jp"
          style={{ letterSpacing: "0.03em" }}
        >
          {children}
        </li>
      ),
      number: ({ children }) => (
        <li
          className="!text-[16px] md:!text-[18px] !leading-[200%] !text-[#182033] !font-noto-sans-jp"
          style={{ letterSpacing: "0.03em" }}
        >
          {children}
        </li>
      ),
    },
    marks: {
      // 太字 + オレンジ寄りの黄色マーカー下線
      strong: ({ children }) => (
        <strong
          className="font-bold"
          style={{
            background: "linear-gradient(transparent 60%, #FED7AA 60%)",
          }}
        >
          {children}
        </strong>
      ),
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
        const href = value?.href || "#";
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] underline hover:text-[#1D4ED8] transition-colors [overflow-wrap:anywhere]"
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
          <figure className="my-8 w-full">
            <img
              src={value.asset.url}
              alt={value.alt || ""}
              className="w-full max-w-none h-auto rounded-lg"
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
      // テーブル（VitePress風）
      tableBlock: ({ value }) => {
        if (!value?.rows || value.rows.length === 0) return null;

        return (
          <div className={`my-6 overflow-x-auto ${textContainerClassName}`}>
            <table className="w-full border-collapse text-[14px]">
              {value.caption && (
                <caption className="text-left text-[14px] text-[#6B7280] mb-2 italic">
                  {value.caption}
                </caption>
              )}
              <tbody>
                {value.rows.map(
                  (
                    row: { isHeader?: boolean; cells?: string[] },
                    rowIndex: number
                  ) => {
                    const isHeader = row.isHeader;
                    const isEvenRow = !isHeader && rowIndex % 2 === 0;

                    return (
                      <tr
                        key={rowIndex}
                        className={`
                        border-t border-[#E5E7EB]
                        ${isHeader ? "bg-[#F9FAFB]" : ""}
                        ${isEvenRow && !isHeader ? "bg-[#F9FAFB]" : "bg-white"}
                        transition-colors duration-200
                      `}
                      >
                        {row.cells?.map((cell: string, cellIndex: number) => {
                          if (isHeader) {
                            return (
                              <th
                                key={cellIndex}
                                className="border border-[#E5E7EB] px-4 py-2 text-left font-semibold text-[#6B7280] bg-[#F9FAFB]"
                              >
                                {cell}
                              </th>
                            );
                          }
                          return (
                            <td
                              key={cellIndex}
                              className="border border-[#E5E7EB] px-4 py-2 text-[#182033]"
                            >
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        );
      },
      // カスタムコンテナ（Notion風コールアウト）
      customContainer: ({ value }) => {
        if (!value?.content) return null;

        const containerType = value.containerType || "info";
        const title = value.title;

        // コンテナタイプ別のスタイル設定
        const containerStyles: Record<
          string,
          {
            bg: string;
            border: string;
            icon: string;
            iconBg: string;
            defaultTitle: string;
          }
        > = {
          tip: {
            bg: "bg-[#ECFDF5]",
            border: "border-[#10B981]",
            icon: "💡",
            iconBg: "bg-[#D1FAE5]",
            defaultTitle: "ヒント",
          },
          info: {
            bg: "bg-[#EFF6FF]",
            border: "border-[#3B82F6]",
            icon: "ℹ️",
            iconBg: "bg-[#DBEAFE]",
            defaultTitle: "情報",
          },
          warning: {
            bg: "bg-[#FFFBEB]",
            border: "border-[#F59E0B]",
            icon: "⚠️",
            iconBg: "bg-[#FEF3C7]",
            defaultTitle: "注意",
          },
          danger: {
            bg: "bg-[#FEF2F2]",
            border: "border-[#EF4444]",
            icon: "🚨",
            iconBg: "bg-[#FEE2E2]",
            defaultTitle: "危険",
          },
          note: {
            bg: "bg-[#F9FAFB]",
            border: "border-[#6B7280]",
            icon: "📝",
            iconBg: "bg-[#F3F4F6]",
            defaultTitle: "ノート",
          },
        };

        const style = containerStyles[containerType] || containerStyles.info;
        const displayTitle = title || style.defaultTitle;

        return (
          <div
            className={`my-6 rounded-lg border-l-4 ${style.border} ${style.bg} p-4 ${textContainerClassName}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center text-base`}
              >
                {style.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#101828] mb-2 text-[16px] md:text-[18px] font-noto-sans-jp">
                  {displayTitle}
                </p>
                <div className="text-[14px] md:text-[16px] leading-[180%] text-[#182033] font-noto-sans-jp [&>p]:mb-2 [&>p:last-child]:mb-0">
                  <PortableText value={value.content} components={components} />
                </div>
              </div>
            </div>
          </div>
        );
      },
      // リンクカード（OGPプレビュー風）
      linkCard: ({ value }) => {
        if (!value?.url || !value?.title) return null;

        // 画像URLを決定（Sanity画像 > 外部URL > なし）
        const imageUrl = value.image?.asset?.url || value.imageUrl;

        // ドメイン名を抽出
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
            className={`my-6 block rounded-lg border border-[#E5E7EB] overflow-hidden hover:border-[#3B82F6] hover:shadow-md transition-all duration-200 no-underline ${textContainerClassName}`}
          >
            <div className="flex flex-col md:flex-row">
              {/* テキスト部分 */}
              <div className="flex-1 p-4 min-w-0">
                <h3 className="text-[16px] md:text-[18px] font-semibold text-[#101828] mb-2 line-clamp-2 font-noto-sans-jp">
                  {value.title}
                </h3>
                {value.description && (
                  <p className="text-[14px] text-[#6B7280] line-clamp-2 mb-3 font-noto-sans-jp">
                    {value.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span>{domain}</span>
                </div>
              </div>
              {/* 画像部分（あれば表示） */}
              {imageUrl && (
                <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={value.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </a>
        );
      },
      // 目次ブロック（本文内に配置可能、見出しから自動生成）
      tableOfContents: ({ value }) => {
        const tocTitle = value?.title || "目次";
        const tocMaxDepth = value?.maxDepth || 2;

        return (
          <TableOfContents
            content={content}
            title={tocTitle}
            maxDepth={tocMaxDepth}
          />
        );
      },
    },
  };

  return (
    <div className="w-full px-6 py-6 bg-white text-[#1D253A] rounded-[20px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)] flex flex-col justify-start items-start gap-1">
      <div className="w-full">
        <PortableText value={displayContent} components={components} />
      </div>

      {afterContent}

      {/* プレミアムコンテンツで未契約の場合、オーバーレイを表示 */}
      {isPremium && !hasAccess && <ContentPreviewOverlay />}
    </div>
  );
};

export default RichTextSection;
