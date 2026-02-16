import { useState } from 'react'
import { createFormEntry } from '../../services/formService'
import { useAuth } from '../../hooks/useAuth'
import type { FormEntryType } from '../../types/form'
import styles from './styles.module.scss'

export function FormEntryForm() {
  const { user } = useAuth()
  const [type, setType] = useState<FormEntryType>('feature')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      await createFormEntry({
        type,
        title: title.trim(),
        description: description.trim(),
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoUrl: user.photoURL,
      })
      setTitle('')
      setDescription('')
      setType('feature')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Submit Feedback</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="form-type">Type *</label>
        <div className={styles.typeSelector}>
          <button
            type="button"
            className={`${styles.typeButton} ${type === 'feature' ? styles.active : ''}`}
            onClick={() => setType('feature')}
            disabled={isSubmitting}
          >
            Feature Suggestion
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${type === 'bug' ? styles.active : ''}`}
            onClick={() => setType('bug')}
            disabled={isSubmitting}
          >
            Bug Report
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="form-title">Title *</label>
        <input
          id="form-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'feature' ? 'Describe the feature...' : 'Describe the bug...'}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="form-description">Description *</label>
        <textarea
          id="form-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'feature' ? 'Why would this feature be useful?' : 'Steps to reproduce the bug...'}
          rows={4}
          required
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || !description.trim()}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
