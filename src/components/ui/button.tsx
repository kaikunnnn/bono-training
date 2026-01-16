import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // カスタムサイズ（HeadingSection等で使用）
        action: "px-[12px] py-[8px] text-[14px] leading-[20px] rounded-xl",
        // Figma準拠サイズ（レッスン詳細等で使用）
        large: "h-12 px-7 py-3.5 rounded-[16px] text-sm font-bold font-noto",
        medium: "h-10 px-5 py-2.5 rounded-xl text-sm",
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
