import type { TInsertProcess } from '@shared/db/schema'

export const processSeed: TInsertProcess[] = [
  {
    id: 'breeding',
    name: 'Breed Recipients',
    desc: 'Update recipient profiles in CattleMax.'
  },
  // {
  //   id: 'calveRecip',
  //   name: 'Calve Recipients',
  //   desc: 'Update recipient profiles and create calf profiles in CattleMax.'
  // },
  {
    id: 'pregCheck',
    name: 'Pregnancy Checks',
    desc: 'Update recipient profiles in CattleMax.'
  },
  {
    id: 'flush',
    name: 'Flush',
    desc: 'Flush donors in CattleMax'
  }
  // {
  //   id: 'transOvaInventory',
  //   name: 'TransOva Inventory',
  //   desc: 'Add new embryo shipment to inventory in CattleMax.'
  // },
]

// export const utilityProcessSeed: TInsertUtilityProcess[] = [
//   {
//     id: 'transOvaInventory',
//     name: 'Inventory Reconciliation',
//     desc: 'Ensure that reported production matches inventory.'
//   }
// ]
