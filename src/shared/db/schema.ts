import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { defineRelations } from 'drizzle-orm/relations'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const processes = sqliteTable('processes', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  desc: text().notNull()
})
export type TSelectProcess = InferSelectModel<typeof processes>
export type TInsertProcess = InferInsertModel<typeof processes>

export const jobs = sqliteTable('jobs', {
  id: int().primaryKey({ autoIncrement: true }),
  processId: int()
    .notNull()
    .references(() => processes.id),
  startedAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: int({ mode: 'timestamp_ms' })
})
export type TSelectJob = InferSelectModel<typeof jobs>
export type TInsertJob = InferInsertModel<typeof jobs>

export const actions = sqliteTable('actions', {
  id: int().primaryKey({ autoIncrement: true }),
  jobId: int()
    .notNull()
    .references(() => jobs.id),
  startedAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: int({ mode: 'timestamp_ms' })
})
export type TSelectAction = InferSelectModel<typeof actions>
export type TInsertAction = InferInsertModel<typeof actions>

export const relations = defineRelations({ processes, jobs, actions }, (r) => ({
  jobs: {
    process: r.one.processes({
      from: r.jobs.processId,
      to: r.processes.id
    })
  },
  actions: {
    job: r.one.jobs({
      from: r.actions.jobId,
      to: r.jobs.id
    })
  }
}))
