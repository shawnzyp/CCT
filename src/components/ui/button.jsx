import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { useHaptic } from "@/components/utils/useHaptic"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-violet-600 text-white shadow hover:bg-violet-700",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border-2 border-slate-600 bg-slate-700 text-white shadow-sm hover:bg-slate-600",
        secondary:
          "bg-slate-700 text-white shadow-sm hover:bg-slate-600",
        ghost: "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white",
        link: "text-violet-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 sm:h-10 px-3 sm:px-4 py-2 text-sm",
        sm: "h-9 sm:h-8 rounded-md px-3 sm:px-3 text-xs",
        lg: "h-12 sm:h-11 rounded-md px-6 sm:px-8 text-sm sm:text-base",
        icon: "h-11 w-11 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { haptic } = useHaptic()
  
  const handleClick = (e) => {
    haptic('medium')
    if (onClick) onClick(e)
  }
  
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      onClick={handleClick}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }