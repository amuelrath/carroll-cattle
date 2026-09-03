import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { defineRelations } from 'drizzle-orm/relations'
import { foreignKey, int, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { TProcess } from '../schemas/process'

export type TValidationStatus = 'valid' | 'invalid'
export type TRowValidationError = 'dateTypeMismatch' | 'missing'
export type TActionError = 'dataError' | 'missingProfile' | 'networkError'
export type TActionStatus = 'pending' | 'running' | 'success' | 'failed'

export const processes = sqliteTable('processes', {
  id: text().primaryKey().$type<TProcess>(),
  name: text().notNull(),
  desc: text().notNull()
})
export type TSelectProcess = InferSelectModel<typeof processes>
export type TInsertProcess = InferInsertModel<typeof processes>

export const files = sqliteTable('files', {
  id: int().primaryKey({ autoIncrement: true }),
  filename: text().notNull(),
  storagePath: text().notNull(),
  sha256: text().notNull(),
  uploadedAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  status: text().$type<TValidationStatus>().notNull()
})
export type TSelectFile = InferSelectModel<typeof files>
export type TInsertFile = InferInsertModel<typeof files>

export const fileRows = sqliteTable(
  'fileRows',
  {
    fileId: int()
      .notNull()
      .references(() => files.id),
    rowNum: int().notNull(),
    rawJson: text({ mode: 'json' }).notNull(),
    parsedJson: text({ mode: 'json' }).notNull(),
    status: text().$type<TValidationStatus>().notNull()
  },
  (t) => [primaryKey({ columns: [t.fileId, t.rowNum] })]
)
export type TSelectFileRow = InferSelectModel<typeof fileRows>
export type TInsertFileRow = InferInsertModel<typeof fileRows>

export const fileErrors = sqliteTable(
  'fileErrors',
  {
    fileId: int().notNull(),
    rowNum: int().notNull(),
    colName: text().notNull(),
    errorType: text().notNull().$type<TRowValidationError>()
  },
  (t) => [
    primaryKey({ columns: [t.fileId, t.rowNum, t.colName] }),
    foreignKey({
      columns: [t.fileId, t.rowNum],
      foreignColumns: [fileRows.fileId, fileRows.rowNum]
    })
  ]
)
export type TSelectFileError = InferSelectModel<typeof fileErrors>
export type TInsertFileError = InferInsertModel<typeof fileErrors>

export const jobs = sqliteTable('jobs', {
  id: int().primaryKey({ autoIncrement: true }),
  processId: text()
    .notNull()
    .references(() => processes.id)
    .$type<TProcess>(),
  fileId: int()
    .notNull()
    .references(() => files.id),
  startedAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: int({ mode: 'timestamp_ms' })
})
export type TSelectJob = InferSelectModel<typeof jobs>
export type TInsertJob = InferInsertModel<typeof jobs>

export const actions = sqliteTable(
  'actions',
  {
    id: int().primaryKey({ autoIncrement: true }),
    jobId: int()
      .notNull()
      .references(() => jobs.id),
    fileId: int().notNull(),
    rowNum: int().notNull(),
    status: text().$type<TActionStatus>().notNull().default('pending'),
    startedAt: int({ mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    completedAt: int({ mode: 'timestamp_ms' })
  },
  (t) => [
    foreignKey({
      columns: [t.fileId, t.rowNum],
      foreignColumns: [fileRows.fileId, fileRows.rowNum]
    })
  ]
)
export type TSelectAction = InferSelectModel<typeof actions>
export type TInsertAction = InferInsertModel<typeof actions>

export const actionErrors = sqliteTable('actionErrors', {
  id: int().primaryKey({ autoIncrement: true }),
  actionId: int()
    .notNull()
    .references(() => actions.id),
  errorType: text().notNull().$type<TActionError>(),
  message: text(),
  createdAt: int({ mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
})
export type TSelectActionError = InferSelectModel<typeof actionErrors>
export type TInsertActionError = InferInsertModel<typeof actionErrors>

export const relations = defineRelations(
  {
    processes,
    jobs,
    actions,
    actionErrors,
    files,
    fileRows,
    fileErrors
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
      actions: r.many.actions({
        from: r.jobs.id,
        to: r.actions.jobId
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
      }),
      errors: r.many.fileErrors({
        from: [r.fileRows.fileId, r.fileRows.rowNum],
        to: [r.fileErrors.fileId, r.fileErrors.rowNum]
      }),
      actions: r.many.actions({
        from: [r.fileRows.fileId, r.fileRows.rowNum],
        to: [r.actions.fileId, r.actions.rowNum]
      })
    },
    fileErrors: {
      row: r.one.fileRows({
        from: [r.fileErrors.fileId, r.fileErrors.rowNum],
        to: [r.fileRows.fileId, r.fileRows.rowNum]
      })
    },
    actions: {
      job: r.one.jobs({
        from: r.actions.jobId,
        to: r.jobs.id
      }),
      row: r.one.fileRows({
        from: [r.actions.fileId, r.actions.rowNum],
        to: [r.fileRows.fileId, r.fileRows.rowNum]
      }),
      errors: r.many.actionErrors({
        from: r.actions.id,
        to: r.actionErrors.actionId
      })
    },
    actionErrors: {
      action: r.one.actions({
        from: r.actionErrors.actionId,
        to: r.actions.id
      })
    }
  })
)
