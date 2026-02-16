import { useCommits } from '../../hooks/useCommits'
import { CommitItem } from '../CommitItem'
import styles from './styles.module.scss'

export function CommitList() {
  const { commits, loading, error, refetch } = useCommits()

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading commits...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No commits found.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {commits.map((commit) => (
        <CommitItem key={commit.sha} commit={commit} />
      ))}
    </div>
  )
}
