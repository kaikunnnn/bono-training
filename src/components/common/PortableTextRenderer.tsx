import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";

const components = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-noto-sans-jp font-bold text-lg text-lesson-overview-heading mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="font-inter text-base leading-relaxed text-lesson-overview-text mb-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-lesson-overview-text">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 ml-4 text-lesson-overview-text">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="text-base leading-relaxed">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ value, children }: any) => {
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
    image: ({ value }: any) => (
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
  value: any;
}

export default function PortableTextRenderer({
  value,
}: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />;
}
