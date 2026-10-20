import { automationService } from '@main/services'
import type { AutomationEvent } from '@main/services/automation.service'
import { procedure, router } from '@main/trpc/trpc'
import { unwrap } from '@main/trpc/unwrap'
import { type TState, ZSpeedInput, ZStartInput } from '@shared/schemas/trpc'
import { observable } from '@trpc/server/observable'

export const stateRouter = router({
  jobId: stateSub('jobId'),
  narration: stateSub('narration'),
  status: stateSub('status'),
  speed: stateSub('speed'),
  tasks: stateSub('tasks')
})

export const automationRouter = router({
  start: procedure.input(ZStartInput).mutation(async ({ input, ctx }) => {
    return await unwrap(await automationService.run(input.jobId, ctx.sender))
  }),
  stop: procedure.mutation(() => {
    return unwrap(automationService.stop())
  }),
  pause: procedure.mutation(() => {
    return unwrap(automationService.pause())
  }),
  resume: procedure.mutation(() => {
    return unwrap(automationService.resume())
  }),
  changeSpeed: procedure.input(ZSpeedInput).mutation(({ input }) => {
    return unwrap(automationService.changeSpeed(input.speed))
  }),
  onCommitOrIssue: procedure.subscription(() => {
    return observable<AutomationEvent['refetch']>((emit) => {
      const handler = (data: AutomationEvent['refetch']) => {
        emit.next(data)
      }

      automationService.on('refetch', handler)
      return () => automationService.off('refetch', handler)
    })
  }),
  state: stateRouter
})

function stateSub<K extends keyof TState>(key: K) {
  // trpc-electron is not updated for using trpc v11 subs
  // only use observers
  return procedure.subscription(() =>
    observable<TState[K]>((emit) => {
      let prev: TState[K] | undefined
      const handler = (state: TState) => {
        const next = state[key]
        if (next === prev) return // skip unchanged slices
        prev = next
        emit.next(next)
      }
      emit.next(automationService.state[key]) // return current value immediately
      automationService.on('state', handler)
      return () => automationService.off('state', handler)
    })
  )
}
