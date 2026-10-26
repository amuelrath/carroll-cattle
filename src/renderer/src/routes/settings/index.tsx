import { trpc } from '@renderer/lib/trpc'
import { SettingsPage } from '@renderer/pages/settings'
import { createFileRoute } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import React from 'react'

export const Route = createFileRoute('/settings/')({
  component: Page,
  staticData: {
    icon: SettingsIcon,
    navLabel: 'Process',
    navOrder: 3
  }
})

function Page(): React.JSX.Element {
  const { data, isLoading } = trpc.credentials.getCredentials.useQuery()
  return <>{!isLoading && <SettingsPage password={data?.password} username={data?.username} />}</>
}
