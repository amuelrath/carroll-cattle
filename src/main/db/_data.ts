import type { TInsertProcess } from '@shared/db/schema'

export const processSeed: TInsertProcess[] = [
  {
    id: 'penguins',
    name: 'Penguins',
    desc: 'Palmer MF Penguins!!!'
  },
  {
    id: 'breedRecip',
    name: 'Breed Recipients',
    desc: 'Update recipient profiles in CattleMax.'
  },
  {
    id: 'calveRecip',
    name: 'Calve Recipients',
    desc: 'Update recipient profiles and create calf profiles in CattleMax.'
  },
  {
    id: 'pregCheck',
    name: 'Pregnancy Checks',
    desc: 'Update recipient profiles in CattleMax.'
  },
  {
    id: 'transOvaInventory',
    name: 'TransOva Inventory',
    desc: 'Add new embryo shipment to inventory in CattleMax.'
  },
  {
    id: 'automateNow',
    name: 'Automate Now',
    desc: 'Dev Only. Fill out a form on a test site.'
  }
]
