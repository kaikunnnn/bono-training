import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const trainingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-training-primary",
  {
    variants: {
      variant: {
        default: "bg-training-primary text-training-primary-foreground hover:bg-training-primary/90",
        secondary: "bg-training-secondary text-training-secondary-foreground hover:bg-training-secondary/80",
        outline: "border border-training-border bg-training-background hover:bg-training-accent hover:text-white",
        ghost: "hover:bg-training-accent hover:text-white",
      },
      size: {
        sm: "h-[var(--training-button-sm)] px-training-3",
        md: "h-[var(--training-button-md)] px-training-4",
        lg: "h-[var(--training-button-lg)] px-training-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface TrainingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof trainingButtonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, TrainingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(trainingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "TrainingButton"

export { Button, trainingButtonVariants }