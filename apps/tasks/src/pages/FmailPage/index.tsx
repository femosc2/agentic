import { EmailForm } from '../../components/EmailForm'
import { EmailList } from '../../components/EmailList'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function FmailPage() {
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
        <h2>Fmail</h2>
        <p>Sign in with GitHub to send and view emails.</p>
      </div>
    )
  }

  return (
    <>
      <EmailForm />
      <EmailList />
    </>
  )
}
