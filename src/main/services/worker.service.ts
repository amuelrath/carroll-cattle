import { postWcMessage } from '@main/core/ipc'
import type { TAction, TActionOutput, TActionType } from '@shared/automation'
import { AbortedError, rehydrateError } from '@shared/automation/errors'
import { type TWorkerRequest, ZWorkerResponse } from '@shared/schemas/protocol.schemas'
import { app, MessageChannelMain, utilityProcess, UtilityProcess, WebContents } from 'electron'
import { EventEmitter } from 'node:events'
import path from 'path'

type Pending = {
  type: TActionType
  resolve: (value: unknown) => void
  reject: (err: unknown) => void
}

class PlaywrightRPC extends EventEmitter {
  private nextId = 1
  private pending = new Map<number, Pending>()

  constructor(private worker: UtilityProcess) {
    super()

    this.worker.on('message', (raw) => this.respond(raw))
    this.worker.on('exit', (code) => {
      console.warn(`[PlaywrightRPC] Utility exited (code: ${code})`)
      this.rejectAll(new AbortedError())
    })
  }

  request = <K extends TActionType>(action: TAction): Promise<TActionOutput<K>> => {
    console.log(`[PlaywrightRPC::request] requesting "${action.type}"`)

    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, {
        type: action.type as K,
        resolve: resolve as (value: unknown) => void,
        reject
      })
      this.worker.postMessage({ id, payload: action } satisfies TWorkerRequest)
    })
  }

  rejectAll(err: unknown) {
    for (const [, entry] of this.pending) {
      entry.reject(err)
    }
    this.pending.clear()
  }

  private respond(raw: unknown) {
    const res = ZWorkerResponse.parse(raw)
    const pending = this.pending.get(res.id)
    if (!pending) return

    switch (res.kind) {
      case 'success': {
        pending.resolve(res.data)
        break
      }
      case 'error': {
        pending.reject(rehydrateError(res))
        break
      }
      default: {
        throw new Error(`Impossible case ${res satisfies never}`)
      }
    }
    this.pending.delete(res.id)
  }
}

const browsersPath =
  app.isPackaged ?
    path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      'playwright-core',
      '.local-browsers'
    )
  : '0'

export class WorkerService extends EventEmitter {
  public rpc: PlaywrightRPC | undefined = undefined
  private name = 'automation-driver'
  private child: UtilityProcess | undefined = undefined

  constructor() {
    super()
  }

  /** Spawns the worker, initializes rpc, and hands off ports for frame streaming */
  spawn(target: WebContents) {
    if (this.child) throw new Error('[WorkerService] Cannot spawn: Utility already spawned.')
    if (this.rpc) throw new Error('[WorkerService] Cannot spawn: PlaywrightRPC already registered.')

    this.child = utilityProcess.fork(path.join(__dirname, 'worker.js'), [], {
      serviceName: this.name,
      allowLoadingUnsignedLibraries: true,
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath }
    })

    this.rpc = new PlaywrightRPC(this.child)

    // for frame streaming
    const { port1, port2 } = new MessageChannelMain()
    this.child.postMessage('worker:init', [port1])
    postWcMessage('worker:entered', target, '*', [port2])

    this.child.on('exit', () => {
      if (!target.isDestroyed()) postWcMessage('worker:exited', target, undefined)
    })
  }

  /** Rejects all in-flight requests and kills the child process */
  kill() {
    this.rpc?.rejectAll('[WorkerService] Utility manually killed.')
    this.child?.kill()

    this.child = undefined
    this.rpc = undefined
  }
}
