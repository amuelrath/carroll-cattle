import { Item, ItemContent } from '@renderer/components/ui/item'
import { iconSizes } from '@renderer/lib/tokens'
import { cn } from '@renderer/lib/utils'
import type { TValidateSheetErrorResponse, TValidateSheetResponse } from '@shared/schemas/trpc'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangleIcon } from 'lucide-react'
import React, { useCallback } from 'react'
import { getCellId, useCellActions, useIsCellActive } from '../../hooks/store'
import { useScrolljacker } from '../../hooks/use-scrolljacker'
import { ValidDialog } from '../valid-dialog'

const MotionItem = motion(Item)

export function Sidebar({
  validation,
  onContinue
}: {
  validation: TValidateSheetResponse | undefined
  onContinue: () => void
}) {
  const { errorItemRefs } = useScrolljacker({ for: 'sidebar' })
  const setErrorRef = useCallback(
    (cellId: string) => (el: HTMLDivElement | null) => {
      errorItemRefs.current[cellId] = el
    },
    [errorItemRefs]
  )

  const errors = validation?.status === 'invalid' ? validation.errors : []

  const groupedErrors = Object.groupBy(errors, (err) => err.rowIdx)

  return (
    <div className="scrollbar-track-muted scrollbar-thumb-muted-foreground flex-1 overflow-y-scroll">
      <div className="flex min-w-0 grow flex-col space-y-2 p-2">
        <AnimatePresence mode="popLayout">
          {errors.length > 0 ?
            Object.entries(groupedErrors).map(([group, errs]) => (
              <div key={group} className="flex min-w-0 flex-col gap-1 overflow-hidden">
                <span className="text-muted-foreground text-xs font-bold">
                  Row {Number(group) + 1}
                </span>
                <AnimatePresence initial={false} mode="popLayout">
                  {errs?.map((err, idx) => {
                    const cellId = getCellId({ rowIdx: err.rowIdx, columnName: err.columnName })
                    return (
                      <ErrorItem key={cellId} ref={setErrorRef(cellId)} renderIdx={idx} {...err} />
                    )
                  })}
                </AnimatePresence>
                <hr />
              </div>
            ))
          : <div className="flex grow flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleX: 0, scaleY: 0 }}
              >
                <ValidDialog onContinue={onContinue} />
              </motion.span>
            </div>
          }
        </AnimatePresence>
      </div>
    </div>
  )
}

type ErrorItemProps = TValidateSheetErrorResponse['errors'][number] & {
  ref?: React.Ref<HTMLDivElement>
  renderIdx: number
}

export const ErrorItem = React.memo(function ErrorItem({
  renderIdx,
  detail,
  rowIdx,
  columnName,
  ref
}: ErrorItemProps): React.JSX.Element {
  const isActive = useIsCellActive({ rowIdx, columnName })
  const [setActive] = useCellActions({ rowIdx, columnName })
  const { handleClick: handleScroll } = useScrolljacker({ for: 'sidebar' })

  const handleItemClick = () => {
    setActive()
    handleScroll() // jack the scroll
  }

  return (
    <MotionItem
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scaleX: 0, scaleY: 0 }}
      transition={{ delay: renderIdx / 20 }}
      ref={ref}
      onClick={handleItemClick}
      className={cn(
        'cursor-pointer text-xs',
        isActive ? 'bg-destructive/25 border-destructive-foreground' : 'hover:bg-destructive/15'
      )}
      size="xs"
    >
      <ItemContent className="flex flex-col space-y-1">
        <div className="flex flex-row items-center space-x-1 font-bold">
          <AlertTriangleIcon className="text-destructive-foreground" {...iconSizes.xsmall} />
          <span className="text-destructive-foreground/80">{columnName}</span>
        </div>
        <span>{detail}</span>
      </ItemContent>
    </MotionItem>
  )
})
