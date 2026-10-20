import { ImageFromBase64 } from '@renderer/components/common/image-with-expand'
import { Button } from '@renderer/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@renderer/components/ui/dialog'
import { iconSizes } from '@renderer/lib/tokens'
import { ReviewerFooter } from '@renderer/pages/jobs/components/view/components/reviewer/footer'
import { ReviewerHeader } from '@renderer/pages/jobs/components/view/components/reviewer/header'
import { ReviewerRowData } from '@renderer/pages/jobs/components/view/components/reviewer/row-data'
import { useReviewerNav } from '@renderer/pages/jobs/components/view/components/reviewer/use-reviewer-nav'
import type { TMappedSheet, TSheet } from '@shared/schemas/trpc'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangleIcon, CheckIcon, ScanSearchIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { reviewerCopy as copy } from './_copy'

interface ReviewerProps {
  sheet: TSheet | undefined
}

export function ReviewerTrigger({ sheet }: ReviewerProps) {
  const { reviewOpen, setReviewOpen } = useReviewerNav()
  const disabled =
    !sheet ||
    !sheet.mapped ||
    !sheet?.rows.some(
      (row) => row.state === 'done' || row.state === 'issue' || row.state === 'issueFixed'
    )

  const issueCount =
    disabled ? 0 : (
      sheet.rows.filter((row) => row.state === 'issue').length +
      sheet.rows.filter((row) => row.state === 'issueFixed').length
    )
  const doneCount = disabled ? 0 : sheet.rows.filter((row) => row.state === 'done').length

  return (
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
      <DialogTrigger
        render={
          <Button
            className="flex min-w-44 flex-row items-center space-x-1 text-sm"
            size="lg"
            variant="outline"
          >
            <ScanSearchIcon {...iconSizes.medium} />
            <span>{copy.trigger}</span>
            <div className="flex flex-row items-end space-x-1 text-xs">
              <CheckIcon className="text-okay-foreground size-3" />
              <span>{doneCount}</span>
            </div>
            <div className="flex flex-row items-center space-x-1 text-xs">
              <AlertTriangleIcon className="text-destructive-foreground size-3" />
              <span>{issueCount}</span>
            </div>
          </Button>
        }
      />
      {sheet?.mapped && <ReviewerContent sheet={sheet} />}
    </Dialog>
  )
}

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: 500 * dir }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -500 * dir })
}

function useNavDirection(idx: number) {
  const prev = useRef(idx)
  // eslint-disable-next-line react-hooks/refs
  const dir = idx >= prev.current ? 1 : -1
  useEffect(() => {
    prev.current = idx
  }, [idx])
  return dir
}

function ReviewerContent({ sheet }: { sheet: TMappedSheet }) {
  const { reviewIdx } = useReviewerNav()
  const direction = useNavDirection(reviewIdx)

  const attemptedRows = sheet.rows
    .filter((row) => row.state !== 'ready')
    .filter((row) => row.state !== 'invalid')

  const currRow = attemptedRows.find((row) => row.rowIdx === reviewIdx)

  const hasIssue = currRow?.state === 'issue' || currRow?.state === 'issueFixed'
  const screenshot = hasIssue ? currRow.issue.screenshot : currRow && currRow.proof.screenshot

  return (
    <DialogContent className="flex min-h-[80vh] min-w-[70vw]">
      <ReviewerHeader currRow={currRow} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          {screenshot && (
            <motion.div
              key={reviewIdx}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="absolute inset-0"
            >
              <ImageFromBase64
                image={screenshot}
                alt={`Screenshot for row ${currRow?.rowIdx}`}
                className="size-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ReviewerRowData currRow={currRow} />
      <ReviewerFooter allRows={sheet.rows} attemptedRows={attemptedRows} />
    </DialogContent>
  )
}
