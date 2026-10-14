// wire and export service singletons here
import { getDb } from '@main/db'
import { FilesRepository, JobsRepository, TasksRepository } from '@main/repositories'
import { AutomationService } from '@main/services/automation.service'
import { DialogService } from '@main/services/dialog.service'
import { FileService } from '@main/services/file.service'
import { JobService } from '@main/services/job.service'
import { SheetService } from '@main/services/sheet.service'
import { ShellService } from '@main/services/shell.service'

// export
export { ShellService, SheetService, DialogService, JobService }

// repositories (feed the db)
export const filesRepository = new FilesRepository(getDb())
export const jobsRepository = new JobsRepository(getDb())
export const tasksRepository = new TasksRepository(getDb())

// core services (feed required repositories) (maybe split into core/orchestration)
export const fileService = new FileService(filesRepository)
export const shellService = new ShellService()
export const sheetService = new SheetService(jobsRepository)
export const dialogService = new DialogService()
export const jobService = new JobService(
  sheetService,
  filesRepository,
  jobsRepository,
  tasksRepository
)
export const automationService = new AutomationService(
  filesRepository,
  tasksRepository,
  jobsRepository
)

// maybe? orchestration services
