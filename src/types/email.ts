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
}

export interface CreateEmailInput {
  to: string
  subject: string
  body: string
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
}
