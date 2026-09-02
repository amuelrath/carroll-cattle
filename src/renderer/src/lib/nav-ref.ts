let navigateFn: ((path: string) => void) | null = null
export const setNavigate = (fn: typeof navigateFn) => {
  navigateFn = fn
}
export const navigate = (path: string) => navigateFn?.(path)
