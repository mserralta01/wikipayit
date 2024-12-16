import { BadgeProps } from '@/components/ui/badge'

declare module '@/components/ui/badge' {
  interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
  }
} 