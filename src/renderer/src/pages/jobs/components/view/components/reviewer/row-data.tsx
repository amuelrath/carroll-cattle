import { type TColumn, type TSheetRowOut, UNUSED } from '@shared/schemas/trpc'
import { AnimatePresence, motion } from 'framer-motion'

const spring = { type: 'spring', stiffness: 500, damping: 40 } as const

export function ReviewerRowData({
  currRow,
  columns
}: {
  currRow: Exclude<TSheetRowOut, { state: 'invalid' } | { state: 'ready' }> | undefined
  columns: TColumn[]
}) {
  if (!currRow) return null

  const usedColumns = columns.filter((col) => col.key !== UNUSED).map((col) => col.source)

  const displayRow = Object.entries(currRow.copyRow).filter(
    (entry): entry is [string, string] => usedColumns.includes(entry[0]) && !isEmpty(entry[1])
  )

  return (
    <motion.div
      layoutScroll
      role="list"
      className="scrollbar-custom relative flex w-full min-w-0 gap-1 overflow-x-auto pb-1 [contain:inline-size]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {displayRow.map(([label, value]) => (
          <motion.div
            key={label}
            layout="position"
            role="listitem"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={spring}
            className="bg-muted-foreground flex min-w-30 shrink-0 flex-col items-start rounded p-2 text-white"
          >
            <p>{label}</p>
            <ChipValue value={value} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

function ChipValue({ value }: { value: string }) {
  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={spring}
          className="line-clamp-1 font-bold"
        >
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function isEmpty(value: unknown) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}
