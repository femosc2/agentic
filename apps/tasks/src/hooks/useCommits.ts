import { useState, useEffect } from 'react'
import type { Commit } from '../types/commit'
import { fetchCommits } from '../services/githubService'

interface UseCommitsResult {
  commits: Commit[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCommits(): UseCommitsResult {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCommits = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchCommits()
      setCommits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommits()
  }, [])

  return { commits, loading, error, refetch: loadCommits }
}
