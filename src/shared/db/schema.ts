import type { TProcessId } from '@shared/schemas/jobs'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { defineRelations } from 'drizzle-orm/relations'
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createSelectSchema } from 'drizzle-orm/zod'
import { z } from 'zod'

export type TJobStatus = 'active' | 'inactive' | 'paused'
export type TTaskStatus = 'done' | 'notDone'

export const processes = sqliteTable('processes', {
  id: text().primaryKey().$type<TProcessId>(),
  name: text().notNull(),
  desc: text().notNull()
})
export type TSelectProcess = InferSelectModel<typeof processes>
export type TInsertProcess = InferInsertModel<typeof processes>
export const ZSelectProcess = createSelectSchema(processes)

// MaybeToDo: Add sha256 hash to guard against duplicate sheet uploads?
export const files = sqliteTable('files', {
  id: int().primaryKey({ autoIncrement: true }),
  fileName: text().notNull(),
  sheetName: text().notNull(),
  uploadedAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
})
export type TSelectFile = InferSelectModel<typeof files>
export type TInsertFile = InferInsertModel<typeof files>
export const ZSelectFile = createSelectSchema(files)

export const fileRows = sqliteTable(
  'fileRows',
  {
    fileId: int()
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    rowIdx: int().notNull(),
    json: text({ mode: 'json' }).notNull()
  },
  (t) => [primaryKey({ columns: [t.fileId, t.rowIdx] })]
)
export type TSelectFileRow = InferSelectModel<typeof fileRows>
export type TInsertFileRow = InferInsertModel<typeof fileRows>
export const ZSelectFileRow = createSelectSchema(fileRows, {
  json: z.unknown()
})

export const jobs = sqliteTable('jobs', {
  id: int().primaryKey({ autoIncrement: true }),
  status: text().$type<TJobStatus>().notNull().default('inactive'),
  processId: text()
    .notNull()
    .references(() => processes.id)
    .$type<TProcessId>(),
  fileId: int()
    .notNull()
    .references(() => files.id, { onDelete: 'cascade' }),
  createdAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  startedAt: int({ mode: 'timestamp_ms' }),
  completedAt: int({ mode: 'timestamp_ms' })
})
export type TSelectJob = InferSelectModel<typeof jobs>
export type TInsertJob = InferInsertModel<typeof jobs>
export const ZSelectJob = createSelectSchema(jobs)

export const tasks = sqliteTable(
  'tasks',
  {
    id: int().primaryKey({ autoIncrement: true }),
    jobId: int()
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    fileId: int()
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    rowIdx: int().notNull(),
    createdAt: int({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    status: text().$type<TTaskStatus>().notNull().default('notDone'),
    startedAt: int({ mode: 'timestamp_ms' }),
    completedAt: int({ mode: 'timestamp_ms' })
  },
  (t) => [
    // fileId intentionally denormalized so we can derive FK
    foreignKey({
      columns: [t.fileId, t.rowIdx],
      foreignColumns: [fileRows.fileId, fileRows.rowIdx]
    })
  ]
)
export type TSelectTask = InferSelectModel<typeof tasks>
export type TInsertTask = InferInsertModel<typeof tasks>
export const ZSelectTask = createSelectSchema(tasks)

export const taskProofs = sqliteTable('taskProofs', {
  taskId: int()
    .primaryKey()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  imgBase64: text().notNull(),
  createdAt: int({ mode: 'timestamp_ms' }).$defaultFn(() => new Date())
})
export type TSelectTaskProof = InferSelectModel<typeof taskProofs>
export type TInsertTaskProof = InferInsertModel<typeof taskProofs>
export const ZSelectTaskProof = createSelectSchema(taskProofs)

export const taskIssues = sqliteTable('taskIssues', {
  taskId: int()
    .primaryKey()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  imgBase64: text().notNull(),
  desc: text().notNull(),
  createdAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
})
export type TSelectTaskIssue = InferSelectModel<typeof taskIssues>
export type TInsertTaskIssue = InferInsertModel<typeof taskIssues>
export const ZSelectTaskIssue = createSelectSchema(taskIssues)

export const relations = defineRelations(
  {
    processes,
    jobs,
    files,
    fileRows,
    tasks,
    taskIssues,
    taskProofs
  },
  (r) => ({
    jobs: {
      process: r.one.processes({
        from: r.jobs.processId,
        to: r.processes.id
      }),
      file: r.one.files({
        from: r.jobs.fileId,
        to: r.files.id
      }),
      tasks: r.many.tasks({
        from: r.jobs.id,
        to: r.tasks.jobId
      })
    },
    files: {
      rows: r.many.fileRows({
        from: r.files.id,
        to: r.fileRows.fileId
      }),
      jobs: r.many.jobs({
        from: r.files.id,
        to: r.jobs.fileId
      })
    },
    fileRows: {
      file: r.one.files({
        from: r.fileRows.fileId,
        to: r.files.id
      })
    },
    tasks: {
      row: r.one.fileRows({
        from: [r.tasks.fileId, r.tasks.rowIdx],
        to: [r.fileRows.fileId, r.fileRows.rowIdx]
      }),
      job: r.one.jobs({
        from: r.tasks.jobId,
        to: r.jobs.id
      }),
      proof: r.one.taskProofs({
        from: r.tasks.id,
        to: r.taskProofs.taskId
      }),
      issues: r.one.taskIssues({
        from: r.tasks.id,
        to: r.taskIssues.taskId
      })
    },
    taskProofs: {
      task: r.one.tasks({
        from: r.taskProofs.taskId,
        to: r.tasks.id
      })
    },
    taskIssues: {
      task: r.one.tasks({
        from: r.taskIssues.taskId,
        to: r.tasks.id
      })
    }
  })
)
