import { ConfirmDialog } from '@renderer/components/common/confirm-dialog'
import { InputDialog } from '@renderer/components/common/input-dialog'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { toast } from '@renderer/components/ui/toast'
import { iconSizes } from '@renderer/lib/tokens'
import { trpc } from '@renderer/lib/trpc'
import { useJobItem } from '@renderer/pages/history/components/job-item/context'
import { sheetToJson } from '@shared/lib/sheet'
import { useNavigate } from '@tanstack/react-router'
import {
  DownloadIcon,
  EllipsisIcon,
  FileTextIcon,
  PencilIcon,
  ScanSearchIcon,
  TrashIcon
} from 'lucide-react'
import React, { useState } from 'react'

export function JobDropdown(): React.JSX.Element {
  const {
    job: {
      id: jobId,
      file: { filePath },
      title: jobTitle
    }
  } = useJobItem()

  const navigate = useNavigate()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  const utils = trpc.useUtils()
  const { data: sheet } = trpc.sheet.getSheet.useQuery({ jobId })
  const { mutateAsync: mutateRenameJob } = trpc.job.renameJob.useMutation({
    onSuccess: async () => {
      await utils.job.readAllJobs.refetch()
    },
    onSettled: () => {
      setRenameOpen(false)
    }
  })
  const { mutateAsync: mutateOpenPath } = trpc.system.openPath.useMutation()
  const { mutateAsync: mutateDeleteJob } = trpc.job.deleteJob.useMutation({
    onSuccess: async () => {
      await utils.job.readAllJobs.refetch()
    },
    onSettled: () => {
      setDeleteOpen(false)
    }
  })

  const handleOpenFile = async () => {
    await mutateOpenPath({ filePath })
  }

  const handleDownloadSheet = () => {
    if (!sheet)
      return toast.add({
        type: 'warning',
        title: 'Cannot Export Sheet',
        description: 'The sheet you are trying to export does not exist.'
      })

    if (!sheet.mapped)
      return toast.add({
        type: 'warning',
        title: 'Cannot Export Sheet',
        description: 'The sheet you are trying to export has not been mapped.'
      })
    const rows = sheet.rows.map((row) => row.copyRow)
    const title = `${sheet.file.fileName} (Revised)`
    return sheetToJson(rows, title)
  }

  const handleRenameJob = async (title: string) => {
    console.log(title)
    await mutateRenameJob({
      jobId,
      title
    })
  }

  const handleOpenReview = async () => {
    await navigate({
      to: '/jobs/view',
      search: (p) => ({ ...p, jobId, reviewOpen: true })
    })
  }

  return (
    <>
      <DropdownMenu>
        <div className="-col-start-1 self-center justify-self-center opacity-0 transition-all group-hover:opacity-100">
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            render={
              <Button size="sm" variant="outline">
                <EllipsisIcon {...iconSizes.large} />
              </Button>
            }
          />
          <DropdownMenuContent className="w-[150px]">
            <JobActions
              openDelete={() => setDeleteOpen(true)}
              openRename={() => setRenameOpen(true)}
              openFile={handleOpenFile}
              downloadSheet={handleDownloadSheet}
              openReview={handleOpenReview}
            />
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={() => mutateDeleteJob({ jobId })}
        icon={TrashIcon}
        title="Delete Job"
        desc="Are you sure you want to delete this job?"
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
      <InputDialog
        open={renameOpen}
        setOpen={setRenameOpen}
        defaultValue={jobTitle}
        onSubmit={handleRenameJob}
        icon={PencilIcon}
        title="Rename Job"
        desc="Give the job a descriptive name"
        confirmLabel="Rename"
      />
    </>
  )
}

export function JobActions({
  openDelete,
  openFile,
  downloadSheet,
  openRename,
  openReview
}: {
  openDelete: () => void
  openFile: () => void
  downloadSheet: () => void
  openRename: () => void
  openReview: () => void
}): React.JSX.Element {
  return (
    <div className="space-y-1">
      <DropdownMenuItem onClick={openRename} className="flex flex-row items-center text-sm">
        <PencilIcon className="text-muted-foreground size-3" />
        <span>Rename</span>
      </DropdownMenuItem>
      <hr />
      <DropdownMenuItem onClick={openFile} className="flex flex-row items-center text-sm">
        <FileTextIcon className="text-muted-foreground size-3" />
        <span>Open in Excel</span>
      </DropdownMenuItem>
      <hr />

      <DropdownMenuItem onClick={openReview} className="flex flex-row items-center text-sm">
        <ScanSearchIcon className="text-muted-foreground size-3" />
        <span>Review</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={downloadSheet} className="flex flex-row items-center text-sm">
        <DownloadIcon className="text-muted-foreground size-3" />
        <span>Export Sheet</span>
      </DropdownMenuItem>
      <hr />
      <DropdownMenuItem
        onClick={openDelete}
        className="text-destructive-foreground flex flex-row items-center text-sm"
      >
        <TrashIcon className="size-3" />
        <span>Delete Job</span>
      </DropdownMenuItem>
    </div>
  )
}
