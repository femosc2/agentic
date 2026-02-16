import { useState, useMemo } from 'react'
import { createTask } from '../../services/taskService'
import { useAuth } from '../../hooks/useAuth'
import { validateTask, ALLOWED_TASK_EXAMPLES } from '../../utils/taskValidation'
import styles from './styles.module.scss'

export function TaskForm() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time validation as user types
  const validation = useMemo(
    () => validateTask(title, description),
    [title, description]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return

    // Final validation check before submission
    if (!validation.isValid) {
      setError(validation.error || 'This task is not allowed for safety reasons')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoUrl: user.photoURL,
      })
      setTitle('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Create New Task</h2>

      {error && <div className={styles.error}>{error}</div>}

      {!validation.isValid && !error && (
        <div className={styles.warning}>
          <strong>Warning:</strong> {validation.error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="title">Task Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Add a hamburger menu for mobile navigation"
          required
          disabled={isSubmitting}
          className={!validation.isValid ? styles.invalidInput : undefined}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details or instructions for the agent..."
          rows={3}
          disabled={isSubmitting}
          className={!validation.isValid ? styles.invalidInput : undefined}
        />
      </div>

      <div className={styles.examples}>
        <span className={styles.examplesLabel}>Examples:</span>
        {ALLOWED_TASK_EXAMPLES.slice(0, 3).map((example) => (
          <button
            key={example}
            type="button"
            className={styles.exampleChip}
            onClick={() => setTitle(example)}
            disabled={isSubmitting}
          >
            {example}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !title.trim() || !validation.isValid}
      >
        {isSubmitting ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}
