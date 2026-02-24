import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg p-1 text-xs",
      className
    )}
    style={{
      background: 'var(--cc-panel1, #202833)',
      border: '1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 18%, transparent)',
    }}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-mono font-semibold tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-black data-[state=inactive]:text-[var(--cc-muted)]",
      className
    )}
    style={{
      '--tw-ring-color': 'transparent',
    }}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Inject active tab styling via a global rule patch
const TabsTriggerStyled = React.forwardRef(({ className, style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-mono font-semibold tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    style={style}
    data-cc-tab
    {...props} />
))
TabsTriggerStyled.displayName = "TabsTriggerStyled"

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 focus-visible:outline-none", className)}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }