import { TaskList } from '../../components/TaskList'
import { TaskForm } from '../../components/TaskForm'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function TasksPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <h2>Welcome to Agentic Task Manager</h2>
        <p>Sign in with GitHub to create and manage your coding tasks.</p>
      </div>
    )
  }

  return (
    <>
      <TaskForm />
      <TaskList />
    </>
  )
}
