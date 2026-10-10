import { cn } from "@/lib/utils";

interface PageTitleSectionProps {
  /** ページタイトル（h1） */
  title: string;
  /** タイトル下の説明文 */
  description: string;
  /** 幅・左右余白（ページ本文の幅に合わせる） */
  className?: string;
}

/**
 * 一覧ページ冒頭のタイトル＋説明文（読みもの / みんなの成果 / イベント）。
 * 左寄せ・h1 1つ。幅と左右の余白はページ本文に合わせて className で渡す。
 */
export function PageTitleSection({ title, description, className }: PageTitleSectionProps) {
  return (
    <section className={cn("pt-16 pb-10 mx-auto", className)}>
      <h1 className="text-4xl font-bold font-rounded-mplus mb-4">{title}</h1>
      <p className="text-muted-foreground text-base leading-relaxed max-w-[600px]">
        {description}
      </p>
    </section>
  );
}

export default PageTitleSection;
