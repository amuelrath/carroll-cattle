import type { TFileRow, TProcessId } from '@shared/schemas/jobs'

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
      date: '2026-09-15',
      method: 'Ultrasound',
      sex: 'Heifer',
      result: 'Pregnant',
      technician: 'Dr. White',
      comments: 'Approx. 60 days bred, strong heartbeat.'
    },
    {
      recipTag: 'R-0877',
      date: '2026-09-15',
      method: 'Palpation',
      result: 'Open',
      technician: 'Dr. White',
      comments: ''
    },
    {
      recipTag: 'R-1156',
      date: '2026-09-18',
      method: 'Blood',
      result: 'Recheck',
      technician: 'Dr. Alvarez',
      comments: 'Recheck in 2 weeks.'
    }
  ],
  breeding: [
    {
      method: 'ET',
      recipTag: 'R-762',
      bullTag: 'B-307',
      donorTag: 'D-1042',
      date: '2026-09-14',
      technician: 'Maria Lopez',
      caneNo: 'C-12',
      strawNo: 'S-0458',
      clSide: 'Left',
      comments: 'Grade 1 embryo, recipient in good condition'
    },
    {
      method: 'AI',
      recipTag: 'R-223',
      bullTag: 'B-512',
      donorTag: 'D-0987',
      date: '2026-09-21',
      technician: 'James Carter',
      comments: ''
    },
    {
      method: 'ET',
      recipTag: 'R-308',
      bullTag: 'B-307',
      donorTag: 'D-1150',
      date: '2026-10-02',
      technician: '',
      comments: 'Second attempt after open result in August'
    }
  ]
} satisfies { [K in TProcessId]: TFileRow<K>[] }
