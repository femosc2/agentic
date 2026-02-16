import { useEffect, useState } from 'react'
import type { Email } from '../../types/email'
import { subscribeToEmails } from '../../services/emailService'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function EmailList() {
  const { user } = useAuth()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setEmails([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToEmails(
      user.uid,
      (updatedEmails) => {
        setEmails(updatedEmails)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading emails...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading emails: {error}</p>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No emails yet. Compose one above to get started!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <h2>Sent ({emails.length})</h2>
      {emails.map((email) => (
        <div key={email.id} className={styles.emailItem}>
          <div className={styles.emailHeader}>
            <span className={styles.to}>To: {email.to}</span>
            <span className={styles.date}>
              {email.createdAt?.toDate?.().toLocaleDateString() ?? '...'}
            </span>
          </div>
          <div className={styles.subject}>{email.subject}</div>
          <div className={styles.body}>{email.body}</div>
        </div>
      ))}
    </div>
  )
}
