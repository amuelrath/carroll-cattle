import { TProcess } from '@shared/schemas/process'
import {
  ZBreedRecipRow,
  ZCalveRecipRow,
  ZPenguinRow,
  ZPregCheckRow,
  ZTransOvaInvRow
} from '@shared/schemas/process/upload'
import { z } from 'zod'

export const transOvaInvExamples: z.output<typeof ZTransOvaInvRow>[] = [
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
]

export const breedRecipExamples: z.output<typeof ZBreedRecipRow>[] = [
  { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-03-14') },
  { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-03-15') },
  { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-03-15') }
]

export const calveRecipExamples: z.output<typeof ZCalveRecipRow>[] = [
  { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-01-02') },
  { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-01-04') },
  { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-01-09') }
]

export const pregCheckExamples: (typeof ZPregCheckRow)['_output'][] = [
  { recipTag: 'R-1042', donor: 'D-4471', sire: 'Bull 88', date: new Date('2026-05-01') },
  { recipTag: 'R-1099', donor: 'D-5023', sire: 'Bull 12', date: new Date('2026-05-01') },
  { recipTag: 'R-0876', donor: 'D-3390', sire: 'Bull 45', date: new Date('2026-05-02') }
]

// todo remove me
export const penguinExamples: z.output<typeof ZPenguinRow>[] = [
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
]

export const processUploadRowExamplesMap: Record<TProcess, unknown[]> = {
  calveRecip: calveRecipExamples,
  breedRecip: breedRecipExamples,
  pregCheck: pregCheckExamples,
  transOvaInventory: transOvaInvExamples,
  penguins: penguinExamples
}
