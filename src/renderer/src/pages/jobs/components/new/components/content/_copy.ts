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
      comments: ''
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
      technician: 'Dr. White',
      caneNo: 'C-12',
      strawNo: 'S-0458',
      clSide: 'Right',
      comments: ''
    }
  ],
  flush: [
    {
      date: '2026-03-14',
      donorTag: '707',
      sireTag: 'Bar R Prime Time 412',
      type: 'Conventional',
      recovered: 14,
      degenerate: 2,
      unfertilized: 3,
      discarded: 1,
      usable: 8,
      transferred: 3,
      frozen: 5,
      comments: ''
    },

    // IVF session with oocytes recovered, no comments
    {
      date: '2026-05-02',
      donorTag: '606',
      sireTag: 'Connealy Thunder 7C',
      type: 'IVF',
      recovered: 22,
      degenerate: 5,
      unfertilized: 8,
      discarded: 2,
      usable: 7,
      transferred: 0,
      frozen: 7,
      comments: ''
    },

    // Partial record: only required fields plus a few counts
    {
      date: '2026-08-19',
      donorTag: '320',
      sireTag: 'SAV Resource 1441',
      type: 'Conventional',
      recovered: 6,
      usable: 4,
      transferred: 4,
      comments: ''
    }
  ]
} satisfies { [K in TProcessId]: TFileRow<K>[] }
