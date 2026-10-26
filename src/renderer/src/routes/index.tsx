import { HomePage } from '@renderer/pages/home'
import { createFileRoute } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/')({
  component: Page,
  staticData: {
    icon: HomeIcon,
    navLabel: 'Home',
    navOrder: 0
  }
})

function Page(): React.JSX.Element {
  return <HomePage />
}
