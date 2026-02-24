
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

// CC-themed slider
const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}>
    <SliderPrimitive.Track
      className="relative h-1 w-full grow overflow-hidden rounded-full"
      style={{ background: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 15%, var(--cc-panel1, #202833))' }}>
      <SliderPrimitive.Range
        className="absolute h-full rounded-full"
        style={{ background: 'var(--cc-accent-a, #00E5FF)' }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full shadow transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      style={{
        background: 'var(--cc-accent-a, #00E5FF)',
        border: '2px solid var(--cc-bg0, #0F1216)',
        boxShadow: '0 0 8px color-mix(in srgb, var(--cc-accent-a, #00E5FF) 50%, transparent)',
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
