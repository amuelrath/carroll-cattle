import { exitModal } from '@main/automation/flows/exit-modal'
import { getEmbryoName } from '@main/automation/flows/helpers'
import type {
  BreedingModal,
  BreedingTab,
  ScopeConsumer,
  ScopeProvider
} from '@main/automation/site'
import type { MatchResult } from '@main/automation/types'
import { act, sel } from '@shared/automation'
import { RowIssue } from '@shared/automation/errors'
import type { TFileRow } from '@shared/schemas/jobs'
import type { TBreedingRow } from '@shared/schemas/jobs/breeding.schemas'
import { type TBreedTableRowRaw } from '@shared/schemas/jobs/site.schemas'

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const normalize = (s: string | undefined | null) =>
  (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

export const isSameBreed = (row: TBreedingRow, tableRow: TBreedTableRowRaw) => {
  const methodsShowingDonor = ['ET']
  const showsDonor = methodsShowingDonor.some((m) => normalize(row.method).toUpperCase() === m)

  const checks = {
    date: row.date === tableRow['Breeding Date'],
    method: tableRow.Method.toLowerCase().startsWith(row.method.toLowerCase()),
    technician: tableRow.Method.toLowerCase().endsWith(row.technician.toLowerCase()),
    bull: tableRow.Mating.toLowerCase().startsWith(row.bullTag.toLowerCase()),
    donor: showsDonor ? tableRow.Mating.toLowerCase().endsWith(row.donorTag.toLowerCase()) : true
  }

  return Object.values(checks).every(Boolean)
}

export const openExistingBreed = function* (scope, rowIdx: number) {
  const { breedingModal } = scope
  yield* act.click(
    sel.css(`#breedings_container table tbody tr:first-child td:nth-child(${rowIdx + 1}) a`)
  )
  return breedingModal
} satisfies ScopeProvider<BreedingTab, BreedingModal>

const SKIP: Record<string, string[]> = {
  AI: ['embryo', 'clSide', 'donorTag'],
  ET: ['bullTag']
}

export const checkIfExistingMatches = function* (scope, row: TFileRow<'breeding'>) {
  const { modalContent, cancel, ...modalFields } = scope
  const keys = (Object.keys(modalFields) as (keyof typeof modalFields)[]).filter(
    (key) => row[key] !== undefined && !SKIP[row.method].includes(key)
  )

  yield* act.waitForVisible(cancel)

  for (const field of keys) {
    const visible = yield* act.getIsVisible(modalFields[field])
    const found = visible ? normalize(String(yield* act.getText(modalFields[field]))) : ''
    const expected =
      field === 'embryo' ?
        normalize(`${row.bullTag} x ${row.donorTag}`)
      : normalize(String(row[field]))

    if (!visible || found !== expected) {
      console.log('modal mismatch', { field, visible, found, expected })
      return yield* exitModal(false, modalContent, cancel)
    }
  }

  return yield* exitModal(true, modalContent, cancel)
} satisfies ScopeConsumer<BreedingModal, MatchResult>

export const fillBreed = function* (scope, row: TFileRow<'breeding'>) {
  const { breedingForm: form } = scope

  yield* act.click(form.$enter)
  yield* act.select(form.method, row.method)
  yield* act.fill(form.date, row.date)
  yield* act.select(form.technician, row.technician)

  if (row.method === 'AI') {
    // select2 input
    const cssString = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const tagPattern = cssString(`^${escapeRe(row.bullTag)}$`)

    const optionSelector = sel.css(`b:text-matches("${tagPattern}", "i")`)
    yield* act.click(form.bull.$enter)
    yield* act.fill(form.bull.searchbar, row.bullTag)

    try {
      yield* act.waitForVisible(optionSelector) // has to load in from db
      yield* act.click(optionSelector)
    } catch {
      throw new RowIssue('NOT_FOUND', `Could not find a sire with tag "${row.bullTag}"`)
    }
  }

  if (row.method === 'ET') {
    if (!row.caneNo || !row.strawNo)
      throw new RowIssue(
        'MISSING_DATA',
        'Method is "ET" but row is missing either a caneNo or strawNo.'
      )

    const embryoName = getEmbryoName(row.bullTag, row.donorTag, row.caneNo, row.strawNo)
    try {
      yield* act.select(form.embryo, embryoName)
    } catch {
      throw new RowIssue('NOT_FOUND', `Could not find embryo with name "${embryoName}"`)
    }

    if (row.clSide) yield* act.select(form.clSide, row.clSide)
  }

  if (row.comments) yield* act.fill(form.comments, row.comments)
  yield* act.click(form.submit)
} satisfies ScopeConsumer<BreedingTab>
