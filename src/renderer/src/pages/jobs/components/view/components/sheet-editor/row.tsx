import { TableCell, TableRow } from '@renderer/components/ui/table'
import { toast } from '@renderer/components/ui/toast'
import { iconSizes } from '@renderer/lib/tokens'
import { cn } from '@renderer/lib/utils'
import type { OnCellUpdate } from '@renderer/pages/jobs/components/view/components/sheet-editor/index'
import { useSheetEditorStore } from '@renderer/pages/jobs/components/view/components/sheet-editor/sheet.store'
import { useThisJobStatus } from '@renderer/pages/jobs/components/view/hooks/use-this-job-status'
import { type TColumn, type TRowState, type TSheetRow, UNUSED } from '@shared/schemas/trpc'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AlertTriangle, Bandage, Check, Play, ThumbsDown } from 'lucide'
import { MorphIcon } from 'morphicons/react'
import { memo, useCallback, useMemo, useState } from 'react'

interface RowProps {
  columns: TColumn[]
  row: TSheetRow
  rowIdx: number
  onCellUpdate: OnCellUpdate
}

export const Row = memo(function ({ row, columns, onCellUpdate }: RowProps) {
  const { thisJobStatus } = useThisJobStatus()
  const isActive = useSheetEditorStore((s) => s.activeRow === row.rowIdx)
  const selectRow = useSheetEditorStore((s) => s.selectRow)

  const numUsedColumns = useMemo(
    () => columns.filter((col) => col.source !== UNUSED).length,
    [columns]
  )
  const locked = thisJobStatus !== 'inactive' || row.state === 'done'

  const onCellChange = useCallback(
    async (value: string | null, columnName: string) => {
      await onCellUpdate({ value, columnName, rowIdx: row.rowIdx })
    },
    [onCellUpdate, row.rowIdx]
  )

  console.log('row rendered')
  return (
    <>
      <TableRow onClick={() => selectRow(row.rowIdx)} className={cn('border-b transition-none')}>
        <TableCell
          className={cn(
            'bg-muted text-muted-foreground sticky left-0 z-10 w-8 justify-items-center text-center text-xs',
            isActive && 'text-okay-foreground bg-border && z-20'
          )}
        >
          <>
            {isActive && (
              <motion.div
                layoutId="cursor"
                transition={{ ease: 'circOut', duration: 0.1 }}
                className="bg-okay-foreground absolute inset-y-0 right-0 z-40 w-0.5"
              />
            )}
            {row.rowIdx + 1}
          </>
        </TableCell>
        <TableCell className="border-r-border relative w-10 justify-items-center border-r">
          <StatusIcon state={row.state} />
        </TableCell>
        {columns.map(({ source }, colIdx) => {
          if (source === UNUSED) return
          const edits = row.edits.find((edit) => edit.key === source)
          const issue = row.errors.find((error) => error.key === source)
          return (
            <Cell
              key={source}
              value={row.copyRow[source]}
              columnName={source}
              disabled={locked}
              onChange={onCellChange}
              state={(issue && 'issue') || (edits && 'edit') || 'normal'}
              className={cn(colIdx !== numUsedColumns + 1 && 'border-r')}
            />
          )
        })}
      </TableRow>
    </>
  )
})

Row.displayName = 'Row'

const statusIconConfig = {
  done: { icon: Check, className: '' },
  invalid: { icon: ThumbsDown, className: 'text-destructive-foreground' },
  issue: { icon: AlertTriangle, className: 'text-destructive-foreground' },
  issueFixed: { icon: Bandage, className: 'text-okay-foreground' },
  ready: { icon: Play, className: 'text-muted-foreground' }
} as const

function StatusIcon({ state }: { state: TRowState }): React.JSX.Element {
  const { icon, className } = statusIconConfig[state]
  return <MorphIcon icon={icon} {...iconSizes.large} className={className} />
}

interface CellProps {
  className?: string
  disabled?: boolean
  onChange?: (val: string | null, column: string) => void
  columnName: string
  value: string | null
  state?: 'edit' | 'issue' | 'normal'
}

const Cell = memo(function Cell({
  className,
  disabled,
  onChange,
  value,
  columnName,
  state = 'normal'
}: CellProps) {
  const navigate = useNavigate()
  const setContextOpen = useSheetEditorStore((s) => s.setContextOpen)

  const [editing, setEditing] = useState<boolean>(false)
  const [draft, setDraft] = useState<string>(value ?? '')
  const display = value ?? ''

  const cannotEditToast = () => {
    toast.add({
      type: 'warning',
      title: 'Cannot make changes!',
      description:
        'This row is locked either because it is complete or the job is currently running.'
    })
  }

  const start = () => {
    if (disabled) return cannotEditToast()
    setDraft(display)
    setEditing(true)
  }

  const commit = () => {
    if (disabled) return cannotEditToast()
    setEditing(false)
    if (draft !== display && onChange) {
      onChange(draft, columnName)
    }
  }

  const cancel = () => setEditing(false)

  const onStateClick = async () => {
    if (state === 'normal') return
    if (state === 'issue') {
      await navigate({
        from: '/jobs/view/',
        search: (prev) => ({ ...prev, contextTab: 'validation' })
      })
      setContextOpen(true)
      return
    }

    if (state === 'edit') {
      await navigate({
        from: '/jobs/view/',
        search: (prev) => ({ ...prev, contextTab: 'details' })
      })
      setContextOpen(true)
    }
  }

  console.log('cell rendered')
  return (
    <TableCell
      onClick={onStateClick}
      onDoubleClick={start}
      className={cn(
        'border-border relative shrink-0 transition',
        state === 'edit' && 'ring-2 ring-yellow-500 ring-inset hover:ring-3',
        state === 'issue' && 'ring-destructive-foreground ring-2 ring-inset hover:ring-3',
        className
      )}
    >
      <svg
        width={10}
        height={10}
        viewBox="0 0 10 10"
        className={cn(
          'pointer-events-none absolute top-0 left-0',
          state === 'normal' && 'invisible',
          state === 'edit' && 'fill-yellow-500',
          state === 'issue' && 'fill-destructive-foreground'
        )}
      >
        <polygon points="0,0 10,0 0,10" />
      </svg>
      <span className={editing ? 'invisible' : ''}>{draft}</span>
      {editing && (
        <input
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setDraft(e.target.value)}
          value={draft}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          className="absolute inset-0 bg-transparent px-2 text-sm outline-none"
        />
      )}
    </TableCell>
  )
})

Cell.displayName = 'Cell'
