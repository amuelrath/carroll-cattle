import { zodResolver } from '@hookform/resolvers/zod'
import { PageContent, PageTitlebar } from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { toast } from '@renderer/components/ui/toast'
import { trpc } from '@renderer/lib/trpc'
import { SettingsIcon } from 'lucide-react'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const ZCredsForm = z.object({
  username: z.string(),
  password: z.string()
})

export function SettingsPage({
  username,
  password
}: {
  username?: string
  password?: string
}): React.JSX.Element {
  const utils = trpc.useUtils()

  const { handleSubmit, control } = useForm<z.infer<typeof ZCredsForm>>({
    resolver: zodResolver(ZCredsForm),
    defaultValues: {
      username: username ?? '',
      password: password ?? ''
    }
  })

  const { mutateAsync: mutateSetCreds } = trpc.credentials.setCredentials.useMutation({
    onSuccess: async () => {
      await utils.credentials.getCredentials.refetch()
      return toast.add({
        type: 'info',
        title: 'Success',
        description: 'Credentials updated.'
      })
    },
    onError: () => {
      return toast.add({
        type: 'error',
        title: 'Something went wrong',
        description: 'Credentials failed to update. Please try again'
      })
    }
  })

  const onSubmit = async (data: z.infer<typeof ZCredsForm>) => {
    await mutateSetCreds(data)
  }

  return (
    <PageContent>
      <PageTitlebar>
        <SettingsIcon className="text-muted-foreground stroke-2" />
        <div className="flex w-full flex-col">
          <h2 className="text-sm font-semibold">Settings</h2>
          <p className="text-muted-foreground text-xs">Configure CattleMax Login Credentials</p>
        </div>
      </PageTitlebar>
      <PageContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          <Controller
            control={control}
            name="username"
            render={({ field }) => <Input placeholder="CattleMax Username" {...field} />}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input placeholder="CattleMax Password" type="password" {...field} />
            )}
          />
          <Button className="w-20" type="submit">
            Save
          </Button>
        </form>
      </PageContent>
    </PageContent>
  )
}
