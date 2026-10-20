import { Button } from '@renderer/components/ui/button'
import { DialogFooter } from '@renderer/components/ui/dialog'
import { cn } from '@renderer/lib/utils'

import { useReviewerNav } from '@renderer/pages/jobs/components/view/components/reviewer/use-reviewer-nav'
import type { TRowState, TSheetRowOut } from '@shared/schemas/trpc'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

function useChipViewport({ reviewIdx, rowCount }: { reviewIdx: number; rowCount: number }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const update = () => {
      const active = track.querySelector<HTMLElement>('[data-active="true"]')
      if (!active) return
      const chipCenter = active.offsetLeft + active.offsetWidth / 2
      setX(viewport.clientWidth / 2 - chipCenter)
    }

    update()
    const ro = new ResizeObserver(update) // re-center when the dialog resizes
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [reviewIdx, rowCount])

  return {
    x,
    viewportRef,
    trackRef
  }
}

function useFooterNav({
  attemptedRows,
  reviewIdx,
  setReviewIdx
}: {
  attemptedRows: Exclude<TSheetRowOut, { state: 'invalid' } | { state: 'ready' }>[]
  reviewIdx: number
  setReviewIdx: (idx: number) => void
}) {
  const attemptedRowCount = attemptedRows.length

  const next = useCallback(async () => {
    const nextIdx = reviewIdx + 1
    if (nextIdx >= attemptedRowCount) return setReviewIdx(reviewIdx)
    return setReviewIdx(nextIdx)
  }, [attemptedRowCount, reviewIdx, setReviewIdx])

  const back = useCallback(async () => {
    const prevIdx = reviewIdx - 1
    if (prevIdx < 0) return setReviewIdx(reviewIdx)
    return setReviewIdx(prevIdx)
  }, [reviewIdx, setReviewIdx])

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      console.log(e.key)
      // don't hijack arrows while typing in an input/textarea/contenteditable
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        await next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        await back()
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [reviewIdx, attemptedRowCount, next, back])

  return { next, back }
}

export function ReviewerFooter({
  allRows,
  attemptedRows
}: {
  allRows: TSheetRowOut[]
  attemptedRows: Exclude<TSheetRowOut, { state: 'invalid' } | { state: 'ready' }>[]
}) {
  const { reviewIdx, setReviewIdx } = useReviewerNav()
  const { next, back } = useFooterNav({ attemptedRows, reviewIdx, setReviewIdx })
  const { trackRef, viewportRef, x } = useChipViewport({ reviewIdx, rowCount: allRows.length })

  const attemptedRowCount = attemptedRows.length
  // rowIdx -> position in attemptedRows (the space reviewIdx lives in)
  const attemptedIdxByRowIdx = useMemo(
    () => new Map(attemptedRows.map((row, i) => [row.rowIdx, i])),
    [attemptedRows]
  )

  return (
    <DialogFooter className="min-w-0">
      <div className="flex w-full min-w-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={back} disabled={reviewIdx - 1 < 0}>
          <ChevronLeftIcon />
        </Button>

        <div
          ref={viewportRef}
          className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        >
          <motion.div
            ref={trackRef}
            className="relative flex w-max gap-1 py-1.5"
            initial={false}
            animate={{ x }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {allRows.map((row) => {
              const attemptedIdx = attemptedIdxByRowIdx.get(row.rowIdx)
              const navigable = attemptedIdx !== undefined
              const active = navigable && attemptedIdx === reviewIdx

              return (
                <ReviewChip
                  key={row.rowIdx}
                  state={row.state}
                  active={active}
                  disabled={!navigable}
                  onClick={navigable ? () => setReviewIdx(attemptedIdx) : undefined}
                />
              )
            })}
          </motion.div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={next}
          disabled={reviewIdx + 1 >= attemptedRowCount}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </DialogFooter>
  )
}

function ReviewChip({
  active,
  state,
  disabled,
  onClick
}: {
  active: boolean
  state: TRowState
  disabled: boolean
  onClick?: () => Promise<void>
}) {
  return (
    <span
      role="button"
      data-active={active}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'aspect-square size-4 rounded border-2 transition-all',
        active ? 'mx-1 scale-150' : 'scale-100',
        chipBgStyles[state],
        active && chipActiveStyles[state]
      )}
    />
  )
}

const chipBgStyles = {
  ready: 'bg-card',
  invalid: 'bg-card',
  issue: 'bg-destructive border-transparent',
  issueFixed: 'bg-destructive border-transparent',
  done: 'bg-okay-foreground/30 border-transparent'
} satisfies Record<TRowState, string>

const chipActiveStyles = {
  ready: 'border-primary',
  invalid: 'border-primary',
  issue: 'border-destructive-foreground',
  issueFixed: 'border-destructive-foreground',
  done: 'border-okay-foreground'
} satisfies Record<TRowState, string>
