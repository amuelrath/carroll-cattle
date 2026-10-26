import { postWcMessage } from '@main/core/ipc'
import { WorkerService } from '@main/services/worker.service'
import type { TAction } from '@shared/automation'
import { AbortedError } from '@shared/automation/errors'
import type { TWorkerErrorResponse } from '@shared/schemas/protocol.schemas'
// import after mocks are declared
import { utilityProcess } from 'electron'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted above imports, so shared state must be hoisted too
const h = vi.hoisted(() => ({ children: [] as any[] }))

vi.mock('electron', async () => {
  const { EventEmitter } = await import('node:events')

  class FakeUtilityProcess extends EventEmitter {
    postMessage = vi.fn()
    kill = vi.fn(() => {
      this.emit('exit', 0)
      return true
    })
  }

  return {
    app: { isPackaged: false },
    utilityProcess: {
      fork: vi.fn(() => {
        const child = new FakeUtilityProcess()
        h.children.push(child)
        return child
      })
    },
    // a real class, because the code calls `new MessageChannelMain()`
    MessageChannelMain: class {
      port1 = { name: 'port1' }
      port2 = { name: 'port2' }
    },
    UtilityProcess: FakeUtilityProcess
  }
})

vi.mock('@main/core/ipc', () => ({ postWcMessage: vi.fn() }))

const fakeTarget = (destroyed = false) => ({ isDestroyed: vi.fn(() => destroyed) }) as any

const action = (type: string) => ({ type }) as unknown as TAction

describe('WorkerService', () => {
  let service: WorkerService
  let child: any

  beforeEach(() => {
    vi.clearAllMocks()
    h.children.length = 0
    service = new WorkerService()
    service.spawn(fakeTarget())
    child = h.children[0]
  })

  describe('spawn', () => {
    it('forks the worker and hands off the frame ports', () => {
      expect(utilityProcess.fork).toHaveBeenCalledOnce()
      expect(child.postMessage).toHaveBeenCalledWith('worker:init', [{ name: 'port1' }])
      expect(postWcMessage).toHaveBeenCalledWith('worker:entered', expect.anything(), '*', [
        { name: 'port2' }
      ])
      expect(service.rpc).toBeDefined()
    })

    it('throws if spawned twice', () => {
      expect(() => service.spawn(fakeTarget())).toThrow(/already spawned/)
    })

    it('notifies the renderer when the child exits', () => {
      const target = fakeTarget()
      const s = new WorkerService()
      s.spawn(target)
      h.children.at(-1).emit('exit', 1)
      expect(postWcMessage).toHaveBeenCalledWith('worker:exited', target, undefined)
    })

    it('skips the notification if the target is destroyed', () => {
      const s = new WorkerService()
      s.spawn(fakeTarget(true))
      vi.mocked(postWcMessage).mockClear()
      h.children.at(-1).emit('exit', 1)
      expect(postWcMessage).not.toHaveBeenCalled()
    })
  })

  describe('rpc', () => {
    it('posts requests with incrementing ids', () => {
      void service.rpc!.request(action('a'))
      void service.rpc!.request(action('b'))
      expect(child.postMessage).toHaveBeenCalledWith({ id: 1, payload: { type: 'a' } })
      expect(child.postMessage).toHaveBeenCalledWith({ id: 2, payload: { type: 'b' } })
    })

    it('resolves on a success response', async () => {
      const p = service.rpc!.request(action('a'))
      child.emit('message', { id: 1, kind: 'success', data: { ok: true } })
      await expect(p).resolves.toEqual({ ok: true })
    })

    it('rejects on an error response', async () => {
      const p = service.rpc!.request(action('a'))
      child.emit('message', {
        id: 1,
        kind: 'error',
        errorType: 'timeout',
        message: 'test'
      } satisfies TWorkerErrorResponse)
      await expect(p).rejects.toBeInstanceOf(Error)
    })

    it('ignores responses for unknown ids', () => {
      expect(() => child.emit('message', { id: 999, kind: 'success', data: null })).not.toThrow()
    })

    it('rejects all pending requests with AbortedError when the worker dies', async () => {
      const p1 = service.rpc!.request(action('a'))
      const p2 = service.rpc!.request(action('b'))
      child.emit('exit', 1)
      await expect(p1).rejects.toBeInstanceOf(AbortedError)
      await expect(p2).rejects.toBeInstanceOf(AbortedError)
    })
  })

  describe('kill', () => {
    it('rejects in-flight requests, kills the child, and resets state', async () => {
      const p = service.rpc!.request(action('a'))
      service.kill()
      await expect(p).rejects.toMatch(/manually killed/)
      expect(child.kill).toHaveBeenCalledOnce()
      expect(service.rpc).toBeUndefined()
    })

    it('allows respawning after kill', () => {
      service.kill()
      expect(() => service.spawn(fakeTarget())).not.toThrow()
    })
  })
})
