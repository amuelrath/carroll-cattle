import { Page, PageContent, PageSidebar } from '@renderer/components/common/page'
import { CustomTabsTrigger, Tabs, TabsContent, TabsList } from '@renderer/components/ui/tabs'
import { trpc } from '@renderer/lib/trpc'
import { ViewPageTitleBar } from '@renderer/pages/jobs/components/view/components/ribbon'
import {
  SheetEditor,
  SheetTabTrigger
} from '@renderer/pages/jobs/components/view/components/sheet-editor'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { BotIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Viewer } from './components/viewer'

export function ViewPage(): React.JSX.Element {
  const { jobId, mainTab } = useSearch({ from: '/jobs/view/' })
  const [tab, setTab] = useState<string>(mainTab)
  const navigate = useNavigate()

  const utils = trpc.useUtils()
  const { data: sheet } = trpc.sheet.getSheet.useQuery({ jobId })
  const { data: shouldRefetch } = trpc.automation.onCommitOrIssue.useSubscription()

  const changeTab = async (mainTab: 'automation' | 'sheet') => {
    await navigate({
      from: '/jobs/view/',
      search: (p) => ({ ...p, mainTab })
    })
    setTab(mainTab)
  }

  useEffect(() => {
    if (shouldRefetch) {
      utils.job.readJobWithTasks.refetch({ jobId: shouldRefetch.jobId }).then(() => undefined)
      utils.sheet.getSheet.refetch({ jobId: shouldRefetch.jobId }).then(() => undefined)
    }
  }, [shouldRefetch, utils.job.readJobWithTasks, utils.sheet.getSheet])

  return (
    <Page direction="vertical">
      <ViewPageTitleBar sheet={sheet} />
      <Tabs
        value={tab}
        onValueChange={changeTab}
        orientation="vertical"
        className="min-h-0 min-w-0 flex-1 gap-0"
      >
        <PageSidebar className="bg-card z-20 h-full">
          <TabsList className="w-full" variant="ghost">
            <CustomTabsTrigger value="automation" Icon={BotIcon} label="Automation" />
            {sheet && <SheetTabTrigger sheet={sheet} />}
          </TabsList>
        </PageSidebar>
        <PageContent className="grow">
          <TabsContent value="automation" className="flex flex-1">
            <Viewer />
          </TabsContent>
          <TabsContent value="sheet" className="flex min-h-0 min-w-0 flex-1">
            {sheet && <SheetEditor sheet={sheet} />}
          </TabsContent>
        </PageContent>
      </Tabs>
    </Page>
  )
}
