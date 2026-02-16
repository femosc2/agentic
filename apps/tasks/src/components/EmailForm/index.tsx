import { useState } from 'react'
import { createEmail } from '../../services/emailService'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function EmailForm() {
  const { user } = useAuth()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!to.trim() || !subject.trim() || !body.trim() || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createEmail({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoUrl: user.photoURL,
      })
      setTo('')
      setSubject('')
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Compose Email</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="email-to">To *</label>
        <input
          id="email-to"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email-subject">Subject *</label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email-body">Body *</label>
        <textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email..."
          rows={5}
          required
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !to.trim() || !subject.trim() || !body.trim()}
      >
        {isSubmitting ? 'Sending...' : 'Send Email'}
      </button>
    </form>
  )
}
