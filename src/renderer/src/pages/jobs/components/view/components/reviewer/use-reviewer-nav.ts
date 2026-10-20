import { useNavigate, useSearch } from '@tanstack/react-router'

export function useReviewerNav() {
  const navigate = useNavigate()
  const reviewOpen = useSearch({ from: '/jobs/view/', select: (s) => s.reviewOpen })
  const setReviewOpen = async (open: boolean) => {
    await navigate({
      from: '/jobs/view/',
      search: (p) => ({ ...p, reviewOpen: open }),
      replace: true
    })
  }

  const reviewIdx = useSearch({ from: '/jobs/view/', select: (s) => s.reviewIdx })
  const setReviewIdx = async (idx: number) => {
    await navigate({
      from: '/jobs/view/',
      search: (p) => ({ ...p, reviewIdx: idx }),
      replace: true
    })
  }

  return { reviewOpen, setReviewOpen, reviewIdx, setReviewIdx }
}
