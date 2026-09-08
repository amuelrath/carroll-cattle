import { ErrorScreen } from '@renderer/components/screens/error'
import { Tabs } from '@renderer/components/ui/tabs'
import { searchParamNames } from '@renderer/lib/tokens'
import { TProcess } from '@shared/schemas/process'
import React, { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useSearchParams } from 'react-router-dom'
import { ProcessContent } from './components/content'
import { ProcessSidebar } from './components/sidebar'

const DEFAULT_TAB_VALUE: TProcess = 'penguins'

export function ProcessPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const processId = searchParams.get(searchParamNames.processTab) as TProcess | null

  useEffect(() => {
    if (!searchParams.get(searchParamNames.processTab)) {
      setSearchParams({ processTab: DEFAULT_TAB_VALUE })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount only

  return (
    <Tabs
      value={processId ?? DEFAULT_TAB_VALUE}
      onValueChange={(v) => setSearchParams({ processTab: v })}
      className="h-full gap-0"
      orientation="vertical"
    >
      <ProcessSidebar />
      <ErrorBoundary fallback={<ErrorScreen />}>
        <ProcessContent processId={processId ?? DEFAULT_TAB_VALUE} />
      </ErrorBoundary>
    </Tabs>
  )
}
