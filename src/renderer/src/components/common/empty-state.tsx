import { CircleGrid } from '@renderer/components/common/circle-grid'
import React from 'react'

interface EmptyState {
  title: string
  desc: string
}

export function EmptyState({ title, desc }: EmptyState): React.JSX.Element {
  return (
    <div className="relative flex grow p-24">
      <CircleGrid className="flex flex-col items-center justify-center">
        <div className="flex size-80 flex-col items-center justify-center space-y-2 rounded-full bg-radial from-white from-20% to-transparent p-6 text-center">
          <p className="text-2xl font-bold">{title}</p>
          <p>{desc}</p>
        </div>
      </CircleGrid>
    </div>
  )
}
