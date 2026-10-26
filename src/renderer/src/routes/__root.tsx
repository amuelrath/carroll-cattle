import { createRootRoute, Outlet } from '@tanstack/react-router'
import React from 'react'
import { RootErrorBoundary } from '../components/common/root-error-boundary'
import { Shell } from '../components/layout'

const RootLayout = (): React.JSX.Element => (
  <>
    <Shell>
      <Outlet />
    </Shell>
    {/*<ReactQueryDevtools />*/}
    {/*<TanStackRouterDevtools />*/}
  </>
)

export const Route = createRootRoute({
  component: RootLayout,
  staticData: { navLabel: 'Home' },
  errorComponent: RootErrorBoundary
})
