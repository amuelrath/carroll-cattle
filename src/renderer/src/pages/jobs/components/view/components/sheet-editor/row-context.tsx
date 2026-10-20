import ThumbsUp from '@renderer/assets/thumbs-up.png'
import { PageSidebar } from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { useSheetEditorStore } from '@renderer/pages/jobs/components/view/components/sheet-editor/sheet.store'
import type { TCellError, TSheet, TSheetRowOut } from '@shared/schemas/trpc'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BandageIcon,
  CheckIcon,
  ScanSearchIcon
} from 'lucide-react'
import { MorphIcon } from 'morphicons/react'

function RowEdits({ row }: { row: TSheetRowOut | undefined }) {
  const edits = row?.edits ?? []
  if (edits.length === 0) return null

  return (
    <section>
      <p className="text-muted-foreground mb-2 text-sm font-medium">Edits</p>
      <div className="flex flex-col gap-3 border-l-2 border-yellow-600/40 pl-3">
        <AnimatePresence initial={false} mode="popLayout">
          {edits.map(({ key, from, to }) => (
            <motion.div
              key={key}
              layout
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
            >
              <div className="text-xs font-medium text-yellow-600">{key}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                <ValueChip value={from} variant="from" />
                <ArrowRightIcon className="text-muted-foreground size-3 shrink-0" />
                <ValueChip value={to} variant="to" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

function ValueChip({ value, variant }: { value?: string | null; variant: 'from' | 'to' }) {
  if (!value) {
    return (
      <span className="text-muted-foreground rounded-md border border-dashed px-1.5 py-px italic">
        empty
      </span>
    )
  }
  return (
    <span
      className={
        variant === 'from' ?
          'bg-card text-muted-foreground rounded-md border px-1.5 py-px break-all'
        : 'rounded-md bg-yellow-500/15 px-1.5 py-px break-all text-yellow-700 dark:text-yellow-500'
      }
    >
      {value}
    </span>
  )
}

function RowErrors({ errors }: { errors: TCellError[] | undefined }) {
  const hasErrors = errors && errors.length > 0

  return (
    <section>
      <p className="text-muted-foreground mb-2 text-sm font-medium">Errors</p>
      <AnimatePresence initial={false} mode="popLayout">
        {hasErrors ?
          <div className="border-destructive-foreground/40 flex flex-col gap-3 border-l-2 pl-3">
            <AnimatePresence initial={false} mode="popLayout">
              {errors.map(({ key, hint }) => (
                <motion.div
                  key={key}
                  layout="position"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                >
                  <div className="text-destructive-foreground text-xs font-medium">{key}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">{hint}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        : <motion.div
            key="okay"
            initial={{ opacity: 0, rotate: 5 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center"
          >
            <img src={ThumbsUp} alt="thumbs-up" className="mb-4 size-24" />
            <p className="font-medium">No Validation Errors</p>
            <p className="text-muted-foreground text-center text-xs font-medium">
              Issues with row values will appear here.
            </p>
          </motion.div>
        }
      </AnimatePresence>
    </section>
  )
}

function HasIssueCopy() {
  return (
    <div>
      <p className="text-destructive-foreground">Something went wrong during this task.</p>
      <p className="text-muted-foreground text-xs">
        Please review and fix any issues before rerunning.
      </p>
    </div>
  )
}

function CompleteCopy() {
  return (
    <div>
      <p>Task completed.</p>
      <p className="text-muted-foreground text-xs">You can now review the finished work.</p>
    </div>
  )
}

function IssueFixedCopy() {
  return (
    <div>
      <p className="text-okay-foreground">Changes Detected</p>
      <p className="text-muted-foreground text-xs">
        It looks like you tried to fix an issue with this row. You can now rerun.
      </p>
    </div>
  )
}

function ReviewRow({ row }: { row: TSheetRowOut | undefined }) {
  const navigate = useNavigate()

  if (!row) return <></>
  if (!(row.state === 'done' || row.state === 'issue' || row.state === 'issueFixed')) return <></>

  const hasIssue = row?.state === 'issue'
  const isComplete = row?.state === 'done'
  const hasIssueFixed = row?.state === 'issueFixed'

  const handleClick = async () => {
    await navigate({
      from: '/jobs/view/',
      search: (p) => ({ ...p, reviewOpen: true, reviewIdx: row.rowIdx }),
      replace: true
    })
  }

  return (
    <section className="mb-2 flex flex-col gap-2">
      <span className="h-14 text-center font-medium">
        {hasIssue && <HasIssueCopy />}
        {isComplete && <CompleteCopy />}
        {hasIssueFixed && <IssueFixedCopy />}
      </span>
      <Button onClick={handleClick}>
        <ScanSearchIcon />
        Open in Reviewer
      </Button>
    </section>
  )
}

export function RowContext({ sheet }: { sheet: TSheet }) {
  const navigate = useNavigate()
  const contextTab = useSearch({ select: (p) => p.contextTab, from: '/jobs/view/' })

  const activeRow = useSheetEditorStore((s) => s.activeRow)
  const contextOpen = useSheetEditorStore((s) => s.contextOpen)
  const setContextOpen = useSheetEditorStore((s) => s.setContextOpen)
  if (!sheet.mapped) return null
  const row = sheet.rows.find((r) => r.rowIdx === activeRow)

  const onTabClick = async (contextTab: 'issues' | 'validation' | 'details') => {
    await navigate({
      from: '/jobs/view/',
      search: (prev) => ({ ...prev, contextTab }),
      replace: true
    })
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: contextOpen ? '19.5rem' : '2.5rem' }}
      transition={{ ease: 'circInOut' }}
      className="h-full"
    >
      <PageSidebar
        side="right"
        className="bg-muted z-30 max-w-78 min-w-78 shrink-0 overflow-hidden p-0"
      >
        <Tabs className="flex h-full min-h-0 grow gap-0" value={contextTab}>
          <TabsList variant="file" className="overflow-hidden">
            <div
              role="button"
              onClick={() => setContextOpen(!contextOpen)}
              className="bg-card hover:text-primary hover:bg-muted flex h-10 w-10 items-center justify-center border-r border-b shadow-sm"
            >
              <MorphIcon icon={contextOpen ? ChevronRight : ChevronLeft} className="size-4" />
            </div>
            <TabsTrigger value="details" onClick={() => onTabClick('details')}>
              <span>Details</span>
              {row?.state === 'issue' && (
                <AlertTriangleIcon className="text-destructive-foreground" {...iconSizes.medium} />
              )}
              {row?.state === 'done' && (
                <CheckIcon className="text-okay-foreground stroke-3" {...iconSizes.medium} />
              )}
              {row?.state === 'issueFixed' && (
                <BandageIcon className="text-okay-foreground" {...iconSizes.medium} />
              )}
            </TabsTrigger>
            <TabsTrigger value="validation" onClick={() => onTabClick('validation')}>
              <span>Validation</span>
              {row?.state === 'invalid' && (
                <AlertTriangleIcon className="text-destructive-foreground" {...iconSizes.medium} />
              )}
            </TabsTrigger>
          </TabsList>
          <motion.div
            initial={false}
            animate={{ opacity: contextOpen ? 1 : 0 }}
            className="bg-muted flex grow flex-col space-y-4"
          >
            <div className="space-y-2 p-2">
              <div className="flex w-full flex-row items-center justify-between">
                <span className="text-muted-foreground text-sm font-bold">
                  Row {(row?.rowIdx || 0) + 1}
                </span>
              </div>
              <TabsContent value="validation">
                <RowErrors errors={row?.errors} />
              </TabsContent>
              <TabsContent value="details">
                <div className="flex flex-col gap-4">
                  <ReviewRow row={row} />
                  <RowEdits row={row} />
                </div>
              </TabsContent>
            </div>
          </motion.div>
        </Tabs>
      </PageSidebar>
    </motion.div>
  )
}
