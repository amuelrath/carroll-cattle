import type { TProcessId } from '@shared/schemas/jobs'
import { BabyIcon, type LucideIcon, TestTubeIcon } from 'lucide-react'

export const processIcons = {
  pregCheck: TestTubeIcon,
  breeding: BabyIcon
} satisfies Record<TProcessId, LucideIcon>
