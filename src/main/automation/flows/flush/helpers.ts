import { exitModal } from '@main/automation/flows/exit-modal'
import { openEmbryoTab } from '@main/automation/flows/profile'
import {
  type EmbryoTab,
  type FlushModal,
  type ScopeConsumer,
  type ScopeProvider,
  site
} from '@main/automation/site'
import type { MatchResult } from '@main/automation/types'
import { act, sel } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'
import type { TFlushRow } from '@shared/schemas/jobs/flush.schemas'
import { type TFlushTableRow } from '@shared/schemas/jobs/site.schemas'
import { isDeepStrictEqual } from 'node:util'

export const toFlushTableRow = (row: TFlushRow): TFlushTableRow => {
  return {
    'Flush Date': row.date,
    Sire: row.sireTag,
    Degenerate: row.degenerate,
    Frozen: row.frozen,
    Recovered: row.recovered,
    Transferred: row.transferred,
    Unfertilized: row.unfertilized,
    Usable: row.usable,
    'Flush Type': row.type
  }
}

export const isSameFlush = (row: TFlushRow, tableRow: TFlushTableRow) => {
  const rowToTable = toFlushTableRow(row)
  return isDeepStrictEqual(rowToTable, tableRow)
}

/* Clicks the link at that is the nth child  */
export const openExistingFlush = function* (scope, rowIdx: number) {
  const { flushModal } = scope
  yield* act.click(sel.css(`#flushes_table > tbody > tr:nth-child(${rowIdx + 1}) a`))
  return flushModal
} satisfies ScopeProvider<EmbryoTab, FlushModal>

export const checkIfExistingMatches = function* (scope, row: TFileRow<'flush'>) {
  const { modalContent, cancel, ...modalFields } = scope

  const fieldsToCheck = (Object.keys(modalFields) as (keyof typeof modalFields)[]).filter(
    (key) => row[key] !== undefined
  )

  // wait for modal to load in
  yield* act.waitForVisible(cancel)

  for (const field of fieldsToCheck) {
    const fieldPresent = yield* act.getIsVisible(modalFields[field])
    if (!fieldPresent) return yield* exitModal(false, modalContent, cancel)

    const expected = String(row[field]).trim()
    const found = String(yield* act.getText(modalFields[field])).trim()

    if (found !== expected) return yield* exitModal(false, modalContent, cancel)
  }

  return yield* exitModal(true, modalContent, cancel)
} satisfies ScopeConsumer<FlushModal, MatchResult>

export const fillFlush = function* (scope, row: TFileRow<'flush'>) {
  const { flushForm: form } = scope

  yield* act.click(form.$enter)
  yield* act.fill(form.date, row.date)
  yield* act.select(form.type, row.type)

  // select2 input
  const optionSelector = [sel.css('b'), sel.text(row.sireTag)]
  yield* act.click(form.bull.$enter)
  yield* act.fill(form.bull.searchbar, row.sireTag)

  try {
    yield* act.waitForVisible(optionSelector) // has to load in from db
    yield* act.click(optionSelector)
  } catch {
    throw new RowIssue('NOT_FOUND', `Could not find a sire with tag "${row.sireTag}"`)
  }

  // rest are optional fields
  const optionalFields = [
    'comments',
    'recovered',
    'degenerate',
    'unfertilized',
    'discarded',
    'usable',
    'transferred',
    'frozen'
  ] as const

  for (const field of optionalFields) {
    const present = row[field] !== undefined
    if (!present) continue
    yield* act.fill(form[field], String(row[field]))
  }

  yield* act.click(form.submit)

  if (row.frozen !== 0 || row.transferred !== 0) {
    // we need to exit out of the embryo creation. redirects us to profile
    yield* act.click(sel.text(`Return to ${row.donorTag}`))
  }
  yield* openEmbryoTab(site.authed.profile)
} satisfies ScopeConsumer<EmbryoTab>
