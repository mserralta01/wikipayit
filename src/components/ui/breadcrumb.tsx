import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex items-center text-sm", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-2", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

interface BreadcrumbLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const BreadcrumbLink = ({ to, children, className }: BreadcrumbLinkProps) => (
  <div className="flex items-center gap-2">
    <Link
      to={to}
      className={cn(
        "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      {children}
    </Link>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </div>
)

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink }