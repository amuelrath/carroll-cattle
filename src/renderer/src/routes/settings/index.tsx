import { createFileRoute } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
  staticData: {
    icon: SettingsIcon,
    navLabel: 'Process',
    navOrder: 3
  }
})

function SettingsPage(): React.JSX.Element {
  return (
    <div className="p-2">
      <h3>Settings</h3>
    </div>
  )
}
