import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-stone-950 dark:focus-visible:ring-stone-300",
  {
    variants: {
      variant: {
        default:
          "bg-stone-900 text-stone-50 hover:bg-stone-900/90 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-50/90 font-bold",
        destructive:
          "bg-red-500 text-stone-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-stone-50 dark:hover:bg-red-900/90 font-bold",
        outline:
          "border border-stone-300 bg-none hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-950 dark:hover:bg-stone-800 dark:hover:text-stone-50 font-bold",
        secondary:
          "bg-stone-200 text-stone-900 hover:bg-stone-100/80 dark:bg-stone-800 dark:text-stone-50 dark:hover:bg-stone-800/80 font-bold",
        ghost:
          "hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-50 font-bold",
        link: "text-stone-900 underline-offset-4 hover:underline dark:text-stone-50 ",
      },
      size: {
        default: "h-10 px-4 pt-3 pb-2.5 text-lg",
        sm: "h-9 rounded-md px-3 pt-3.5 pb-3 text-xs",
        lg: "h-14 px-6 pt-5 pb-4 rounded-md",
        icon: "h-10 px-4 pt-3 pb-2.5 flex justify-center  gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
