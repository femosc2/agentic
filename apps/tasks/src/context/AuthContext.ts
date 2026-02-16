import { createContext } from 'react'
import type { AuthUser } from '../types/user'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signOutUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
