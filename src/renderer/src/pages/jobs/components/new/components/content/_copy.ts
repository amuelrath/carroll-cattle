import type { TFileRow, TProcessId } from '@shared/schemas/jobs'
import { z } from 'zod'

export const contentCopy = {
  downloadTemplate: 'Download Template (.xlsx)',
  exampleData: 'Example Data',
  columnDefinitions: 'Column Definitions',
  callout:
    "After upload, you'll be able to match your columns to the expected fields and we'll flag anything that needs fixing."
} as const

export const exampleRows = {
  pregCheck: [
    {
      recipTag: 'R-1042',
      checkDate: '2026-09-15',
      checkMethod: 'ultrasound',
      ultrasoundSex: 'heifer',
      result: 'pregnant',
      technician: 'Dr. White',
      comments: 'Approx. 60 days bred, strong heartbeat.'
    },
    {
      recipTag: 'R-0877',
      checkDate: '2026-09-15',
      checkMethod: 'palpation',
      ultrasoundSex: '',
      result: 'open',
      technician: 'Dr. White',
      comments: ''
    },
    {
      recipTag: 'R-1156',
      checkDate: '2026-09-18',
      checkMethod: 'blood',
      ultrasoundSex: '',
      result: 'recheck',
      technician: 'Dr. Alvarez',
      comments: 'Recheck in 2 weeks.'
    }
  ]
} satisfies { [K in TProcessId]: TFileRow<K>[] }
