import logger from '@renderer/lib/logger'
import { ErrorComponentProps, useRouterState } from '@tanstack/react-router'
import React, { useEffect } from 'react'
import { ErrorScreen } from '../screens/error'

export function RootErrorBoundary({ error, reset }: ErrorComponentProps): React.JSX.Element {
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    const route = location.pathname
    const search = location.searchStr

    if (error instanceof Error) {
      logger.error({
        process: '[render]',
        route,
        search,
        cause: error.cause,
        message: error.message,
        stack: error.stack
      })
    } else {
      logger.error({
        process: '[render]',
        route,
        search,
        cause: 'UNKNOWN_ERROR',
        message: 'UNKNOWN_ERROR',
        stack: 'UNKNOWN_ERROR'
      })
    }
  }, [error, location])

  return <ErrorScreen error={error} reset={reset} />
}
