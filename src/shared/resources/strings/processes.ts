import { TInsertProcess } from '@shared/db/schema'
import { TProcess } from '@shared/schemas/process'
import {
  BabyIcon,
  BirdIcon,
  LucideIcon,
  ShelvingUnitIcon,
  SyringeIcon,
  TestTubeIcon
} from 'lucide-react'
import {
  breedRecipExamples,
  calveRecipExamples,
  penguinExamples,
  pregCheckExamples,
  transOvaInvExamples
} from '../schemas/process-examples'

export const PROCESS_COPY: Record<
  TProcess,
  Omit<TInsertProcess, 'id'> & {
    Icon: LucideIcon
    exampleData: Record<string, any>[]
  }
> = {
  penguins: {
    name: 'Penguins',
    desc: 'Palmer MF Penguins!!!',
    Icon: BirdIcon,
    exampleData: penguinExamples
  },
  breedRecip: {
    name: 'Breed Recipients',
    desc: 'Update recipient profiles in CattleMax.',
    Icon: SyringeIcon,
    exampleData: breedRecipExamples
  },
  calveRecip: {
    name: 'Calve Recipients',
    desc: 'Update recipient profiles and create calf profiles in CattleMax.',
    Icon: BabyIcon,
    exampleData: calveRecipExamples
  },
  pregCheck: {
    name: 'Pregnancy Checks',
    desc: 'Update recipient profiles in CattleMax.',
    Icon: TestTubeIcon,
    exampleData: pregCheckExamples
  },
  transOvaInventory: {
    name: 'TransOva Inventory',
    desc: 'Add new embryo shipment to inventory in CattleMax.',
    Icon: ShelvingUnitIcon,
    exampleData: transOvaInvExamples
  }
} as const
