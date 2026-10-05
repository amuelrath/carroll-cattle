import type { TProcessId } from '@shared/schemas/jobs'
import { type LucideIcon, TestTubeIcon } from 'lucide-react'

export const processIcons = {
  pregCheck: TestTubeIcon
} satisfies Record<TProcessId, LucideIcon>
