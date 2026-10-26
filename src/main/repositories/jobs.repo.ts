import type { Executor } from '@main/db'
import { jobs, type TInsertJob, type TSelectFile, type TSelectJob } from '@shared/db/schema'
import { eq } from 'drizzle-orm'

export const jobsRepo = {
  insert: async (db: Executor, input: TInsertJob) => {
    const rows = await db.insert(jobs).values(input).returning({ id: jobs.id })
    return rows[0].id
  },
  findByFile: async (db: Executor, input: TSelectFile['id']) => {
    const rows = await db.select().from(jobs).where(eq(jobs.fileId, input))
    return rows[0]
  },
  /* Get one job with its process and file */
  readOne: (db: Executor, input: TSelectJob['id']) => {
    return db.query.jobs.findFirst({
      where: {
        id: input
      },
      with: {
        process: true,
        file: true
      }
    })
  },
  /* Get one job with its file, process, task and the row, proof, and issue */
  readOneWithTasks: (db: Executor, input: TSelectJob['id']) => {
    return db.query.jobs.findFirst({
      where: {
        id: input
      },
      with: {
        file: true,
        process: true,
        tasks: {
          with: {
            row: true,
            proof: true,
            issue: true
          }
        }
      }
    })
  },
  readAll: (db: Executor) => {
    return db.query.jobs.findMany({
      with: {
        process: true,
        file: true,
        tasks: true
      }
    })
  },

  update: async (db: Executor, input: { jobId: TSelectJob['id']; data: Partial<TInsertJob> }) => {
    return await db.update(jobs).set(input.data).where(eq(jobs.id, input.jobId))
  },
  delete: async (db: Executor, input: TSelectJob['id']) => {
    return await db.delete(jobs).where(eq(jobs.id, input))
  }
}
