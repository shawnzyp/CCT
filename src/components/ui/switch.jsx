
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

// CC-themed switch using CSS vars
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      '--switch-off': 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, var(--cc-panel1, #202833))',
      '--switch-on': 'var(--cc-accent-a, #00E5FF)',
    }}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className="pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5"
      style={{ background: 'var(--cc-bg0, #0F1216)' }}
    />
    <style>{`
      [data-radix-switch-root][data-state="checked"] { background: var(--cc-accent-a, #00E5FF); box-shadow: 0 0 8px color-mix(in srgb, var(--cc-accent-a, #00E5FF) 40%, transparent); }
      [data-radix-switch-root][data-state="unchecked"] { background: color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, var(--cc-panel1, #202833)); border: 1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 25%, transparent); }
    `}</style>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
