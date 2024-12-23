import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
  children?: React.ReactNode
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  to: string
  children?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null
          
          return (
            <React.Fragment key={index}>
              {child}
              {index < React.Children.count(children) - 1 && separator}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      {children}
    </li>
  )
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, to, children, ...props }, ref) => (
    <Link
      to={to}
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink } 