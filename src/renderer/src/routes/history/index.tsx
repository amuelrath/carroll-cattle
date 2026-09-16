import { createFileRoute } from '@tanstack/react-router'
import { HistoryIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/history/')({
  component: HistoryPage,
  staticData: {
    icon: HistoryIcon,
    navLabel: 'Process',
    navOrder: 2
  }
})

function HistoryPage(): React.JSX.Element {
  return (
    <div className="p-2">
      <h3>History</h3>
    </div>
  )
}
