import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "end"
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  return <div className={cn("relative inline-block", className)}>{children}</div>
}

export function DropdownMenuTrigger({ 
  children, 
  className,
  asChild 
}: DropdownMenuTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(children.props.className, className)
    })
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ 
  children, 
  className,
  align = "end"
}: DropdownMenuContentProps) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" && "right-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ 
  children, 
  className,
  onClick,
  disabled 
}: DropdownMenuItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}

