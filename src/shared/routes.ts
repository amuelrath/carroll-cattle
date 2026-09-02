import { TProcess } from './schemas/process'

export const ROUTES = {
  home: '/home',
  process: {
    home: '/process',
    validate: (id: TProcess) => `/process/${id}`
  },
  history: '/history',
  settings: '/settings'
} as const

export type TRoute = typeof ROUTES
