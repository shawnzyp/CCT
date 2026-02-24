
import * as React from "react"
import { cn } from "@/lib/utils"

// CC-themed card using CSS vars
const Card = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border overflow-hidden relative", className)}
    style={{
      background: 'var(--cc-panel0, #1A1F26)',
      borderColor: 'color-mix(in srgb, var(--cc-accent-a, #00E5FF) 20%, transparent)',
      color: 'var(--cc-text0, #E6F1FF)',
      ...style,
    }}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    style={style}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-mono font-bold text-sm tracking-wide leading-none", className)}
    style={{ color: 'var(--cc-text0, #E6F1FF)', ...style }}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-mono", className)}
    style={{ color: 'var(--cc-muted, #5F6E80)', ...style }}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    style={style}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
