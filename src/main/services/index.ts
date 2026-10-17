// wire and export service singletons here
import { getDb } from '@main/db'
import { AutomationService } from '@main/services/automation.service'
import { DialogService } from '@main/services/dialog.service'
import { FileService } from '@main/services/file.service'
import { JobService } from '@main/services/job.service'
import { SheetService } from '@main/services/sheet.service'
import { ShellService } from '@main/services/shell.service'
import { TaskService } from '@main/services/task.service'

// export
export { ShellService, SheetService, DialogService, JobService, FileService, TaskService }

// core services
export const shellService = new ShellService()
export const dialogService = new DialogService()
export const sheetService = new SheetService(getDb())
export const taskService = new TaskService(getDb())
export const fileService = new FileService(getDb())
export const jobService = new JobService(getDb(), sheetService)

// orchestration service
export const automationService = new AutomationService(fileService, taskService, jobService)
