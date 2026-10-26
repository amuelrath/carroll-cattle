import { cn } from '@renderer/lib/utils'
import { useMatchRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import React from 'react'
import { Button } from '../ui/button'

export function SideBar({ version }: { version: string }): React.JSX.Element {
  const router = useRouter()
  const matchRoute = useMatchRoute()

  const navItems = Object.values(router.routesById)
    .filter((route) => route.parentRoute?.id === router.routeTree.id)
    .filter((route) => route.options.staticData?.icon)
    .map((route) => ({
      path: route.fullPath,
      icon: route.options.staticData!.icon,
      order: route.options.staticData!.navOrder ?? Number.MAX_SAFE_INTEGER
    }))
    .sort((a, b) => a.order - b.order)

  const navigate = useNavigate()

  const handleClick = async (path: string) => {
    await navigate({ to: path })
  }

  return (
    <aside className="flex w-10 flex-col items-center bg-transparent">
      <div className="flex flex-1 flex-col items-center justify-start gap-1 pt-2">
        {navItems.map(({ path, icon: Icon }) => {
          const isActive = !!matchRoute({ to: path, fuzzy: true })

          return (
            <Button
              key={path}
              onClick={() => handleClick(path)}
              size="sm"
              variant="ghost"
              className="relative"
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-selected"
                  className="border-border absolute size-7 rounded-full border bg-white"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                />
              )}
              <Icon className={cn('relative z-10 transition', !isActive && 'opacity-50')} />
            </Button>
          )
        })}
      </div>
      <p className="text-muted-foreground mb-2 text-xs">{version}</p>
    </aside>
  )
}
