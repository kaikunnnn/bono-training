import { Map, MessageSquare, BookOpen, MessagesSquare } from "lucide-react";
import { PurposeItem } from "@/components/top-next/molecules/PurposeItem";

/**
 * 目的から探すナビ（新トップページ Figma Make HANDOFF / PurposeNav）
 *
 * アイコンは top2/FeatureLinkGrid と同一の lucide-react アイコンを使用。
 */
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
    icon: <MessageSquare className="size-5 text-text-primary" aria-hidden />,
    href: "/feedbacks",
  },
  {
    sub: "レッスン",
    label: "UI・UXのコンテンツ",
    icon: <BookOpen className="size-5 text-text-primary" aria-hidden />,
    href: "/lessons",
  },
  {
    sub: "掲示板",
    label: "質問・相談する",
    icon: <MessagesSquare className="size-5 text-text-primary" aria-hidden />,
    href: "/questions",
  },
];

export function PurposeNav() {
  return (
    <section className="px-6 lg:px-12">
      <div className="border-b border-black/[0.12] py-8">
        <h2 className="mb-6 font-noto-sans-jp text-[22px] font-medium leading-[1.71] text-text-primary">
          目的から探す
        </h2>
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
