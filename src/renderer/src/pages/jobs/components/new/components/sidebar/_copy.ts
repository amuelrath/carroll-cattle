import type { TProcessId } from '@shared/schemas/jobs'
import {
  BabyIcon,
  BirdIcon,
  type LucideIcon,
  RobotArmIcon,
  ShelvingUnitIcon,
  SyringeIcon,
  TestTubeIcon
} from 'lucide-react'

export const processIcons = {
  penguins: BirdIcon,
  breedRecip: SyringeIcon,
  calveRecip: BabyIcon,
  pregCheck: TestTubeIcon,
  transOvaInventory: ShelvingUnitIcon,
  automateNow: RobotArmIcon
} satisfies Record<TProcessId, LucideIcon>
