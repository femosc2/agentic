import { useState } from 'react'
import type { Task } from '../../types/task'
import { deleteTask } from '../../services/taskService'
import { Markdown } from '../Markdown'
import styles from './styles.module.scss'

interface TaskItemProps {
  task: Task
}

const statusLabels: Record<Task['status'], string> = {
  draft: 'Draft',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
}

export function TaskItem({ task }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    setIsDeleting(true)
    try {
      await deleteTask(task.id)
    } catch (err) {
      console.error('Failed to delete task:', err)
      setIsDeleting(false)
    }
  }

  const formatDate = (timestamp: Task['createdAt']) => {
    if (!timestamp?.toDate) return ''
    return timestamp.toDate().toLocaleString()
  }

  return (
    <div className={`${styles.item} ${styles[task.status]}`}>
      <div className={styles.header}>
        <h3>{task.title}</h3>
        <div className={styles.badges}>
          {task.source === 'product-owner' && (
            <span className={styles.sourceBadge}>Auto-generated</span>
          )}
          <span className={styles.status}>{statusLabels[task.status]}</span>
        </div>
      </div>

      {task.description && (
        <div className={styles.description}>
          <Markdown content={task.description} />
        </div>
      )}

      <div className={styles.meta}>
        <span className={styles.date}>Created: {formatDate(task.createdAt)}</span>
      </div>

      {task.architectReview && (
        <div className={styles.architectReview}>
          <div className={styles.reviewHeader}>
            <span className={`${styles.complexityBadge} ${styles[task.architectReview.complexity]}`}>
              {task.architectReview.complexity}
            </span>
            <span className={styles.reviewLabel}>Architect Review</span>
          </div>
          {task.architectReview.impactedFiles.length > 0 && (
            <div className={styles.impactedFiles}>
              <strong>Impacted files:</strong>
              <ul>
                {task.architectReview.impactedFiles.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </div>
          )}
          {task.architectReview.notes && (
            <div className={styles.reviewNotes}>{task.architectReview.notes}</div>
          )}
        </div>
      )}

      {task.result && (
        <div className={styles.result}>
          {task.result.branchName && (
            <div>
              <strong>Branch:</strong> {task.result.branchName}
            </div>
          )}
          {task.result.prUrl && (
            <div>
              <strong>PR:</strong>{' '}
              <a href={task.result.prUrl} target="_blank" rel="noopener noreferrer">
                {task.result.prUrl}
              </a>
            </div>
          )}
          {task.result.error && (
            <div className={styles.resultError}>
              <strong>Error:</strong> {task.result.error}
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={handleDelete}
          disabled={isDeleting || task.status === 'in_progress'}
          className={styles.deleteBtn}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
