import React, { useMemo } from "react";

interface LinkCardBlockProps {
  value: {
    url: string;
    title: string;
    description?: string;
    image?: { asset?: { url?: string } };
    imageUrl?: string;
  };
}

const LinkCardBlock = ({ value }: LinkCardBlockProps) => {
  const imageUrl = value.image?.asset?.url || value.imageUrl;

  const hostname = useMemo(() => {
    try {
      return new URL(value.url).hostname;
    } catch {
      return value.url;
    }
  }, [value.url]);

  return (
    <a
      href={value.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-background group"
    >
      {imageUrl && (
        <div className="w-[120px] sm:w-[160px] shrink-0">
          <img
            src={imageUrl}
            alt={value.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 p-4 min-w-0">
        <p className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
          {value.title}
        </p>
        {value.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {value.description}
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground truncate">
          {hostname}
        </p>
      </div>
    </a>
  );
};

export default LinkCardBlock;
