import { Heart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export const metadata = {
  title: "Component Check — Button",
  robots: { index: false, follow: false },
};

const VARIANTS: NonNullable<ButtonProps["variant"]>[] = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
  "action-secondary",
  "action-tertiary",
];

const SIZES: NonNullable<ButtonProps["size"]>[] = ["default", "sm", "lg", "large", "action", "icon"];

export default function ComponentCheckPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">COMPONENT</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Button
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            <code className="font-mono bg-surface px-1.5 py-0.5 rounded">@/components/ui/button</code>{" "}
            の現在のスタイルを、全variant × 全sizeの組み合わせで確認する。
          </p>
        </header>

        <section className="space-y-10">
          {VARIANTS.map((variant) => (
            <div key={variant}>
              <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-4">
                variant=&quot;{variant}&quot;
              </h2>
              <div className="flex flex-wrap items-end gap-6 bg-surface rounded-[20px] p-6">
                {SIZES.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Button variant={variant} size={size}>
                      {size === "icon" ? <Heart /> : "ボタン"}
                    </Button>
                    <span className="text-[11px] text-text-primary/40 font-mono">{size}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-4">
            その他の状態
          </h2>
          <div className="flex flex-wrap items-end gap-6 bg-surface rounded-[20px] p-6">
            <div className="flex flex-col items-center gap-2">
              <Button disabled>disabled</Button>
              <span className="text-[11px] text-text-primary/40 font-mono">default / disabled</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button>
                <Heart />
                アイコン付き
              </Button>
              <span className="text-[11px] text-text-primary/40 font-mono">default / with icon</span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-cta-primary-bg p-4 rounded-[14px]">
              <Button variant="secondary">on-dark 上での secondary</Button>
              <span className="text-[11px] text-white/60 font-mono">on dark bg</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
