import React, { useEffect } from 'react'
import { TitleBar } from './titlebar'
import { SideBar } from './sidebar'
import { Toaster } from '../ui/toast'
import { useNavigate } from 'react-router-dom'
import { setNavigate } from '../../lib/nav-ref'

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
        <div className="flex flex-grow flex-row">
          <SideBar />
          <main className="border-border flex-1 rounded-tl-md border bg-white"> {children} </main>
        </div>
      </div>
      <Toaster />
    </>
  )
}
