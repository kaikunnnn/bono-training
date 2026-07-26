import Link from "next/link";
import { STUDIO_TOOLS } from "@/lib/studio-tools";

export const metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioIndexPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary font-rounded-mplus">
            Studio
          </h1>
          <p className="text-sm text-text-primary/60 mt-3 font-noto-sans-jp leading-relaxed">
            素材生成まわりの社内クリエイティブツール置き場。
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STUDIO_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/studio/${tool.slug}`}
              className="group block bg-surface rounded-[4px] overflow-clip"
            >
              <div className="w-full aspect-video" style={tool.thumbnailStyle} />
              <div className="px-6 py-[38px]">
                <p className="text-xs text-text-primary/40 font-noto-sans-jp">{tool.meta}</p>
                <h2 className="text-2xl leading-[32px] font-normal text-text-primary font-noto-sans-jp mt-2 group-hover:underline">
                  {tool.title}
                </h2>
                <p className="text-xs leading-[22.75px] text-text-primary/60 font-noto-sans-jp mt-3 line-clamp-3">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
