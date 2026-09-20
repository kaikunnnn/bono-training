import { fireEvent, render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HorizontalContentCard from "./HorizontalContentCard";
import SearchBar from "./SearchBar";
import { SearchResultsSkeleton } from "./SearchResultsSkeleton";
import { useSearchData } from "@/hooks/useSearch";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    prefetch,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
    children: ReactNode;
  }) => (
    <a {...props} data-prefetch={String(prefetch)}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    fill,
    sizes,
    unoptimized,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      data-fill={String(fill)}
      data-sizes={sizes}
      data-unoptimized={String(unoptimized)}
    />
  ),
}));

vi.mock("@/hooks/useSearch", () => ({
  useSearchData: vi.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
  searchFromCache: vi.fn(() => []),
}));

describe("search page performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reserves the initial all-results layout with ten card skeletons", () => {
    const { rerender } = render(<SearchResultsSkeleton tab="all" />);
    expect(screen.getAllByTestId("search-result-skeleton-card")).toHaveLength(10);

    rerender(<SearchResultsSkeleton tab="lesson" />);
    expect(screen.getAllByTestId("search-result-skeleton-card")).toHaveLength(5);
  });

  it("does not subscribe to suggestion data when suggestions are disabled", () => {
    render(<SearchBar showSuggestions={false} />);
    expect(vi.mocked(useSearchData)).toHaveBeenCalledWith(false);
  });

  it("optimizes result images and prefetches only after navigation intent", () => {
    render(
      <HorizontalContentCard
        variant="article"
        href="/contents/ui-basics"
        title="UIデザインの基本"
        thumbnailUrl="https://cdn.sanity.io/images/test/article.jpg"
        description="UIを基礎から学ぶ"
      />
    );

    const link = screen.getByRole("link", { name: /UIデザインの基本/ });
    expect(link.getAttribute("data-prefetch")).toBe("false");

    const image = screen.getByRole("img", { name: "UIデザインの基本" });
    expect(image.getAttribute("data-fill")).toBe("true");
    expect(image.getAttribute("data-sizes")).toContain("240px");
    expect(image.getAttribute("data-unoptimized")).not.toBe("true");

    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("null");
  });
});
