import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useHaptic } from "@/components/utils/useHaptic"

// CC-themed button using CSS vars — auto-updates on faction switch
const buttonVariants = (variant = 'default', size = 'default') => {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono font-semibold tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  const variants = {
    default:   "bg-[var(--cc-accent-a)] text-black hover:opacity-90",
    destructive: "bg-[color-mix(in_srgb,var(--cc-danger)_15%,transparent)] text-[var(--cc-danger)] border border-[color-mix(in_srgb,var(--cc-danger)_40%,transparent)] hover:opacity-90",
    outline:   "border border-[color-mix(in_srgb,var(--cc-accent-a)_35%,transparent)] text-[var(--cc-text1)] bg-transparent hover:bg-[color-mix(in_srgb,var(--cc-accent-a)_10%,transparent)]",
    secondary: "bg-[var(--cc-panel1)] text-[var(--cc-text1)] border border-[color-mix(in_srgb,var(--cc-accent-a)_18%,transparent)] hover:opacity-90",
    ghost:     "bg-transparent text-[var(--cc-text1)] hover:bg-[color-mix(in_srgb,var(--cc-accent-a)_10%,transparent)]",
    link:      "text-[var(--cc-accent-a)] underline-offset-4 hover:underline bg-transparent",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-xs rounded-md",
    sm:      "h-8 px-3 text-xs rounded-md",
    lg:      "h-11 px-8 text-sm rounded-md",
    icon:    "h-10 w-10 rounded-md",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default);
};

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild = false, onClick, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { haptic } = useHaptic()

  const handleClick = (e) => {
    haptic('medium')
    if (onClick) onClick(e)
  }

  return (
    <Comp
      className={cn(buttonVariants(variant, size), className)}
      ref={ref}
      onClick={handleClick}
      {...props}
    />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }