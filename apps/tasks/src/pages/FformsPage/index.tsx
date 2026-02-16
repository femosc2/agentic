import { FormEntryForm } from '../../components/FormEntry'
import { FormList } from '../../components/FormList'
import { useAuth } from '../../hooks/useAuth'
import styles from './styles.module.scss'

export function FformsPage() {
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
        <h2>Fforms</h2>
        <p>Sign in with GitHub to submit and view feedback.</p>
      </div>
    )
  }

  return (
    <>
      <FormEntryForm />
      <FormList />
    </>
  )
}
