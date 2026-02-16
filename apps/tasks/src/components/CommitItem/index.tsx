import type { Commit } from '../../types/commit'
import styles from './styles.module.scss'

interface CommitItemProps {
  commit: Commit
}

export function CommitItem({ commit }: CommitItemProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return `${diffMins} minutes ago`
      }
      return `${diffHours} hours ago`
    }
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString()
  }

  const messageLines = commit.message.split('\n')
  const title = messageLines[0]
  const body = messageLines.slice(1).join('\n').trim()

  return (
    <div className={styles.item}>
      <div className={styles.avatar}>
        {commit.avatarUrl ? (
          <img src={commit.avatarUrl} alt={commit.authorName} />
        ) : (
          <div className={styles.placeholder}>
            {commit.authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <a
          href={commit.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.title}
        >
          {title}
        </a>

        {body && <p className={styles.body}>{body}</p>}

        <div className={styles.meta}>
          <span className={styles.author}>
            {commit.authorLogin ? (
              <a
                href={`https://github.com/${commit.authorLogin}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {commit.authorName}
              </a>
            ) : (
              commit.authorName
            )}
          </span>
          <span className={styles.date}>{formatDate(commit.date)}</span>
          <code className={styles.sha}>{commit.shortSha}</code>
        </div>
      </div>
    </div>
  )
}
