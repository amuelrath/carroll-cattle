import { createFileRoute } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
  staticData: {
    icon: HomeIcon,
    navLabel: 'Home',
    navOrder: 0
  }
})

function HomePage(): React.JSX.Element {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
