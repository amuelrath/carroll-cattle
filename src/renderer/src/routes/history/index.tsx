import { HistoryPage } from '@renderer/pages/history'
import { createFileRoute } from '@tanstack/react-router'
import { HistoryIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/history/')({
  component: Page,
  staticData: {
    icon: HistoryIcon,
    navLabel: 'Process',
    navOrder: 2
  }
})

function Page(): React.JSX.Element {
  return <HistoryPage />
}
