import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// スタイル（フォント・太さ・角丸の言語）は全サイズで統一し、size は寸法のみを変える。
// 基準スタイル = ログイン画面の主要CTA（bold / font-noto / 角丸は高さに比例）
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold font-noto ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0px_1px_1px_0px_rgba(0,0,0,0.08),0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "bg-white border border-[#EBEBEB] text-black shadow-[0px_0px_3px_0px_rgba(0,0,0,0.04)] hover:bg-gray-50",
        secondary:
          "bg-[rgba(245,245,244,1)] border border-[rgba(0,0,0,0.04)] text-secondary-foreground shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] hover:bg-[rgba(235,235,234,1)] hover:border-[rgba(0,0,0,0.08)] active:bg-[rgba(229,229,228,1)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // カスタムボタンスタイル（HeadingSection等で使用）
        "action-secondary":
          "bg-white border border-[#E4E4E4] text-black shadow-[0px_1px_12px_0px_rgba(0,0,0,0.05)] hover:bg-[#FAFAFA] hover:border-[#D0D0D0] active:bg-[#F5F5F5] rounded-full",
        "action-tertiary":
          "bg-[#E9EBEB] text-[#5A616F] hover:bg-[#DFE1E1] active:bg-[#D5D7D7] rounded-full font-semibold",
      },
      size: {
        // 角丸は高さに比例（h-8→10px / h-10→12px / h-11→14px / h-12→16px）
        default: "h-10 px-5 py-2 rounded-[12px]",
        sm: "h-9 px-4 rounded-[10px]",
        lg: "h-11 px-8 rounded-[14px]",
        icon: "h-10 w-10 rounded-[12px]",
        // カスタムサイズ（HeadingSection等で使用）
        action: "px-[12px] py-[8px] text-[14px] leading-[20px] rounded-xl",
        // 大CTA（ログイン・レッスン詳細等）
        large: "h-12 px-7 py-3.5 rounded-[16px]",
        medium: "h-10 px-5 py-2.5 rounded-[12px]",
        small: "h-8 px-3.5 py-1.5 rounded-[10px] text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
