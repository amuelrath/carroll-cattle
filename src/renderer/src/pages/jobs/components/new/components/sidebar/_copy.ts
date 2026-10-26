import type { TProcessId } from '@shared/schemas/jobs'
import { BabyIcon, type LucideIcon, SearchIcon, TestTubeIcon } from 'lucide-react'

export const processIcons = {
  pregCheck: SearchIcon,
  breeding: BabyIcon,
  flush: TestTubeIcon
} satisfies Record<TProcessId, LucideIcon>
