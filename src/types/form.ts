import type { Timestamp } from 'firebase/firestore'

export type FormEntryType = 'feature' | 'bug'

export interface FormEntry {
  id: string
  type: FormEntryType
  title: string
  description: string
  createdAt: Timestamp
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
}

export interface CreateFormInput {
  type: FormEntryType
  title: string
  description: string
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
}
