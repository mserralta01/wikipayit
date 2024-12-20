import { BadgeProps } from '@/components/ui/badge'

declare module '@/components/ui/badge' {
  interface BadgeProps {
    // Available variants for badge styling - controls the visual appearance of the badge
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
  }
} 