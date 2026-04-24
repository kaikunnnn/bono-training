import React from "react";
import { cn } from "@/lib/utils";

interface CardItem {
  _key: string;
  icon?: string;
  image?: { asset?: { url?: string } };
  title: string;
  description?: string;
  value?: string;
  unit?: string;
  tags?: string[];
}

interface CardGridBlockProps {
  value: {
    variant: "info" | "stat" | "feature" | "persona";
    columns?: number;
    cards: CardItem[];
  };
}

type CardVariant = CardGridBlockProps["value"]["variant"];

const cardClass = "bg-background border border-border rounded-xl p-5";

const CardHeader = ({ card, variant }: { card: CardItem; variant: CardVariant }) => {
  switch (variant) {
    case "stat":
      return card.value ? (
        <p className="text-3xl font-bold text-foreground leading-none">
          {card.value}
        </p>
      ) : null;

    case "feature":
      return card.icon ? (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl mb-3">
          {card.icon}
        </div>
      ) : null;

    case "persona":
      return (
        <div className="flex items-center gap-3 mb-3">
          {card.image?.asset?.url ? (
            <img
              src={card.image.asset.url}
              alt={card.title}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
              {card.icon || "👤"}
            </div>
          )}
          <p className="text-sm font-bold text-foreground">{card.title}</p>
        </div>
      );

    default: // info
      return card.icon ? <div className="text-2xl mb-2">{card.icon}</div> : null;
  }
};

const CardBody = ({ card, variant }: { card: CardItem; variant: CardVariant }) => (
  <>
    {/* persona はヘッダーにタイトルを含むためスキップ */}
    {variant !== "persona" && (
      <p className={cn(
        "font-bold text-foreground",
        variant === "stat" ? "mt-2 text-sm" : "text-sm"
      )}>
        {card.title}
      </p>
    )}
    {variant === "stat" && card.unit && (
      <p className="mt-0.5 text-xs text-muted-foreground">{card.unit}</p>
    )}
    {card.description && (
      <p className={cn(
        "text-[13px] leading-relaxed text-muted-foreground",
        variant === "persona" ? "" : "mt-1.5"
      )}>
        {card.description}
      </p>
    )}
    {variant === "persona" && card.tags && card.tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {card.tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="px-2 py-0.5 text-[11px] font-medium bg-muted rounded-full text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </>
);

const columnClasses: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

const CardGridBlock = ({ value }: CardGridBlockProps) => {
  const { variant, columns = 3, cards } = value;
  if (!cards?.length) return null;

  const gridClass = columnClasses[columns as 1 | 2 | 3] || columnClasses[3];

  return (
    <div className={cn("grid gap-3", gridClass)}>
      {cards.map((card) => (
        <div key={card._key} className={cn(cardClass, variant === "stat" && "text-center")}>
          <CardHeader card={card} variant={variant} />
          <CardBody card={card} variant={variant} />
        </div>
      ))}
    </div>
  );
};

export default CardGridBlock;
