import React from 'react'
import { Button } from '../ui/button'
import { HistoryIcon, HomeIcon, SettingsIcon, BotIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@renderer/lib/utils'
import { ROUTES } from '@shared/routes'

const navItems = [
  { path: ROUTES.home, icon: HomeIcon },
  { path: ROUTES.process.home, icon: BotIcon },
  { path: ROUTES.history, icon: HistoryIcon },
  { path: ROUTES.settings, icon: SettingsIcon }
]

function SideBar(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="flex w-10 flex-col items-center bg-transparent">
      <div className="flex flex-1 flex-col items-center justify-start gap-1 pt-2">
        {navItems.map(({ path, icon: Icon }) => {
          const isActive = location.pathname === path

          return (
            <Button
              key={path}
              onClick={() => navigate(path)}
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
    </aside>
  )
}

export { SideBar }
