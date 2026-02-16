import { useEffect, useState } from 'react'
import type { FormEntry } from '../../types/form'
import { subscribeToForms } from '../../services/formService'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function FormList() {
  const { user } = useAuth()
  const [forms, setForms] = useState<FormEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setForms([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToForms(
      user.uid,
      (updatedForms) => {
        setForms(updatedForms)
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
        <p>Loading submissions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading submissions: {error}</p>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No submissions yet. Submit feedback above to get started!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <h2>Submissions ({forms.length})</h2>
      {forms.map((form) => (
        <div key={form.id} className={styles.formItem}>
          <div className={styles.formHeader}>
            <span className={`${styles.badge} ${styles[form.type]}`}>
              {form.type === 'feature' ? 'Feature' : 'Bug'}
            </span>
            <span className={styles.date}>
              {form.createdAt?.toDate?.().toLocaleDateString() ?? '...'}
            </span>
          </div>
          <div className={styles.title}>{form.title}</div>
          <div className={styles.description}>{form.description}</div>
        </div>
      ))}
    </div>
  )
}
