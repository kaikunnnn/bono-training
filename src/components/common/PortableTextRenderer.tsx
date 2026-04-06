import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity";
import type { ReactNode } from "react";

interface BlockProps {
  children?: ReactNode;
}

interface MarkProps {
  children?: ReactNode;
  value?: {
    href?: string;
  };
}

interface ImageValue {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  alt?: string;
  caption?: string;
}

interface ImageProps {
  value: ImageValue;
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }: BlockProps) => (
      <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: BlockProps) => (
      <h3 className="font-noto-sans-jp font-bold text-lg text-lesson-overview-heading mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: BlockProps) => (
      <p className="font-inter text-base leading-relaxed text-lesson-overview-text mb-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: BlockProps) => (
      <ul className="list-disc list-outside pl-5 space-y-2 mb-4 text-lesson-overview-text marker:text-lesson-overview-text">
        {children}
      </ul>
    ),
    number: ({ children }: BlockProps) => (
      <ol className="list-decimal list-outside pl-5 space-y-2 mb-4 text-lesson-overview-text marker:text-lesson-overview-text">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: BlockProps) => (
      <li className="text-base leading-relaxed text-lesson-overview-text">
        {children}
      </li>
    ),
    number: ({ children }: BlockProps) => (
      <li className="text-base leading-relaxed text-lesson-overview-text">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }: MarkProps) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: MarkProps) => <em className="italic">{children}</em>,
    link: ({ value, children }: MarkProps) => {
      const target = (value?.href || "").startsWith("http")
        ? "_blank"
        : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className="text-blue-600 underline hover:text-blue-700"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: ImageProps) => (
      <div className="my-6">
        <img
          src={urlFor(value).width(764).height(400).url()}
          alt={value.alt || ""}
          className="w-full h-auto rounded bg-lesson-overview-image-bg"
        />
        {value.caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            {value.caption}
          </p>
        )}
      </div>
    ),
  },
};

interface PortableTextRendererProps {
  value: PortableTextBlock | PortableTextBlock[];
}

export default function PortableTextRenderer({
  value,
}: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />;
}
