import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigate } from '../../lib/nav-ref'
import { Toaster } from '../ui/toast'
import { SideBar } from './sidebar'
import { TitleBar } from './titlebar'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps): React.JSX.Element {
  const navigate = useNavigate()
  useEffect(() => setNavigate(navigate), [navigate])
  return (
    <>
      <div className="bg-secondary flex h-screen w-screen flex-col">
        <TitleBar />
        <div className="flex min-h-0 flex-grow flex-row">
          <SideBar />
          <main className="border-border min-h-0 flex-1 rounded-tl-md border bg-white">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </>
  )
}
