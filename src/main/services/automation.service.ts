import { runFlow } from '@main/automation/flow'
import { FilesRepository, JobsRepository, TasksRepository } from '@main/repositories'
import { WorkerService } from '@main/services/worker.service'
import type { TAction, TActionOutput, TActionType } from '@shared/automation'
import { AbortedError } from '@shared/automation/errors'
import { type TSelectJob } from '@shared/db/schema'
import { AutomationError, DatabaseError, NotFoundError, toAppError } from '@shared/errors'
import { projectRow } from '@shared/lib/sheet'
import { uploadSchemas } from '@shared/schemas/jobs'
import type { TSpeed, TState } from '@shared/schemas/trpc/automation.schemas'
import type { WebContents } from 'electron'
import { err, errAsync, ok, okAsync, Result, type ResultAsync, safeTry } from 'neverthrow'
import { setTimeout as sleep } from 'node:timers/promises'

export type AutomationEventType = 'narration' | 'refetch' | 'state'
export interface AutomationEvent extends Record<AutomationEventType, unknown> {
  narration: string
  /* rather than streaming heavy data to the render, just tell it to refetch that jobId */
  refetch: { jobId: TSelectJob['id']; idx: number }
  state: TState
}

const defaultState = {
  jobId: undefined,
  narration: undefined,
  status: 'inactive',
  tasks: []
} as const satisfies Partial<TState>

export const speeds = {
  slow: 1_000,
  normal: 250,
  max: 0
} satisfies Record<TSpeed & string, number>

export class AutomationService extends WorkerService {
  private currAborter: AbortController | undefined = undefined
  private pauseGate: { promise: Promise<void>; release: () => void } | null = null
  public state: TState = { ...defaultState, speed: 'max' }

  constructor(
    private files: FilesRepository,
    private tasks: TasksRepository,
    private jobs: JobsRepository
  ) {
    super()
  }

  pause(): ResultAsync<void, AutomationError | DatabaseError> {
    if (!this.state.jobId)
      return errAsync(new AutomationError('[AutomationService] Cannot pause when no jobId is set.'))

    if (this.pauseGate) return okAsync()
    let release!: () => void
    const promise = new Promise<void>((r) => (release = r))
    this.pauseGate = { promise, release }

    this.updateState({ status: 'paused' })
    return this.jobs.updateJobState(this.state.jobId, 'paused')
  }

  resume(): ResultAsync<void, AutomationError | DatabaseError> {
    if (!this.state.jobId)
      return errAsync(
        new AutomationError('[AutomationService] Cannot resume when no jobId is set.')
      )

    if (!this.pauseGate) return okAsync()
    this.pauseGate.release()
    this.pauseGate = null

    this.updateState({ status: 'active' })
    return this.jobs.updateJobState(this.state.jobId, 'active')
  }

  changeSpeed(speed: TSpeed): Result<void, AutomationError> {
    this.updateState({ speed })
    return ok()
  }

  async run(
    jobId: TSelectJob['id'],
    sender: WebContents
  ): Promise<ResultAsync<void, AutomationError | DatabaseError | NotFoundError>> {
    this.currAborter = new AbortController()

    const res = await safeTry(() => this.getTaskRowsAndProcessId(jobId))
    if (res.isErr()) return err(res.error)
    const { processId, rows } = res.value

    const stateRes = await this.jobs.updateJobState(jobId, 'active')
    if (stateRes.isErr()) return stateRes
    this.updateState({ status: 'active', jobId })

    try {
      this.spawn(sender)
      if (!this.rpc)
        return err(new AutomationError('[AutomationService] PlaywrightRPC failed to initialize.'))

      await runFlow(processId, rows, {
        request: this.request,
        onIssue: async (idx, issue, screenshot) => {
          const task = this.state.tasks[idx]
          if (!task.row) throw new Error('Tried accessing a task that did not exist.')
          const res = await this.tasks.upsertIssue(
            task.id,
            screenshot,
            issue.message,
            task.row.copyRow
          )
          if (res.isErr()) throw res.error
          this.emission('refetch', { jobId, idx })
        },
        onCommit: async (idx, screenshot) => {
          const task = this.state.tasks[idx]
          const taskUpdateRes = await this.tasks.commitTask(task.id, screenshot)
          task.status = 'done'
          if (taskUpdateRes.isErr()) throw taskUpdateRes.error
          this.emission('refetch', { jobId, idx })
        },
        onWarn: async (warning) => {
          console.log('warning', warning)
        },
        onNarration: async (narration) => {
          this.updateState({ narration })
        },
        signal: this.currAborter.signal
      })
      return ok()
    } catch (e) {
      if (e instanceof AbortedError) return ok()
      console.info('[AutomationService] Worker Died', e)
      return errAsync(toAppError(e, AutomationError))
    } finally {
      if (this.state.tasks.every((task) => task.status === 'done')) {
        this.updateState({ status: 'complete' })
        await this.jobs.updateJobState(jobId, 'complete')
      } else {
        this.updateState({ status: 'inactive' })
        await this.jobs.updateJobState(jobId, 'inactive')
      }
      this.stop()
    }
  }

  stop(): Result<void, AutomationError> {
    this.currAborter?.abort()
    this.resume().then(() => this.kill())
    this.updateState(defaultState)
    return ok()
  }

  private request = async <K extends TActionType>(action: TAction): Promise<TActionOutput<K>> => {
    const delay = speeds[this.state.speed]
    if (delay > 0) await sleep(delay)

    if (this.pauseGate) await this.pauseGate.promise // wait until unpaused
    if (!this.rpc) throw new AutomationError('[AutomationService ] this.rpc is undefined.')
    return this.rpc.request(action)
  }

  private updateState(newState: Partial<TState>) {
    this.state = { ...this.state, ...newState }
    this.emission('state', this.state)
  }

  private async *getTaskRowsAndProcessId(jobId: TSelectJob['id']) {
    const job = yield* this.jobs.readJob(jobId)
    const file = yield* this.files.readFile(job.fileId)
    const tasks = yield* this.tasks.readIncompleteJobTasksWithRows(jobId)
    const mappedRows = tasks.map((task) => {
      if (!file?.columnMap) return errAsync(new NotFoundError(`Job ${job.id} is unmapped!`))
      if (!task.row?.copyRow) return errAsync(new NotFoundError(`Task ${task.id} has no row.`))
      return projectRow(task.row.copyRow, file.columnMap, { inverse: true })
    })
    const taskRows = mappedRows.map((row) => uploadSchemas[job.processId].parse(row))

    if (!taskRows || taskRows.length === 0) {
      return errAsync(
        new AutomationError('Job already complete', { toast: 'Job Already Complete' })
      )
    }

    // ToDo: I don't think we need to put all tasks in state:
    //    Only the Ids/Order get used.
    this.state.tasks = tasks
    return ok({ processId: job.processId, rows: taskRows })
  }

  private emission<E extends AutomationEventType>(event: E, data: AutomationEvent[E]) {
    this.emit(event, data)
  }
}
