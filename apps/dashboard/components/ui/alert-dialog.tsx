import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(undefined)

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-50">
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>
  )
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error('AlertDialogContent must be used within AlertDialog')

  return (
    <div
      className={cn(
        "bg-background rounded-lg shadow-lg p-6 w-full max-w-md",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  )
}

interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  return (
    <div className={cn("flex justify-end gap-2 mt-4", className)}>
      {children}
    </div>
  )
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error('AlertDialogAction must be used within AlertDialog')

  return (
    <button
      onClick={() => {
        onClick?.()
        context.onOpenChange(false)
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  )
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  className?: string
}

export function AlertDialogCancel({ children, className }: AlertDialogCancelProps) {
  const context = React.useContext(AlertDialogContext)
  if (!context) throw new Error('AlertDialogCancel must be used within AlertDialog')

  return (
    <button
      onClick={() => context.onOpenChange(false)}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  )
}

