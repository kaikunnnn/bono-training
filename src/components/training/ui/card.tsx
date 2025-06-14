import * as React from "react"

import { cn } from "@/lib/utils"

export interface TrainingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

const Card = React.forwardRef<HTMLDivElement, TrainingCardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-training-border bg-training-card text-card-foreground",
        variant === 'elevated' ? "shadow-training-card" : "shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "TrainingCard"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-training-2 p-training-6", className)}
    {...props}
  />
))
CardHeader.displayName = "TrainingCardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight font-training-primary",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "TrainingCardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-training-secondary", className)}
    {...props}
  />
))
CardDescription.displayName = "TrainingCardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-training-6 pt-0", className)} {...props} />
))
CardContent.displayName = "TrainingCardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-training-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "TrainingCardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }