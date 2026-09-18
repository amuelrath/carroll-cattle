import { Button } from '@renderer/components/ui/button'
import { toast } from '@renderer/components/ui/toast'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { useCreateJobMutation } from '@renderer/pages/jobs/hooks/use-create-job-mutation'
import { useSearch } from '@tanstack/react-router'
import { ExternalLinkIcon, RefreshCcwIcon } from 'lucide-react'
import React, { useCallback, useEffect, useRef } from 'react'
import { sheetCopy as copy } from './_copy'
import { ExplanationDialog } from './components/explanation-dialog'
import { SheetTable } from './components/sheet'
import { Sidebar } from './components/sidebar'

export function ValidatePage(): React.JSX.Element {
  const isFirstRender = useRef(true)
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

  const showTable = sheet && validationRes

  return (
    <div className="flex h-full flex-row outline">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 flex-row items-center justify-between border-r p-2">
          <p className="text-base font-semibold">{sheetName}</p>
          <div className="flex justify-center space-x-1.5">
            <ExplanationDialog onContinue={handleContinue} validation={validationRes} />
            <Button variant="secondary" size="sm" onClick={handleRefreshClick}>
              <RefreshCcwIcon {...iconSizes.small} />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenClick}>
              <ExternalLinkIcon {...iconSizes.small} />
            </Button>
          </div>
        </div>
        {showTable && <SheetTable sheet={sheet} validation={validationRes} />}
      </div>
      <Sidebar onContinue={handleContinue} validation={validationRes} />
    </div>
  )
}
