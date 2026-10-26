import { trpc } from '@renderer/lib/trpc'
import React from 'react'
import { Toaster } from '../ui/toast'
import { TooltipProvider } from '../ui/tooltip'
import { SideBar } from './sidebar'
import { TitleBar } from './titlebar'

export function Shell({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { data: version } = trpc.info.getVersion.useQuery()
  return (
    <>
      <div className="bg-secondary flex h-screen w-screen flex-col">
        <TitleBar />
        <div className="flex min-h-0 flex-grow flex-row">
          <SideBar version={version ?? ''} />
          <main className="border-border no-scrollbar min-h-0 flex-1 overflow-hidden rounded-tl-md border bg-white">
            <TooltipProvider delay={200}>{children}</TooltipProvider>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  )
}
