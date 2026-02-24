import * as React from "react"
import { cn } from "@/lib/utils"

// CC-themed input — uses CSS vars, updates on faction switch
const Input = React.forwardRef(({ className, type, style, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md px-3 py-1 text-sm font-mono outline-none transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:opacity-50",
        className
      )}
      style={{
        background: 'var(--cc-panel1, #202833)',
        border: '1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 22%, transparent)',
        color: 'var(--cc-text0, #E6F1FF)',
        caretColor: 'var(--cc-accent-a, #00E5FF)',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 55%, transparent)'; }}
      onBlur={e => { e.target.style.borderColor = 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 22%, transparent)'; }}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }