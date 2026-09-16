// wire and export service singletons here
import { getDb } from '@main/db'
import { FilesDbService, JobsDbService } from '@main/services/db'
import { DialogService, JobService, SheetService, ShellService } from '@main/services/trpc'

// export types
export type { FilesDbService, JobsDbService, JobService, DialogService, SheetService }

// db services
export const filesDbService = new FilesDbService(getDb())
export const jobsDbService = new JobsDbService(getDb())

// trpc services
export const shellService = new ShellService()
export const sheetService = new SheetService()
export const dialogService = new DialogService()
export const jobService = new JobService(sheetService, filesDbService, jobsDbService)
