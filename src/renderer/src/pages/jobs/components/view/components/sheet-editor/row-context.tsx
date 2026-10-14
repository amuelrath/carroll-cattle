import { IconCircle } from '@renderer/components/common/icon-circle'
import { ImageWithExpand } from '@renderer/components/common/image-with-expand'
import { PageSidebar } from '@renderer/components/common/page'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@renderer/components/ui/item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { iconSizes } from '@renderer/lib/tokens'
import { useSheetEditorStore } from '@renderer/pages/jobs/components/view/components/sheet-editor/sheet.store'
import type { TCellError, TRowIssue, TSheet, TSheetRow } from '@shared/schemas/trpc'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide'
import { AlertTriangleIcon, ArrowRightIcon, ThumbsUpIcon } from 'lucide-react'
import { MorphIcon } from 'morphicons/react'

function RowDetails({ row }: { row: TSheetRow | undefined }) {
  const hasEdits = (row?.edits.length || 0) > 0

  return (
    <>
      {hasEdits && (
        <div>
          <p className="text-muted-foreground text-sm font-medium">Edits</p>
          {row?.edits.map(({ key, from, to }) => (
            <Item key={key}>
              <ItemContent>
                <ItemTitle className="flex flex-row items-center gap-1.5 text-sm text-yellow-600">
                  <span className="size-1.5 translate-y-1/3 rounded-full bg-yellow-600" />
                  <span>{key}</span>
                </ItemTitle>
                <ItemDescription>
                  <p className="flex flex-row items-center space-x-2">
                    <p>{from ? `"${from}"` : 'Empty'}</p>
                    <ArrowRightIcon {...iconSizes.medium} />
                    <p>{to ? `"${to}"` : 'Empty'}</p>
                  </p>
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      )}
    </>
  )
}

function RowErrors({ errors }: { errors: TCellError[] | undefined }) {
  const hasErrors = errors && errors.length > 0

  return (
    <section className="flex flex-col gap-2">
      {hasErrors ?
        errors.map(({ key, hint }) => (
          <Item key={key} variant="muted">
            <ItemContent>
              <ItemTitle className="text-destructive-foreground flex items-center gap-1.5 text-sm">
                <AlertTriangleIcon {...iconSizes.medium} />
                <span>{key}</span>
              </ItemTitle>
              <ItemDescription>{hint}</ItemDescription>
            </ItemContent>
          </Item>
        ))
      : <div className="flex flex-col items-center justify-center space-y-2">
          <IconCircle Icon={ThumbsUpIcon} size="small" />
          <p className="text-muted-foreground text-center text-xs font-medium">
            Everything looks good!
          </p>
        </div>
      }
    </section>
  )
}

function Screenshot({ src }: { src: string }) {
  return (
    <div className="flex flex-col gap-1">
      <ImageWithExpand imgString={src} className="max-w-full" />
      <p className="text-muted-foreground text-center text-xs">Click to expand</p>
    </div>
  )
}

function RowProof({ row }: { row: TSheetRow | undefined }) {
  if (!row) return <></>
  if (row.state !== 'done') return <></>

  return (
    <section className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm font-medium">Result</p>
      <Screenshot src={row.proof.screenshot} />
    </section>
  )
}

function RowIssue({ issue }: { issue: TRowIssue | undefined }) {
  return (
    <>
      {issue ?
        <section className="flex flex-col gap-2">
          <div className="bg-destructive/10 rounded-md p-4">
            <p className="text-destructive-foreground font-medium">{issue.hint}</p>
          </div>
          <div className="p-4">
            <Screenshot src={issue.screenshot} />
          </div>
        </section>
      : <div className="flex flex-col items-center justify-center space-y-2">
          <IconCircle Icon={ThumbsUpIcon} size="small" />
          <p className="text-muted-foreground text-center text-xs font-medium">No Issues!</p>
        </div>
      }
    </>
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
      search: (prev) => ({ ...prev, contextTab })
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
            </TabsTrigger>
            <TabsTrigger value="validation" onClick={() => onTabClick('validation')}>
              <span>Validation</span>
            </TabsTrigger>
            <TabsTrigger value="issues" onClick={() => onTabClick('issues')}>
              <span>Issues</span>
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
                <span className="text-muted-foreground text-sm font-bold capitalize">
                  {row?.state}
                </span>
              </div>
              <TabsContent value="validation">
                <RowErrors errors={row?.errors} />
              </TabsContent>
              <TabsContent value="issues">
                <RowIssue issue={row?.['issue']} />
              </TabsContent>
              <TabsContent value="details">
                <RowProof row={row} />
                <RowDetails row={row} />
              </TabsContent>
            </div>
          </motion.div>
        </Tabs>
      </PageSidebar>
    </motion.div>
  )
}
