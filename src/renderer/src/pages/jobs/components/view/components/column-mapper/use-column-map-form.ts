import { zodResolver } from '@hookform/resolvers/zod'
import {
  assignColumn,
  buildMappingSchema,
  type ColumnMap,
  suggestMapping
} from '@renderer/pages/jobs/components/view/components/column-mapper/_helpers'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

interface UseColumnMapFormArgs {
  targets: string[]
  required: string[]
  sheetKeys: string[]
  initial: unknown
}

export function useColumnMapForm({ targets, required, sheetKeys, initial }: UseColumnMapFormArgs) {
  const schema = useMemo(() => buildMappingSchema(targets, required), [targets, required])
  const suggestion = useMemo(
    () => (initial ? null : suggestMapping(targets, sheetKeys, required)),
    [initial, targets, sheetKeys, required]
  )
  const form = useForm<ColumnMap>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? suggestion!.map
  })

  const assign = useCallback(
    (target: string, sheetKey: string) => {
      const prev = form.getValues()
      const next = assignColumn(prev, target, sheetKey, required)
      for (const k of Object.keys(next)) {
        if (prev[k] !== next[k])
          form.setValue(k, next[k], {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted
          })
      }
    },
    [form, required]
  )

  return { form, assign, suggested: suggestion?.suggested ?? new Set<string>() }
}
