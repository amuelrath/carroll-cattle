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
import { trpc, trpcClient } from '@renderer/lib/trpc'
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

function useJobActions() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  const utils = trpc.useUtils()

  const { mutateAsync: openPath } = trpc.system.openPath.useMutation()

  const { mutateAsync: renameJob } = trpc.job.renameJob.useMutation({
    onSuccess: async () => {
      await utils.job.readAllJobs.refetch()
    },
    onSettled: () => {
      setRenameOpen(false)
    }
  })

  const { mutateAsync: deleteJob } = trpc.job.deleteJob.useMutation({
    onSuccess: async () => {
      await utils.job.readAllJobs.refetch()
    },
    onSettled: () => {
      setDeleteOpen(false)
    }
  })

  const handleDownloadSheet = async (jobId: number) => {
    const sheet = await trpcClient.sheet.getSheet.query({ jobId })

    if (!sheet)
      return toast.add({
        type: 'warning',
        title: 'Cannot Export Sheet',
        description: 'That sheet could not be found.'
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

  return {
    rename: {
      renameOpen,
      setRenameOpen,
      renameJob
    },
    remove: {
      removeOpen: deleteOpen,
      setRemoveOpen: setDeleteOpen,
      deleteJob
    },
    open: {
      openPath
    },
    download: {
      handleDownloadSheet
    }
  }
}

export function JobDropdown(): React.JSX.Element {
  const {
    job: {
      id: jobId,
      file: { filePath },
      title: jobTitle
    }
  } = useJobItem()

  const { remove, download, open, rename } = useJobActions()

  const navigate = useNavigate()

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
          <DropdownMenuContent className="w-50">
            <JobActions
              openDelete={() => remove.setRemoveOpen(true)}
              openRename={() => rename.setRenameOpen(true)}
              openFile={() => open.openPath({ filePath })}
              downloadSheet={() => download.handleDownloadSheet(jobId)}
              openReview={handleOpenReview}
            />
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
      <ConfirmDialog
        open={remove.removeOpen}
        setOpen={remove.setRemoveOpen}
        onConfirm={() => remove.deleteJob({ jobId })}
        icon={TrashIcon}
        title="Delete Job"
        desc="Are you sure you want to delete this job?"
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
      <InputDialog
        open={rename.renameOpen}
        setOpen={rename.setRenameOpen}
        defaultValue={jobTitle}
        onSubmit={(title) => rename.renameJob({ jobId, title })}
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
        <span>Open Original in Excel</span>
      </DropdownMenuItem>
      <hr />

      <DropdownMenuItem onClick={openReview} className="flex flex-row items-center text-sm">
        <ScanSearchIcon className="text-muted-foreground size-3" />
        <span>Review</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={downloadSheet} className="flex flex-row items-center text-sm">
        <DownloadIcon className="text-muted-foreground size-3" />
        <span>Export Edited Sheet</span>
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
