import { fireEvent, render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import { describe, expect, it, vi } from "vitest";
import TrainingGrid from "./TrainingGrid";
import TrainingBackgroundPreload from "./TrainingBackgroundPreload";
import {
  getOptimizedTrainingImage,
  TRAINING_CARD_BACKGROUND_IMAGE,
} from "@/lib/training-images";
import type { Training } from "@/types/training";

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
    loading,
    unoptimized,
    quality,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
    quality?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      data-fill={String(fill)}
      data-sizes={sizes}
      data-loading={loading}
      data-quality={quality}
      data-unoptimized={String(unoptimized)}
    />
  ),
}));

const portfolioTraining: Training = {
  id: "training-1",
  slug: "information-architecture",
  title: "情報設計トレーニング",
  description: "情報を整理する",
  type: "portfolio",
  difficulty: "初級",
  tags: [],
  icon: "/assets/emoji/building.svg",
  category: "情報設計",
};

const challengeTraining: Training = {
  ...portfolioTraining,
  id: "training-2",
  slug: "ui-challenge",
  title: "UIチャレンジ",
  type: "challenge",
  thumbnailImage: "/assets/emoji/watch.svg",
};

describe("training list performance", () => {
  it("preloads the shared first-card LCP background from the static shell", () => {
    render(<TrainingBackgroundPreload />);
    const preload = document.head.querySelector(
      'link[rel="preload"][as="image"]'
    );

    expect(preload?.getAttribute("href")).toBe(TRAINING_CARD_BACKGROUND_IMAGE);
    expect(preload?.getAttribute("type")).toBe("image/svg+xml");
    expect(preload?.getAttribute("fetchpriority")).toBe("high");
  });

  it("maps only known oversized emoji assets to lightweight WebP files", () => {
    expect(getOptimizedTrainingImage("/assets/emoji/building.svg")).toBe(
      "/assets/emoji/optimized/building.webp"
    );
    expect(getOptimizedTrainingImage("/assets/emoji/new-icon.svg")).toBe(
      "/assets/emoji/new-icon.svg"
    );
    expect(getOptimizedTrainingImage("https://cdn.sanity.io/image.webp")).toBe(
      "https://cdn.sanity.io/image.webp"
    );
  });

  it("uses optimized responsive images and only eagerly loads the first card", () => {
    render(
      <TrainingGrid trainings={[portfolioTraining, challengeTraining]} />
    );

    const portfolioImage = screen.getByRole("img", {
      name: "情報設計トレーニング",
    });
    expect(portfolioImage.getAttribute("src")).toBe(
      "/assets/emoji/optimized/building.webp"
    );
    expect(portfolioImage.getAttribute("data-loading")).toBe("eager");
    expect(portfolioImage.getAttribute("data-sizes")).toBe("50px");
    expect(portfolioImage.getAttribute("data-unoptimized")).not.toBe("true");

    const challengeImage = screen.getByRole("img", { name: "UIチャレンジ" });
    expect(challengeImage.getAttribute("src")).toBe(
      "/assets/emoji/optimized/watch.webp"
    );
    expect(challengeImage.getAttribute("data-loading")).toBe("lazy");
    expect(challengeImage.getAttribute("data-unoptimized")).not.toBe("true");
  });

  it("prefetches a detail route only after navigation intent", () => {
    render(<TrainingGrid trainings={[portfolioTraining]} />);

    const link = screen.getByRole("link", { name: /情報設計トレーニング/ });
    expect(link.getAttribute("data-prefetch")).toBe("false");

    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("null");
  });
});
