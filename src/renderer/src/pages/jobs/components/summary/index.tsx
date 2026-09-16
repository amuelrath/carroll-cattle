import { useSearch } from '@tanstack/react-router'
import React from 'react'

export function SummaryPage(): React.JSX.Element {
  const { jobId } = useSearch({ from: '/jobs/summary/' })
  return (
    <div>
      <p>Summary Page</p>
      {jobId}
    </div>
  )
}
