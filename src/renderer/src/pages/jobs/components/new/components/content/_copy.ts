import type { TProcessId } from '@shared/schemas/jobs'
import { type TUploadSchemas } from '@shared/schemas/jobs/upload'
import { z } from 'zod'

export const contentCopy = {
  downloadTemplate: 'Download Template (.xlsx)',
  exampleData: 'Example Data',
  columnDefinitions: 'Column Definitions',
  callout:
    "After upload, you'll be able to match your columns to the expected fields and we'll flag anything that needs fixing."
} as const

export const exampleRows = {
  penguins: [
    {
      species: 'Adelie',
      island: 'Torgersen',
      billLength: 39.1,
      billDepth: 18.7,
      flipperLength: 181,
      bodyMass: 3750,
      sex: 'male',
      year: 2007
    },
    {
      species: 'Gentoo',
      island: 'Biscoe',
      billLength: 46.1,
      billDepth: 13.2,
      flipperLength: 211,
      bodyMass: 4500,
      sex: 'female',
      year: 2008
    },
    {
      species: 'Chinstrap',
      island: 'Dream',
      billLength: 49.2,
      billDepth: 18.2,
      flipperLength: 195,
      bodyMass: 4000,
      sex: 'male',
      year: 2009
    }
  ],
  pregCheck: [
    { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-05-01') },
    { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-05-01') },
    { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-05-02') }
  ],
  calveRecip: [
    { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-01-02') },
    { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-01-04') },
    { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-01-09') }
  ],
  breedRecip: [
    { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-03-14') },
    { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-03-15') },
    { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-03-15') }
  ],
  transOvaInventory: [
    {
      donor: 'D-4471',
      sire: 'Bull 88',
      freezeDate: new Date('2026-02-11'),
      canister: 3,
      caneNumber: 'C-12',
      strawNumber: 5,
      stage: 7,
      grade: 1,
      sex: 'RS F'
    },
    {
      donor: 'D-5023',
      sire: 'Bull 12',
      freezeDate: new Date('2026-03-04'),
      canister: 1,
      caneNumber: 'C-04',
      strawNumber: 2,
      stage: 6,
      grade: 2,
      sex: 'RS M'
    },
    {
      donor: 'D-3390',
      sire: 'Bull 45',
      freezeDate: new Date('2026-01-27'),
      canister: 5,
      caneNumber: 'C-19',
      strawNumber: 8,
      stage: 7,
      grade: 1,
      sex: 'N'
    }
  ],
  automateNow: [
    {
      name: 'Jordan Lee',
      password: 'Tr0ub4dor&3',
      favDrink: 'Coffee',
      favColor: 'Blue',
      likesAutomation: 'Yes',
      email: 'jordan.lee@example.com',
      message: 'Excited to get this workflow automated.'
    },
    {
      name: 'Casey Morgan',
      password: 'correct-horse-battery',
      favDrink: 'Ctrl-Alt-Delight',
      favColor: '#FFC0CB',
      likesAutomation: 'Undecided',
      email: 'casey.morgan@example.com',
      message: 'Not sure yet, but willing to try it out.'
    },
    {
      name: 'Riley Chen',
      password: 'hunter2',
      favDrink: 'Wine',
      favColor: 'Green',
      likesAutomation: 'No',
      email: 'riley.chen@example.com',
      message: 'Prefer doing this manually for now.'
    }
  ]
} satisfies { [K in TProcessId]: z.infer<TUploadSchemas[K]>[] }
