import Link from "next/link";
import Image from "next/image";

/**
 * 横並び小サムネイル＋タイトル（新トップページ Figma Make HANDOFF由来 / NewContentSection用）
 *
 * -mx / px / w-[calc] の組み合わせで、ホバー背景を広げつつコンテンツ左端は
 * 親の左端に揃える（HANDOFFの「Hoverパターン（行アイテム）」に準拠）。
 */
export interface ArticleRowProps {
  image?: string;
  category: string;
  title: string;
  href: string;
}

export function ArticleRow({ image, category, title, href }: ArticleRowProps) {
  return (
    <Link
      href={href}
      className="group flex w-[calc(100%+24px)] -mx-3 items-center gap-4 rounded-[8px] px-3 py-3 text-left transition-colors duration-200 hover:bg-black/[0.03]"
    >
      <div className="relative h-14 w-[101px] shrink-0 overflow-hidden rounded-[2px] bg-muted-custom lg:h-16 lg:w-[115px]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 115px, 101px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div>
        <p className="font-noto-sans-jp text-xs font-medium leading-[24px] text-text-primary/[0.56]">
          {category}
        </p>
        <h3 className="font-noto-sans-jp text-sm font-medium leading-[24px] text-text-primary group-hover:underline">
          {title}
        </h3>
      </div>
    </Link>
  );
}
