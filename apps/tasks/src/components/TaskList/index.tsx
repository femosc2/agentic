import { useEffect, useState } from 'react'
import type { Task } from '../../types/task'
import { subscribeToTasks } from '../../services/taskService'
import { useAuth } from '../../hooks/useAuth'
import { TaskItem } from '../TaskItem'
import styles from './styles.module.scss'

export function TaskList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToTasks(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks)
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
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading tasks: {error}</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No tasks yet. Create one above to get started!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <h2>Tasks ({tasks.length})</h2>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
