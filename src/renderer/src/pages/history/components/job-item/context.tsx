import type { TReadAllJobsRes } from '@shared/schemas/trpc'
import React, { createContext, useContext, useMemo } from 'react'

type Job = TReadAllJobsRes[number]

interface JobItemContextValue {
  job: Job
}

export const JobItemContext = createContext<JobItemContextValue | null>(null)

export function JobProvider({ children, job }: { children: React.ReactNode; job: Job }) {
  const value = useMemo(() => ({ job }), [job])
  return <JobItemContext value={value}>{children}</JobItemContext>
}

export function useJobItem() {
  const context = useContext(JobItemContext)
  if (!context) {
    throw new Error('useJobItem must be used within a JobProvider')
  }
  return context
}
