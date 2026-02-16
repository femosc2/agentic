import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { UserMenu } from '../UserMenu'
import styles from './styles.module.scss'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h1>Agentic Task Manager</h1>
          <p>Create coding tasks for the agent to execute</p>
        </div>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? styles.active : ''}
            onClick={closeMenu}
          >
            Tasks
          </NavLink>
          <NavLink
            to="/commits"
            className={({ isActive }) => isActive ? styles.active : ''}
            onClick={closeMenu}
          >
            Commits
          </NavLink>
          <NavLink
            to="/fmail"
            className={({ isActive }) => isActive ? styles.active : ''}
            onClick={closeMenu}
          >
            Fmail
          </NavLink>
          <NavLink
            to="/fforms"
            className={({ isActive }) => isActive ? styles.active : ''}
            onClick={closeMenu}
          >
            Fforms
          </NavLink>
        </nav>

        <div className={styles.userMenu}>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
