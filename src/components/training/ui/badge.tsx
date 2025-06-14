import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const trainingBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-training-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-training-primary",
  {
    variants: {
      variant: {
        default: "border-transparent bg-training-primary text-training-primary-foreground hover:bg-training-primary/80",
        accent: "border-transparent bg-training-accent text-white hover:bg-training-accent/80",
        outline: "text-training-primary border-training-border",
      },
      size: {
        sm: "px-training-2 py-0.5 text-xs",
        md: "px-training-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

export interface TrainingBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trainingBadgeVariants> {}

function Badge({ className, variant, size, ...props }: TrainingBadgeProps) {
  return (
    <div className={cn(trainingBadgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, trainingBadgeVariants }