import { TInsertProcess } from '@shared/db/schema'
import { TProcess } from '@shared/schemas/process'

export const processesCopy: Record<TProcess, Omit<TInsertProcess, 'id'>> = {
  penguins: {
    name: 'Penguins',
    desc: 'Palmer MF Penguins!!!'
  },
  breedRecip: {
    name: 'Breed Recipients',
    desc: 'Update recipient profiles in CattleMax.'
  },
  calveRecip: {
    name: 'Calve Recipients',
    desc: 'Update recipient profiles and create calf profiles in CattleMax.'
  },
  pregCheck: {
    name: 'Pregnancy Checks',
    desc: 'Update recipient profiles in CattleMax.'
  },
  transOvaInventory: {
    name: 'TransOva Inventory',
    desc: 'Add new embryo shipment to inventory in CattleMax.'
  }
} as const
