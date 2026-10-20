import { cn } from '@renderer/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

const alertBannerVariants = cva(
  'flex flex-row items-center p-2.5 gap-4 rounded w-full border-l-4',
  {
    variants: {
      variant: {
        default: 'bg-card border-l-primary text-primary',
        secondary: 'bg-muted border-l-muted-foreground text-muted-foreground',
        warn: 'bg-warn/40 border-l-warn-foreground text-yellow-600',
        destructive:
          'bg-destructive/20 border-l-destructive-foreground text-destructive-foreground',
        okay: 'bg-okay/30 border-l-okay-foreground text-okay-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  Icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function AlertBanner({ Icon, title, description, className, variant }: AlertBannerProps) {
  return (
    <div role="banner" className={cn(alertBannerVariants({ variant }), className)}>
      <div className="flex flex-col">
        <div className="flex flex-row items-center space-x-2">
          <Icon className="size-4" />
          <p className="text-base">{title}</p>
        </div>
        <p className="text-muted-foreground pl-6 text-sm font-normal">{description}</p>
      </div>
    </div>
  )
}
