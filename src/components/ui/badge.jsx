import * as React from "react"
import { cn } from "@/lib/utils"

// CC-themed badge — uses CSS vars so it updates on faction switch
function Badge({ className, variant = 'default', style, ...props }) {
  const base = "inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded border transition-colors";

  const variants = {
    default: {
      background: 'color-mix(in srgb, var(--cc-accent-a) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cc-accent-a) 40%, transparent)',
      color: 'var(--cc-accent-a)',
    },
    secondary: {
      background: 'var(--cc-panel1, #202833)',
      borderColor: 'color-mix(in srgb, var(--cc-accent-a) 20%, transparent)',
      color: 'var(--cc-text1, #8EA0B5)',
    },
    destructive: {
      background: 'color-mix(in srgb, var(--cc-danger) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cc-danger) 40%, transparent)',
      color: 'var(--cc-danger, #FF3B3B)',
    },
    outline: {
      background: 'transparent',
      borderColor: 'color-mix(in srgb, var(--cc-accent-a) 35%, transparent)',
      color: 'var(--cc-text1, #8EA0B5)',
    },
    success: {
      background: 'color-mix(in srgb, var(--cc-success) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cc-success) 40%, transparent)',
      color: 'var(--cc-success, #00D1B2)',
    },
    warning: {
      background: 'color-mix(in srgb, var(--cc-warning) 15%, transparent)',
      borderColor: 'color-mix(in srgb, var(--cc-warning) 40%, transparent)',
      color: 'var(--cc-warning, #FFC857)',
    },
  };

  return (
    <div
      className={cn(base, className)}
      style={{ ...variants[variant] || variants.default, ...style }}
      {...props}
    />
  );
}

// Keep cva export for backward compat
const badgeVariants = () => "";

export { Badge, badgeVariants }