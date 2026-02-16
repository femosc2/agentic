import type { Timestamp } from 'firebase/firestore'

export interface Email {
  id: string
  to: string
  subject: string
  body: string
  createdAt: Timestamp
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
  processed: boolean
  taskId?: string
}

export interface CreateEmailInput {
  to: string
  subject: string
  body: string
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
}
