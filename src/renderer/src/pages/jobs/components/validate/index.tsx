import {
  Page,
  PageContent,
  PageSidebar,
  PageTitlebar,
  PageTitlebarButtonGroup
} from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { toast } from '@renderer/components/ui/toast'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { useSearch } from '@tanstack/react-router'
import { ExternalLinkIcon, RefreshCcwIcon } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCreateJobMutation } from '../../hooks/use-create-job-mutation'
import { sheetCopy as copy } from './_copy'
import { ExplanationDialog } from './components/explanation-dialog'
import { SheetTable } from './components/sheet'
import { Sidebar } from './components/sidebar'

export function ValidatePage(): React.JSX.Element {
  const isFirstRender = useRef(true)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isScrollAtTop, setIsScrollAtTop] = useState(true)
  const { filePath, sheetName, columnMap, processId } = useSearch({ from: '/jobs/validate/' })
  const { mutateCreateJob } = useCreateJobMutation()
  const { mutateAsync: mutateOpenPath } = trpc.system.openPath.useMutation()
  const { refetch: refetchSheet, data: sheet } = trpc.sheet.fetchSheet.useQuery({
    sheetName,
    filePath
  })

  const { refetch: refetchValidation, data: validationRes } = trpc.sheet.validateSheet.useQuery({
    processId,
    sheetName,
    filePath,
    columnMap
  })

  const refresh = useCallback(async () => {
    //  error routed through responseLink, no need to break the ui
    await refetchSheet()
    await refetchValidation()
  }, [refetchSheet, refetchValidation])

  const handleRefreshClick = useCallback(async () => {
    await refresh()
    toast.add({ type: 'success', title: copy.refreshed })
  }, [refresh])

  const handleOpenClick = async () => {
    // error routed through responseLink, no need to break the ui
    await mutateOpenPath({ filePath })
  }

  const handleContinue = async () => {
    await mutateCreateJob({
      processId,
      sheetName,
      filePath,
      columnMap
    })
  }

  useEffect(() => {
    // trigger fetch on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      refresh().then(() => null)
      return // exit early
    }

    // refetch on refocus
    const handleFocus = async () => {
      if (!isFirstRender.current) {
        await refresh().then(() => null)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [filePath, sheetName, refresh, refetchSheet])

  // for handling scroll style on sticky table header
  const handleScroll = useCallback(() => {
    const atTop = (scrollRef.current?.scrollTop ?? 0) === 0
    setIsScrollAtTop((prev) => (prev === atTop ? prev : atTop))
  }, [])

  const showTable = sheet && validationRes

  return (
    <Page>
      <PageContent>
        <PageTitlebar className="border-r">
          <p className="">{sheetName}</p>
          <PageTitlebarButtonGroup>
            <ExplanationDialog onContinue={handleContinue} validation={validationRes} />
            <Button variant="secondary" size="sm" onClick={handleRefreshClick}>
              <RefreshCcwIcon {...iconSizes.small} />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenClick}>
              <ExternalLinkIcon {...iconSizes.small} />
            </Button>
          </PageTitlebarButtonGroup>
        </PageTitlebar>
        <PageContent
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar relative flex min-h-0 flex-1 overflow-y-scroll"
        >
          {showTable && (
            <SheetTable sheet={sheet} validation={validationRes} isScrollAtTop={isScrollAtTop} />
          )}
        </PageContent>
      </PageContent>
      <PageSidebar className="bg-muted">
        <Sidebar onContinue={handleContinue} validation={validationRes} />
      </PageSidebar>
    </Page>
  )
}
