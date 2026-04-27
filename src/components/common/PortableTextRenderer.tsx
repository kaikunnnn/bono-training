import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

const components = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-noto-sans-jp font-bold text-lg text-lesson-overview-heading mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="font-inter text-base leading-relaxed text-lesson-overview-text mb-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-outside pl-5 space-y-2 mb-4 text-lesson-overview-text marker:text-lesson-overview-text">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-outside pl-5 space-y-2 mb-4 text-lesson-overview-text marker:text-lesson-overview-text">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-base leading-relaxed text-lesson-overview-text">
        {children}
      </li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-base leading-relaxed text-lesson-overview-text">
        {children}
      </li>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => {
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
    image: ({ value }: { value: { alt?: string; caption?: string; asset?: { _ref?: string } } }) => (
      <div className="my-6">
        <div className="relative w-full aspect-video">
          <Image
            src={urlFor(value).width(764).height(400).url()}
            alt={value.alt || ""}
            fill
            className="rounded bg-lesson-overview-image-bg object-contain"
            unoptimized
          />
        </div>
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
  value: unknown;
}

export default function PortableTextRenderer({
  value,
}: PortableTextRendererProps) {
  return <PortableText value={value as Parameters<typeof PortableText>[0]['value']} components={components} />;
}
