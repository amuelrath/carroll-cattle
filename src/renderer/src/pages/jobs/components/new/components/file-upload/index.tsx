import { IconCircle } from '@renderer/components/common/icon-circle'
import { Button } from '@renderer/components/ui/button'
import { toast } from '@renderer/components/ui/toast'
import { trpc } from '@renderer/lib/trpc'
import { cn } from '@renderer/lib/utils'
import { SheetPicker } from '@renderer/pages/jobs/components/new/components/sheet-picker'
import { errors } from '@shared/resources/strings'
import { TSheetPreviewResponse } from '@shared/schemas/trpc'
import { FileUpIcon, UploadIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { fileUploadCopy as copy } from './_copy'

type TDragDropValidationResult =
  { valid: true; file: File } | { valid: false; reason: 'multiple' | 'invalid-type' }

// todo test
function validateDragDropFiles(fileList: File[]): TDragDropValidationResult {
  if (fileList.length > 1) return { valid: false, reason: 'multiple' }
  const file = fileList[0]
  if (!ALLOWED_FILE_TYPES.includes(file.type)) return { valid: false, reason: 'invalid-type' }
  return { valid: true, file }
}

const ALLOWED_FILE_TYPES = [
  'text/csv', // .csv
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
]

export function FileUpload(): React.JSX.Element {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [sheets, setSheets] = useState<TSheetPreviewResponse['sheets'] | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)
  const dragCounter = useRef(0) // anti-flickering while dragging over
  const { mutateAsync: openFile } = trpc.dialog.openFile.useMutation()
  const { mutateAsync: previewSheets } = trpc.sheet.previewSheets.useMutation()

  const handleWorkbookImport = async (filePath: string): Promise<void> => {
    // errors already surface via responseLink toast + log
    // this try/catch only covers the "readable file, but no sheets" case
    const response = await previewSheets({ filePath })

    if (!response.sheets || response.sheets.length === 0) {
      toast.add({
        type: 'error',
        description: errors.unreadableFile
      })
      return
    }

    setSheets(response.sheets)
    setFilePath(filePath)
  }

  const handleUploadClick = async (): Promise<void> => {
    const response = await openFile()
    if (!response.filePath) return // user canceled
    await handleWorkbookImport(response.filePath)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    // ensure that the file is something we can read
    const result = validateDragDropFiles(Array.from(e.dataTransfer.files))
    if (!result.valid) {
      toast.add({
        type: 'error',
        description:
          result.reason === 'multiple' ?
            'Cannot upload multiple files at once.'
          : 'Please upload a CSV, XLS, or XLSX file.'
      })
      return
    }

    // file is readable -> validate the workbook -> redirect or select sheet
    const path = window.electron.webUtils.getPathForFile(result.file)
    await handleWorkbookImport(path)
  }

  return (
    <>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'flex h-44 flex-col items-center justify-center space-y-2 rounded-lg border-2 border-dashed transition select-none',
          isDragging ? 'drop-shadow-lg' : 'shadow-none'
        )}
      >
        <IconCircle Icon={FileUpIcon} size="medium" />
        <p> {copy.instructions} </p>
        <Button onClick={handleUploadClick}>
          <UploadIcon />
          Browse Files
        </Button>
        <p className="text-muted-foreground text-xs">{copy.supportedFileTypes}</p>
      </div>
      <SheetPicker sheets={sheets} filePath={filePath} cancel={() => setSheets(null)} />
    </>
  )
}
