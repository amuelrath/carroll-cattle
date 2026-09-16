import '@renderer/assets/globals.css'
import { trpc, trpcClient } from '@renderer/lib/trpc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { TRPCClientError } from '@trpc/client'
import log from 'electron-log/renderer'
import { LucideIcon } from 'lucide-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { routeTree } from './routeTree.gen'

// set up logging
log.errorHandler.startCatching({
  showDialog: false,
  onError: ({ error }) => {
    return !(error instanceof TRPCClientError)
  }
})

// set up react query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
})

// Set up a Router instance
const hashHistory = createHashHistory()
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  history: hashHistory
})

// Register things for type-safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    icon?: LucideIcon
    navOrder?: number
    navLabel: string
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
)
