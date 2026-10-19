import { PageContent, PageTitlebar } from '@renderer/components/common/page'
import { Button } from '@renderer/components/ui/button'
import { ButtonGroup } from '@renderer/components/ui/button-group'
import { Input } from '@renderer/components/ui/input'
import { iconSizes } from '@renderer/lib/tokens'
import { cn } from '@renderer/lib/utils'
import { JobResults } from '@renderer/pages/history/components/job-item'
import type { TProcessId } from '@shared/schemas/jobs'
import { SearchIcon } from 'lucide-react'
import React, { useState } from 'react'

export function HistoryPage(): React.JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [processValue, setProcessValue] = useState<TProcessId | undefined>(undefined)

  return (
    <>
      <PageTitlebar>
        <SearchInput
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          processValue={processValue}
          onProcessValueChange={setProcessValue}
        />
      </PageTitlebar>
      <PageContent className="h-full space-y-2 p-4">
        <JobResults searchValue={searchValue} processValue={processValue} />
      </PageContent>
    </>
  )
}

function SearchInput({
  searchValue,
  onSearchChange,
  processValue,
  onProcessValueChange
}: {
  searchValue: string
  onSearchChange: (val: string) => void
  processValue: TProcessId | undefined
  onProcessValueChange: (val: TProcessId | undefined) => void
}) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="relative w-full">
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-6"
          placeholder="Search Previous Jobs..."
        />
        <SearchIcon
          className="text-muted-foreground absolute top-1/2 left-1 -translate-y-1/2"
          {...iconSizes.small}
        />
      </div>
      <ButtonGroup className="transition-none">
        <Button
          onClick={() => onProcessValueChange(undefined)}
          variant={processValue === undefined ? 'secondary' : 'outline'}
          className={cn(
            'w-26 transition-none',
            processValue !== undefined && 'text-muted-foreground'
          )}
          size="sm"
        >
          All
        </Button>
        <Button
          onClick={() => onProcessValueChange('pregCheck')}
          variant={processValue === 'pregCheck' ? 'secondary' : 'outline'}
          className={cn(
            'w-26 transition-none',
            processValue !== 'pregCheck' && 'text-muted-foreground'
          )}
          size="sm"
        >
          Preg Checks
        </Button>
        <Button
          onClick={() => onProcessValueChange('breeding')}
          variant={processValue === 'breeding' ? 'secondary' : 'outline'}
          className={cn(
            'w-26 transition-none',
            processValue !== 'breeding' && 'text-muted-foreground'
          )}
          size="sm"
        >
          Breeding
        </Button>
      </ButtonGroup>
    </div>
  )
}
