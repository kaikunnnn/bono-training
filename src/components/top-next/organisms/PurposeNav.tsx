import { Map, ClipboardCheck } from "lucide-react";
import { Book, MessageQuestion } from "iconsax-react";
import { PurposeItem } from "@/components/top-next/molecules/PurposeItem";

/**
 * 目的から探すナビ（新トップページ Figma Make HANDOFF / PurposeNav）
 *
 * レッスン・掲示板は、左サイドバー（Sidebar/icons.tsx の MenuIcons.lesson /
 * MenuIcons.question）と同じ iconsax-react アイコン（Book / MessageQuestion）を
 * 使う（ユーザー指定：同じ導線は同じアイコンで揃える）。
 * ※ 03-ui-conventions.md は新規コードで lucide-react を原則としているが、
 * この2つはサイドバーとの一貫性を優先し、意図的に iconsax-react を使用している。
 */
const ICONSAX_SIZE = 20;

const PURPOSE_ITEMS = [
  {
    sub: "ロードマップ",
    label: "スキルアップ計画を立てる",
    icon: <Map className="size-5 text-text-primary" aria-hidden />,
    href: "/roadmap",
  },
  {
    sub: "フィードバック",
    label: "プロに改善点をもらう",
    icon: <ClipboardCheck className="size-5 text-text-primary" aria-hidden />,
    href: "/feedback-apply/guide",
  },
  {
    sub: "掲示板",
    label: "質問・相談する",
    icon: (
      <MessageQuestion size={ICONSAX_SIZE} color="#2F3037" variant="Outline" />
    ),
    href: "/questions",
  },
  {
    sub: "レッスン",
    label: "UI・UXのコンテンツ",
    icon: <Book size={ICONSAX_SIZE} color="#2F3037" variant="Outline" />,
    href: "/lessons",
  },
];

export function PurposeNav() {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] pt-1 pb-[5px]">
        {/* 視覚的には非表示だが、h1→h2→h3... の見出し階層を保つために構造上は残す */}
        <h2 className="sr-only">目的から探す</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[21px]">
          {PURPOSE_ITEMS.map((item) => (
            <PurposeItem
              key={item.label}
              subLabel={item.sub}
              label={item.label}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
