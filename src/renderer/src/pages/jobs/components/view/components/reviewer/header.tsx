import { AlertBanner } from '@renderer/components/common/alert-banner'
import { Button } from '@renderer/components/ui/button'
import { DialogHeader, DialogTitle } from '@renderer/components/ui/dialog'
import { trpc } from '@renderer/lib/trpc'
import type { TSheetRowOut } from '@shared/schemas/trpc'
import { AlertTriangleIcon, BandageIcon, CheckCircleIcon, ExternalLinkIcon } from 'lucide-react'
import { reviewerCopy as copy } from './_copy'

export function ReviewerHeader({
  currRow
}: {
  currRow: Exclude<TSheetRowOut, { state: 'invalid' } | { state: 'ready' }> | undefined
}) {
  const { mutateAsync: openExternal } = trpc.system.openExternal.useMutation()

  if (!currRow) return <></>
  const isIssue = currRow.state === 'issue' || currRow.state === 'issueFixed'

  const handleClick = () => {
    if (isIssue) return openExternal({ url: currRow.issue.url })
    return openExternal({ url: currRow.proof.url })
  }

  return (
    <DialogHeader>
      <DialogTitle className="-mx-8 -mt-4 space-y-2 border-b px-4 pb-4">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="">Row {currRow.rowIdx + 1}</span>
          <Button size="sm" variant="outline" onClick={handleClick}>
            <ExternalLinkIcon />
            {copy.externalLink}
          </Button>
        </div>
        <ReviewHeaderBanner state={currRow.state} title={isIssue ? currRow.issue.hint : ''} />
      </DialogTitle>
    </DialogHeader>
  )
}

function ReviewHeaderBanner({
  state,
  title
}: {
  state: 'issue' | 'issueFixed' | 'done'
  title: string
}) {
  if (state === 'done') {
    return <AlertBanner Icon={CheckCircleIcon} title={copy.completedBannerTitle} variant="okay" />
  }

  if (state === 'issue') {
    return <AlertBanner Icon={AlertTriangleIcon} title={title} variant="destructive" />
  }

  if (state === 'issueFixed') {
    return <AlertBanner Icon={BandageIcon} title={title} variant="destructive" />
  }

  return <></>
}
